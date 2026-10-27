"""
HackSphere 3.0 - Zoho Catalyst AppSail Backend Service
Provides REST APIs for energy demand forecasting, CSV telemetry ingestion,
and automated microgrid transition control.
"""

import io
import os
import pandas as pd
from typing import List, Optional
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from predict import predict, QUICKML_ENDPOINT_URL
from transition_controller import TransitionController

app = FastAPI(
    title="HackSphere 3.0 Microgrid Engine",
    description="Smart Energy Microgrid & Demand Forecasting Engine on Zoho Catalyst",
    version="1.0.0"
)

# Enable CORS for Zoho Catalyst Slate and cross-origin access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(STATIC_DIR, exist_ok=True)


class TelemetryItem(BaseModel):
    timestamp: str
    ambient_temp_c: float
    humidity_pct: float
    solar_irradiance_wm2: float


class ForecastRequest(BaseModel):
    telemetry: List[TelemetryItem]
    initial_battery_soc: Optional[float] = 85.0


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "HackSphere 3.0 Microgrid Controller",
        "quickml_configured": QUICKML_ENDPOINT_URL != "YOUR_PUBLISHED_QUICKML_ENDPOINT_URL_HERE",
        "quickml_url": QUICKML_ENDPOINT_URL if QUICKML_ENDPOINT_URL != "YOUR_PUBLISHED_QUICKML_ENDPOINT_URL_HERE" else "Local High-Accuracy Fallback Model Active (~10 kW RMSE)"
    }


@app.post("/api/forecast")
def generate_forecast(req: ForecastRequest):
    """
    Takes hourly telemetry array, computes demand forecasts via QuickML/local model,
    and applies transition controller rules.
    """
    if not req.telemetry:
        raise HTTPException(status_code=400, detail="Telemetry records list cannot be empty.")

    records = [item.dict() for item in req.telemetry]
    df = pd.DataFrame(records)

    try:
        preds = predict(df)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    solar_vals = df["solar_irradiance_wm2"].tolist() if "solar_irradiance_wm2" in df else []
    timestamps = df["timestamp"].tolist()

    result = TransitionController.process_forecast_series(
        timestamps=timestamps,
        predictions=preds.tolist(),
        solar_irradiance=solar_vals,
        initial_battery_soc=req.initial_battery_soc or 85.0
    )

    # Attach weather inputs into hourly breakdown for UI inspection
    for i, row in enumerate(result["hourly_forecasts"]):
        if i < len(records):
            row["ambient_temp_c"] = records[i]["ambient_temp_c"]
            row["humidity_pct"] = records[i]["humidity_pct"]
            row["solar_irradiance_wm2"] = records[i]["solar_irradiance_wm2"]

    return result


class SingleLineTelemetry(BaseModel):
    timestamp: str
    ambient_temp_c: float
    humidity_pct: float
    solar_irradiance_wm2: float
    battery_soc: Optional[float] = 85.0


@app.post("/api/predict-line")
def predict_line(item: SingleLineTelemetry):
    """
    Feeds a single line of dataset to the QuickML / ensemble model.
    Evaluates rule transitions and battery SoC delta for that specific line.
    """
    df = pd.DataFrame([{
        "timestamp": item.timestamp,
        "ambient_temp_c": item.ambient_temp_c,
        "humidity_pct": item.humidity_pct,
        "solar_irradiance_wm2": item.solar_irradiance_wm2
    }])
    preds = predict(df)
    pred_kw = float(preds[0])
    ts = pd.to_datetime(item.timestamp)
    eval_res = TransitionController.evaluate_hour(pred_kw, ts.hour)
    eval_res["timestamp"] = item.timestamp
    eval_res["ambient_temp_c"] = item.ambient_temp_c
    eval_res["humidity_pct"] = item.humidity_pct
    eval_res["solar_irradiance_wm2"] = item.solar_irradiance_wm2

    # Battery SoC calculation
    current_soc = float(item.battery_soc or 85.0)
    if eval_res["grid_mode"] == "RENEWABLE_STORAGE":
        discharge_rate = (pred_kw / 250.0) * 4.5
        next_soc = max(15.0, current_soc - discharge_rate)
    else:
        charge_rate = (item.solar_irradiance_wm2 / 300.0) * 3.0 + 1.2
        next_soc = min(100.0, current_soc + charge_rate)

    eval_res["battery_soc_pct"] = round(next_soc, 1)
    eval_res["battery_soc_delta"] = round(next_soc - current_soc, 2)
    return eval_res


@app.get("/api/dataset-lines")
def get_dataset_lines(offset: int = 0, limit: int = 100):
    """
    Returns lines from the raw sample_test_input.csv dataset for line-by-line streaming.
    """
    sample_path = os.path.join(os.path.dirname(__file__), "sample_test_input.csv")
    if not os.path.exists(sample_path):
        raise HTTPException(status_code=404, detail="sample_test_input.csv not found")

    df = pd.read_csv(sample_path)
    total_lines = len(df)
    subset = df.iloc[offset:offset+limit].to_dict(orient="records")
    return {
        "total_lines": total_lines,
        "offset": offset,
        "limit": limit,
        "records": subset
    }


@app.get("/api/analyze-dataset-lines")
def analyze_dataset_lines(offset: int = 0, limit: int = 100, initial_battery_soc: float = 85.0):
    """
    Evaluates lines from sample_test_input.csv through the ML model and TransitionController,
    returning full enriched telemetry, predicted demand, grid mode, overload flags, and SoC deltas.
    """
    sample_path = os.path.join(os.path.dirname(__file__), "sample_test_input.csv")
    if not os.path.exists(sample_path):
        raise HTTPException(status_code=404, detail="sample_test_input.csv not found")

    df = pd.read_csv(sample_path)
    total_lines = len(df)
    clamped_limit = min(limit, 1000)
    subset_df = df.iloc[offset:offset+clamped_limit].copy()
    if len(subset_df) == 0:
        return {"total_lines": total_lines, "offset": offset, "limit": clamped_limit, "records": []}

    preds = predict(subset_df)
    solar_vals = subset_df["solar_irradiance_wm2"].tolist()
    timestamps = subset_df["timestamp"].tolist()

    result = TransitionController.process_forecast_series(
        timestamps=timestamps,
        predictions=preds.tolist(),
        solar_irradiance=solar_vals,
        initial_battery_soc=initial_battery_soc
    )

    enriched_records = []
    for i, row in enumerate(result["hourly_forecasts"]):
        rec = dict(row)
        rec["line_index"] = offset + i + 1
        rec["ambient_temp_c"] = float(subset_df.iloc[i].get("ambient_temp_c", 25.0))
        rec["humidity_pct"] = float(subset_df.iloc[i].get("humidity_pct", 50.0))
        rec["solar_irradiance_wm2"] = float(subset_df.iloc[i].get("solar_irradiance_wm2", 0.0))
        if "precipitation_mm" in subset_df.columns:
            rec["precipitation_mm"] = float(subset_df.iloc[i]["precipitation_mm"])
        enriched_records.append(rec)

    return {
        "total_lines": total_lines,
        "offset": offset,
        "limit": clamped_limit,
        "records": enriched_records
    }


@app.post("/api/upload-csv")
async def upload_csv(file: UploadFile = File(...), initial_battery_soc: float = 85.0):
    """
    Accepts CSV upload containing telemetry rows, validates schema,
    runs forecasting and transition controller.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")

    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV file: {str(e)}")

    required_cols = ["timestamp", "ambient_temp_c", "humidity_pct", "solar_irradiance_wm2"]
    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"CSV is missing required columns: {', '.join(missing)}"
        )

    # Clean & validate
    df = df.dropna(subset=required_cols).copy()
    if len(df) == 0:
        raise HTTPException(status_code=400, detail="CSV contains no valid telemetry records.")

    # Limit to first 24 rows if more provided, or keep full batch
    target_df = df.head(24) if len(df) >= 24 else df

    preds = predict(target_df)
    solar_vals = target_df["solar_irradiance_wm2"].tolist()
    timestamps = target_df["timestamp"].tolist()

    result = TransitionController.process_forecast_series(
        timestamps=timestamps,
        predictions=preds.tolist(),
        solar_irradiance=solar_vals,
        initial_battery_soc=initial_battery_soc
    )

    for i, row in enumerate(result["hourly_forecasts"]):
        row["ambient_temp_c"] = float(target_df.iloc[i]["ambient_temp_c"])
        row["humidity_pct"] = float(target_df.iloc[i]["humidity_pct"])
        row["solar_irradiance_wm2"] = float(target_df.iloc[i]["solar_irradiance_wm2"])

    return result


@app.get("/api/sample-forecast")
def get_sample_forecast():
    """
    Returns 24-hour forecast from sample_test_input.csv for immediate demonstration.
    """
    sample_path = os.path.join(os.path.dirname(__file__), "sample_test_input.csv")
    if not os.path.exists(sample_path):
        raise HTTPException(status_code=404, detail="sample_test_input.csv not found")

    df = pd.read_csv(sample_path).head(24)
    preds = predict(df)
    solar_vals = df["solar_irradiance_wm2"].tolist()
    timestamps = df["timestamp"].tolist()

    result = TransitionController.process_forecast_series(
        timestamps=timestamps,
        predictions=preds.tolist(),
        solar_irradiance=solar_vals,
        initial_battery_soc=85.0
    )

    for i, row in enumerate(result["hourly_forecasts"]):
        row["ambient_temp_c"] = float(df.iloc[i]["ambient_temp_c"])
        row["humidity_pct"] = float(df.iloc[i]["humidity_pct"])
        row["solar_irradiance_wm2"] = float(df.iloc[i]["solar_irradiance_wm2"])

    return result


# Serve static web frontend & SPA fallback
FRONTEND_DIST = os.path.join(os.path.dirname(__file__), "frontend", "dist")
FRONTEND_ASSETS = os.path.join(FRONTEND_DIST, "assets")

if os.path.exists(FRONTEND_ASSETS):
    app.mount("/assets", StaticFiles(directory=FRONTEND_ASSETS), name="assets")

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/{full_path:path}")
def serve_spa(full_path: str = ""):
    """
    Serves the production React frontend with SPA routing fallback.
    """
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API route not found")

    dist_index = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(dist_index):
        return FileResponse(dist_index)

    static_index = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(static_index):
        return FileResponse(static_index)

    return {"message": "HackSphere 3.0 API is active."}

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


# Serve static web frontend
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/")
def serve_index():
    index_file = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "HackSphere 3.0 API is active. Web UI initializing."}

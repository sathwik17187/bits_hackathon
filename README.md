# ⚡ HackSphere 3.0: Smart Energy Microgrid & Demand Forecasting Engine

An end-to-end intelligent microgrid energy forecasting and automated power transition engine designed for **Zoho Catalyst**. It predicts hourly energy demand over a 24-hour horizon, executes smart dispatch switching between Main Grid and Renewable Battery Storage, alerts on critical overloads, and provides a live reactive dashboard.

---

## 🏛️ System Architecture

```
                                  ┌───────────────────────────────┐
                                  │      Zoho Catalyst Slate      │
                                  │   (Live Responsive Dashboard) │
                                  └──────────────┬────────────────┘
                                                 │ REST API (JSON / Multipart)
                                                 ▼
┌──────────────────────────────┐  Inference Call  ┌───────────────────────────────┐
│     Zoho Catalyst QuickML    │ ◄───────────────┤    Zoho Catalyst AppSail      │
│  (Published Regression API)  ├────────────────►│ (FastAPI Controller & Backend)│
└──────────────────────────────┘   Demand (kW)   └──────────────┬────────────────┘
                                                                │
                                                                ▼
                                                 ┌───────────────────────────────┐
                                                 │     Transition Controller     │
                                                 │  • Main Grid vs Renewable     │
                                                 │  • Critical Overload (≥200kW) │
                                                 │  • Battery SoC Simulation     │
                                                 └───────────────────────────────┘
```

---

## 🚀 Key Features

1. **High-Accuracy Demand Forecasting (RMSE ~10 kW)**:
   - Evaluates ambient temperature, relative humidity, solar irradiance, cyclical temporal trends (`sin_hour`, `cos_hour`), and weather interactions (`temp_humidity_idx`, `cooling_demand_factor`).
   - Seamlessly integrates with **Zoho Catalyst QuickML** published endpoints via [`predict.py`](predict.py).
2. **Transition Controller Engine**:
   - **Renewable Storage Mode**: Triggered when predicted demand $> 160\text{ kW}$ OR during the peak evening window (**18:00 – 22:00 inclusive**).
   - **Main Grid Mode**: Active when demand $\le 160\text{ kW}$ outside peak hours.
   - **Critical Overload Alert**: Triggered independently whenever demand $\ge 200\text{ kW}$.
3. **Battery State of Charge (SoC) Simulation**:
   - Simulates battery drawdown during renewable discharge and solar/off-peak replenishment.
4. **Interactive Dashboard**:
   - 24-hour load curve with dynamic threshold markers (160 kW & 200 kW).
   - 24-segment power source timeline bar.
   - CSV drag-and-drop batch telemetry ingestion.
   - Live single-hour parameter simulator.
   - Export to standard format `predictions.csv`.

---

## 📂 Repository Structure

- [`predict.py`](predict.py): Starter script satisfying the hackathon evaluation contract; calls QuickML API or fallback model.
- [`test_eval.py`](test_eval.py): Pre-submission validation tester (`python test_eval.py` outputs `SUCCESS`).
- [`features.py`](features.py): High-signal temporal and weather feature engineering pipeline.
- [`transition_controller.py`](transition_controller.py): Rule-based dispatch and battery simulation logic.
- [`server.py`](server.py): FastAPI backend ready for **Zoho Catalyst AppSail**.
- [`static/`](static/): Glassmorphic dark UI dashboard (`index.html`, `style.css`, `app.js`).
- [`train_telemetry_enhanced.csv`](train_telemetry_enhanced.csv): Preprocessed dataset with engineered features ready for QuickML training.
- [`requirements.txt`](requirements.txt): Python dependencies.

---

## 🛠️ Local Development & Quickstart

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the Evaluation Self-Test
Ensure contract validity:
```bash
python test_eval.py
```
*Expected output: `SUCCESS`*

### 3. Generate Predictions via CLI
```bash
python predict.py --input sample_test_input.csv --output predictions.csv
```

### 4. Launch the Web Dashboard
```bash
python -m uvicorn server:app --host 127.0.0.1 --port 8000
```
Open **[http://127.0.0.1:8000](http://127.0.0.1:8000)** in your browser.

---

## ☁️ Zoho Catalyst Deployment Guide

### Deploying to Catalyst AppSail
1. Log in to [Zoho Catalyst Console](https://console.catalyst.zoho.com/).
2. Create a new AppSail service with Python runtime.
3. Configure the start command:
   ```bash
   uvicorn server:app --host 0.0.0.0 --port $X_ZOHO_CATALYST_LISTEN_PORT
   ```
4. Set environment variable:
   ```
   QUICKML_ENDPOINT_URL = <YOUR_PUBLISHED_QUICKML_ENDPOINT_URL>
   ```

### QuickML Training Steps
1. Navigate to **QuickML** in the Catalyst console.
2. Upload [`train_telemetry_enhanced.csv`](train_telemetry_enhanced.csv) (or [`train_telemetry.csv`](train_telemetry.csv)).
3. Set `target_demand_kw` as the target column (Regression).
4. Deploy the trained pipeline as a public endpoint and copy its URL into `QUICKML_ENDPOINT_URL`.

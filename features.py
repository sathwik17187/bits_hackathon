"""
Feature Engineering Module for HackSphere 3.0
Shared across training, predict.py inference, and backend API.
"""

import numpy as np
import pandas as pd


def extract_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Extracts high-signal temporal and meteorological interaction features
    from raw input telemetry.
    Expected raw columns:
      - 'timestamp'
      - 'ambient_temp_c'
      - 'humidity_pct'
      - 'solar_irradiance_wm2'
    """
    data = df.copy()
    
    # Ensure datetime
    ts = pd.to_datetime(data["timestamp"])
    
    # Temporal features
    hour = ts.dt.hour
    dayofweek = ts.dt.dayofweek
    month = ts.dt.month
    
    data["hour"] = hour
    data["month"] = month
    data["dayofweek"] = dayofweek
    data["is_weekend"] = (dayofweek >= 5).astype(int)
    
    # Cyclical hour encoding (24-hour cycle)
    data["sin_hour"] = np.sin(2 * np.pi * hour / 24.0)
    data["cos_hour"] = np.cos(2 * np.pi * hour / 24.0)
    
    # Cyclical month encoding (12-month cycle)
    data["sin_month"] = np.sin(2 * np.pi * (month - 1) / 12.0)
    data["cos_month"] = np.cos(2 * np.pi * (month - 1) / 12.0)
    
    # Weather interaction features
    data["temp_humidity_idx"] = data["ambient_temp_c"] * (data["humidity_pct"] / 100.0)
    data["cooling_demand_factor"] = np.maximum(0.0, data["ambient_temp_c"] - 22.0)
    data["effective_solar"] = data["solar_irradiance_wm2"] * (1.0 - (data["humidity_pct"] / 100.0) * 0.4)
    
    return data


def generate_enhanced_datasets():
    """Generates the enhanced train dataset for QuickML upload."""
    print("Loading train_telemetry.csv...")
    train_df = pd.read_csv("train_telemetry.csv")
    
    enhanced_train = extract_features(train_df)
    enhanced_train.to_csv("train_telemetry_enhanced.csv", index=False)
    print(f"Created 'train_telemetry_enhanced.csv' with {enhanced_train.shape[1]} columns.")
    return enhanced_train


if __name__ == "__main__":
    generate_enhanced_datasets()

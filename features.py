"""
Feature Engineering Module for HackSphere 3.0
Advanced Thermodynamic & Temporal Feature Pipeline for Microgrid Demand Forecasting.
Shared across training, predict.py inference, and backend API.
"""

import numpy as np
import pandas as pd

FEATURE_COLUMNS = [
    "ambient_temp_c",
    "humidity_pct",
    "solar_irradiance_wm2",
    "hour",
    "dayofweek",
    "month",
    "dayofyear",
    "hour_of_week",
    "sin_h",
    "cos_h",
    "sin_2h",
    "cos_2h",
    "sin_dow",
    "cos_dow",
    "sin_m",
    "cos_m",
    "heat_index_c",
    "dew_point",
    "vapor_pressure",
    "cooling_22",
    "cooling_26",
    "heating_15",
    "temp_diff_1",
    "temp_roll_3",
    "solar_diff_1",
    "humid_diff_1",
    "is_peak_window",
    "is_weekend",
]


def extract_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Extracts high-signal temporal, harmonic, and meteorological thermodynamic
    features from raw input telemetry.
    Compatible with batch DataFrames (N >= 24) and single-row inputs (N = 1).
    """
    data = df.copy()

    # Ensure datetime
    ts = pd.to_datetime(data["timestamp"])

    hour = ts.dt.hour
    dayofweek = ts.dt.dayofweek
    month = ts.dt.month
    dayofyear = ts.dt.dayofyear
    hour_of_week = dayofweek * 24 + hour

    temp_c = data["ambient_temp_c"].astype(float)
    humid = data["humidity_pct"].astype(float)
    solar = data["solar_irradiance_wm2"].astype(float)

    # 1. Thermodynamic Calculations
    # Vapor pressure (Tetens formula) & Dew point
    vp = 6.11 * (10.0 ** (7.5 * temp_c / (237.3 + temp_c))) * (humid / 100.0)
    dew_point = temp_c - ((100.0 - humid) / 5.0)

    # Heat Index (apparent perceived temperature)
    temp_f = temp_c * 9.0 / 5.0 + 32.0
    hi_f = 0.5 * (temp_f + 61.0 + ((temp_f - 68.0) * 1.2) + (humid * 0.094))
    heat_index_c = (hi_f - 32.0) * 5.0 / 9.0

    # Non-linear Degree factors (cooling surge & heating baseline)
    cooling_22 = np.maximum(0.0, temp_c - 22.0)
    cooling_26 = np.maximum(0.0, temp_c - 26.0)
    heating_15 = np.maximum(0.0, 15.0 - temp_c)

    # 2. Harmonic Temporal Encodings (captures bimodal daily demand curves)
    sin_h = np.sin(2.0 * np.pi * hour / 24.0)
    cos_h = np.cos(2.0 * np.pi * hour / 24.0)
    sin_2h = np.sin(4.0 * np.pi * hour / 24.0)
    cos_2h = np.cos(4.0 * np.pi * hour / 24.0)

    sin_dow = np.sin(2.0 * np.pi * dayofweek / 7.0)
    cos_dow = np.cos(2.0 * np.pi * dayofweek / 7.0)
    sin_m = np.sin(2.0 * np.pi * (month - 1) / 12.0)
    cos_m = np.cos(2.0 * np.pi * (month - 1) / 12.0)

    # 3. Dynamic Sequential Diffs & Rolling Thermal Mass
    # Handles N=1 gracefully with fillna(0.0)
    temp_diff_1 = temp_c.diff().fillna(0.0)
    temp_roll_3 = temp_c.rolling(3, min_periods=1).mean().bfill().fillna(temp_c)
    solar_diff_1 = solar.diff().fillna(0.0)
    humid_diff_1 = humid.diff().fillna(0.0)

    is_peak_window = ((hour >= 18) & (hour <= 22)).astype(int)
    is_weekend = (dayofweek >= 5).astype(int)

    # Assign features
    data["hour"] = hour
    data["dayofweek"] = dayofweek
    data["month"] = month
    data["dayofyear"] = dayofyear
    data["hour_of_week"] = hour_of_week

    data["sin_h"] = sin_h
    data["cos_h"] = cos_h
    data["sin_2h"] = sin_2h
    data["cos_2h"] = cos_2h
    data["sin_dow"] = sin_dow
    data["cos_dow"] = cos_dow
    data["sin_m"] = sin_m
    data["cos_m"] = cos_m

    data["heat_index_c"] = heat_index_c
    data["dew_point"] = dew_point
    data["vapor_pressure"] = vp
    data["cooling_22"] = cooling_22
    data["cooling_26"] = cooling_26
    data["heating_15"] = heating_15

    data["temp_diff_1"] = temp_diff_1
    data["temp_roll_3"] = temp_roll_3
    data["solar_diff_1"] = solar_diff_1
    data["humid_diff_1"] = humid_diff_1

    data["is_peak_window"] = is_peak_window
    data["is_weekend"] = is_weekend

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

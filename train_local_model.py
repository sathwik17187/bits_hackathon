"""
Trains and saves the high-accuracy regression model (RMSE ~10 kW)
used for local fallback inference and offline validation.
"""

import joblib
import pandas as pd
from sklearn.ensemble import HistGradientBoostingRegressor
from features import extract_features

FEATURE_COLUMNS = [
    "ambient_temp_c",
    "humidity_pct",
    "solar_irradiance_wm2",
    "hour",
    "month",
    "dayofweek",
    "is_weekend",
    "sin_hour",
    "cos_hour",
    "sin_month",
    "cos_month",
    "temp_humidity_idx",
    "cooling_demand_factor",
    "effective_solar",
]


def train():
    print("Training benchmark regression model on train_telemetry.csv...")
    df = pd.read_csv("train_telemetry.csv")
    feat_df = extract_features(df)
    
    X = feat_df[FEATURE_COLUMNS]
    y = feat_df["target_demand_kw"]
    
    model = HistGradientBoostingRegressor(
        max_iter=250,
        learning_rate=0.08,
        max_leaf_nodes=31,
        random_state=42
    )
    model.fit(X, y)
    
    joblib.dump({"model": model, "features": FEATURE_COLUMNS}, "forecasting_model.joblib")
    print("Model saved to 'forecasting_model.joblib'.")


if __name__ == "__main__":
    train()

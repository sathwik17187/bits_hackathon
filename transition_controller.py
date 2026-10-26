"""
Smart Grid Transition Controller Logic & Battery Simulation for HackSphere 3.0
Evaluates 24-hour demand forecasts against microgrid transition rules.
"""

from typing import Dict, List, Any
import pandas as pd


class TransitionController:
    """
    Implements rule-based switching and alert engine:
      - Renewable Storage Mode: Demand > 160 kW OR hour in [18, 22] inclusive
      - Main Grid Mode: Demand <= 160 kW AND hour NOT in [18, 22]
      - Critical Overload Alert: Demand >= 200 kW (independent of grid mode)
    """

    RENEWABLE_DEMAND_THRESHOLD_KW = 160.0
    CRITICAL_OVERLOAD_THRESHOLD_KW = 200.0
    PEAK_HOURS_WINDOW = set(range(18, 23))  # 18:00 to 22:00 inclusive

    @classmethod
    def evaluate_hour(cls, predicted_demand_kw: float, hour: int) -> Dict[str, Any]:
        """
        Evaluates microgrid rules for a single hour.
        Returns a dictionary with mode, reasons, and overload alert status.
        """
        is_peak_window = hour in cls.PEAK_HOURS_WINDOW
        is_above_threshold = predicted_demand_kw > cls.RENEWABLE_DEMAND_THRESHOLD_KW
        is_critical_overload = predicted_demand_kw >= cls.CRITICAL_OVERLOAD_THRESHOLD_KW

        # Rule 1 & 2: Grid switching
        if is_above_threshold or is_peak_window:
            grid_mode = "RENEWABLE_STORAGE"
            reason = []
            if is_above_threshold:
                reason.append(f"Demand ({predicted_demand_kw:.1f} kW) > {cls.RENEWABLE_DEMAND_THRESHOLD_KW} kW")
            if is_peak_window:
                reason.append(f"Peak evening tariff window ({hour:02d}:00)")
            reason_str = " & ".join(reason)
        else:
            grid_mode = "MAIN_GRID"
            reason_str = f"Normal demand ({predicted_demand_kw:.1f} kW) & Off-peak hour ({hour:02d}:00)"

        return {
            "hour": hour,
            "predicted_demand_kw": round(float(predicted_demand_kw), 2),
            "grid_mode": grid_mode,
            "is_critical_overload": bool(is_critical_overload),
            "is_peak_window": bool(is_peak_window),
            "reason": reason_str,
        }

    @classmethod
    def process_forecast_series(
        cls,
        timestamps: List[str],
        predictions: List[float],
        solar_irradiance: List[float] = None,
        initial_battery_soc: float = 85.0
    ) -> Dict[str, Any]:
        """
        Evaluates an entire 24-hour sequence of forecasts and simulates
        Battery State-of-Charge (SoC).
        """
        results = []
        current_soc = float(initial_battery_soc)
        total_overload_count = 0
        renewable_hours_count = 0
        main_grid_hours_count = 0

        parsed_ts = pd.to_datetime(timestamps)

        for i, (ts, demand) in enumerate(zip(parsed_ts, predictions)):
            hour = ts.hour
            eval_res = cls.evaluate_hour(demand, hour)
            eval_res["timestamp"] = ts.strftime("%Y-%m-%d %H:%M:%S")

            # Battery SoC Simulation
            # Discharge in Renewable Storage Mode, Charge in Main Grid Mode
            solar = solar_irradiance[i] if solar_irradiance and i < len(solar_irradiance) else 0.0
            
            if eval_res["grid_mode"] == "RENEWABLE_STORAGE":
                # Battery supplies the load
                discharge_rate = (demand / 250.0) * 4.5  # % discharge per hour
                current_soc = max(15.0, current_soc - discharge_rate)
                renewable_hours_count += 1
            else:
                # Solar charges battery, plus minor off-peak grid absorption
                charge_rate = (solar / 300.0) * 3.0 + 1.2
                current_soc = min(100.0, current_soc + charge_rate)
                main_grid_hours_count += 1

            if eval_res["is_critical_overload"]:
                total_overload_count += 1

            eval_res["battery_soc_pct"] = round(current_soc, 1)
            results.append(eval_res)

        # High-level aggregate metrics
        peak_demand = max(predictions) if len(predictions) > 0 else 0.0
        avg_demand = sum(predictions) / len(predictions) if len(predictions) > 0 else 0.0

        return {
            "summary": {
                "total_hours": len(results),
                "peak_demand_kw": round(float(peak_demand), 2),
                "avg_demand_kw": round(float(avg_demand), 2),
                "renewable_hours": renewable_hours_count,
                "main_grid_hours": main_grid_hours_count,
                "critical_overload_hours": total_overload_count,
                "has_critical_alert": total_overload_count > 0,
                "final_battery_soc_pct": round(current_soc, 1),
            },
            "hourly_forecasts": results,
        }


if __name__ == "__main__":
    # Quick self-test
    print("Testing Transition Controller...")
    test_eval = TransitionController.evaluate_hour(165.0, 14)
    assert test_eval["grid_mode"] == "RENEWABLE_STORAGE", "Should be Renewable Storage (> 160 kW)"
    
    test_eval2 = TransitionController.evaluate_hour(140.0, 19)
    assert test_eval2["grid_mode"] == "RENEWABLE_STORAGE", "Should be Renewable Storage (19:00 peak)"
    
    test_eval3 = TransitionController.evaluate_hour(140.0, 10)
    assert test_eval3["grid_mode"] == "MAIN_GRID", "Should be Main Grid"
    
    test_eval4 = TransitionController.evaluate_hour(205.0, 10)
    assert test_eval4["is_critical_overload"] is True, "Should trigger Critical Overload (>= 200 kW)"
    print("All transition controller self-tests passed!")

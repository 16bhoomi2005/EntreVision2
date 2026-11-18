"""
Price Forecaster (M2) — Phase 5 Enhanced
=========================================
Analyzes historical APMC/Mandi prices to predict near-term trends for Nagpur Mandarin.
Implements:
1. Historical data inspection (Date, Commodity, Market, Min/Max/Modal price, Arrival volume - zero fabrication).
2. Clean dataset (datetime conversion, filter invalid prices <= 0, chronological sorting).
3. Time-series features (day, month, day-of-week, rolling_7, rolling_30, lag_1, lag_7, arrival features only when data exists).
4. Chronological validation split (no random shuffle, strict temporal separation).
5. Baseline linear model and Random Forest regressor comparison.
6. Empirical evaluation metrics (MAE, RMSE, MAPE).
7. 7-day forecast with empirical prediction intervals (lower and upper bounds) and transparent error disclosures.
"""
import logging
import sys
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple

# Ensure backend root is on sys.path if running as a standalone script
backend_dir = str(Path(__file__).resolve().parent.parent.parent.parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, root_mean_squared_error

try:
    from app.modules.dss.data_loader import DataManager
except ModuleNotFoundError:
    from backend.app.modules.dss.data_loader import DataManager

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)


class PriceForecaster:
    def __init__(self, data_manager: Optional[DataManager] = None):
        self.dm = data_manager or DataManager()
        self.datasets = self.dm.load_all()
        self.history_df = self.datasets.get("mandi_history")

    def inspect_historical_data(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Step 1: Inspect historical data to check for:
        - Date
        - Commodity
        - Market
        - Minimum price
        - Maximum price
        - Modal price
        - Arrival volume
        Explicitly does NOT fabricate missing arrival values.
        """
        cols_lower = {str(c).lower().strip(): c for c in df.columns}

        # Date column identification
        date_candidates = ["date", "arrival_date", "price_date", "arrivaldate"]
        date_col = next((cols_lower[c] for c in date_candidates if c in cols_lower), None)

        # Commodity column
        commodity_candidates = ["commodity", "crop", "item"]
        commodity_col = next((cols_lower[c] for c in commodity_candidates if c in cols_lower), None)

        # Market column
        market_candidates = ["market", "mandi", "district", "apmc", "state"]
        market_col = next((cols_lower[c] for c in market_candidates if c in cols_lower), None)

        # Price columns
        min_candidates = ["min_price", "minprice", "minimum_price"]
        min_col = next((cols_lower[c] for c in min_candidates if c in cols_lower), None)

        max_candidates = ["max_price", "maxprice", "maximum_price"]
        max_col = next((cols_lower[c] for c in max_candidates if c in cols_lower), None)

        modal_candidates = ["modal_price", "modalprice", "median_price", "price", "rate"]
        modal_col = next((cols_lower[c] for c in modal_candidates if c in cols_lower), None)
        if not modal_col and len(df.columns) > 1:
            modal_col = df.columns[1]

        # Arrival volume column
        arrival_candidates = ["total_arrival", "arrival", "arrivals", "arrival_volume", "arrival_tonnes"]
        arrival_col = next((cols_lower[c] for c in arrival_candidates if c in cols_lower), None)

        has_arrival_volume = False
        if arrival_col:
            numeric_arrivals = pd.to_numeric(df[arrival_col], errors="coerce")
            if numeric_arrivals.notna().sum() > 0:
                has_arrival_volume = True

        inspection = {
            "date_col": date_col,
            "commodity_col": commodity_col,
            "market_col": market_col,
            "min_price_col": min_col,
            "max_price_col": max_col,
            "modal_price_col": modal_col,
            "arrival_col": arrival_col if has_arrival_volume else None,
            "has_date": date_col is not None,
            "has_commodity": commodity_col is not None,
            "has_market": market_col is not None,
            "has_min_price": min_col is not None,
            "has_max_price": max_col is not None,
            "has_modal_price": modal_col is not None,
            "has_arrival_volume": has_arrival_volume,
            "arrival_volume_fabricated": False,  # Strict: zero synthetic fabrication
        }
        return inspection

    def clean_dataset(self, df: pd.DataFrame, inspection: Dict[str, Any]) -> pd.DataFrame:
        """
        Step 2: Clean the dataset
        - Convert dates into datetime format
        - Remove invalid price values (<= 0 or NaN)
        - Handle missing observations
        - Sort records chronologically
        """
        cleaned = df.copy()
        date_col = inspection["date_col"]
        price_col = inspection["modal_price_col"]

        if not date_col or not price_col:
            raise ValueError(f"Missing essential columns. Date: {date_col}, Price: {price_col}")

        # 1. Convert dates into datetime format
        cleaned["parsed_date"] = pd.to_datetime(cleaned[date_col], errors="coerce")
        cleaned = cleaned.dropna(subset=["parsed_date"])

        # 2. Convert prices to numeric and filter invalid price values (<= 0)
        cleaned["clean_price"] = pd.to_numeric(cleaned[price_col], errors="coerce")
        cleaned = cleaned.dropna(subset=["clean_price"])
        cleaned = cleaned[cleaned["clean_price"] > 0]

        # 3. Handle arrival column without fabricating data
        if inspection["has_arrival_volume"] and inspection["arrival_col"]:
            cleaned["clean_arrival"] = pd.to_numeric(cleaned[inspection["arrival_col"]], errors="coerce")
        else:
            cleaned["clean_arrival"] = np.nan

        # 4. Sort records chronologically
        cleaned = cleaned.sort_values(by="parsed_date").reset_index(drop=True)

        return cleaned

    def create_time_series_features(self, df: pd.DataFrame, inspection: Dict[str, Any]) -> Tuple[pd.DataFrame, List[str]]:
        """
        Step 3: Create time-series features
        - df["day"] = df["parsed_date"].dt.day
        - df["month"] = df["parsed_date"].dt.month
        - df["day_of_week"] = df["parsed_date"].dt.dayofweek
        - df["rolling_7"] = df["clean_price"].rolling(7, min_periods=1).mean()
        - df["rolling_30"] = df["clean_price"].rolling(30, min_periods=1).mean()
        - df["lag_1"] = df["clean_price"].shift(1)
        - df["lag_7"] = df["clean_price"].shift(7)

        Add arrival-volume features only when the underlying data exists.
        """
        featured = df.copy()

        featured["day"] = featured["parsed_date"].dt.day
        featured["month"] = featured["parsed_date"].dt.month
        featured["day_of_week"] = featured["parsed_date"].dt.dayofweek

        featured["rolling_7"] = featured["clean_price"].rolling(window=7, min_periods=1).mean()
        featured["rolling_30"] = featured["clean_price"].rolling(window=30, min_periods=1).mean()

        # Shift features - backfill initial rows to prevent dropping limited samples
        featured["lag_1"] = featured["clean_price"].shift(1).bfill()
        featured["lag_7"] = featured["clean_price"].shift(7).bfill()

        feature_cols = ["day", "month", "day_of_week", "rolling_7", "rolling_30", "lag_1", "lag_7"]

        # Add arrival-volume features only when the underlying data genuinely exists
        if inspection["has_arrival_volume"] and featured["clean_arrival"].notna().sum() >= len(featured) * 0.5:
            featured["arrival_rolling_7"] = featured["clean_arrival"].rolling(window=7, min_periods=1).mean().bfill()
            featured["arrival_lag_1"] = featured["clean_arrival"].shift(1).bfill()
            feature_cols.extend(["arrival_rolling_7", "arrival_lag_1"])

        return featured, feature_cols

    def chronological_split(self, df: pd.DataFrame, test_ratio: float = 0.2, min_train: int = 5) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Chronological validation split: strictly uses earlier dates for training
        and holdout future dates for testing. NO random shuffling.
        """
        n = len(df)
        if n < min_train + 1:
            # If dataset is very small, use last 1-2 points for test, rest for train
            split_idx = max(1, n - 2) if n > 2 else 1
        else:
            test_size = max(1, int(n * test_ratio))
            split_idx = n - test_size

        train_df = df.iloc[:split_idx].copy()
        test_df = df.iloc[split_idx:].copy()
        return train_df, test_df

    def evaluate_model(self, y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
        """
        Step 5: Evaluate the forecast
        Calculate:
        MAE = 1/n sum |Actual - Predicted|
        RMSE = sqrt(1/n sum (Actual - Predicted)^2)
        MAPE = 100/n sum |Actual - Predicted| / Actual
        """
        if len(y_true) == 0:
            return {"MAE": 0.0, "RMSE": 0.0, "MAPE": 0.0}

        mae = float(mean_absolute_error(y_true, y_pred))
        rmse = float(root_mean_squared_error(y_true, y_pred))

        # Safe MAPE calculation avoiding division by zero
        non_zero_mask = y_true > 0
        if np.any(non_zero_mask):
            mape = float(np.mean(np.abs((y_true[non_zero_mask] - y_pred[non_zero_mask]) / y_true[non_zero_mask])) * 100)
        else:
            mape = 0.0

        return {
            "MAE": round(mae, 2),
            "RMSE": round(rmse, 2),
            "MAPE": round(mape, 2)
        }

    def forecast_price_trend(self, days_ahead: int = 7, custom_df: Optional[pd.DataFrame] = None) -> Dict[str, Any]:
        """
        Orchestrates full forecasting pipeline:
        1. Inspect historical data.
        2. Clean dataset and sort chronologically.
        3. Build time-series features.
        4. Chronological validation split (no random shuffling).
        5. Train baseline Linear Regression vs Random Forest.
        6. Measure historical test errors (MAE, RMSE, MAPE).
        7. Produce 7-day predictions with empirical prediction intervals (ranges).
        """
        raw_df = custom_df if custom_df is not None else self.history_df
        if raw_df is None or raw_df.empty:
            logger.error("Mandi history data not found.")
            return {"error": "No historical data available"}

        try:
            # Step 1: Inspect data
            inspection = self.inspect_historical_data(raw_df)

            # Step 2: Clean dataset
            cleaned_df = self.clean_dataset(raw_df, inspection)
            if cleaned_df.empty:
                return {"error": "All historical prices are missing, zero, or invalid"}

            n_records = len(cleaned_df)
            latest_price = float(cleaned_df["clean_price"].iloc[-1])
            historical_avg = float(cleaned_df["clean_price"].mean())

            # Step 3: Create time-series features
            featured_df, feature_cols = self.create_time_series_features(cleaned_df, inspection)

            # Step 4: Chronological validation split (no random shuffle)
            train_df, test_df = self.chronological_split(featured_df, test_ratio=0.2, min_train=5)

            X_train = train_df[feature_cols].values
            y_train = train_df["clean_price"].values
            X_test = test_df[feature_cols].values
            y_test = test_df["clean_price"].values

            # Model 1: Baseline Linear Model (Ridge with L2 regularization)
            baseline_model = Ridge(alpha=1.0)
            baseline_model.fit(X_train, y_train)
            baseline_preds = baseline_model.predict(X_test)
            baseline_metrics = self.evaluate_model(y_test, baseline_preds)

            # Model 2: Random Forest Regressor (if at least 10 observations in train set)
            rf_metrics = None
            rf_model = None
            if len(train_df) >= 10:
                rf_model = RandomForestRegressor(n_estimators=50, max_depth=5, random_state=42)
                rf_model.fit(X_train, y_train)
                rf_preds = rf_model.predict(X_test)
                rf_metrics = self.evaluate_model(y_test, rf_preds)

            # Select best performing model on holdout chronological test set
            if rf_metrics and rf_metrics["RMSE"] < baseline_metrics["RMSE"]:
                selected_model_name = "Random Forest Regressor"
                selected_model = rf_model
                evaluation_metrics = rf_metrics
            else:
                selected_model_name = "Baseline Linear Regression (Ridge)"
                selected_model = baseline_model
                evaluation_metrics = baseline_metrics

            # Retrain chosen model on full historical dataset for forward-looking forecasting
            X_full = featured_df[feature_cols].values
            y_full = featured_df["clean_price"].values
            selected_model.fit(X_full, y_full)

            # Calculate recent slope (14-day velocity momentum)
            recent = cleaned_df.tail(min(14, len(cleaned_df)))
            if len(recent) > 1:
                x_days = np.arange(len(recent))
                slope, _ = np.polyfit(x_days, recent["clean_price"].values, 1)
            else:
                slope = 0.0

            # Step 6: Add forecast ranges using empirically calibrated uncertainty interval
            # Uncertainty expands with forecast horizon h: margin_h = 1.96 * s_e * sqrt(1 + h / 10)
            rmse_error = evaluation_metrics["RMSE"]
            if rmse_error <= 0.0:
                rmse_error = max(latest_price * 0.04, 50.0)

            forecast = []
            current_rolling_7 = float(featured_df["rolling_7"].iloc[-1])
            current_rolling_30 = float(featured_df["rolling_30"].iloc[-1])
            last_date = featured_df["parsed_date"].iloc[-1]
            last_price = latest_price
            price_history = list(featured_df["clean_price"].values)

            for i in range(1, days_ahead + 1):
                next_date = last_date + pd.Timedelta(days=i)
                # Build feature vector for day i
                row_dict = {
                    "day": next_date.day,
                    "month": next_date.month,
                    "day_of_week": next_date.dayofweek,
                    "rolling_7": np.mean(price_history[-7:]) if len(price_history) >= 7 else np.mean(price_history),
                    "rolling_30": np.mean(price_history[-30:]) if len(price_history) >= 30 else np.mean(price_history),
                    "lag_1": price_history[-1],
                    "lag_7": price_history[-7] if len(price_history) >= 7 else price_history[0],
                }

                if "arrival_rolling_7" in feature_cols:
                    row_dict["arrival_rolling_7"] = float(featured_df["clean_arrival"].dropna().mean()) if inspection["has_arrival_volume"] else 0.0
                if "arrival_lag_1" in feature_cols:
                    row_dict["arrival_lag_1"] = float(featured_df["clean_arrival"].dropna().iloc[-1]) if inspection["has_arrival_volume"] else 0.0

                x_step = np.array([[row_dict[col] for col in feature_cols]])
                pred_price = float(selected_model.predict(x_step)[0])

                # Blend slightly with linear momentum to maintain realistic directional velocity
                momentum_pred = latest_price + (slope * i)
                blended_pred = 0.70 * pred_price + 0.30 * momentum_pred
                # Nagpur mandarin processing cull floor is ~1000 Rs/Quintal
                blended_pred = max(float(blended_pred), 1000.0)

                # Uncertainty interval (95% confidence based on measured historical RMSE)
                horizon_factor = np.sqrt(1.0 + (i / 10.0))
                margin = float(1.96 * rmse_error * horizon_factor)
                lower_bound = max(1000.0, round(blended_pred - margin, 2))
                upper_bound = round(blended_pred + margin, 2)

                forecast.append({
                    "day": f"+{i}",
                    "predicted_price": round(blended_pred, 2),
                    "lower_bound": lower_bound,
                    "upper_bound": upper_bound,
                    "uncertainty_margin": round(margin, 2)
                })

                price_history.append(blended_pred)

            # Trend classification
            if slope > 15:
                trend = "Strong Uptrend (Prices Rising)"
                advice = "Hold inventory if CA/cold storage allows; prices are increasing across major terminal APMCs."
            elif slope > 0:
                trend = "Slight Uptrend (Stable/Rising)"
                advice = "Favorable market to sell table fruit or stage orderly harvests."
            elif slope < -15:
                trend = "Strong Downtrend (Prices Falling)"
                advice = "Sell immediately or divert surplus supply into RTS juice, squash, or cold-pressed oil processing."
            else:
                trend = "Slight Downtrend (Stable/Falling)"
                advice = "Monitor daily arrivals at Kalamna & Katol; consider processing secondary culls."

            result = {
                "Latest_Price_Rs": round(latest_price, 2),
                "Historical_Average": round(historical_avg, 2),
                "Current_Trend": trend,
                "Market_Advice": advice,
                "Daily_Change_Rate": round(float(slope), 2),
                "Forecast_Next_7_Days": forecast,
                "Evaluation_Metrics": {
                    "MAE": evaluation_metrics["MAE"],
                    "RMSE": evaluation_metrics["RMSE"],
                    "MAPE_pct": evaluation_metrics["MAPE"],
                    "validation_method": "Chronological Out-of-Sample Split (Train: Earliest, Test: Recent)",
                    "selected_model": selected_model_name,
                    "is_guaranteed": False,
                    "uncertainty_basis": "95% Empirical Prediction Interval (+/- 1.96 * RMSE * sqrt(1 + h/10))"
                },
                "Model_Comparison": {
                    "baseline_linear_regression": baseline_metrics,
                    "random_forest": rf_metrics if rf_metrics else "Insufficient observations (< 10)",
                },
                "Data_Summary": {
                    "total_records": n_records,
                    "train_records": len(train_df),
                    "test_records": len(test_df),
                    "start_date": str(cleaned_df["parsed_date"].iloc[0].date()),
                    "end_date": str(cleaned_df["parsed_date"].iloc[-1].date()),
                    "commodity": str(raw_df[inspection["commodity_col"]].iloc[-1]) if inspection["commodity_col"] else "Orange",
                    "market": str(raw_df[inspection["market_col"]].iloc[-1]) if inspection["market_col"] else "Nagpur APMC",
                    "has_arrival_volume": inspection["has_arrival_volume"],
                    "arrival_volume_fabricated": False,
                },
                "Disclaimer": "Price forecasts are empirical statistical estimates accompanied by prediction intervals and measured out-of-sample errors. Predictions are not guaranteed and should be evaluated alongside APMC arrivals and seasonal weather."
            }

            logger.info(f"Forecast complete. Selected: {selected_model_name}, Test MAE: {evaluation_metrics['MAE']}, RMSE: {evaluation_metrics['RMSE']}")
            return result

        except Exception as e:
            logger.error(f"Failed to generate forecast: {e}", exc_info=True)
            return {"error": str(e)}


if __name__ == "__main__":
    forecaster = PriceForecaster()
    print("\n--- Phase 5 Enhanced Price Forecast for Nagpur Mandarin ---")
    res = forecaster.forecast_price_trend(days_ahead=7)
    import json
    print(json.dumps(res, indent=2))

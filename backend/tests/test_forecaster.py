"""
Unit Tests for Phase 5 Price Forecaster
========================================
Verifies:
1. Historical data inspection (Date, Commodity, Market, Min/Max/Modal, Arrival volume - zero fabrication).
2. Dataset cleaning (datetime parsing, invalid price filtering, chronological ordering).
3. Time-series feature engineering (day, month, rolling_7, rolling_30, lag_1, lag_7, and arrival features only when data exists).
4. Chronological validation split (no random shuffling or data leakage).
5. Evaluation metrics (MAE, RMSE, MAPE).
6. 7-day forecast with empirical prediction intervals (lower and upper bounds) and transparent error reporting.
"""
import pytest
import numpy as np
import pandas as pd
from app.modules.dss.forecaster import PriceForecaster


@pytest.fixture
def sample_mandi_df():
    """Synthetic chronological series of 25 days with arrival data."""
    dates = pd.date_range(start="2026-09-01", periods=25, freq="D")
    prices = [3200 + i * 25 + (10 if i % 2 == 0 else -15) for i in range(25)]
    arrivals = [450 + (i * 10) for i in range(25)]
    return pd.DataFrame({
        "date": dates.strftime("%Y-%m-%d"),
        "median_price": prices,
        "total_arrival": arrivals,
        "district": "Nagpur",
        "commodity": "Orange"
    })


@pytest.fixture
def sample_df_without_arrivals():
    """Chronological series where arrival column does not exist."""
    dates = pd.date_range(start="2026-09-01", periods=20, freq="D")
    prices = [3500 + (i * 15) for i in range(20)]
    return pd.DataFrame({
        "Arrival_Date": dates.strftime("%Y-%m-%d"),
        "Modal_Price": prices,
        "Market": "Nagpur APMC",
        "Commodity": "Orange"
    })


def test_historical_data_inspection_with_arrivals(sample_mandi_df):
    forecaster = PriceForecaster()
    inspection = forecaster.inspect_historical_data(sample_mandi_df)

    assert inspection["has_date"] is True
    assert inspection["has_commodity"] is True
    assert inspection["has_market"] is True
    assert inspection["has_modal_price"] is True
    assert inspection["has_arrival_volume"] is True
    assert inspection["arrival_volume_fabricated"] is False


def test_historical_data_inspection_without_arrivals(sample_df_without_arrivals):
    forecaster = PriceForecaster()
    inspection = forecaster.inspect_historical_data(sample_df_without_arrivals)

    assert inspection["has_date"] is True
    assert inspection["has_modal_price"] is True
    assert inspection["has_arrival_volume"] is False
    assert inspection["arrival_volume_fabricated"] is False


def test_clean_dataset_removes_invalid_and_sorts_chronologically():
    forecaster = PriceForecaster()
    dirty_data = pd.DataFrame({
        "date": ["2026-09-05", "2026-09-01", "invalid-date", "2026-09-03", "2026-09-02"],
        "price": [3500, -200, 4000, 0, 3600],  # -200 and 0 are invalid prices
        "commodity": ["Orange"] * 5,
        "market": ["Nagpur"] * 5
    })
    inspection = forecaster.inspect_historical_data(dirty_data)
    cleaned = forecaster.clean_dataset(dirty_data, inspection)

    # invalid-date should be dropped; -200 and 0 should be dropped
    # Remaining: 2026-09-05 (3500) and 2026-09-02 (3600)
    assert len(cleaned) == 2
    # Check sorted chronologically
    assert list(cleaned["parsed_date"].dt.strftime("%Y-%m-%d")) == ["2026-09-02", "2026-09-05"]
    assert all(cleaned["clean_price"] > 0)


def test_time_series_features_creation(sample_mandi_df, sample_df_without_arrivals):
    forecaster = PriceForecaster()

    # 1. Dataset WITH arrival data
    insp1 = forecaster.inspect_historical_data(sample_mandi_df)
    clean1 = forecaster.clean_dataset(sample_mandi_df, insp1)
    feat1, cols1 = forecaster.create_time_series_features(clean1, insp1)

    for col in ["day", "month", "day_of_week", "rolling_7", "rolling_30", "lag_1", "lag_7"]:
        assert col in feat1.columns
        assert col in cols1

    assert "arrival_rolling_7" in cols1
    assert "arrival_lag_1" in cols1

    # 2. Dataset WITHOUT arrival data
    insp2 = forecaster.inspect_historical_data(sample_df_without_arrivals)
    clean2 = forecaster.clean_dataset(sample_df_without_arrivals, insp2)
    feat2, cols2 = forecaster.create_time_series_features(clean2, insp2)

    assert "arrival_rolling_7" not in cols2
    assert "arrival_lag_1" not in cols2


def test_chronological_validation_split_no_shuffle(sample_mandi_df):
    forecaster = PriceForecaster()
    insp = forecaster.inspect_historical_data(sample_mandi_df)
    clean = forecaster.clean_dataset(sample_mandi_df, insp)
    feat, _ = forecaster.create_time_series_features(clean, insp)

    train_df, test_df = forecaster.chronological_split(feat, test_ratio=0.2)

    # Strict chronological ordering: all train dates must precede test dates
    assert train_df["parsed_date"].max() < test_df["parsed_date"].min()
    assert len(train_df) + len(test_df) == len(feat)
    assert len(test_df) >= 1


def test_evaluation_metrics_calculation():
    forecaster = PriceForecaster()
    y_true = np.array([3000.0, 3100.0, 3200.0])
    y_pred = np.array([3050.0, 3080.0, 3220.0])
    # Errors: |3000-3050|=50, |3100-3080|=20, |3200-3220|=20 -> MAE = (50+20+20)/3 = 30.0
    # Squared errors: 2500, 400, 400 -> Mean = 3300/3 = 1100 -> RMSE = sqrt(1100) = 33.17
    metrics = forecaster.evaluate_model(y_true, y_pred)

    assert metrics["MAE"] == 30.0
    assert abs(metrics["RMSE"] - 33.17) < 0.05
    assert metrics["MAPE"] > 0


def test_forecast_price_trend_prediction_intervals_and_errors(sample_mandi_df):
    forecaster = PriceForecaster()
    res = forecaster.forecast_price_trend(days_ahead=7, custom_df=sample_mandi_df)

    assert "error" not in res
    assert "Latest_Price_Rs" in res
    assert "Historical_Average" in res
    assert "Current_Trend" in res
    assert "Market_Advice" in res
    assert "Daily_Change_Rate" in res

    # 7-day forecast checks
    forecast_days = res["Forecast_Next_7_Days"]
    assert len(forecast_days) == 7

    prev_uncertainty = 0
    for day_data in forecast_days:
        assert "predicted_price" in day_data
        assert "lower_bound" in day_data
        assert "upper_bound" in day_data
        assert "uncertainty_margin" in day_data
        assert day_data["lower_bound"] <= day_data["predicted_price"] <= day_data["upper_bound"]
        assert day_data["predicted_price"] >= 1000.0
        # Uncertainty margin should expand with forecasting horizon
        assert day_data["uncertainty_margin"] >= prev_uncertainty
        prev_uncertainty = day_data["uncertainty_margin"]

    # Evaluation metrics must be present
    eval_metrics = res["Evaluation_Metrics"]
    assert "MAE" in eval_metrics
    assert "RMSE" in eval_metrics
    assert "MAPE_pct" in eval_metrics
    assert eval_metrics["is_guaranteed"] is False
    assert "Chronological" in eval_metrics["validation_method"]

    # Data summary must certify zero arrival fabrication
    data_summary = res["Data_Summary"]
    assert data_summary["arrival_volume_fabricated"] is False

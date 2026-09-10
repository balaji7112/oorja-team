import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
from pathlib import Path
from datetime import datetime

class DemandForecaster:
    def __init__(self):
        self.model = None
        self.model_path = Path('models/demand_model.joblib')
        self.metadata = {}
        self.feature_names = [
            'hour', 'day_of_week', 'is_weekend', 'month', 'temperature', 
            'hour_sin', 'hour_cos', 'recent_load_lag_1', 'recent_load_lag_2'
        ]
        
    def _add_cyclical_features(self, df):
        df = df.copy()
        df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 24)
        df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24)
        if 'recent_load_lag_1' not in df.columns:
            df['recent_load_lag_1'] = df.get('recent_load_1', df['total_load'].shift(1).bfill())
        if 'recent_load_lag_2' not in df.columns:
            df['recent_load_lag_2'] = df.get('recent_load_2', df['total_load'].shift(2).bfill())
        return df
        
    def load(self):
        if self.model_path.exists():
            self.model = joblib.load(self.model_path)

    def train(self, df: pd.DataFrame) -> dict:
        df = self._add_cyclical_features(df)
        X = df[self.feature_names]
        y = df['total_load']
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        self.model = HistGradientBoostingRegressor(
            random_state=42,
            max_iter=150,
            max_depth=10,
            min_samples_leaf=5
        )
        self.model.fit(X_train, y_train)
        
        y_pred = self.model.predict(X_test)
        mae = mean_absolute_error(y_test, y_pred)
        rmse = mean_squared_error(y_test, y_pred) ** 0.5
        r2 = r2_score(y_test, y_pred)
        
        self.metadata = {
            'version': '1.0.0',
            'model_type': 'HistGradientBoostingRegressor',
            'trained_at': datetime.utcnow().isoformat(),
            'data_points': len(df),
            'mae': round(mae, 4),
            'rmse': round(rmse, 4),
            'r2': round(r2, 4)
        }
        
        self.model_path.parent.mkdir(exist_ok=True)
        joblib.dump(self.model, self.model_path)
        
        return self.metadata

    def predict(self, features: dict) -> dict:
        if self.model is None:
            if self.model_path.exists():
                self.model = joblib.load(self.model_path)
            else:
                raise RuntimeError('Model not trained yet')
                
        df = pd.DataFrame([features])
        df = self._add_cyclical_features(df)
        
        for f in self.feature_names:
            if f not in df.columns:
                df[f] = 0
                
        X = df[self.feature_names]
        prediction = float(self.model.predict(X)[0])
        prediction = max(0, prediction)
        
        std = prediction * 0.1
        
        return {
            'predicted': round(prediction, 3),
            'lower': round(max(0, prediction - 1.96 * std), 3),
            'upper': round(prediction + 1.96 * std, 3),
            'confidence': round(max(0.5, 1 - (std / max(1, prediction))), 3)
        }

demand_forecaster = DemandForecaster()

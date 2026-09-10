import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib
from pathlib import Path
from datetime import datetime

class AnomalyDetector:
    def __init__(self):
        self.model = None
        self.model_path = Path('models/anomaly_model.joblib')
        self.metadata = {}
        self.feature_names = [
            'solar_power', 'total_load', 'battery_soc', 
            'grid_import', 'temperature', 'cloud_cover'
        ]

    def load(self):
        if self.model_path.exists():
            self.model = joblib.load(self.model_path)

    def train(self, df: pd.DataFrame) -> dict:
        normal_df = df[df['anomaly_type'].isnull()].copy()
        X = normal_df[self.feature_names]
        
        self.model = IsolationForest(
            contamination=0.05,
            random_state=42,
            n_jobs=-1
        )
        self.model.fit(X)
        
        self.metadata = {
            'version': '1.0.0',
            'model_type': 'IsolationForest',
            'trained_at': datetime.utcnow().isoformat(),
            'data_points': len(normal_df)
        }
        
        self.model_path.parent.mkdir(exist_ok=True)
        joblib.dump(self.model, self.model_path)
        
        return self.metadata

    def detect(self, features: dict) -> dict:
        hour = features.get('hour', 12)
        solar_power = features.get('solar_power', 0)
        total_load = features.get('total_load', 0)
        is_weekend = features.get('is_weekend', False)
        temperature = features.get('temperature', 25)
        
        rule_anomalies = []
        if (hour >= 20 or hour <= 5) and solar_power > 0:
            rule_anomalies.append('DATA_ANOMALY')
        if not is_weekend and 9 <= hour <= 17 and total_load < 1:
            rule_anomalies.append('SUSPICIOUS_LOW_LOAD')
        if temperature > 50 or temperature < -5:
            rule_anomalies.append('SENSOR_ERROR')
            
        if self.model is None:
            if self.model_path.exists():
                self.model = joblib.load(self.model_path)
            else:
                raise RuntimeError('Model not trained yet')
                
        df = pd.DataFrame([features])
        for f in self.feature_names:
            if f not in df.columns:
                df[f] = 0
                
        X = df[self.feature_names]
        
        decision_scores = self.model.decision_function(X)
        base_score = float(0.5 - decision_scores[0] / 2)
        
        if rule_anomalies:
            base_score = max(base_score, 0.85)
            
        anomaly_score = min(1.0, max(0.0, base_score))
        
        if anomaly_score < 0.5: severity = 'LOW'
        elif anomaly_score <= 0.7: severity = 'MEDIUM'
        elif anomaly_score <= 0.85: severity = 'HIGH'
        else: severity = 'CRITICAL'
        
        return {
            'anomaly_score': round(anomaly_score, 3),
            'is_anomaly': anomaly_score >= 0.5 or bool(rule_anomalies),
            'severity': severity,
            'rule_violations': rule_anomalies
        }

anomaly_detector = AnomalyDetector()

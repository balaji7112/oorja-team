import os
from pathlib import Path

base_dir = r'C:\Users\Balaji\.gemini\antigravity\scratch\oorja-sync\ml-service'
os.makedirs(os.path.join(base_dir, 'routers'), exist_ok=True)
os.makedirs(os.path.join(base_dir, 'services'), exist_ok=True)
os.makedirs(os.path.join(base_dir, 'models'), exist_ok=True)
os.makedirs(os.path.join(base_dir, 'data'), exist_ok=True)

Path(os.path.join(base_dir, 'routers', '__init__.py')).touch()
Path(os.path.join(base_dir, 'services', '__init__.py')).touch()

reqs = '''fastapi==0.115.0
uvicorn[standard]==0.31.0
pandas==2.2.3
numpy==2.1.1
scikit-learn==1.5.2
joblib==1.4.2
python-dotenv==1.0.1
httpx==0.27.2
'''
with open(os.path.join(base_dir, 'requirements.txt'), 'w', encoding='utf-8') as f: f.write(reqs)

data_gen = '''import numpy as np
import pandas as pd
from datetime import datetime, timedelta

def generate_campus_data(seed=42, days=90):
    rng = np.random.default_rng(seed)
    start = datetime(2026, 6, 11, 0, 0)
    timestamps = [start + timedelta(hours=i) for i in range(days * 24)]
    
    records = []
    for i, ts in enumerate(timestamps):
        hour = ts.hour
        month = ts.month
        day_of_week = ts.weekday()
        is_weekend = day_of_week >= 5
        
        solar_angle = max(0, np.sin((hour - 6) / 12 * np.pi)) if 6 <= hour <= 18 else 0
        seasonal_factor = 0.85 + 0.15 * np.sin((month - 3) / 12 * 2 * np.pi)
        base_irradiance = 950 * solar_angle * seasonal_factor
        
        monsoon = month in [6, 7, 8, 9]
        cloud_base = 0.3 if monsoon else 0.15
        day_seed = (i // 24) * 31 + seed
        day_rng = np.random.default_rng(day_seed)
        cloud_cover = min(1.0, max(0, cloud_base + day_rng.normal(0, 0.2)))
        
        rain_prob = cloud_cover * (0.6 if monsoon else 0.2)
        effective_irradiance = base_irradiance * (1 - 0.85 * cloud_cover)
        
        base_temp = 28 + 8 * np.sin((month - 3) / 12 * 2 * np.pi)
        daily_variation = 8 * np.sin((hour - 6) / 24 * 2 * np.pi)
        temperature = base_temp + daily_variation + rng.normal(0, 1.5)
        
        wind_speed = max(0, 3 + 2 * np.sin(hour / 24 * 2 * np.pi) + rng.normal(0, 0.8))
        humidity = np.clip(60 + 20 * cloud_cover + rng.normal(0, 5), 30, 95)
        
        panel_capacity = 50
        temp_derating = 1 - 0.004 * max(0, temperature - 25)
        efficiency = 0.18 * temp_derating
        solar_power = max(0, (effective_irradiance / 1000) * panel_capacity * efficiency) if 6 <= hour <= 18 else 0
        solar_power *= (1 + rng.normal(0, 0.02))
        solar_power = max(0, solar_power)
        
        wind_power = max(0, min(5.0, 0.5 * wind_speed ** 1.5))
        wind_power += rng.normal(0, 0.1)
        wind_power = max(0, wind_power)
        
        academic_factor = 0 if is_weekend else (1 if 8 <= hour < 20 else 0.3)
        academic_load = 4.0 * academic_factor + rng.normal(0, 0.2)
        
        lab_factor = (0.5 if is_weekend else 1) * (1 if 9 <= hour < 21 else 0.1)
        lab_load = 6.0 * lab_factor + rng.normal(0, 0.3)
        
        library_factor = 1 if 8 <= hour < 20 else 0.1
        library_load = 2.0 * library_factor + rng.normal(0, 0.1)
        
        hostel_factor = 0.3 + 0.7 * max(0, np.sin((hour - 6) / 18 * np.pi)) if hour >= 6 else 0.5
        hostel_load = 3.0 * hostel_factor + rng.normal(0, 0.15)
        
        canteen_factor = 1 if hour in [7, 8, 12, 13, 18, 19] else 0.2
        canteen_load = 2.0 * canteen_factor + rng.normal(0, 0.1)
        
        ev_load = 7.0 if 10 <= hour < 14 else 0
        
        total_load = max(0, academic_load + lab_load + library_load + hostel_load + canteen_load + ev_load)
        
        anomaly_score = 0.0
        anomaly_type = None
        
        if (i // 24) == 15 and hour == 15:
            lab_load *= 2.5
            total_load += lab_load * 1.5
            anomaly_score = 0.87
            anomaly_type = \'LOAD_SPIKE\'
        
        if 30 * 24 <= i < 31 * 24:
            solar_power *= 0.6
            if solar_power > 0:
                anomaly_score = max(anomaly_score, 0.75)
                anomaly_type = \'SOLAR_DEGRADATION\'
        
        if (i // 24) == 45 and 2 <= hour < 5:
            lab_load = 4.0
            total_load = max(total_load, lab_load + 2)
            anomaly_score = max(anomaly_score, 0.65)
            anomaly_type = \'OVERNIGHT_CONSUMPTION\'
        
        record = {
            \'timestamp\': ts.isoformat(),
            \'hour\': hour,
            \'day_of_week\': day_of_week,
            \'month\': month,
            \'is_weekend\': is_weekend,
            \'temperature\': round(temperature, 2),
            \'humidity\': round(float(humidity), 2),
            \'wind_speed\': round(wind_speed, 2),
            \'cloud_cover\': round(cloud_cover, 3),
            \'rain_probability\': round(rain_prob, 3),
            \'solar_irradiance\': round(effective_irradiance, 2),
            \'solar_power\': round(float(solar_power), 3),
            \'wind_power\': round(float(wind_power), 3),
            \'total_load\': round(float(total_load), 3),
            \'academic_load\': round(float(academic_load), 3),
            \'lab_load\': round(float(lab_load), 3),
            \'library_load\': round(float(library_load), 3),
            \'hostel_load\': round(float(hostel_load), 3),
            \'canteen_load\': round(float(canteen_load), 3),
            \'ev_load\': round(float(ev_load), 3),
            \'anomaly_score\': round(anomaly_score, 3),
            \'anomaly_type\': anomaly_type,
        }
        records.append(record)
    
    df = pd.DataFrame(records)
    
    soc = 76.0
    battery_capacity = 40.0
    min_soc, max_soc = 20.0, 90.0
    charge_efficiency = 0.95
    discharge_efficiency = 0.95
    
    soc_values = []
    battery_action = []
    
    for idx, row in df.iterrows():
        net = row[\'solar_power\'] + row[\'wind_power\'] - row[\'total_load\']
        
        if net > 0 and soc < max_soc:
            charge_kw = min(net, 10.0)
            charge_kwh = charge_kw * charge_efficiency
            soc = min(max_soc, soc + (charge_kwh / battery_capacity) * 100)
            action = \'CHARGING\'
        elif net < 0 and soc > min_soc:
            discharge_kw = min(abs(net), 10.0)
            discharge_kwh = discharge_kw / discharge_efficiency
            soc = max(min_soc, soc - (discharge_kwh / battery_capacity) * 100)
            action = \'DISCHARGING\'
        else:
            action = \'HOLD\'
        
        soc_values.append(round(soc, 2))
        battery_action.append(action)
    
    df[\'battery_soc\'] = soc_values
    df[\'battery_action\'] = battery_action
    
    df[\'grid_import\'] = (df[\'total_load\'] - df[\'solar_power\'] - df[\'wind_power\']).clip(lower=0).round(3)
    df[\'grid_export\'] = (df[\'solar_power\'] + df[\'wind_power\'] - df[\'total_load\']).clip(lower=0).round(3)
    df[\'grid_dependency\'] = ((df[\'grid_import\'] / df[\'total_load\'].clip(lower=0.001)) * 100).round(2)
    df[\'renewable_share\'] = (100 - df[\'grid_dependency\']).clip(lower=0, upper=100).round(2)
    df[\'co2_avoided\'] = ((df[\'solar_power\'] + df[\'wind_power\']).clip(lower=0) * 0.82).round(3)
    
    return df

if __name__ == \'__main__\':
    import os
    os.makedirs(\'data\', exist_ok=True)
    df = generate_campus_data()
    df.to_csv(\'data/campus_energy_90d.csv\', index=False)
    print(f\'Generated {len(df)} records\')
    print(df.describe())
'''
with open(os.path.join(base_dir, 'services', 'data_generator.py'), 'w', encoding='utf-8') as f: f.write(data_gen)

solar_forecaster_py = '''import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
from pathlib import Path
from datetime import datetime

class SolarForecaster:
    def __init__(self):
        self.model = None
        self.model_path = Path('models/solar_model.joblib')
        self.metadata = {}
        self.feature_names = [
            'hour', 'month', 'day_of_week', 'is_weekend',
            'temperature', 'cloud_cover', 'solar_irradiance',
            'wind_speed', 'humidity', 'hour_sin', 'hour_cos',
            'month_sin', 'month_cos'
        ]
    
    def _add_cyclical_features(self, df):
        df = df.copy()
        df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 24)
        df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24)
        df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
        df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)
        return df
    
    def load(self):
        if self.model_path.exists():
            self.model = joblib.load(self.model_path)
            
    def train(self, df: pd.DataFrame) -> dict:
        df = self._add_cyclical_features(df)
        X = df[self.feature_names]
        y = df['solar_power']
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        self.model = RandomForestRegressor(
            n_estimators=150,
            max_depth=10,
            min_samples_leaf=5,
            random_state=42,
            n_jobs=-1
        )
        self.model.fit(X_train, y_train)
        
        y_pred = self.model.predict(X_test)
        mae = mean_absolute_error(y_test, y_pred)
        rmse = mean_squared_error(y_test, y_pred) ** 0.5
        r2 = r2_score(y_test, y_pred)
        
        self.metadata = {
            'version': '1.0.0',
            'model_type': 'RandomForestRegressor',
            'trained_at': datetime.utcnow().isoformat(),
            'data_points': len(df),
            'mae': round(mae, 4),
            'rmse': round(rmse, 4),
            'r2': round(r2, 4),
            'feature_importances': dict(zip(
                self.feature_names,
                [round(float(x), 4) for x in self.model.feature_importances_]
            ))
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
        prediction = max(0, prediction) if 6 <= features.get('hour', 12) <= 18 else 0.0
        
        tree_preds = np.array([tree.predict(X)[0] for tree in self.model.estimators_])
        std = float(np.std(tree_preds))
        
        return {
            'predicted': round(prediction, 3),
            'lower': round(max(0, prediction - 1.96 * std), 3),
            'upper': round(prediction + 1.96 * std, 3),
            'confidence': round(max(0.5, 1 - (std / max(1, prediction))), 3) if prediction > 0 else 1.0
        }
    
    def predict_24h(self, base_features: dict) -> list:
        current_hour = base_features.get('hour', 12)
        predictions = []
        for h in range(24):
            hour = (current_hour + h) % 24
            features = base_features.copy()
            features['hour'] = hour
            pred = self.predict(features)
            predictions.append({
                'hour': hour,
                'offset_hours': h,
                **pred
            })
        return predictions

solar_forecaster = SolarForecaster()
'''
with open(os.path.join(base_dir, 'services', 'solar_forecaster.py'), 'w', encoding='utf-8') as f: f.write(solar_forecaster_py)


demand_forecaster_py = '''import numpy as np
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
'''
with open(os.path.join(base_dir, 'services', 'demand_forecaster.py'), 'w', encoding='utf-8') as f: f.write(demand_forecaster_py)

anomaly_detector_py = '''import numpy as np
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
'''
with open(os.path.join(base_dir, 'services', 'anomaly_detector.py'), 'w', encoding='utf-8') as f: f.write(anomaly_detector_py)

predict_py = '''from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from services.solar_forecaster import solar_forecaster
from services.demand_forecaster import demand_forecaster

router = APIRouter()

class SolarForecastRequest(BaseModel):
    hour: int = Field(ge=0, le=23)
    month: int = Field(ge=1, le=12)
    day_of_week: int = Field(ge=0, le=6)
    is_weekend: bool = False
    temperature: float = Field(ge=-10, le=60)
    cloud_cover: float = Field(ge=0, le=1)
    solar_irradiance: float = Field(ge=0, le=1200)
    wind_speed: float = Field(ge=0, le=30)
    humidity: float = Field(ge=0, le=100)

class DemandForecastRequest(BaseModel):
    hour: int = Field(ge=0, le=23)
    month: int = Field(ge=1, le=12)
    day_of_week: int = Field(ge=0, le=6)
    is_weekend: bool = False
    temperature: float
    recent_load_1: Optional[float] = None
    recent_load_2: Optional[float] = None

@router.post('/solar')
async def predict_solar(req: SolarForecastRequest):
    try:
        result = solar_forecaster.predict(req.model_dump())
        return {'status': 'success', 'forecast': result, 'model_version': solar_forecaster.metadata.get('version', '1.0.0')}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/solar/24h')
async def predict_solar_24h(req: SolarForecastRequest):
    try:
        predictions = solar_forecaster.predict_24h(req.model_dump())
        return {'status': 'success', 'forecast_24h': predictions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/demand')
async def predict_demand(req: DemandForecastRequest):
    try:
        result = demand_forecaster.predict(req.model_dump())
        return {'status': 'success', 'forecast': result, 'model_version': demand_forecaster.metadata.get('version', '1.0.0')}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
'''
with open(os.path.join(base_dir, 'routers', 'predict.py'), 'w', encoding='utf-8') as f: f.write(predict_py)

detect_py = '''from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from services.anomaly_detector import anomaly_detector

router = APIRouter()

class SensorReading(BaseModel):
    solar_power: float = Field(ge=0)
    total_load: float = Field(ge=0)
    battery_soc: float = Field(ge=0, le=100)
    grid_import: float = Field(ge=0)
    temperature: float
    cloud_cover: float = Field(ge=0, le=1)
    hour: int = Field(ge=0, le=23)
    is_weekend: bool = False

@router.post('/anomaly')
async def detect_anomaly(req: SensorReading):
    try:
        result = anomaly_detector.detect(req.model_dump())
        return {'status': 'success', 'detection': result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
'''
with open(os.path.join(base_dir, 'routers', 'detect.py'), 'w', encoding='utf-8') as f: f.write(detect_py)

models_info_py = '''from fastapi import APIRouter
from services.solar_forecaster import solar_forecaster
from services.demand_forecaster import demand_forecaster
from services.anomaly_detector import anomaly_detector

router = APIRouter()

@router.get('/info')
async def get_model_info():
    return {
        'solar_forecast': solar_forecaster.metadata,
        'demand_forecast': demand_forecaster.metadata,
        'anomaly_detection': anomaly_detector.metadata
    }

@router.get('/solar')
async def solar_model_info():
    return solar_forecaster.metadata

@router.get('/demand')
async def demand_model_info():
    return demand_forecaster.metadata

@router.get('/anomaly')
async def anomaly_model_info():
    return anomaly_detector.metadata
'''
with open(os.path.join(base_dir, 'routers', 'models_info.py'), 'w', encoding='utf-8') as f: f.write(models_info_py)

main_py = '''from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import pandas as pd
import logging
from pathlib import Path

from services.data_generator import generate_campus_data
from services.solar_forecaster import solar_forecaster
from services.demand_forecaster import demand_forecaster
from services.anomaly_detector import anomaly_detector
from routers import predict, detect, models_info

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info('Starting OORJA SYNC ML Service...')
    
    data_path = Path('data/campus_energy_90d.csv')
    if not data_path.exists():
        logger.info('Generating 90-day campus energy dataset...')
        df = generate_campus_data(seed=42, days=90)
        data_path.parent.mkdir(exist_ok=True)
        df.to_csv(data_path, index=False)
        logger.info(f'Generated {len(df)} records')
    else:
        df = pd.read_csv(data_path)
        logger.info(f'Loaded existing dataset: {len(df)} records')
    
    if not Path('models/solar_model.joblib').exists():
        logger.info('Training solar forecast model...')
        metrics = solar_forecaster.train(df)
        logger.info(f'Solar model trained: MAE={metrics["mae"]}, R2={metrics["r2"]}')
    else:
        logger.info('Loading existing solar model...')
        solar_forecaster.load()
    
    if not Path('models/demand_model.joblib').exists():
        logger.info('Training demand forecast model...')
        metrics = demand_forecaster.train(df)
        logger.info(f'Demand model trained: MAE={metrics["mae"]}, R2={metrics["r2"]}')
    else:
        logger.info('Loading existing demand model...')
        demand_forecaster.load()
    
    if not Path('models/anomaly_model.joblib').exists():
        logger.info('Training anomaly detection model...')
        metrics = anomaly_detector.train(df)
        logger.info(f'Anomaly model trained: {metrics}')
    else:
        logger.info('Loading existing anomaly model...')
        anomaly_detector.load()
    
    app.state.df = df
    logger.info('ML Service ready!')
    yield
    logger.info('ML Service shutting down...')

app = FastAPI(
    title='OORJA SYNC ML Service',
    description='AI-powered energy forecasting and anomaly detection for OORJA SYNC',
    version='1.0.0',
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173', 'http://localhost:3000', '*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(predict.router, prefix='/predict', tags=['Forecasting'])
app.include_router(detect.router, prefix='/detect', tags=['Anomaly Detection'])
app.include_router(models_info.router, prefix='/model', tags=['Model Info'])

@app.get('/health')
async def health():
    return {'status': 'online', 'service': 'OORJA SYNC ML Service', 'version': '1.0.0'}
'''
with open(os.path.join(base_dir, 'main.py'), 'w', encoding='utf-8') as f: f.write(main_py)

run_py = '''import uvicorn
if __name__ == '__main__':
    uvicorn.run('main:app', host='0.0.0.0', port=8001, reload=False)
'''
with open(os.path.join(base_dir, 'run.py'), 'w', encoding='utf-8') as f: f.write(run_py)
print('Files created successfully.')

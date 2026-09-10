from fastapi import FastAPI
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

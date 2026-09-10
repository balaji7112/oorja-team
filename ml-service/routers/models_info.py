from fastapi import APIRouter
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

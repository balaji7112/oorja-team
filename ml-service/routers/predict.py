from fastapi import APIRouter, HTTPException
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

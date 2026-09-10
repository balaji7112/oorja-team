from fastapi import APIRouter, HTTPException
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

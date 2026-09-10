import numpy as np
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
            anomaly_type = 'LOAD_SPIKE'
        
        if 30 * 24 <= i < 31 * 24:
            solar_power *= 0.6
            if solar_power > 0:
                anomaly_score = max(anomaly_score, 0.75)
                anomaly_type = 'SOLAR_DEGRADATION'
        
        if (i // 24) == 45 and 2 <= hour < 5:
            lab_load = 4.0
            total_load = max(total_load, lab_load + 2)
            anomaly_score = max(anomaly_score, 0.65)
            anomaly_type = 'OVERNIGHT_CONSUMPTION'
        
        record = {
            'timestamp': ts.isoformat(),
            'hour': hour,
            'day_of_week': day_of_week,
            'month': month,
            'is_weekend': is_weekend,
            'temperature': round(temperature, 2),
            'humidity': round(float(humidity), 2),
            'wind_speed': round(wind_speed, 2),
            'cloud_cover': round(cloud_cover, 3),
            'rain_probability': round(rain_prob, 3),
            'solar_irradiance': round(effective_irradiance, 2),
            'solar_power': round(float(solar_power), 3),
            'wind_power': round(float(wind_power), 3),
            'total_load': round(float(total_load), 3),
            'academic_load': round(float(academic_load), 3),
            'lab_load': round(float(lab_load), 3),
            'library_load': round(float(library_load), 3),
            'hostel_load': round(float(hostel_load), 3),
            'canteen_load': round(float(canteen_load), 3),
            'ev_load': round(float(ev_load), 3),
            'anomaly_score': round(anomaly_score, 3),
            'anomaly_type': anomaly_type,
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
        net = row['solar_power'] + row['wind_power'] - row['total_load']
        
        if net > 0 and soc < max_soc:
            charge_kw = min(net, 10.0)
            charge_kwh = charge_kw * charge_efficiency
            soc = min(max_soc, soc + (charge_kwh / battery_capacity) * 100)
            action = 'CHARGING'
        elif net < 0 and soc > min_soc:
            discharge_kw = min(abs(net), 10.0)
            discharge_kwh = discharge_kw / discharge_efficiency
            soc = max(min_soc, soc - (discharge_kwh / battery_capacity) * 100)
            action = 'DISCHARGING'
        else:
            action = 'HOLD'
        
        soc_values.append(round(soc, 2))
        battery_action.append(action)
    
    df['battery_soc'] = soc_values
    df['battery_action'] = battery_action
    
    df['grid_import'] = (df['total_load'] - df['solar_power'] - df['wind_power']).clip(lower=0).round(3)
    df['grid_export'] = (df['solar_power'] + df['wind_power'] - df['total_load']).clip(lower=0).round(3)
    df['grid_dependency'] = ((df['grid_import'] / df['total_load'].clip(lower=0.001)) * 100).round(2)
    df['renewable_share'] = (100 - df['grid_dependency']).clip(lower=0, upper=100).round(2)
    df['co2_avoided'] = ((df['solar_power'] + df['wind_power']).clip(lower=0) * 0.82).round(3)
    
    return df

if __name__ == '__main__':
    import os
    os.makedirs('data', exist_ok=True)
    df = generate_campus_data()
    df.to_csv('data/campus_energy_90d.csv', index=False)
    print(f'Generated {len(df)} records')
    print(df.describe())

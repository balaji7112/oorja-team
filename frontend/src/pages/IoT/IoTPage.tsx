import React from 'react';
import { useEnergyStore } from '../../store/energyStore';
import GlassCard from '../../components/ui/GlassCard';
import KPICard from '../../components/ui/KPICard';
import { Cpu, Wifi, Battery, Sun, Wind } from 'lucide-react';

const DEVICES = [
  { id: 'solar-inv-1', name: 'Solar Inverter 1', type: 'Inverter', location: 'Solar Farm', status: 'ONLINE', protocol: 'Modbus RTU' },
  { id: 'solar-inv-2', name: 'Solar Inverter 2', type: 'Inverter', location: 'Solar Farm', status: 'ONLINE', protocol: 'Modbus RTU' },
  { id: 'bms-1', name: 'Battery BMS', type: 'BMS', location: 'Battery Block', status: 'ONLINE', protocol: 'CAN Bus' },
  { id: 'wind-ctrl', name: 'Wind Controller', type: 'SCADA', location: 'Wind Turbine', status: 'ONLINE', protocol: 'OPC-UA' },
  { id: 'meter-lab', name: 'Lab Smart Meter', type: 'Meter', location: 'Computer Lab', status: 'ONLINE', protocol: 'MQTT' },
  { id: 'meter-acad', name: 'Academic Meter', type: 'Meter', location: 'Academic Block', status: 'ONLINE', protocol: 'MQTT' },
  { id: 'meter-hostel', name: 'Hostel Meter', type: 'Meter', location: 'Hostel Block', status: 'ONLINE', protocol: 'MQTT' },
  { id: 'weather-stn', name: 'Weather Station', type: 'Sensor', location: 'Rooftop', status: 'ONLINE', protocol: 'HTTP/REST' },
];

export default function IoTPage() {
  const { activeFault } = useEnergyStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <Cpu size={20} color="var(--color-secondary)" />
        <h2 style={{ margin: 0, fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.2rem' }}>IoT Device Network</h2>
        <div className="status-demo">DEMO</div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <KPICard label="Devices Online" value={DEVICES.filter(d => !(activeFault === 'SENSOR_DISCONNECT' && d.id === 'meter-lab')).length} unit={`/ ${DEVICES.length}`} color="var(--color-primary)" />
        <KPICard label="Data Rate" value="3" unit="sec" color="var(--color-secondary)" />
        <KPICard label="Protocol Types" value="5" unit="" />
      </div>

      <GlassCard padding={0} style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
              {['Device', 'Type', 'Location', 'Protocol', 'Status', 'Last Seen'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DEVICES.map(dev => {
              const offline = activeFault === 'SENSOR_DISCONNECT' && dev.id === 'meter-lab';
              return (
                <tr key={dev.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '10px 16px', fontSize: '0.82rem', fontWeight: 600 }}>{dev.name}</td>
                  <td style={{ padding: '10px 16px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{dev.type}</td>
                  <td style={{ padding: '10px 16px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{dev.location}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ background: 'rgba(39,215,208,0.1)', border: '1px solid rgba(39,215,208,0.2)', borderRadius: 20, padding: '2px 8px', fontSize: '0.67rem', color: 'var(--color-secondary)' }}>{dev.protocol}</span>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: offline ? 'var(--color-critical)' : 'var(--color-primary)', animation: offline ? 'none' : 'pulse-dot 2s infinite' }} />
                      <span style={{ fontSize: '0.72rem', color: offline ? 'var(--color-critical)' : 'var(--color-primary)', fontWeight: 600 }}>{offline ? 'OFFLINE' : 'ONLINE'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{offline ? 'Disconnected' : 'Just now'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}

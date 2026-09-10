import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEnergyStore } from '../../store/energyStore';

export default function LiveBatteryChart({ height = 140 }: { height?: number }) {
  const { batteryHistory, battery } = useEnergyStore();
  const color = battery.soc > 50 ? '#20D67B' : battery.soc > 25 ? '#FFB84D' : '#FF5A5A';

  const option = useMemo(() => ({
    backgroundColor: 'transparent',
    grid: { top: 4, right: 4, bottom: 4, left: 4, containLabel: false },
    xAxis: { type: 'category', show: false, data: batteryHistory.map(p => p.t) },
    yAxis: { type: 'value', show: false, min: 0, max: 100 },
    series: [{
      type: 'line',
      data: batteryHistory.map(p => p.v),
      smooth: true,
      symbol: 'none',
      lineStyle: { color, width: 2 },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: `${color}33` },
            { offset: 1, color: `${color}05` },
          ],
        },
      },
    }],
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(9,20,17,0.95)',
      borderColor: `${color}50`,
      textStyle: { color: '#F4FAF7', fontSize: 11 },
      formatter: (params: any) => `${params[0]?.value?.toFixed(1) || 0}% SOC`,
    },
  }), [batteryHistory, color]);

  return <ReactECharts option={option} style={{ height }} notMerge />;
}

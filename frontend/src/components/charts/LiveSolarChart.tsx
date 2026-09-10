import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEnergyStore } from '../../store/energyStore';

export default function LiveSolarChart({ height = 140 }: { height?: number }) {
  const { solarHistory } = useEnergyStore();

  const option = useMemo(() => ({
    backgroundColor: 'transparent',
    grid: { top: 4, right: 4, bottom: 4, left: 4, containLabel: false },
    xAxis: { type: 'category', show: false, data: solarHistory.map(p => p.t) },
    yAxis: { type: 'value', show: false, min: 0, max: 30 },
    series: [{
      type: 'line',
      data: solarHistory.map(p => p.v),
      smooth: true,
      symbol: 'none',
      lineStyle: { color: '#FFB84D', width: 2 },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(255, 184, 77, 0.3)' },
            { offset: 1, color: 'rgba(255, 184, 77, 0.02)' },
          ],
        },
      },
    }],
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(9,20,17,0.95)',
      borderColor: 'rgba(255,184,77,0.3)',
      textStyle: { color: '#F4FAF7', fontSize: 11 },
      formatter: (params: any) => `${params[0]?.value?.toFixed(1) || 0} kW (SIMULATED)`,
    },
  }), [solarHistory]);

  return <ReactECharts option={option} style={{ height }} notMerge />;
}

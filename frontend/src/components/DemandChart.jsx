import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const DemandChart = ({ hourlyForecasts = [], height = 350 }) => {
  if (!hourlyForecasts || hourlyForecasts.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        No telemetry forecast data loaded.
      </div>
    );
  }

  const labels = hourlyForecasts.map((h) => {
    const d = new Date(h.timestamp);
    return `${String(d.getHours()).padStart(2, '0')}:00`;
  });

  const demandValues = hourlyForecasts.map((h) => h.predicted_demand_kw);

  const pointColors = hourlyForecasts.map((h) => {
    if (h.is_critical_overload) return '#ef4444';
    if (h.grid_mode === 'RENEWABLE_STORAGE') return '#f59e0b';
    return '#10b981';
  });

  const thresholdPlugin = {
    id: 'thresholdLinesReact',
    afterDraw: (chart) => {
      const { ctx, chartArea: { left, right, top, bottom }, scales: { y } } = chart;
      if (!y) return;

      // 160 kW line (Amber dashed)
      const y160 = y.getPixelForValue(160);
      if (y160 >= top && y160 <= bottom) {
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.moveTo(left, y160);
        ctx.lineTo(right, y160);
        ctx.stroke();

        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 11px Outfit, sans-serif';
        ctx.fillText('160 kW (Renewable Threshold)', right - 180, y160 - 6);
        ctx.restore();
      }

      // 200 kW line (Red dashed)
      const y200 = y.getPixelForValue(200);
      if (y200 >= top && y200 <= bottom) {
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.moveTo(left, y200);
        ctx.lineTo(right, y200);
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 11px Outfit, sans-serif';
        ctx.fillText('200 kW (Critical Overload)', right - 165, y200 - 6);
        ctx.restore();
      }
    }
  };

  const data = {
    labels,
    datasets: [
      {
        label: 'Predicted Demand (kW)',
        data: demandValues,
        borderColor: '#38bdf8',
        borderWidth: 2.5,
        pointBackgroundColor: pointColors,
        pointBorderColor: '#fff',
        pointBorderWidth: 1.5,
        pointRadius: 4.5,
        pointHoverRadius: 7,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 320);
          gradient.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
          gradient.addColorStop(0.7, 'rgba(99, 102, 241, 0.1)');
          gradient.addColorStop(1, 'rgba(15, 23, 42, 0.0)');
          return gradient;
        },
        fill: true,
        tension: 0.35,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.94)',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255, 255, 255, 0.12)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => {
            const item = hourlyForecasts[context.dataIndex];
            const mode = item ? item.grid_mode : '';
            const overload = item?.is_critical_overload ? ' ⚠️ CRITICAL OVERLOAD' : '';
            return [
              `Demand: ${context.parsed.y.toFixed(1)} kW`,
              `Power Source: ${mode}${overload}`,
              `Battery SoC: ${item ? item.battery_soc_pct : ''}%`
            ];
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { family: 'Outfit', size: 11 } },
      },
      y: {
        min: 40,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: {
          color: '#94a3b8',
          font: { family: 'Outfit', size: 11 },
          callback: (val) => `${val} kW`,
        },
      },
    },
  };

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      <Line data={data} options={options} plugins={[thresholdPlugin]} />
    </div>
  );
};

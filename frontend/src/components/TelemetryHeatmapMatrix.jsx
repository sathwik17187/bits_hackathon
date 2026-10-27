import React, { useState } from 'react';
import { Layers, Thermometer, Droplets, Sun, Zap, Info } from 'lucide-react';

export const TelemetryHeatmapMatrix = ({ hourlyForecasts = [] }) => {
  const [hoveredHour, setHoveredHour] = useState(null);

  if (!hourlyForecasts || hourlyForecasts.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No telemetry records available for heatmap matrix.
      </div>
    );
  }

  // Calculate min & max ranges for normalization
  const temps = hourlyForecasts.map(h => h.ambient_temp_c ?? 25);
  const humids = hourlyForecasts.map(h => h.humidity_pct ?? 50);
  const solars = hourlyForecasts.map(h => h.solar_irradiance_wm2 ?? 0);
  const demands = hourlyForecasts.map(h => h.predicted_demand_kw ?? 150);

  const minTemp = Math.min(...temps), maxTemp = Math.max(...temps);
  const minDemand = Math.min(...demands), maxDemand = Math.max(...demands);
  const maxSolar = Math.max(...solars) || 1;

  // Color generator for demand (Green < 160 kW, Orange 160-200 kW, Crimson >= 200 kW)
  const getDemandColor = (kw, isOverload, isRenewable) => {
    if (isOverload) return '#ef4444'; // Red
    if (isRenewable) return '#ff5f14'; // Orange
    return '#10b981'; // Green
  };

  const activeRecord = hoveredHour !== null ? hourlyForecasts[hoveredHour] : hourlyForecasts[0];

  return (
    <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="var(--color-precision-orange)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>
              24-Hour Telemetry Heatmap Matrix
            </h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
            Multi-variable chromatic matrix mapping ambient weather variables directly to QuickML kilowatt demand.
          </p>
        </div>

        {activeRecord && (
          <div style={{
            background: 'var(--crox-card-dark)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--crox-seam)',
            fontSize: '0.74rem',
            fontFamily: 'var(--font-mono)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <span style={{ color: 'var(--crox-orange)', fontWeight: 800 }}>HOUR {activeRecord.hour}:00</span>
            <span style={{ color: '#fff' }}>{activeRecord.predicted_demand_kw} kW</span>
            <span style={{ color: activeRecord.grid_mode === 'RENEWABLE_STORAGE' ? '#ff5f14' : '#10b981', fontWeight: 700 }}>
              [{activeRecord.grid_mode}]
            </span>
            <span style={{ color: '#8e95a0' }}>{activeRecord.ambient_temp_c}°C / {activeRecord.solar_irradiance_wm2} W/m²</span>
          </div>
        )}
      </div>

      {/* Heatmap Grid */}
      <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
        <div style={{ minWidth: '700px' }}>
          {/* Header Hour Numbers */}
          <div style={{ display: 'grid', gridTemplateColumns: '140px repeat(24, 1fr)', gap: '4px', marginBottom: '6px', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textAlign: 'center' }}>
            <div style={{ textAlign: 'left', paddingLeft: '6px' }}>VARIABLE // HOUR</div>
            {hourlyForecasts.map((h, idx) => (
              <div key={idx} style={{ fontWeight: hoveredHour === idx ? 800 : 500, color: hoveredHour === idx ? 'var(--crox-orange)' : 'inherit' }}>
                {String(h.hour).padStart(2, '0')}
              </div>
            ))}
          </div>

          {/* Row 1: Predicted Demand kW */}
          <div style={{ display: 'grid', gridTemplateColumns: '140px repeat(24, 1fr)', gap: '4px', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--crox-black)' }}>
              <Zap size={13} color="var(--crox-orange)" />
              DEMAND (kW)
            </div>
            {hourlyForecasts.map((h, idx) => {
              const bg = getDemandColor(h.predicted_demand_kw, h.is_critical_overload, h.grid_mode === 'RENEWABLE_STORAGE');
              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredHour(idx)}
                  style={{
                    height: '36px',
                    borderRadius: '2px',
                    background: bg,
                    opacity: hoveredHour === idx ? 1 : 0.88,
                    transform: hoveredHour === idx ? 'scale(1.08)' : 'scale(1)',
                    transition: 'all 0.12s ease',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.62rem',
                    fontFamily: 'var(--font-mono)',
                    color: '#fff',
                    fontWeight: 800,
                    boxShadow: hoveredHour === idx ? `0 0 10px ${bg}` : 'none'
                  }}
                  title={`Hour ${h.hour}:00: ${h.predicted_demand_kw} kW (${h.grid_mode})`}
                >
                  {Math.round(h.predicted_demand_kw)}
                </div>
              );
            })}
          </div>

          {/* Row 2: Solar Irradiance W/m² */}
          <div style={{ display: 'grid', gridTemplateColumns: '140px repeat(24, 1fr)', gap: '4px', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <Sun size={13} color="#f59e0b" />
              SOLAR (W/m²)
            </div>
            {hourlyForecasts.map((h, idx) => {
              const s = h.solar_irradiance_wm2 ?? 0;
              const ratio = Math.min(1, s / maxSolar);
              const bg = s > 0 ? `rgba(245, 158, 11, ${0.15 + ratio * 0.85})` : 'rgba(255, 255, 255, 0.04)';
              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredHour(idx)}
                  style={{
                    height: '28px',
                    borderRadius: '2px',
                    background: bg,
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.6rem',
                    fontFamily: 'var(--font-mono)',
                    color: s > 0 ? '#fbbf24' : '#6b7280'
                  }}
                >
                  {s > 0 ? Math.round(s) : '—'}
                </div>
              );
            })}
          </div>

          {/* Row 3: Ambient Temperature °C */}
          <div style={{ display: 'grid', gridTemplateColumns: '140px repeat(24, 1fr)', gap: '4px', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <Thermometer size={13} color="#ef4444" />
              TEMP (°C)
            </div>
            {hourlyForecasts.map((h, idx) => {
              const t = h.ambient_temp_c ?? 25;
              const ratio = maxTemp > minTemp ? (t - minTemp) / (maxTemp - minTemp) : 0.5;
              const bg = `rgba(239, 68, 68, ${0.15 + ratio * 0.75})`;
              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredHour(idx)}
                  style={{
                    height: '28px',
                    borderRadius: '2px',
                    background: bg,
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.6rem',
                    fontFamily: 'var(--font-mono)',
                    color: '#fca5a5'
                  }}
                >
                  {t.toFixed(0)}°
                </div>
              );
            })}
          </div>

          {/* Row 4: Relative Humidity % */}
          <div style={{ display: 'grid', gridTemplateColumns: '140px repeat(24, 1fr)', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <Droplets size={13} color="#0284c7" />
              HUMIDITY (%)
            </div>
            {hourlyForecasts.map((h, idx) => {
              const hum = h.humidity_pct ?? 50;
              const bg = `rgba(2, 132, 199, ${0.15 + (hum / 100) * 0.75})`;
              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredHour(idx)}
                  style={{
                    height: '28px',
                    borderRadius: '2px',
                    background: bg,
                    border: '1px solid rgba(2, 132, 199, 0.2)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.6rem',
                    fontFamily: 'var(--font-mono)',
                    color: '#7dd3fc'
                  }}
                >
                  {Math.round(hum)}%
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Heatmap Legend */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--crox-seam)', fontSize: '0.74rem', fontFamily: 'var(--font-mono)', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '2px' }} />
            Main Grid Mode (&le;160 kW)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', background: '#ff5f14', borderRadius: '2px' }} />
            Renewable BESS Mode (&gt;160 kW / 18-22h)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '2px' }} />
            Critical Overload (&ge;200 kW)
          </span>
        </div>
        <div style={{ color: 'var(--text-muted)' }}>
          QuickML Multivariate Regressor • 24 Cells
        </div>
      </div>
    </div>
  );
};

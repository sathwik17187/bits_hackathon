import React, { useState } from 'react';
import { DollarSign, Clock, Zap, Sun, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const TariffSpectrumMatrix = ({ hourlyForecasts = [] }) => {
  const [selectedHour, setSelectedHour] = useState(19);

  if (!hourlyForecasts || hourlyForecasts.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No tariff forecast logs available.
      </div>
    );
  }

  const selectedData = hourlyForecasts.find(h => h.hour === selectedHour) || hourlyForecasts[0];
  const isPeakWindow = selectedData.is_peak_window;
  const isOverload = selectedData.is_critical_overload;
  const tariffRate = isPeakWindow ? 0.28 : 0.12;
  const hourlyCostEst = (selectedData.predicted_demand_kw * tariffRate).toFixed(2);
  const batteryOffsetUsd = isPeakWindow ? (selectedData.predicted_demand_kw * (0.28 - 0.12)).toFixed(2) : '0.00';

  return (
    <div className="glass-card" style={{ padding: '26px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="var(--color-precision-orange)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>
              24-Hour Tariff Spectrum &amp; Load Intensity Matrix
            </h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
            Chronological demand blocks mapping time-of-use utility rates ($0.12 vs $0.28/kWh) with battery arbitrage savings.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: '#10b981' }}>
            ● Off-Peak $0.12/kWh (10PM-6PM)
          </span>
          <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: 'var(--crox-orange)' }}>
            ● Peak Peaker $0.28/kWh (6PM-10PM)
          </span>
        </div>
      </div>

      {/* 24-Hour Chromatic Spectrum Timeline Strip */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', gap: '3px', marginBottom: '8px' }}>
          {hourlyForecasts.map((h) => {
            const isSelected = h.hour === selectedHour;
            const isPeak = h.is_peak_window;
            const isCrit = h.is_critical_overload;
            const barBg = isCrit ? '#ef4444' : isPeak ? 'var(--crox-orange)' : '#10b981';

            return (
              <button
                key={h.hour}
                onClick={() => setSelectedHour(h.hour)}
                style={{
                  background: barBg,
                  border: isSelected ? '2px solid #fff' : '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '3px',
                  padding: '8px 2px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transform: isSelected ? 'scaleY(1.15)' : 'scaleY(1)',
                  transition: 'all 0.12s ease',
                  boxShadow: isSelected ? `0 0 12px ${barBg}` : 'none'
                }}
                title={`Hour ${h.hour}:00 - ${h.predicted_demand_kw} kW (${isPeak ? '$0.28' : '$0.12'})`}
              >
                <div style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: '#fff', fontWeight: 800 }}>
                  {String(h.hour).padStart(2, '0')}
                </div>
                <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.85)', marginTop: '2px' }}>
                  {Math.round(h.predicted_demand_kw)}
                </div>
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          <span>00:00 (MIDNIGHT)</span>
          <span>06:00 (SOLAR ONSET)</span>
          <span>12:00 (NOON SOLAR PEAK)</span>
          <span>18:00 (PEAKER SURGE)</span>
          <span>23:00 (NIGHT BASELOAD)</span>
        </div>
      </div>

      {/* Selected Hour Telemetry Inspection Card */}
      {selectedData && (
        <div style={{
          background: 'var(--crox-card-dark)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--crox-seam)',
          padding: '20px 24px',
          color: '#fff',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--crox-orange)', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
              INSPECTION TARGET // HOUR {String(selectedData.hour).padStart(2, '0')}:00
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-mono)', margin: '4px 0', color: '#fff' }}>
              {selectedData.predicted_demand_kw} <span style={{ fontSize: '0.9rem', color: '#8e95a0' }}>kW Demand</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: selectedData.grid_mode === 'RENEWABLE_STORAGE' ? 'var(--crox-orange)' : '#34d399', fontWeight: 700 }}>
              Status: {selectedData.grid_mode === 'RENEWABLE_STORAGE' ? '⚡ BESS Storage Supplying Load' : '🏢 Main Grid Feeding Baseload'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: '#8e95a0', fontFamily: 'var(--font-mono)' }}>TIME-OF-USE TARIFF</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: isPeakWindow ? '#f59e0b' : '#10b981', fontFamily: 'var(--font-mono)' }}>
              ${tariffRate.toFixed(2)} <span style={{ fontSize: '0.8rem', color: '#8e95a0' }}>/ kWh</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#9ca3af' }}>
              {isPeakWindow ? 'Peak Peaker Window (18:00–22:00)' : 'Standard Clean Off-Peak Tier'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: '#8e95a0', fontFamily: 'var(--font-mono)' }}>HOURLY EXPENDITURE</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>
              ${hourlyCostEst}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#34d399' }}>
              BESS Arbitrage Benefit: +${batteryOffsetUsd}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: '#8e95a0', fontFamily: 'var(--font-mono)' }}>WEATHER CONTEXT</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#fff' }}>
              {selectedData.ambient_temp_c ?? 26}°C • {selectedData.solar_irradiance_wm2 ?? 0} W/m²
            </div>
            <div style={{ fontSize: '0.74rem', color: '#8e95a0' }}>
              Relative Humidity: {selectedData.humidity_pct ?? 55}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

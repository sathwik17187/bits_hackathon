import React, { useState } from 'react';
import { TrendingUp, Download, Filter, Search, Sliders } from 'lucide-react';
import { useMicrogrid } from '../../context/MicrogridContext';
import { DemandChart } from '../../components/DemandChart';
import { WeatherSimulator } from '../../components/WeatherSimulator';

export const AdminForecastEngine = () => {
  const { forecastData } = useMicrogrid();
  const hourly = forecastData?.hourly_forecasts || [];
  const [filterMode, setFilterMode] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRows = hourly.filter((h) => {
    const matchesFilter =
      filterMode === 'ALL' ||
      (filterMode === 'MAIN_GRID' && h.grid_mode === 'MAIN_GRID') ||
      (filterMode === 'RENEWABLE' && h.grid_mode === 'RENEWABLE_STORAGE') ||
      (filterMode === 'OVERLOAD' && h.is_critical_overload);

    const matchesSearch =
      h.timestamp.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(h.predicted_demand_kw).includes(searchTerm);

    return matchesFilter && matchesSearch;
  });

  const exportCsv = () => {
    if (!hourly || hourly.length === 0) return;
    let csv = 'timestamp,target_demand_kw\n';
    hourly.forEach((h) => {
      csv += `${h.timestamp},${h.predicted_demand_kw}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'predictions.csv';
    link.click();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Forecast Lab & Analytics
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Inspect hourly machine learning predictions and validate multi-model feature responses.
          </p>
        </div>

        <button onClick={exportCsv} className="btn btn-primary">
          <Download size={16} />
          Export predictions.csv
        </button>
      </div>

      {/* Grid: Chart & Simulator */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '28px' }}>
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>24-Hour Horizon Load Curve</h3>
            <span className="badge badge-cyan">9.04 kW RMSE Ensemble</span>
          </div>
          <DemandChart hourlyForecasts={hourly} height={340} />
        </div>

        <div>
          <WeatherSimulator />
        </div>
      </div>

      {/* Hourly Data Table */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Hourly Dispatch Log Breakdown</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Full 24-hour tabular breakdown of telemetry and transition rules</p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {['ALL', 'MAIN_GRID', 'RENEWABLE', 'OVERLOAD'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterMode(f)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    border: '1px solid',
                    borderColor: filterMode === f ? 'var(--color-cyan)' : 'var(--border-subtle)',
                    background: filterMode === f ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                    color: filterMode === f ? 'var(--color-cyan)' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Search */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px' }} />
              <input
                type="text"
                placeholder="Search timestamp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '6px 12px 6px 30px',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.8)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 14px' }}>Timestamp</th>
                <th style={{ padding: '12px 14px' }}>Temp (°C)</th>
                <th style={{ padding: '12px 14px' }}>Humidity (%)</th>
                <th style={{ padding: '12px 14px' }}>Solar (W/m²)</th>
                <th style={{ padding: '12px 14px' }}>Forecast Demand (kW)</th>
                <th style={{ padding: '12px 14px' }}>Grid Mode</th>
                <th style={{ padding: '12px 14px' }}>Battery SoC</th>
                <th style={{ padding: '12px 14px' }}>Overload Alert</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((h, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600 }}>{h.timestamp}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{h.ambient_temp_c ? h.ambient_temp_c.toFixed(1) : '-'}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{h.humidity_pct ? h.humidity_pct.toFixed(0) : '-'}%</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{h.solar_irradiance_wm2 ? h.solar_irradiance_wm2.toFixed(0) : '-'}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--color-cyan)', fontWeight: 700 }}>{h.predicted_demand_kw} kW</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span className={`badge ${h.grid_mode === 'RENEWABLE_STORAGE' ? 'badge-renewable' : 'badge-main-grid'}`}>
                      {h.grid_mode === 'RENEWABLE_STORAGE' ? 'Renewable' : 'Main Grid'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>{h.battery_soc_pct}%</td>
                  <td style={{ padding: '12px 14px' }}>
                    {h.is_critical_overload ? (
                      <span className="badge badge-overload">Critical (≥200kW)</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Normal</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  BatteryCharging, 
  ArrowUpRight, 
  ArrowRight,
  ShieldCheck, 
  FileText 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMicrogrid } from '../../context/MicrogridContext';
import { DemandChart } from '../../components/DemandChart';
import { TimelineBar } from '../../components/TimelineBar';

export const AdminOverview = () => {
  const { forecastData, batterySoc, overrideMode } = useMicrogrid();
  const summary = forecastData?.summary;
  const hourly = forecastData?.hourly_forecasts || [];
  const firstHour = hourly[0];

  const effectiveGridMode = overrideMode === 'AUTO' 
    ? (firstHour ? firstHour.grid_mode : 'MAIN_GRID')
    : overrideMode === 'FORCE_RENEWABLE' ? 'RENEWABLE_STORAGE' : 'MAIN_GRID';

  return (
    <div>
      {/* Page Title */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Microgrid Command Center
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Real-time demand telemetry, automated source dispatching, and battery state monitoring.
        </p>
      </div>

      {/* Critical Overload Banner */}
      {summary?.has_critical_alert && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.16), rgba(153, 27, 27, 0.28))',
          border: '1px solid rgba(239, 68, 68, 0.45)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 0 25px rgba(239, 68, 68, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#fca5a5', fontSize: '0.98rem' }}>
                CRITICAL OVERLOAD ALERT: {summary.critical_overload_hours} HOURS EXCEED 200 kW
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                Peak evening demand spike detected. Automated microgrid transition rules actively buffering main grid.
              </div>
            </div>
          </div>
          <span className="badge badge-overload">Priority 1 Alarm</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {/* Active Grid Mode */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Active Power Source</span>
            <div className="kpi-icon">
              <Zap size={18} color="var(--color-cyan)" />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: effectiveGridMode === 'RENEWABLE_STORAGE' ? '#f59e0b' : '#10b981' }}>
              {effectiveGridMode === 'RENEWABLE_STORAGE' ? 'RENEWABLE' : 'MAIN GRID'}
            </span>
          </div>
          <div className="kpi-footer">
            <span className={`badge ${effectiveGridMode === 'RENEWABLE_STORAGE' ? 'badge-renewable' : 'badge-main-grid'}`}>
              {effectiveGridMode === 'RENEWABLE_STORAGE' ? 'Battery Dispatched' : 'Grid Active'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {overrideMode !== 'AUTO' ? `Override: ${overrideMode}` : 'Automated Logic'}
            </span>
          </div>
        </div>

        {/* 24h Peak Demand */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">24h Peak Demand</span>
            <div className="kpi-icon">
              <TrendingUp size={18} color="#38bdf8" />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: '#fff' }}>
              {summary ? summary.peak_demand_kw : '289.5'}
            </span>
            <span className="kpi-unit">kW</span>
          </div>
          <div className="kpi-footer">
            <span style={{ color: summary && summary.peak_demand_kw > 160 ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
              {summary ? `+${(summary.peak_demand_kw - 160).toFixed(1)} kW` : '+129.5 kW'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>over 160 kW threshold</span>
          </div>
        </div>

        {/* Critical Overload Events */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Overload Events (&ge;200kW)</span>
            <div className="kpi-icon">
              <AlertTriangle size={18} color="#ef4444" />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: summary?.critical_overload_hours > 0 ? '#ef4444' : '#fff' }}>
              {summary ? summary.critical_overload_hours : 0}
            </span>
            <span className="kpi-unit">Hours</span>
          </div>
          <div className="kpi-footer">
            <span className={`badge ${summary?.critical_overload_hours > 0 ? 'badge-overload' : 'badge-main-grid'}`}>
              {summary?.critical_overload_hours > 0 ? 'Critical Risk Active' : 'Normal Operating Envelope'}
            </span>
          </div>
        </div>

        {/* Battery State of Charge */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Battery Storage SoC</span>
            <div className="kpi-icon">
              <BatteryCharging size={18} color="#34d399" />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: '#34d399' }}>
              {batterySoc ? batterySoc.toFixed(1) : '85.0'}
            </span>
            <span className="kpi-unit">%</span>
          </div>
          {/* Progress Bar */}
          <div style={{ background: 'rgba(255, 255, 255, 0.08)', height: '8px', borderRadius: '4px', overflow: 'hidden', marginTop: '8px' }}>
            <div style={{
              height: '100%',
              width: `${batterySoc}%`,
              background: 'linear-gradient(90deg, #10b981, #38bdf8)',
              borderRadius: '4px',
              transition: 'width 0.4s ease'
            }} />
          </div>
          <div className="kpi-footer">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Reserve Margin: Safe (&gt;15%)
            </span>
          </div>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="glass-card" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} color="var(--color-cyan)" />
              24-Hour Energy Demand Forecast Curve
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Predicted hourly load in kW plotted with 160 kW switching threshold and 200 kW critical overload boundary.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/admin/forecast-engine" className="btn btn-secondary" style={{ fontSize: '0.82rem' }}>
              Open Forecast Lab <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Chart Component */}
        <DemandChart hourlyForecasts={hourly} height={380} />

        {/* 24h Timeline Bar */}
        <TimelineBar hourlyForecasts={hourly} />
      </div>

      {/* Quick Access Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <Link to="/admin/dispatch-controller" style={{ textDecoration: 'none' }}>
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
              <Zap size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#fff' }}>Smart Grid Transition Controller</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Configure rule thresholds and manual dispatch overrides.</div>
            </div>
          </div>
        </Link>

        <Link to="/admin/data-ingestion" style={{ textDecoration: 'none' }}>
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-cyan)' }}>
              <FileText size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#fff' }}>Telemetry Batch Ingestion</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Upload CSV telemetry files and export predictions.csv.</div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

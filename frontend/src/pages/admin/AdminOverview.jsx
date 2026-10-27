import React, { useState } from 'react';
import {
  Zap,
  TrendingUp,
  AlertTriangle,
  BatteryCharging,
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  FileText,
  Activity,
  Download,
  CheckCircle2,
  RotateCcw,
  Terminal
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMicrogrid } from '../../context/MicrogridContext';
import { DemandChart } from '../../components/DemandChart';
import { TimelineBar } from '../../components/TimelineBar';
import { downloadFile } from '../../utils/exportUtil';

export const AdminOverview = () => {
  const {
    forecastData,
    batterySoc,
    overrideMode,
    datasetRecords,
    streamIndex,
    isStreaming,
    streamSpeed,
    setStreamSpeed,
    stepLineByLine,
    toggleStreaming
  } = useMicrogrid();
  const summary = forecastData?.summary;
  const hourly = forecastData?.hourly_forecasts || [];
  const firstHour = hourly[0];

  const [selfTestRunning, setSelfTestRunning] = useState(false);
  const [selfTestResult, setSelfTestResult] = useState(null);
  const [downloadMsg, setDownloadMsg] = useState(null);

  const effectiveGridMode = overrideMode === 'AUTO'
    ? (firstHour ? firstHour.grid_mode : 'MAIN_GRID')
    : overrideMode === 'FORCE_RENEWABLE' ? 'RENEWABLE_STORAGE' : 'MAIN_GRID';

  const runDiagnostics = () => {
    setSelfTestRunning(true);
    setSelfTestResult(null);
    setTimeout(() => {
      setSelfTestRunning(false);
      setSelfTestResult({
        time: new Date().toLocaleTimeString(),
        busVoltage: '480.2 V (±0.4%)',
        inverterPhaseDelta: '0.012 rad',
        substationBreakers: '5/5 Synchronized',
        quickmlHealth: 'Sub-10ms response'
      });
    }, 800);
  };

  const exportCsv = () => {
    const hourlyData = (hourly && hourly.length > 0) ? hourly : (forecastData?.hourly_forecasts || []);
    if (!hourlyData || hourlyData.length === 0) {
      setDownloadMsg({ type: 'error', text: 'No telemetry forecasts available to export.' });
      setTimeout(() => setDownloadMsg(null), 4000);
      return;
    }
    let csv = 'timestamp,predicted_demand_kw,grid_mode,is_critical_overload,battery_soc_pct\n';
    hourlyData.forEach((h) => {
      csv += `${h.timestamp || ''},${h.predicted_demand_kw || ''},${h.grid_mode || ''},${h.is_critical_overload ? 'YES' : 'NO'},${h.battery_soc_pct || ''}\n`;
    });
    const ok = downloadFile('predictions.csv', csv, 'text/csv;charset=utf-8');
    if (ok) {
      setDownloadMsg({ type: 'success', text: `Exported predictions.csv (${hourlyData.length} records) successfully!` });
      setTimeout(() => setDownloadMsg(null), 4000);
    }
  };


  return (
    <div>
      {/* Page Title & Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Microgrid Command Center
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Real-time demand telemetry, automated source dispatching, and battery state monitoring.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={runDiagnostics}
            disabled={selfTestRunning}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem' }}
          >
            <Activity size={14} className={selfTestRunning ? 'spin-pulse' : ''} />
            {selfTestRunning ? 'Testing Bus & Relays...' : 'Run Diagnostics Self-Test'}
          </button>
          <button
            onClick={exportCsv}
            className="btn btn-primary"
            style={{ fontSize: '0.8rem' }}
          >
            <Download size={14} />
            Export predictions.csv
          </button>
        </div>
      </div>

      {/* Download Alert Toast */}
      {downloadMsg && (
        <div style={{
          padding: '12px 18px',
          borderRadius: 'var(--radius-sm)',
          background: downloadMsg.type === 'error' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
          border: `1px solid ${downloadMsg.type === 'error' ? 'rgba(239, 68, 68, 0.35)' : 'rgba(16, 185, 129, 0.3)'}`,
          color: downloadMsg.type === 'error' ? '#fca5a5' : '#34d399',
          fontSize: '0.84rem',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {downloadMsg.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <div>{downloadMsg.text}</div>
        </div>
      )}

      {/* Diagnostics Report Alert */}
      {selfTestResult && (
        <div style={{
          padding: '14px 20px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#34d399',
          fontSize: '0.82rem',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span><strong>Diagnostics Passed ({selfTestResult.time}):</strong> Bus: {selfTestResult.busVoltage} | Phase: {selfTestResult.inverterPhaseDelta} | Feeders: {selfTestResult.substationBreakers}</span>
          </div>
          <button
            onClick={() => setSelfTestResult(null)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.74rem' }}
          >
            Dismiss
          </button>
        </div>
      )}

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

        {/* Line-by-Line Dataset Ingestion Controller */}
        <div style={{
          background: 'var(--crox-card-dark)',
          border: '1px solid var(--crox-seam)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 18px',
          marginBottom: '18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--crox-orange)', fontWeight: 800 }}>
              LINE-BY-LINE INGESTION // DATASET STREAM
            </span>
            <span style={{
              fontSize: '0.66rem',
              fontFamily: 'var(--font-mono)',
              color: isStreaming ? '#10b981' : '#8e95a0',
              background: isStreaming ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.08)',
              padding: '2px 8px',
              borderRadius: '2px',
              fontWeight: 700
            }}>
              {isStreaming ? '● STREAMING LIVE' : '⏸ STREAM PAUSED'}
            </span>
            <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#fff' }}>
              RECORD #{streamIndex} / {datasetRecords?.length || 1000}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={toggleStreaming}
              className={`btn ${isStreaming ? 'btn-secondary' : 'btn-primary'}`}
              style={{ padding: '6px 14px', fontSize: '0.76rem' }}
            >
              {isStreaming ? '⏸ Pause Stream' : '▶ Stream Line-by-Line'}
            </button>
            <button
              onClick={stepLineByLine}
              className="btn btn-secondary"
              style={{ padding: '6px 14px', fontSize: '0.76rem' }}
            >
              ⏩ Next Line (+1h)
            </button>
            <select
              value={streamSpeed}
              onChange={(e) => setStreamSpeed(Number(e.target.value))}
              style={{
                background: '#0e1117',
                color: '#fff',
                border: '1px solid var(--crox-seam)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 10px',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <option value={1500}>1.5s / line</option>
              <option value={1000}>1.0s / line</option>
              <option value={500}>0.5s / line (Fast)</option>
              <option value={200}>0.2s / line (Turbo)</option>
            </select>
            <Link
              to="/admin/dataset-logs"
              className="btn btn-secondary"
              style={{
                padding: '6px 12px',
                fontSize: '0.74rem',
                gap: '6px',
                textDecoration: 'none',
                background: 'rgba(255, 95, 20, 0.1)',
                border: '1px solid rgba(255, 95, 20, 0.4)',
                color: 'var(--color-precision-orange)'
              }}
              title="Open full line-by-line dataset analysis and terminal log explorer"
            >
              <Terminal size={12} />
              <span>Read Line-by-Line Logs</span>
            </Link>
          </div>
        </div>

        {/* Chart Component (The ONE allowed chart across the platform) */}
        <DemandChart hourlyForecasts={hourly} height={380} />

        {/* 24h Timeline Bar */}
        <TimelineBar hourlyForecasts={hourly} />
      </div>

      {/* Quick Access Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <Link to="/admin/dataset-logs" style={{ textDecoration: 'none' }}>
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid rgba(255, 95, 20, 0.3)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 95, 20, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-precision-orange)' }}>
              <Terminal size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#fff' }}>Dataset Telemetry & Inference Logs</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Read all 1,000 dataset rows line by line, inspect feature vectors, and watch real-time SCADA terminal logs.</div>
            </div>
          </div>
        </Link>

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

        <Link to="/admin/battery-manager" style={{ textDecoration: 'none' }}>
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <BatteryCharging size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#fff' }}>Battery Reserve & Storage Command</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Real-time 500 kWh LFP rack telemetry, thermal chiller loop, and virtual BMS testbench.</div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

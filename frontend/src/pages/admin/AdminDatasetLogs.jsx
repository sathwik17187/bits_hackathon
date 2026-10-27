import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  Download, 
  Terminal, 
  Table, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertTriangle, 
  Zap, 
  BatteryCharging, 
  ArrowLeft, 
  Sun, 
  Thermometer, 
  Droplets, 
  Eye, 
  Copy, 
  Check, 
  FastForward, 
  Sliders, 
  Layers,
  Flame,
  Clock,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { useMicrogrid } from '../../context/MicrogridContext';
import { downloadFile } from '../../utils/exportUtil';

export const AdminDatasetLogs = () => {
  const navigate = useNavigate();
  const { 
    datasetRecords, 
    streamIndex, 
    isStreaming, 
    streamSpeed, 
    setStreamSpeed, 
    stepLineByLine, 
    toggleStreaming, 
    inferenceLogs, 
    resetStream, 
    jumpToLine, 
    clearLogs,
    batterySoc
  } = useMicrogrid();

  // Local state
  const [activeTab, setActiveTab] = useState('table'); // 'table' | 'terminal'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' | 'RENEWABLE_STORAGE' | 'GRID_ASSISTED' | 'DIESEL_PEAK'
  const [filterOverloadOnly, setFilterOverloadOnly] = useState(false);
  const [jumpInput, setJumpInput] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const [preloading, setPreloading] = useState(false);
  const [preloadStatus, setPreloadStatus] = useState(null);

  // Terminal autoscroll ref
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (autoScroll && activeTab === 'terminal' && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [inferenceLogs, autoScroll, activeTab]);

  // Total lines in dataset
  const totalLines = datasetRecords?.length || 1000;
  const progressPct = Math.min(100, Math.round((streamIndex / totalLines) * 100 * 10) / 10);

  // Latest inferred row
  const latestRow = inferenceLogs[0] || null;

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return inferenceLogs.filter((log) => {
      if (filterOverloadOnly && !log.is_critical_overload) return false;
      if (filterMode !== 'ALL' && log.grid_mode !== filterMode) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesIndex = String(log.lineIndex).includes(q);
        const matchesTime = (log.timestamp || '').toLowerCase().includes(q);
        const matchesMode = (log.grid_mode || '').toLowerCase().includes(q);
        return matchesIndex || matchesTime || matchesMode;
      }
      return true;
    });
  }, [inferenceLogs, filterMode, filterOverloadOnly, searchQuery]);

  // Jump to specific line
  const handleJump = (e) => {
    e.preventDefault();
    const val = parseInt(jumpInput, 10);
    if (!isNaN(val) && val >= 1 && val <= totalLines) {
      jumpToLine(val - 1);
      setJumpInput('');
    }
  };

  // Preload batch (e.g. next 24 lines or all lines)
  const handleBatchPreload = async (count = 24) => {
    setPreloading(true);
    setPreloadStatus(`Evaluating next ${count} lines through model...`);
    try {
      const res = await fetch(`/api/analyze-dataset-lines?offset=${streamIndex}&limit=${count}&initial_battery_soc=${batterySoc}`);
      if (!res.ok) throw new Error('Batch inference failed');
      const data = await res.json();
      if (data.records && data.records.length > 0) {
        jumpToLine(streamIndex + data.records.length);
        setPreloadStatus(`Successfully evaluated ${data.records.length} records!`);
      }
    } catch (err) {
      setPreloadStatus(`Batch evaluation error: ${err.message}`);
    } finally {
      setPreloading(false);
      setTimeout(() => setPreloadStatus(null), 4000);
    }
  };

  // Download Logs as CSV
  const handleExportCsv = () => {
    if (inferenceLogs.length === 0) return;
    let csv = 'line_index,timestamp,ambient_temp_c,humidity_pct,solar_irradiance_wm2,predicted_demand_kw,grid_mode,battery_soc_pct,battery_soc_delta,is_critical_overload,duration_ms\n';
    inferenceLogs.forEach((row) => {
      csv += `${row.lineIndex || ''},${row.timestamp || ''},${row.ambient_temp_c || ''},${row.humidity_pct || ''},${row.solar_irradiance_wm2 || ''},${row.predicted_demand_kw || ''},${row.grid_mode || ''},${row.battery_soc_pct || ''},${row.battery_soc_delta || ''},${row.is_critical_overload ? 'YES' : 'NO'},${row.duration_ms || ''}\n`;
    });
    downloadFile(`dataset_inference_logs_line_${streamIndex}.csv`, csv, 'text/csv;charset=utf-8');
  };

  // Download Logs as JSON
  const handleExportJson = () => {
    if (inferenceLogs.length === 0) return;
    const jsonStr = JSON.stringify(inferenceLogs, null, 2);
    downloadFile(`dataset_inference_logs_line_${streamIndex}.json`, jsonStr, 'application/json;charset=utf-8');
  };

  // Copy selected record JSON
  const handleCopyRecord = () => {
    if (!selectedRecord) return;
    navigator.clipboard.writeText(JSON.stringify(selectedRecord, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <button
            onClick={() => navigate('/admin/overview')}
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.74rem', marginBottom: '8px', gap: '6px' }}
          >
            <ArrowLeft size={12} />
            <span>Back to Command Center</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
              Dataset Inference & Telemetry Logs
            </h1>
            <span style={{
              fontSize: '0.68rem',
              fontFamily: 'var(--font-mono)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm)',
              background: isStreaming ? 'rgba(255, 95, 20, 0.15)' : 'rgba(0, 230, 153, 0.12)',
              border: isStreaming ? '1px solid var(--color-precision-orange)' : '1px solid var(--color-emerald)',
              color: isStreaming ? 'var(--color-precision-orange)' : 'var(--color-emerald)',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: isStreaming ? 'var(--color-precision-orange)' : 'var(--color-emerald)',
                animation: isStreaming ? 'pulse 1.2s infinite' : 'none'
              }} />
              {isStreaming ? 'STREAMING ACTIVE' : 'STREAM IDLE'}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '4px', maxWidth: '780px' }}>
            Real-time telemetry ingestion and line-by-line model inference engine. Feed raw microgrid datasets directly into the ML model, observe transition policies, and inspect system log traces.
          </p>
        </div>

        {/* Global actions */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={handleExportCsv}
            className="btn btn-secondary"
            style={{ fontSize: '0.78rem', padding: '6px 12px', gap: '6px' }}
            disabled={inferenceLogs.length === 0}
            title="Download verified CSV log of all evaluated lines"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportJson}
            className="btn btn-secondary"
            style={{ fontSize: '0.78rem', padding: '6px 12px', gap: '6px' }}
            disabled={inferenceLogs.length === 0}
            title="Download JSON telemetry logs"
          >
            <Download size={13} />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Industrial Playback & Streaming Controller Deck */}
      <div className="card" style={{ marginBottom: '24px', background: 'var(--crox-card-dark, #141619)', borderColor: 'var(--border-grid)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 95, 20, 0.12)',
              border: '1px solid rgba(255, 95, 20, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-precision-orange)'
            }}>
              <Zap size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                Dataset Ingestion Controller // sample_test_input.csv
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Line Record</span>
                <span style={{ color: 'var(--color-precision-orange)', fontFamily: 'var(--font-mono)' }}>
                  #{streamIndex.toString().padStart(4, '0')}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>/ {totalLines}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px' }}>
                  {progressPct}% Ingested
                </span>
              </div>
            </div>
          </div>

          {/* Controller buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={toggleStreaming}
              className="btn btn-primary"
              style={{
                background: isStreaming ? '#ff3b30' : 'var(--color-precision-orange)',
                borderColor: isStreaming ? '#ff3b30' : 'var(--color-precision-orange)',
                padding: '7px 16px',
                fontSize: '0.82rem',
                gap: '8px'
              }}
            >
              {isStreaming ? <Pause size={14} /> : <Play size={14} />}
              <span>{isStreaming ? 'Pause Stream' : 'Stream Line-by-Line'}</span>
            </button>

            <button
              onClick={stepLineByLine}
              disabled={isStreaming}
              className="btn btn-secondary"
              style={{ padding: '7px 12px', fontSize: '0.82rem', gap: '6px' }}
              title="Step forward +1 record into the model"
            >
              <SkipForward size={14} />
              <span>Step (+1h)</span>
            </button>

            <button
              onClick={() => handleBatchPreload(24)}
              disabled={isStreaming || preloading}
              className="btn btn-secondary"
              style={{ padding: '7px 12px', fontSize: '0.82rem', gap: '6px' }}
              title="Preload next 24 hours of dataset through model"
            >
              <FastForward size={14} />
              <span>Batch (+24h)</span>
            </button>

            {/* Speed dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.04)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-grid)' }}>
              <Clock size={12} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>SPEED:</span>
              <select
                value={streamSpeed}
                onChange={(e) => setStreamSpeed(Number(e.target.value))}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value={2000} style={{ background: '#1a1f26' }}>0.5x (2.0s)</option>
                <option value={1000} style={{ background: '#1a1f26' }}>1.0x (1.0s)</option>
                <option value={500} style={{ background: '#1a1f26' }}>2.0x (0.5s)</option>
                <option value={250} style={{ background: '#1a1f26' }}>4.0x (250ms)</option>
                <option value={100} style={{ background: '#1a1f26' }}>10.0x (100ms)</option>
              </select>
            </div>

            {/* Jump input */}
            <form onSubmit={handleJump} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input
                type="number"
                min="1"
                max={totalLines}
                placeholder="Line #"
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                style={{
                  width: '74px',
                  padding: '5px 8px',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-grid)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  outline: 'none'
                }}
              />
              <button type="submit" className="btn btn-secondary" style={{ padding: '5px 8px', fontSize: '0.72rem' }}>
                Go
              </button>
            </form>

            <button
              onClick={() => resetStream(0)}
              className="btn btn-secondary"
              style={{ padding: '7px 10px', fontSize: '0.8rem' }}
              title="Reset stream index back to line 0"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden', position: 'relative' }}>
          <div
            style={{
              width: `${progressPct}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--color-precision-orange), #ff9040)',
              borderRadius: '3px',
              transition: 'width 0.2s ease',
              boxShadow: '0 0 10px rgba(255, 95, 20, 0.5)'
            }}
          />
        </div>

        {preloadStatus && (
          <div style={{ marginTop: '10px', fontSize: '0.76rem', color: 'var(--color-precision-orange)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={12} className="spin" />
            <span>{preloadStatus}</span>
          </div>
        )}
      </div>

      {/* 5 SCADA Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '16px', background: 'var(--crox-card-dark, #141619)' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
            Active Stream Index
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            #{streamIndex}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {totalLines - streamIndex} lines remaining
          </div>
        </div>

        <div className="card" style={{ padding: '16px', background: 'var(--crox-card-dark, #141619)' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
            Latest Inferred Demand
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-precision-orange)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            {latestRow ? `${latestRow.predicted_demand_kw} kW` : '-- kW'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            ML QuickML Ensemble (~9 kW RMSE)
          </div>
        </div>

        <div className="card" style={{ padding: '16px', background: 'var(--crox-card-dark, #141619)' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
            Active Dispatch Mode
          </div>
          <div style={{ marginTop: '6px' }}>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)',
              background: latestRow?.grid_mode === 'RENEWABLE_STORAGE' ? 'rgba(0, 230, 153, 0.15)' : 'rgba(255, 95, 20, 0.15)',
              border: latestRow?.grid_mode === 'RENEWABLE_STORAGE' ? '1px solid var(--color-emerald)' : '1px solid var(--color-precision-orange)',
              color: latestRow?.grid_mode === 'RENEWABLE_STORAGE' ? 'var(--color-emerald)' : 'var(--color-precision-orange)'
            }}>
              {latestRow?.grid_mode || 'AUTONOMOUS'}
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Policy Transition Engine
          </div>
        </div>

        <div className="card" style={{ padding: '16px', background: 'var(--crox-card-dark, #141619)' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
            Reserve Battery SoC
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            {latestRow ? `${latestRow.battery_soc_pct}%` : `${batterySoc}%`}
          </div>
          <div style={{ fontSize: '0.72rem', color: latestRow?.battery_soc_delta >= 0 ? 'var(--color-emerald)' : 'var(--color-precision-orange)', marginTop: '2px' }}>
            {latestRow ? `${latestRow.battery_soc_delta >= 0 ? '+' : ''}${latestRow.battery_soc_delta}% this line` : 'Nominal capacity'}
          </div>
        </div>

        <div className="card" style={{ padding: '16px', background: 'var(--crox-card-dark, #141619)' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
            Model Inference Latency
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            {latestRow ? `${latestRow.duration_ms} ms` : '8.2 ms'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-emerald)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={11} /> Real-time edge latency
          </div>
        </div>
      </div>

      {/* Main Section: View Tabs & Filter Bar */}
      <div className="card" style={{ padding: '0', background: 'var(--crox-card-dark, #141619)', borderColor: 'var(--border-grid)', overflow: 'hidden' }}>
        {/* Navigation & Toolbar Header */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border-grid)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'rgba(0,0,0,0.2)'
        }}>
          {/* Tab buttons */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setActiveTab('table')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: activeTab === 'table' ? 'var(--color-precision-orange)' : 'rgba(255,255,255,0.05)',
                color: activeTab === 'table' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                transition: 'var(--transition)'
              }}
            >
              <Table size={14} />
              <span>Telemetry Matrix ({filteredLogs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('terminal')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: activeTab === 'terminal' ? 'var(--color-precision-orange)' : 'rgba(255,255,255,0.05)',
                color: activeTab === 'terminal' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                transition: 'var(--transition)'
              }}
            >
              <Terminal size={14} />
              <span>SCADA Terminal Feed</span>
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Search input */}
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search index, time, mode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '6px 10px 6px 30px',
                  fontSize: '0.75rem',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-grid)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  width: '200px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Mode filter */}
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              style={{
                padding: '6px 10px',
                fontSize: '0.75rem',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-grid)',
                borderRadius: 'var(--radius-sm)',
                color: '#fff',
                outline: 'none',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <option value="ALL">All Modes</option>
              <option value="RENEWABLE_STORAGE">Renewable Only</option>
              <option value="GRID_ASSISTED">Grid Assisted</option>
              <option value="DIESEL_PEAK">Diesel Peak</option>
            </select>

            {/* Overload filter toggle */}
            <button
              onClick={() => setFilterOverloadOnly((p) => !p)}
              style={{
                padding: '6px 10px',
                fontSize: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                background: filterOverloadOnly ? 'rgba(255, 59, 48, 0.2)' : 'rgba(255,255,255,0.05)',
                border: filterOverloadOnly ? '1px solid #ff3b30' : '1px solid var(--border-grid)',
                color: filterOverloadOnly ? '#ff3b30' : 'var(--text-secondary)'
              }}
            >
              Overload Alerts
            </button>

            {activeTab === 'terminal' && (
              <button
                onClick={() => setAutoScroll((p) => !p)}
                style={{
                  padding: '6px 10px',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  background: autoScroll ? 'rgba(0, 230, 153, 0.15)' : 'rgba(255,255,255,0.05)',
                  border: autoScroll ? '1px solid var(--color-emerald)' : '1px solid var(--border-grid)',
                  color: autoScroll ? 'var(--color-emerald)' : 'var(--text-secondary)'
                }}
              >
                Auto-scroll {autoScroll ? 'ON' : 'OFF'}
              </button>
            )}

            <button
              onClick={clearLogs}
              className="btn btn-secondary"
              style={{ padding: '6px 10px', fontSize: '0.75rem' }}
              title="Clear in-memory log buffer"
            >
              Clear Buffer
            </button>
          </div>
        </div>

        {/* Tab 1: Telemetry Matrix (High-Density Engineering Table) */}
        {activeTab === 'table' && (
          <div style={{ overflowX: 'auto', maxHeight: '560px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid var(--border-grid)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 14px' }}>Index</th>
                  <th style={{ padding: '10px 14px' }}>Dataset Timestamp</th>
                  <th style={{ padding: '10px 14px' }}>Ambient Temp</th>
                  <th style={{ padding: '10px 14px' }}>Humidity</th>
                  <th style={{ padding: '10px 14px' }}>Solar Irradiance</th>
                  <th style={{ padding: '10px 14px' }}>Inferred Load</th>
                  <th style={{ padding: '10px 14px' }}>Grid Policy</th>
                  <th style={{ padding: '10px 14px' }}>Battery SoC</th>
                  <th style={{ padding: '10px 14px' }}>Overload</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No telemetry logs match the current filter. Ingest records using the controller above.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((row) => {
                    const isRenewable = row.grid_mode === 'RENEWABLE_STORAGE';
                    return (
                      <tr
                        key={row.id}
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 95, 20, 0.04)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        {/* Line Index */}
                        <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: 'var(--color-precision-orange)', fontWeight: 700 }}>
                          #{String(row.lineIndex).padStart(4, '0')}
                        </td>

                        {/* Timestamp */}
                        <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                          {row.timestamp || '--'}
                        </td>

                        {/* Ambient Temp */}
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontFamily: 'var(--font-mono)',
                            background: row.ambient_temp_c > 30 ? 'rgba(255, 95, 20, 0.15)' : 'rgba(0, 150, 255, 0.12)',
                            color: row.ambient_temp_c > 30 ? 'var(--color-precision-orange)' : '#60a5fa'
                          }}>
                            {row.ambient_temp_c != null ? `${row.ambient_temp_c.toFixed(1)}°C` : '--'}
                          </span>
                        </td>

                        {/* Humidity */}
                        <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                          {row.humidity_pct != null ? `${row.humidity_pct.toFixed(0)}%` : '--'}
                        </td>

                        {/* Solar Irradiance */}
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontFamily: 'var(--font-mono)',
                            background: row.solar_irradiance_wm2 > 200 ? 'rgba(255, 215, 0, 0.12)' : 'rgba(255,255,255,0.05)',
                            color: row.solar_irradiance_wm2 > 200 ? '#ffd700' : 'var(--text-muted)'
                          }}>
                            {row.solar_irradiance_wm2 != null ? `${row.solar_irradiance_wm2.toFixed(0)} W/m²` : '--'}
                          </span>
                        </td>

                        {/* Predicted Demand kW */}
                        <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fff' }}>
                          {row.predicted_demand_kw != null ? `${row.predicted_demand_kw.toFixed(2)} kW` : '--'}
                        </td>

                        {/* Grid Mode */}
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-sm)',
                            fontFamily: 'var(--font-mono)',
                            background: isRenewable ? 'rgba(0, 230, 153, 0.15)' : 'rgba(255, 95, 20, 0.15)',
                            color: isRenewable ? 'var(--color-emerald)' : 'var(--color-precision-orange)',
                            border: isRenewable ? '1px solid rgba(0, 230, 153, 0.4)' : '1px solid rgba(255, 95, 20, 0.4)'
                          }}>
                            {row.grid_mode || 'UNKNOWN'}
                          </span>
                        </td>

                        {/* Battery SoC */}
                        <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>{row.battery_soc_pct != null ? `${row.battery_soc_pct}%` : '--'}</span>
                            {row.battery_soc_delta !== 0 && row.battery_soc_delta != null && (
                              <span style={{ fontSize: '0.7rem', color: row.battery_soc_delta > 0 ? 'var(--color-emerald)' : 'var(--color-precision-orange)' }}>
                                ({row.battery_soc_delta > 0 ? '+' : ''}{row.battery_soc_delta}%)
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Overload */}
                        <td style={{ padding: '10px 14px' }}>
                          {row.is_critical_overload ? (
                            <span style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: 'rgba(255, 59, 48, 0.2)',
                              color: '#ff3b30',
                              border: '1px solid #ff3b30'
                            }}>
                              OVERLOAD
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.68rem', color: 'var(--color-emerald)' }}>
                              NORMAL
                            </span>
                          )}
                        </td>

                        {/* Inspect Action */}
                        <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                          <button
                            onClick={() => setSelectedRecord(row)}
                            className="btn btn-secondary"
                            style={{ padding: '3px 8px', fontSize: '0.72rem', gap: '4px' }}
                          >
                            <Eye size={11} />
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Real-Time SCADA Terminal Console */}
        {activeTab === 'terminal' && (
          <div style={{
            background: '#080a0f',
            padding: '20px',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            fontSize: '0.78rem',
            lineHeight: 1.6,
            maxHeight: '560px',
            overflowY: 'auto',
            color: '#a0aec0'
          }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
              // CROX SCADA TELEMETRY & MODEL INFERENCE STREAM CONSOLE // ACTIVE PID: 37560
            </div>
            {filteredLogs.length === 0 ? (
              <div style={{ color: '#4a5568', fontStyle: 'italic' }}>
                [NO DATA] Start streaming or step to generate real-time log traces.
              </div>
            ) : (
              filteredLogs.slice().reverse().map((row) => {
                const isRenewable = row.grid_mode === 'RENEWABLE_STORAGE';
                return (
                  <div key={row.id} style={{ marginBottom: '6px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    <span style={{ color: '#718096' }}>[{row.loggedAt || '00:00:00'}] </span>
                    <span style={{ color: 'var(--color-precision-orange)', fontWeight: 700 }}>
                      [INGEST #{String(row.lineIndex).padStart(4, '0')}]
                    </span>{' '}
                    <span style={{ color: '#63b3ed' }}>timestamp={row.timestamp}</span>{' '}
                    <span style={{ color: '#cbd5e0' }}>temp={row.ambient_temp_c}°C hum={row.humidity_pct}% solar={row.solar_irradiance_wm2}W/m² </span>
                    <span style={{ color: '#e2e8f0' }}>→ </span>
                    <span style={{ color: '#f6ad55', fontWeight: 700 }}>PREDICT={row.predicted_demand_kw}kW </span>
                    <span style={{ color: isRenewable ? '#48bb78' : '#ed8936' }}>
                      MODE={row.grid_mode}
                    </span>{' '}
                    <span style={{ color: '#a0aec0' }}>BATT={row.battery_soc_pct}% </span>
                    <span style={{ color: row.is_critical_overload ? '#f56565' : '#48bb78' }}>
                      {row.is_critical_overload ? 'ALERT=OVERLOAD' : 'STATUS=NOMINAL'}
                    </span>{' '}
                    <span style={{ color: '#718096' }}>({row.duration_ms || 8}ms)</span>
                  </div>
                );
              })
            )}
            <div ref={terminalEndRef} />
          </div>
        )}
      </div>

      {/* Selected Record Telemetry Inspector Modal / Drawer */}
      {selectedRecord && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="card" style={{
            maxWidth: '680px',
            width: '100%',
            background: '#12151b',
            border: '1px solid var(--border-grid)',
            padding: '24px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--border-grid)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 95, 20, 0.15)',
                  border: '1px solid var(--color-precision-orange)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-precision-orange)'
                }}>
                  <Layers size={16} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                    Line Record Telemetry Inspector
                  </h3>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    RECORD #{selectedRecord.lineIndex} // TIMESTAMP: {selectedRecord.timestamp}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedRecord(null)}
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              >
                Close ✕
              </button>
            </div>

            {/* Weather Feature Inputs */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '8px' }}>
                1. Feature Vector Inputs (Fed to QuickML)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-grid)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Ambient Temperature</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    {selectedRecord.ambient_temp_c}°C
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-grid)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Relative Humidity</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    {selectedRecord.humidity_pct}%
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-grid)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Solar Irradiance</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffd700', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    {selectedRecord.solar_irradiance_wm2} W/m²
                  </div>
                </div>
              </div>
            </div>

            {/* Model Inference & Policy Evaluation */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '8px' }}>
                2. Model Inference & Transition Policy
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-grid)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Predicted Demand:</span>
                  <span style={{ fontWeight: 800, color: 'var(--color-precision-orange)', fontFamily: 'var(--font-mono)', fontSize: '1.05rem' }}>
                    {selectedRecord.predicted_demand_kw} kW
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Rule Engine Decision:</span>
                  <span style={{
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: selectedRecord.grid_mode === 'RENEWABLE_STORAGE' ? 'rgba(0, 230, 153, 0.15)' : 'rgba(255, 95, 20, 0.15)',
                    border: selectedRecord.grid_mode === 'RENEWABLE_STORAGE' ? '1px solid #10b981' : '1px solid #ff7a30',
                    color: selectedRecord.grid_mode === 'RENEWABLE_STORAGE' ? '#34d399' : '#ff944d'
                  }}>
                    {selectedRecord.grid_mode}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Battery State of Charge:</span>
                  <span style={{ fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                    {selectedRecord.battery_soc_pct}% ({selectedRecord.battery_soc_delta >= 0 ? '+' : ''}{selectedRecord.battery_soc_delta}%)
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Overload Threshold:</span>
                  <span style={{
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    color: selectedRecord.is_critical_overload ? '#ff3b30' : 'var(--color-emerald)'
                  }}>
                    {selectedRecord.is_critical_overload ? 'EXCEEDED (Action Required)' : 'NOMINAL (< 200 kW)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Raw JSON Payload */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                  3. Raw Evaluated JSON Payload
                </div>
                <button
                  onClick={handleCopyRecord}
                  className="btn btn-secondary"
                  style={{ padding: '2px 8px', fontSize: '0.7rem', gap: '4px' }}
                >
                  {copied ? <Check size={11} color="var(--color-emerald)" /> : <Copy size={11} />}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>
              <pre style={{
                background: '#080a0f',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.74rem',
                fontFamily: 'var(--font-mono)',
                color: '#63b3ed',
                overflowX: 'auto',
                maxHeight: '160px',
                border: '1px solid var(--border-grid)'
              }}>
                {JSON.stringify(selectedRecord, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

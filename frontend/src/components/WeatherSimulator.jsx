import React, { useState } from 'react';
import { Sliders, Zap, AlertTriangle, Sun, Moon, Flame, RotateCcw } from 'lucide-react';
import { useMicrogrid } from '../context/MicrogridContext';

export const WeatherSimulator = () => {
  const { runSimulation, currentHourData } = useMicrogrid();
  const [hour, setHour] = useState(19);
  const [temp, setTemp] = useState(32.0);
  const [humid, setHumid] = useState(65);
  const [solar, setSolar] = useState(120);
  const [simResult, setSimResult] = useState(null);
  const [simError, setSimError] = useState(null);
  const [simulating, setSimulating] = useState(false);

  const handleSimulate = async () => {
    setSimulating(true);
    setSimError(null);
    try {
      const res = await runSimulation({ hour, temp, humid, solar });
      setSimResult(res);
    } catch (err) {
      setSimError(`Simulation error: ${err.message}`);
    } finally {
      setSimulating(false);
    }
  };

  const applyPreset = (presetHour, presetTemp, presetHumid, presetSolar) => {
    setHour(presetHour);
    setTemp(presetTemp);
    setHumid(presetHumid);
    setSolar(presetSolar);
    setSimResult(null);
  };

  const resetToCurrent = () => {
    if (currentHourData) {
      const d = new Date(currentHourData.timestamp);
      setHour(d.getHours());
      setTemp(currentHourData.ambient_temp_c ?? 25.0);
      setHumid(currentHourData.humidity_pct ?? 50);
      setSolar(currentHourData.solar_irradiance_wm2 ?? 200);
      setSimResult(null);
    } else {
      setHour(12);
      setTemp(28.0);
      setHumid(45);
      setSolar(350);
      setSimResult(null);
    }
  };

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={18} color="var(--color-precision-orange)" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Parameter Stress Simulator</h3>
        </div>
        <button
          onClick={resetToCurrent}
          title="Reset to live telemetry"
          className="btn btn-secondary"
          style={{ padding: '4px 8px', fontSize: '0.72rem' }}
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
        Adjust weather parameters to test live machine learning inference and rule triggers.
      </p>

      {/* Quick 1-Click Scenario Preset Buttons */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button
          onClick={() => applyPreset(19, 34.0, 70, 40)}
          className="btn btn-secondary"
          style={{ padding: '5px 9px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Flame size={12} color="#ef4444" />
          Peak Surge (19h)
        </button>

        <button
          onClick={() => applyPreset(12, 28.5, 40, 460)}
          className="btn btn-secondary"
          style={{ padding: '5px 9px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Sun size={12} color="#fbbf24" />
          High Noon Solar
        </button>

        <button
          onClick={() => applyPreset(3, 21.0, 55, 0)}
          className="btn btn-secondary"
          style={{ padding: '5px 9px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Moon size={12} color="#38bdf8" />
          Night Baseload
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Hour Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Timestamp Hour:</span>
            <strong style={{ color: 'var(--color-precision-orange)', fontFamily: 'var(--font-mono)' }}>
              {String(hour).padStart(2, '0')}:00
            </strong>
          </div>
          <input
            type="range"
            min="0"
            max="23"
            value={hour}
            onChange={(e) => setHour(parseInt(e.target.value, 10))}
            style={{ width: '100%', accentColor: 'var(--color-precision-orange)', cursor: 'pointer' }}
          />
        </div>

        {/* Ambient Temp Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Ambient Temperature:</span>
            <strong style={{ color: 'var(--color-cyan)', fontFamily: 'var(--font-mono)' }}>
              {temp.toFixed(1)} °C
            </strong>
          </div>
          <input
            type="range"
            min="-5"
            max="45"
            step="0.5"
            value={temp}
            onChange={(e) => setTemp(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--color-cyan)', cursor: 'pointer' }}
          />
        </div>

        {/* Humidity Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Relative Humidity:</span>
            <strong style={{ color: 'var(--color-cyan)', fontFamily: 'var(--font-mono)' }}>
              {humid}%
            </strong>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            value={humid}
            onChange={(e) => setHumid(parseInt(e.target.value, 10))}
            style={{ width: '100%', accentColor: 'var(--color-cyan)', cursor: 'pointer' }}
          />
        </div>

        {/* Solar Irradiance Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Solar Irradiance:</span>
            <strong style={{ color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
              {solar} W/m²
            </strong>
          </div>
          <input
            type="range"
            min="0"
            max="500"
            step="10"
            value={solar}
            onChange={(e) => setSolar(parseInt(e.target.value, 10))}
            style={{ width: '100%', accentColor: '#fbbf24', cursor: 'pointer' }}
          />
        </div>

        <button
          onClick={handleSimulate}
          disabled={simulating}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '6px' }}
        >
          <Zap size={16} />
          {simulating ? 'Inferencing...' : 'Evaluate Dispatch Rule'}
        </button>

        {/* Simulation Error Alert Box */}
        {simError && (
          <div style={{
            marginTop: '12px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            color: '#fca5a5',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertTriangle size={15} color="#ef4444" />
            <div>{simError}</div>
          </div>
        )}

        {/* Simulation Output Result Box */}
        {simResult && (
          <div style={{
            marginTop: '12px',
            background: '#090d16',
            border: '1px solid var(--border-grid)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px',
            animation: 'fadeIn 0.25s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Predicted Demand</span>
              <strong style={{ fontSize: '1.35rem', color: simResult.is_critical_overload ? '#ef4444' : 'var(--color-cyan)', fontFamily: 'var(--font-mono)' }}>
                {simResult.predicted_demand_kw} kW
              </strong>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span className={`badge ${simResult.grid_mode === 'RENEWABLE_STORAGE' ? 'badge-renewable' : 'badge-main-grid'}`}>
                {simResult.grid_mode === 'RENEWABLE_STORAGE' ? '⚡ Renewable Battery' : '🔌 Main Grid Mode'}
              </span>
              {simResult.is_critical_overload && (
                <span className="badge badge-overload">
                  <AlertTriangle size={12} />
                  Critical Overload (≥200 kW)
                </span>
              )}
            </div>

            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              <strong>Rule Rationale:</strong> {simResult.transition_reason || simResult.reason}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

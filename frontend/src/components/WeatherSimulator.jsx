import React, { useState } from 'react';
import { Sliders, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useMicrogrid } from '../context/MicrogridContext';

export const WeatherSimulator = () => {
  const { runSimulation } = useMicrogrid();
  const [hour, setHour] = useState(19);
  const [temp, setTemp] = useState(32.0);
  const [humid, setHumid] = useState(65);
  const [solar, setSolar] = useState(120);
  const [simResult, setSimResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const res = await runSimulation({ hour, temp, humid, solar });
      setSimResult(res);
    } catch (err) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <Sliders size={18} color="var(--color-cyan)" />
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Real-Time Parameter Simulator</h3>
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
        Adjust weather and temporal inputs to test live model inference and rule triggers.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Hour Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Timestamp Hour:</span>
            <strong style={{ color: 'var(--color-cyan)' }}>{String(hour).padStart(2, '0')}:00</strong>
          </div>
          <input
            type="range"
            min="0"
            max="23"
            value={hour}
            onChange={(e) => setHour(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--color-cyan)', cursor: 'pointer' }}
          />
        </div>

        {/* Ambient Temp Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Ambient Temperature:</span>
            <strong style={{ color: 'var(--color-cyan)' }}>{temp.toFixed(1)} °C</strong>
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
            <strong style={{ color: 'var(--color-cyan)' }}>{humid}%</strong>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            value={humid}
            onChange={(e) => setHumid(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--color-cyan)', cursor: 'pointer' }}
          />
        </div>

        {/* Solar Irradiance Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Solar Irradiance:</span>
            <strong style={{ color: 'var(--color-cyan)' }}>{solar} W/m²</strong>
          </div>
          <input
            type="range"
            min="0"
            max="500"
            step="10"
            value={solar}
            onChange={(e) => setSolar(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--color-cyan)', cursor: 'pointer' }}
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

        {/* Simulation Output Result Box */}
        {simResult && (
          <div style={{
            marginTop: '12px',
            background: 'rgba(7, 10, 18, 0.75)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            animation: 'fadeIn 0.25s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Predicted Demand</span>
              <strong style={{ fontSize: '1.25rem', color: simResult.is_critical_overload ? '#ef4444' : 'var(--color-cyan)' }}>
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
              <strong>Rationale:</strong> {simResult.reason}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

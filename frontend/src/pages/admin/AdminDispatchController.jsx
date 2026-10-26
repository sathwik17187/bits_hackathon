import React, { useState } from 'react';
import { Sliders, Zap, ShieldAlert, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { useMicrogrid } from '../../context/MicrogridContext';

export const AdminDispatchController = () => {
  const { forecastData, overrideMode, setOverrideMode, RENEWABLE_THRESHOLD, OVERLOAD_THRESHOLD } = useMicrogrid();
  const summary = forecastData?.summary;
  const firstHour = forecastData?.hourly_forecasts?.[0];

  const [sheddingActive, setSheddingActive] = useState(false);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Smart Grid Transition Controller
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Evaluate deterministic dispatch rules, trigger manual overrides, and manage blackout protections.
        </p>
      </div>

      {/* Manual Override Control Panel */}
      <div className="glass-card" style={{ marginBottom: '28px', borderLeft: '4px solid var(--color-cyan)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Master Dispatch Mode Override</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Operator commands take precedence over automated QuickML rule-switching.
            </p>
          </div>
          <span className="badge badge-cyan">Current: {overrideMode}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <button
            onClick={() => setOverrideMode('AUTO')}
            className={`btn ${overrideMode === 'AUTO' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '14px', justifyContent: 'flex-start' }}
          >
            <Sliders size={18} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600 }}>Automated (Rule Engine)</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>Evaluate QuickML predictions</div>
            </div>
          </button>

          <button
            onClick={() => setOverrideMode('FORCE_MAIN_GRID')}
            className={`btn ${overrideMode === 'FORCE_MAIN_GRID' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '14px', justifyContent: 'flex-start' }}
          >
            <Zap size={18} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600 }}>Force Main Grid</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>Preserve battery reserves</div>
            </div>
          </button>

          <button
            onClick={() => setOverrideMode('FORCE_RENEWABLE')}
            className={`btn ${overrideMode === 'FORCE_RENEWABLE' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '14px', justifyContent: 'flex-start' }}
          >
            <Zap size={18} color="#f59e0b" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600 }}>Force Renewable Storage</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>Zero-carbon utility isolation</div>
            </div>
          </button>
        </div>
      </div>

      {/* Deterministic Rule Evaluation Matrix */}
      <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '16px' }}>Transition Controller Logic Matrix</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {/* Rule 1 */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--color-cyan)', textTransform: 'uppercase' }}>
              Rule 1: Demand Threshold
            </span>
            <span className="badge badge-renewable">Switch Signal</span>
          </div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '6px' }}>Demand &gt; 160 kW</h4>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
            When forecasted demand exceeds 160 kW, dispatch Renewable Battery Storage to prevent substation stress.
          </p>
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: '#f59e0b', fontWeight: 500 }}>
            Result: <strong>RENEWABLE_STORAGE MODE</strong>
          </div>
        </div>

        {/* Rule 2 */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--color-cyan)', textTransform: 'uppercase' }}>
              Rule 2: Peak Evening Window
            </span>
            <span className="badge badge-renewable">Tariff Window</span>
          </div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '6px' }}>18:00 to 22:00 (Inclusive)</h4>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
            Regardless of demand magnitude, evening peak tariff hours switch automatically to battery storage.
          </p>
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: '#f59e0b', fontWeight: 500 }}>
            Result: <strong>RENEWABLE_STORAGE MODE</strong>
          </div>
        </div>

        {/* Rule 3 */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' }}>
              Rule 3: Critical Overload
            </span>
            <span className="badge badge-overload">Priority 1 Alarm</span>
          </div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '6px' }}>Demand &ge; 200 kW</h4>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
            Severe microgrid overload warning triggered independently of current active grid power mode.
          </p>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: '#fca5a5', fontWeight: 600 }}>
            Trigger: <strong>CRITICAL OVERLOAD ALARM</strong>
          </div>
        </div>
      </div>

      {/* Emergency Load Shedding Section */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} />
              Emergency Blackout Prevention & Load Shedding
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              In case of unforecasted industrial demand surges, manually engage shedding relays across non-critical circuits.
            </p>
          </div>

          <button
            onClick={() => setSheddingActive(!sheddingActive)}
            className="btn"
            style={{
              background: sheddingActive ? '#ef4444' : 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              color: '#fff'
            }}
          >
            {sheddingActive ? '⚠️ Shedding Engaged (Disarm)' : 'Simulate Emergency Shedding'}
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sliders, 
  Zap, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Power, 
  RotateCcw, 
  Activity,
  ToggleLeft,
  ToggleRight,
  ListFilter,
  ArrowLeft
} from 'lucide-react';
import { useMicrogrid } from '../../context/MicrogridContext';

export const AdminDispatchController = () => {
  const navigate = useNavigate();
  const { forecastData, overrideMode, setOverrideMode, RENEWABLE_THRESHOLD, OVERLOAD_THRESHOLD } = useMicrogrid();
  const summary = forecastData?.summary;
  const firstHour = forecastData?.hourly_forecasts?.[0];

  // Base loads for feeders
  const [feeders, setFeeders] = useState([
    { id: 'f1', name: 'Hospital & Critical Infrastructure', type: 'ESSENTIAL', kw: 30, active: true },
    { id: 'f2', name: 'Residential Neighborhood Feeder', type: 'ESSENTIAL', kw: 75, active: true },
    { id: 'f3', name: 'Commercial HVAC & Shopping Malls', type: 'SHEDDABLE', kw: 45, active: true },
    { id: 'f4', name: 'EV Supercharger Plaza (150 kW)', type: 'SHEDDABLE', kw: 35, active: true },
    { id: 'f5', name: 'Municipal Pumping & Public Lights', type: 'SHEDDABLE', kw: 25, active: true },
  ]);

  const [eventLogs, setEventLogs] = useState([
    { time: '18:00:00', event: 'Autonomous Rule 2 Engaged: Peak tariff window shifted to BESS storage.' },
    { time: '17:15:22', event: 'Forecast validation: QuickML predicted 185 kW evening peak.' }
  ]);

  const toggleFeeder = (id) => {
    setFeeders((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          if (f.type === 'ESSENTIAL') return f; // Locked
          const nextActive = !f.active;
          const logMsg = nextActive 
            ? `Breaker Closed: Re-energized ${f.name} (+${f.kw} kW)`
            : `Breaker Tripped: Load shed on ${f.name} (-${f.kw} kW)`;
          
          setEventLogs((logs) => [
            { time: new Date().toTimeString().split(' ')[0], event: logMsg },
            ...logs
          ]);
          return { ...f, active: nextActive };
        }
        return f;
      })
    );
  };

  const totalShedKw = feeders
    .filter((f) => !f.active)
    .reduce((sum, f) => sum + f.kw, 0);

  const activeKw = feeders
    .filter((f) => f.active)
    .reduce((sum, f) => sum + f.kw, 0);

  const handleShedAllNonEssential = () => {
    setFeeders((prev) =>
      prev.map((f) => (f.type === 'SHEDDABLE' ? { ...f, active: false } : f))
    );
    setEventLogs((logs) => [
      { time: new Date().toTimeString().split(' ')[0], event: 'EMERGENCY PROTOCOL: All non-essential feeders shed (-105 kW)' },
      ...logs
    ]);
  };

  const handleRestoreAll = () => {
    setFeeders((prev) => prev.map((f) => ({ ...f, active: true })));
    setEventLogs((logs) => [
      { time: new Date().toTimeString().split(' ')[0], event: 'GRID RESTORED: All 5 substation feeders energized.' },
      ...logs
    ]);
  };

  const isOverload = activeKw >= OVERLOAD_THRESHOLD;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/admin/overview')}
          className="btn btn-secondary"
          style={{ padding: '4px 10px', fontSize: '0.74rem', marginBottom: '8px', gap: '6px' }}
        >
          <ArrowLeft size={12} />
          <span>Back to Command Center</span>
        </button>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Smart Grid Transition &amp; Dispatch Controller
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Evaluate deterministic dispatch rules, trigger manual overrides, and manage feeder breaker shed interlocks.
        </p>
      </div>

      {/* Master Override Control Panel */}
      <div className="glass-card" style={{ marginBottom: '28px', borderLeft: '4px solid var(--color-precision-orange)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Master Dispatch Mode Override</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Operator commands take precedence over automated QuickML rule-switching.
            </p>
          </div>
          <span className="badge badge-renewable">Current: {overrideMode}</span>
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
            <Zap size={18} color="var(--color-precision-orange)" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600 }}>Force Renewable Storage</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>Zero-carbon utility isolation</div>
            </div>
          </button>
        </div>
      </div>

      {/* Deterministic Rule Evaluation Matrix */}
      <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '16px' }}>Transition Controller Logic Matrix</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {/* Rule 1 */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-precision-orange)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Rule 1: Demand Threshold
            </span>
            <span className="badge badge-renewable">Switch Signal</span>
          </div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '6px' }}>Demand &gt; 160 kW</h4>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
            When forecasted demand exceeds 160 kW, dispatch Renewable Battery Storage to prevent substation stress.
          </p>
          <div style={{ background: '#0a0d14', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--color-precision-orange)', fontWeight: 600, border: '1px solid var(--border-subtle)' }}>
            Result: <strong>RENEWABLE_STORAGE MODE</strong>
          </div>
        </div>

        {/* Rule 2 */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-cyan)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              Rule 2: Peak Evening Window
            </span>
            <span className="badge badge-cyan">Tariff Window</span>
          </div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '6px' }}>18:00 to 22:00 (Inclusive)</h4>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
            Regardless of demand magnitude, evening peak tariff hours switch automatically to battery storage.
          </p>
          <div style={{ background: '#0a0d14', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--color-precision-orange)', fontWeight: 600, border: '1px solid var(--border-subtle)' }}>
            Result: <strong>RENEWABLE_STORAGE MODE</strong>
          </div>
        </div>

        {/* Rule 3 */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
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

      {/* Interactive Substation Feeder Breaker & Load Shedding Matrix */}
      <div className="glass-card" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} color={isOverload ? '#ef4444' : 'var(--color-precision-orange)'} />
              Substation Feeder Breaker Matrix &amp; Blackout Prevention
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Manually shed or restore non-critical feeder circuits to buffer the grid during unforecasted demand surges.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleShedAllNonEssential}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', borderColor: '#ef4444', color: '#fca5a5' }}
            >
              ⚠️ Shed All Non-Essential (-105 kW)
            </button>
            <button
              onClick={handleRestoreAll}
              className="btn btn-primary"
              style={{ fontSize: '0.8rem' }}
            >
              <RotateCcw size={14} />
              Restore All Feeders
            </button>
          </div>
        </div>

        {/* Load Status Summary */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          background: '#090d16',
          padding: '16px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-grid)',
          marginBottom: '20px'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              CONNECTED SUBSTATION LOAD
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: isOverload ? '#ef4444' : (activeKw > 160 ? 'var(--color-precision-orange)' : '#10b981'), fontFamily: 'var(--font-mono)' }}>
              {activeKw} kW
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              {isOverload ? '⚠️ OVERLOAD THRESHOLD EXCEEDED' : 'Normal Operating Limit'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              LOAD SHEDDING BUFFER
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: totalShedKw > 0 ? '#38bdf8' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              -{totalShedKw} kW
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              {totalShedKw > 0 ? `${feeders.filter(f => !f.active).length} Circuits Disconnected` : 'All Breakers Energized'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              CRITICAL OVERLOAD HEADROOM
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: OVERLOAD_THRESHOLD - activeKw > 0 ? '#10b981' : '#ef4444', fontFamily: 'var(--font-mono)' }}>
              {(OVERLOAD_THRESHOLD - activeKw).toFixed(0)} kW
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              Below 200 kW Safety Boundary
            </div>
          </div>
        </div>

        {/* Feeder Breaker Table */}
        <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: '#0b101c', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 14px' }}>Feeder Circuit</th>
                <th style={{ padding: '12px 14px' }}>Priority Level</th>
                <th style={{ padding: '12px 14px' }}>Draw (kW)</th>
                <th style={{ padding: '12px 14px' }}>Breaker State</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Manual Toggle</th>
              </tr>
            </thead>
            <tbody>
              {feeders.map((f) => (
                <tr key={f.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', background: !f.active ? 'rgba(239, 68, 68, 0.04)' : 'transparent' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: '#fff' }}>
                    {f.name}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span className={`badge ${f.type === 'ESSENTIAL' ? 'badge-main-grid' : 'badge-cyan'}`}>
                      {f.type}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: f.active ? 'var(--color-cyan)' : 'var(--text-muted)' }}>
                    {f.active ? `${f.kw} kW` : '0 kW (Shed)'}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ color: f.active ? '#10b981' : '#ef4444', fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="pulse-dot" style={{ color: f.active ? '#10b981' : '#ef4444' }}></span>
                      {f.active ? 'ENERGIZED' : 'OPEN / DISCONNECTED'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    {f.type === 'ESSENTIAL' ? (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        🔒 LOCKED CRITICAL
                      </span>
                    ) : (
                      <button
                        onClick={() => toggleFeeder(f.id)}
                        className={`btn ${f.active ? 'btn-secondary' : 'btn-primary'}`}
                        style={{ padding: '5px 12px', fontSize: '0.75rem' }}
                      >
                        <Power size={13} />
                        {f.active ? 'Trip Breaker' : 'Energize'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Substation Relay Event Log */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ListFilter size={16} color="var(--color-precision-orange)" />
          Substation Event &amp; Dispatch Relay Log
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
          {eventLogs.map((log, i) => (
            <div key={i} style={{ padding: '8px 12px', background: '#090d16', borderRadius: '4px', border: '1px solid var(--border-subtle)', display: 'flex', gap: '12px' }}>
              <span style={{ color: 'var(--color-precision-orange)', fontWeight: 700 }}>[{log.time}]</span>
              <span style={{ color: 'var(--text-secondary)' }}>{log.event}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

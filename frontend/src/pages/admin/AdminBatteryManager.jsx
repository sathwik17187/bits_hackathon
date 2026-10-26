import React from 'react';
import { BatteryCharging, Zap, ShieldCheck, Sun, ArrowDown, ArrowUp } from 'lucide-react';
import { useMicrogrid } from '../../context/MicrogridContext';

export const AdminBatteryManager = () => {
  const { batterySoc, setBatterySoc, forecastData } = useMicrogrid();
  const summary = forecastData?.summary;
  const renewableHours = summary?.renewable_hours || 0;
  const mainGridHours = summary?.main_grid_hours || 0;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Battery Reserve & Storage Manager
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Monitor microgrid battery storage reserves, discharge profiles, and solar replenishment cycles.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px', marginBottom: '28px' }}>
        {/* Main Battery Gauge Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px' }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'conic-gradient(#10b981 0% calc(var(--soc, 85) * 1%), rgba(255, 255, 255, 0.08) 0% 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            boxShadow: '0 0 30px rgba(16, 185, 129, 0.25)',
            '--soc': batterySoc
          }}>
            <div style={{
              width: '94px',
              height: '94px',
              borderRadius: '50%',
              background: '#0a0f1d',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#34d399' }}>
                {batterySoc.toFixed(1)}%
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>State of Charge</span>
            </div>
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>Lithium-Iron Phosphate (LFP) Array</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '280px', marginBottom: '20px' }}>
            Operating within optimal thermal limits (22°C - 28°C) with active cooling.
          </p>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span>Manual SoC Override:</span>
              <strong style={{ color: 'var(--color-cyan)' }}>{batterySoc.toFixed(0)}%</strong>
            </div>
            <input
              type="range"
              min="15"
              max="100"
              value={batterySoc}
              onChange={(e) => setBatterySoc(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--color-main-grid)', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Battery Telemetry Statistics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
          <div className="glass-card">
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', color: '#f59e0b' }}>
              <ArrowDown size={18} />
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Discharge Cycles</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b', margin: '4px 0' }}>
              {renewableHours} Hours
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Supplying high demand &gt;160kW</div>
          </div>

          <div className="glass-card">
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', color: '#10b981' }}>
              <ArrowUp size={18} />
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Recharge Absorption</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981', margin: '4px 0' }}>
              {mainGridHours} Hours
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Solar surplus & off-peak power</div>
          </div>

          <div className="glass-card">
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', color: 'var(--color-cyan)' }}>
              <ShieldCheck size={18} />
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Minimum Reserve Floor</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', margin: '4px 0' }}>
              15.0%
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Emergency critical blackout floor</div>
          </div>

          <div className="glass-card">
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'rgba(129, 140, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', color: '#818cf8' }}>
              <Zap size={18} />
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Array Roundtrip Efficiency</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#a78bfa', margin: '4px 0' }}>
              94.2%
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Minimal thermal conversion loss</div>
          </div>
        </div>
      </div>
    </div>
  );
};

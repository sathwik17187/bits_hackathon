import React from 'react';
import { Sun, BatteryCharging, Zap, Home, ArrowRight, ShieldCheck, Activity } from 'lucide-react';

export const MicrogridPowerFlowSLD = ({
  firstHour = {},
  batterySoc = 85.0,
  summary = {}
}) => {
  const demandKw = firstHour?.predicted_demand_kw ?? 165.0;
  const isRenewable = firstHour?.grid_mode === 'RENEWABLE_STORAGE';
  const solarKw = firstHour?.solar_irradiance_wm2 ? Math.round((firstHour.solar_irradiance_wm2 * 0.18)) : 0;
  const batteryDischargeKw = isRenewable ? Math.max(0, Math.round(demandKw - solarKw)) : 0;
  const mainGridKw = !isRenewable ? Math.round(demandKw) : 0;
  const cleanPct = demandKw > 0 ? Math.min(100, Math.round(((solarKw + batteryDischargeKw) / demandKw) * 100)) : 80;

  return (
    <div className="glass-card" style={{ padding: '26px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="var(--color-precision-orange)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>
              Live Microgrid Power-Flow Single Line Diagram (SLD)
            </h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
            Real-time energy routing matrix mapping generation sources through the central 480V substation bus into neighborhood loads.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className={`badge ${isRenewable ? 'badge-renewable' : 'badge-main-grid'}`}>
            {isRenewable ? '⚡ RENEWABLE BESS DISPATCH' : '🏢 MAIN GRID BASELOAD'}
          </span>
          <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: 'var(--crox-muted)' }}>
            SUBSTATION HS-3024
          </span>
        </div>
      </div>

      {/* Dynamic Single-Line Diagram Visual Container */}
      <div style={{
        background: 'var(--crox-card-dark)',
        borderRadius: 'var(--radius-sm)',
        padding: '28px',
        color: '#fff',
        border: '1px solid var(--crox-seam)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Top 3 Power Generation Nodes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px', marginBottom: '28px' }}>
          {/* Node 1: Rooftop Solar */}
          <div style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', color: '#fbbf24', fontSize: '0.74rem', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
              <Sun size={15} />
              ROOFTOP SOLAR
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
              {solarKw} <span style={{ fontSize: '0.8rem', color: 'rgba(251, 191, 36, 0.7)' }}>kW</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#9ca3af', marginTop: '2px' }}>
              {firstHour.solar_irradiance_wm2 ?? 0} W/m² Irradiance
            </div>
          </div>

          {/* Node 2: 500 kWh BESS Array */}
          <div style={{
            background: isRenewable ? 'rgba(255, 95, 20, 0.12)' : 'rgba(255, 255, 255, 0.04)',
            border: `1px solid ${isRenewable ? 'var(--crox-orange)' : 'rgba(255, 255, 255, 0.12)'}`,
            borderRadius: 'var(--radius-sm)',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', color: 'var(--crox-orange)', fontSize: '0.74rem', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
              <BatteryCharging size={15} />
              500 KWH BESS (LFP)
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--crox-orange)', fontFamily: 'var(--font-mono)' }}>
              {batteryDischargeKw} <span style={{ fontSize: '0.8rem', color: 'rgba(255, 95, 20, 0.7)' }}>kW</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#9ca3af', marginTop: '2px' }}>
              Reserve: {batterySoc.toFixed(1)}% SoC
            </div>
          </div>

          {/* Node 3: Utility Main Grid */}
          <div style={{
            background: !isRenewable ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.04)',
            border: `1px solid ${!isRenewable ? '#10b981' : 'rgba(255, 255, 255, 0.12)'}`,
            borderRadius: 'var(--radius-sm)',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', color: '#34d399', fontSize: '0.74rem', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
              <Zap size={15} />
              MAIN UTILITY FEED
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
              {mainGridKw} <span style={{ fontSize: '0.8rem', color: 'rgba(52, 211, 153, 0.7)' }}>kW</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#9ca3af', marginTop: '2px' }}>
              50.02 Hz Synchronized
            </div>
          </div>
        </div>

        {/* Central 480V Power Bus Bar */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.08)',
          borderTop: '2px solid var(--crox-orange)',
          borderBottom: '2px solid var(--crox-orange)',
          padding: '12px 20px',
          borderRadius: '2px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '28px',
          fontSize: '0.76rem',
          fontFamily: 'var(--font-mono)'
        }}>
          <span style={{ color: 'var(--crox-orange)', fontWeight: 800 }}>
            [ CENTRAL 480V 3-PHASE SUBSTATION POWER BUS ]
          </span>
          <span style={{ color: '#fff' }}>
            TOTAL BALANCED DISPATCH: <strong>{demandKw.toFixed(1)} kW</strong>
          </span>
          <span style={{ color: '#10b981', fontWeight: 700 }}>
            ● ZERO SURGE LOSS
          </span>
        </div>

        {/* Downstream Loads & Radial Dial Gauges */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '24px', alignItems: 'center' }}>
          {/* Left: 5 Campus Feeder Loads */}
          <div>
            <div style={{ fontSize: '0.7rem', color: '#8e95a0', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: '10px' }}>
              DOWNSTREAM FEEDER ALLOCATION (100% ONLINE):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              {[
                { name: 'Feeder A', load: Math.round(demandKw * 0.32), desc: 'Academic Labs' },
                { name: 'Feeder B', load: Math.round(demandKw * 0.26), desc: 'Hostels / HVAC' },
                { name: 'Feeder C', load: Math.round(demandKw * 0.18), desc: 'Dining & Kitchen' },
                { name: 'Feeder D', load: Math.round(demandKw * 0.14), desc: 'Server Cluster' },
                { name: 'Feeder E', load: Math.round(demandKw * 0.10), desc: 'Perimeter / EV' }
              ].map((f, i) => (
                <div key={i} style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.66rem', color: '#9ca3af', fontFamily: 'var(--font-mono)' }}>{f.name}</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', margin: '2px 0', fontFamily: 'var(--font-mono)' }}>{f.load} kW</div>
                  <div style={{ fontSize: '0.6rem', color: '#6b7280' }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Radial Gauges (Clean Share % & Battery Reserve %) */}
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', borderLeft: '1px solid rgba(255, 255, 255, 0.1)', paddingLeft: '16px' }}>
            {/* Dial 1: Clean Share */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative', width: '84px', height: '84px', margin: '0 auto 6px' }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="3.2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3.2"
                    strokeDasharray={`${cleanPct}, 100`}
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#34d399' }}>
                  {cleanPct}%
                </div>
              </div>
              <div style={{ fontSize: '0.68rem', color: '#8e95a0', fontFamily: 'var(--font-mono)' }}>CLEAN SHARE</div>
            </div>

            {/* Dial 2: Battery Reserve */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative', width: '84px', height: '84px', margin: '0 auto 6px' }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="3.2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="var(--crox-orange)"
                    strokeWidth="3.2"
                    strokeDasharray={`${Math.round(batterySoc)}, 100`}
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--crox-orange)' }}>
                  {Math.round(batterySoc)}%
                </div>
              </div>
              <div style={{ fontSize: '0.68rem', color: '#8e95a0', fontFamily: 'var(--font-mono)' }}>BESS SOC</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BatteryCharging, 
  Zap, 
  ShieldCheck, 
  Sun, 
  ArrowDown, 
  ArrowUp, 
  Thermometer, 
  Cpu, 
  RotateCcw, 
  Clock, 
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Fan,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { useMicrogrid } from '../../context/MicrogridContext';

export const AdminBatteryManager = () => {
  const navigate = useNavigate();
  const { batterySoc, setBatterySoc, forecastData } = useMicrogrid();
  const summary = forecastData?.summary;
  const renewableHours = summary?.renewable_hours || 0;
  const mainGridHours = summary?.main_grid_hours || 0;

  // Virtual testbench state
  const [testDischargeRate, setTestDischargeRate] = useState(80); // kW
  const [ambientCellTemp, setAmbientCellTemp] = useState(24.0); // °C
  const [coolingActive, setCoolingActive] = useState(true);
  const [calibrationStatus, setCalibrationStatus] = useState(null);
  const [balancingStatus, setBalancingStatus] = useState(null);

  // 500 kWh nameplate capacity calculations
  const TOTAL_CAPACITY_KWH = 500;
  const usableKwh = (TOTAL_CAPACITY_KWH * (batterySoc - 15)) / 100;
  const hoursRemainingAtRate = testDischargeRate > 0 
    ? Math.max(0, usableKwh / testDischargeRate).toFixed(1) 
    : '∞';

  const totalCycles = 418;
  const stateOfHealth = (100 - (totalCycles * 0.015)).toFixed(1);

  const [rackOffsets, setRackOffsets] = useState([0, 0.3, 0, -0.2]);

  const racks = [
    { id: 'Rack 1 (North Array)', temp: (ambientCellTemp - 0.8).toFixed(1), voltage: '398 V', current: '112 A', soc: Math.min(100, Math.max(15, batterySoc + rackOffsets[0])) },
    { id: 'Rack 2 (Central A)', temp: (ambientCellTemp + 0.1).toFixed(1), voltage: '400 V', current: '114 A', soc: Math.min(100, Math.max(15, batterySoc + rackOffsets[1])) },
    { id: 'Rack 3 (Central B)', temp: (ambientCellTemp - 0.2).toFixed(1), voltage: '399 V', current: '113 A', soc: Math.min(100, Math.max(15, batterySoc + rackOffsets[2])) },
    { id: 'Rack 4 (South Array)', temp: (ambientCellTemp - 1.1).toFixed(1), voltage: '401 V', current: '110 A', soc: Math.min(100, Math.max(15, batterySoc + rackOffsets[3])) },
  ];

  const handleCalibrateBms = () => {
    setCalibrationStatus('Calibrating shunt sensors and internal cell resistance...');
    setTimeout(() => {
      setCalibrationStatus('BMS calibration verified. Coulombic efficiency calibrated to 99.4%.');
      setTimeout(() => setCalibrationStatus(null), 4000);
    }, 1000);
  };

  const handleRebalanceRacks = () => {
    setBalancingStatus('Actively shunting bleed resistors across racks...');
    setTimeout(() => {
      setRackOffsets([0, 0, 0, 0]);
      setBalancingStatus('All 4 racks perfectly balanced within ±0.01V delta.');
      setTimeout(() => setBalancingStatus(null), 4000);
    }, 1200);
  };

  return (
    <div>
      {/* Title */}
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
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Battery Reserve &amp; Energy Storage Command
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Real-time monitoring of 500 kWh Lithium-Iron Phosphate (LFP) array, thermal chiller loop, and cell balancing.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setCoolingActive(!coolingActive)}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', borderColor: coolingActive ? '#10b981' : 'var(--border-grid)' }}
          >
            <Fan size={14} color={coolingActive ? '#10b981' : 'var(--text-muted)'} style={{ animation: coolingActive ? 'spinPulse 2s linear infinite' : 'none' }} />
            <span>{coolingActive ? 'Chiller Loop: ACTIVE' : 'Chiller Loop: IDLE'}</span>
          </button>

          <button
            onClick={handleCalibrateBms}
            className="btn btn-primary"
            style={{ fontSize: '0.8rem' }}
          >
            <Sparkles size={14} />
            <span>Calibrate BMS</span>
          </button>
        </div>
      </div>

      {calibrationStatus && (
        <div style={{
          padding: '10px 16px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#34d399',
          fontSize: '0.82rem',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} />
          {calibrationStatus}
        </div>
      )}

      {/* Main Top Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px', marginBottom: '28px' }}>
        {/* Main Battery Gauge Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '36px 24px', position: 'relative' }}>
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.74rem',
            color: coolingActive ? '#34d399' : '#f59e0b',
            background: coolingActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            padding: '4px 10px',
            borderRadius: '9999px',
            border: `1px solid ${coolingActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
          }}>
            <span className="pulse-dot" style={{ color: coolingActive ? '#10b981' : '#f59e0b' }}></span>
            {coolingActive ? 'Liquid Loop 24°C' : 'Chiller Standby'}
          </div>

          <div style={{
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            background: `conic-gradient(#10b981 0% ${batterySoc}%, rgba(255, 255, 255, 0.08) ${batterySoc}% 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '12px 0 20px',
            boxShadow: '0 0 32px rgba(16, 185, 129, 0.25)',
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              width: '110px',
              height: '110px',
              borderRadius: '50%',
              background: '#090e1a',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '1.85rem', fontWeight: 800, color: batterySoc < 25 ? '#ef4444' : '#34d399', fontFamily: 'var(--font-mono)' }}>
                {batterySoc.toFixed(1)}%
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                State of Charge
              </span>
            </div>
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '4px' }}>
            500 kWh LFP Storage Reserve
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '320px', marginBottom: '16px' }}>
            Usable buffer: <strong style={{ color: '#fff' }}>{usableKwh > 0 ? usableKwh.toFixed(1) : 0} kWh</strong> above 15% reserve floor.
          </p>

          {/* Quick Preset Buttons */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', width: '100%', justifyContent: 'center' }}>
            <button onClick={() => setBatterySoc(15)} className="btn btn-secondary" style={{ padding: '3px 8px', fontSize: '0.72rem' }}>15% Floor</button>
            <button onClick={() => setBatterySoc(50)} className="btn btn-secondary" style={{ padding: '3px 8px', fontSize: '0.72rem' }}>50% Half</button>
            <button onClick={() => setBatterySoc(85)} className="btn btn-secondary" style={{ padding: '3px 8px', fontSize: '0.72rem' }}>85% Default</button>
            <button onClick={() => setBatterySoc(100)} className="btn btn-secondary" style={{ padding: '3px 8px', fontSize: '0.72rem' }}>100% Full</button>
          </div>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.25)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span>Manual SoC Calibration Slider:</span>
              <strong style={{ color: 'var(--color-precision-orange)', fontFamily: 'var(--font-mono)' }}>{batterySoc.toFixed(0)}%</strong>
            </div>
            <input
              type="range"
              min="15"
              max="100"
              value={batterySoc}
              onChange={(e) => setBatterySoc(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--color-precision-orange)', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* 4 Battery Telemetry KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px' }}>
          <div className="glass-card">
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 95, 20, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', color: 'var(--color-precision-orange)' }}>
              <ArrowDown size={18} />
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>24h Peak Shaving</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-precision-orange)', margin: '4px 0', fontFamily: 'var(--font-mono)' }}>
              {renewableHours} Hours
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Battery isolated from utility tariff</div>
          </div>

          <div className="glass-card">
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', color: '#10b981' }}>
              <ArrowUp size={18} />
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Solar Recharge</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#10b981', margin: '4px 0', fontFamily: 'var(--font-mono)' }}>
              {mainGridHours} Hours
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Off-peak solar surplus absorption</div>
          </div>

          <div className="glass-card">
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'rgba(56, 189, 248, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', color: 'var(--color-cyan)' }}>
              <ShieldCheck size={18} />
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Health &amp; Life (SOH)</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#38bdf8', margin: '4px 0', fontFamily: 'var(--font-mono)' }}>
              {stateOfHealth}%
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>{totalCycles} cumulative cycles (Est. 4000)</div>
          </div>

          <div className="glass-card">
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'rgba(129, 140, 248, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', color: '#818cf8' }}>
              <Zap size={18} />
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Roundtrip Efficiency</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#a78bfa', margin: '4px 0', fontFamily: 'var(--font-mono)' }}>
              94.6%
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Low internal resistance (IR: 0.18 mΩ)</div>
          </div>
        </div>
      </div>

      {/* Interactive Discharge Stress Testbench */}
      <div className="glass-card" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={18} color="var(--color-precision-orange)" />
              Virtual Discharge Testbench &amp; Autonomy Estimator
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Simulate load stress at different discharge rates to project islanded runtime.
            </p>
          </div>
          <span className="badge badge-cyan">Real-Time Physics Model</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'center' }}>
          <div style={{ background: '#0b1019', padding: '18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.84rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Simulated Microgrid Load Injection:</span>
              <strong style={{ color: 'var(--color-precision-orange)', fontSize: '1rem', fontFamily: 'var(--font-mono)' }}>{testDischargeRate} kW</strong>
            </div>
            <input
              type="range"
              min="20"
              max="250"
              step="5"
              value={testDischargeRate}
              onChange={(e) => setTestDischargeRate(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: 'var(--color-precision-orange)', cursor: 'pointer', marginBottom: '14px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.84rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Ambient Inclosure Temp:</span>
              <strong style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>{ambientCellTemp.toFixed(1)} °C</strong>
            </div>
            <input
              type="range"
              min="15"
              max="45"
              step="0.5"
              value={ambientCellTemp}
              onChange={(e) => setAmbientCellTemp(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ background: '#0b1019', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Islanded Autonomy
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: hoursRemainingAtRate < 2 ? '#ef4444' : '#34d399', fontFamily: 'var(--font-mono)' }}>
                {hoursRemainingAtRate} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Hours</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                Before hitting 15% floor
              </div>
            </div>

            <div style={{ background: '#0b1019', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                C-Rate Intensity
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-cyan)', fontFamily: 'var(--font-mono)' }}>
                {(testDischargeRate / TOTAL_CAPACITY_KWH).toFixed(2)}C
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                Max continuous: 0.8C
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rack Telemetry Detail */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
          Cell Module Telemetry &amp; Rack Balance
        </h3>
        <button
          onClick={handleRebalanceRacks}
          className="btn btn-secondary"
          style={{ fontSize: '0.78rem', padding: '5px 12px' }}
        >
          <RotateCcw size={13} />
          Rebalance All 4 Racks
        </button>
      </div>

      {balancingStatus && (
        <div style={{
          padding: '10px 16px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(56, 189, 248, 0.12)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          color: '#38bdf8',
          fontSize: '0.82rem',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} />
          {balancingStatus}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
        {racks.map((rack) => (
          <div key={rack.id} className="glass-card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <strong style={{ fontSize: '0.9rem', color: '#fff' }}>{rack.id}</strong>
              <span className="badge badge-main-grid" style={{ fontSize: '0.65rem' }}>Active</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Voltage:</span>
                <div style={{ fontWeight: 600, color: '#fff' }}>{rack.voltage}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Current:</span>
                <div style={{ fontWeight: 600, color: '#fff' }}>{rack.current}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Cell Temp:</span>
                <div style={{ fontWeight: 600, color: '#38bdf8' }}>{rack.temp}°C</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Rack SoC:</span>
                <div style={{ fontWeight: 600, color: '#34d399' }}>{rack.soc.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

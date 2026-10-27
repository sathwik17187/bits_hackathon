import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Clock, Zap, Lightbulb, Sliders, DollarSign, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useMicrogrid } from '../../context/MicrogridContext';
import { TariffSpectrumMatrix } from '../../components/TariffSpectrumMatrix';

export const ClientLoadCurve = () => {
  const navigate = useNavigate();
  const { forecastData } = useMicrogrid();
  const hourly = forecastData?.hourly_forecasts || [];

  const [shiftPct, setShiftPct] = useState(25);
  const [applied, setApplied] = useState(false);

  // Peak window is 18:00 - 22:00 (4 hours)
  const peakLoadAvg = 220; // kW
  const shiftedKwhDaily = Math.round((peakLoadAvg * 4 * (shiftPct / 100)));
  const monthlySavings = Math.round(shiftedKwhDaily * 30 * (0.28 - 0.12)); // $0.16 tariff spread

  const handleApplyShift = () => {
    setApplied(true);
    setTimeout(() => setApplied(false), 3000);
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/client/dashboard')}
          className="btn btn-secondary"
          style={{ padding: '4px 10px', fontSize: '0.74rem', marginBottom: '8px', gap: '6px' }}
        >
          <ArrowLeft size={12} />
          <span>Back to Consumer Overview</span>
        </button>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>
          24-Hour Consumer Load Horizon
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Hourly power demand forecast with optimal appliance and peak-shifting cost simulator.
        </p>
      </div>

      {/* Visualizer: 24-Hour Tariff Spectrum & Load Intensity Matrix (No Duplicate Charts) */}
      <TariffSpectrumMatrix hourlyForecasts={hourly} />

      {/* Interactive Peak Shifting Simulator */}
      <div className="glass-card" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 95, 20, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-precision-orange)' }}>
              <Sliders size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                Interactive Peak Load-Shifting Simulator
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                Simulate shifting EV charging and heavy appliances into solar hours to calculate electric bill savings.
              </p>
            </div>
          </div>
          <span className="badge badge-main-grid">Tariff Arbitrage</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Shift Peak Load to Solar Hours:</span>
              <strong style={{ color: 'var(--color-precision-orange)', fontFamily: 'var(--font-mono)' }}>{shiftPct}% Shuffled</strong>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={shiftPct}
              onChange={(e) => setShiftPct(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: 'var(--color-precision-orange)', cursor: 'pointer', marginBottom: '8px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              <span>0% Baseline</span>
              <span>25% Moderate (EV &amp; Laundry)</span>
              <span>50% Aggressive (Smart Home)</span>
            </div>

            <div style={{ marginTop: '16px' }}>
              <button
                onClick={handleApplyShift}
                className="btn btn-primary"
                style={{ fontSize: '0.82rem', padding: '8px 18px' }}
              >
                {applied ? (
                  <>
                    <CheckCircle2 size={15} /> Automation Profile Dispatched
                  </>
                ) : (
                  'Apply Simulated Schedule'
                )}
              </button>
            </div>
          </div>

          <div style={{ background: '#0a0d14', padding: '18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-grid)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              ESTIMATED MONTHLY BILL REDUCTION
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', margin: '4px 0', fontFamily: 'var(--font-mono)' }}>
              ${monthlySavings} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ Month</span>
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              Shifting {shiftedKwhDaily} kWh daily from $0.28 to $0.12 tariff
            </div>
          </div>
        </div>
      </div>

      {/* Energy Tips Box */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div className="glass-card">
          <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', color: '#10b981' }}>
            <Lightbulb size={20} />
          </div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '6px' }}>Best Time for Heavy Loads</h4>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Schedule washing machines, dishwashers, and dryers between <strong>10:00 AM and 03:00 PM</strong> when solar generation is peaking.
          </p>
        </div>

        <div className="glass-card">
          <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 95, 20, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', color: 'var(--color-precision-orange)' }}>
            <Clock size={20} />
          </div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '6px' }}>Peak Evening Conservation</h4>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Between <strong>06:00 PM and 10:00 PM</strong>, localized demand is highest. Pre-cool your home before 06:00 PM to save energy.
          </p>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Activity, Clock, Zap, Lightbulb } from 'lucide-react';
import { useMicrogrid } from '../../context/MicrogridContext';
import { DemandChart } from '../../components/DemandChart';
import { TimelineBar } from '../../components/TimelineBar';

export const ClientLoadCurve = () => {
  const { forecastData } = useMicrogrid();
  const hourly = forecastData?.hourly_forecasts || [];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>
          24-Hour Consumer Load Curve
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Hourly power demand forecast with optimal appliance and EV charging advisories.
        </p>
      </div>

      <div className="glass-card" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="var(--color-cyan)" />
              Microgrid Demand Horizon (kW)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              18:00 to 22:00 is highlighted as peak consumption window
            </p>
          </div>
          <span className="badge badge-renewable">Battery Buffering</span>
        </div>

        <DemandChart hourlyForecasts={hourly} height={360} />
        <TimelineBar hourlyForecasts={hourly} />
      </div>

      {/* Energy Tips Box */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div className="glass-card">
          <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', color: '#10b981' }}>
            <Lightbulb size={20} />
          </div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '6px' }}>Best Time for Heavy Loads</h4>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Schedule washing machines, dishwashers, and dryers between <strong>10:00 AM and 03:00 PM</strong> when solar generation is peaking.
          </p>
        </div>

        <div className="glass-card">
          <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', color: '#f59e0b' }}>
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

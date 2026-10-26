import React from 'react';
import { Bell, AlertTriangle, Clock, DollarSign, ShieldCheck } from 'lucide-react';
import { useMicrogrid } from '../../context/MicrogridContext';

export const ClientTariffAlerts = () => {
  const { forecastData } = useMicrogrid();
  const summary = forecastData?.summary;
  const hasOverload = summary?.has_critical_alert;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Tariff Schedule & Overload Advisories
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Time-of-use electricity pricing tiers, demand surge alerts, and cost optimization tips.
        </p>
      </div>

      {/* Critical Advisory Banner if Overload Exists */}
      {hasOverload && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.16), rgba(153, 27, 27, 0.28))',
          border: '1px solid rgba(239, 68, 68, 0.45)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <AlertTriangle size={24} color="#ef4444" />
          <div>
            <div style={{ fontWeight: 700, color: '#fca5a5' }}>
              COMMUNITY DEMAND ALERT (≥ 200 kW)
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Peak neighborhood demand is projected to spike above 200 kW during the evening. Please avoid charging EVs or running high-draw appliances to prevent surcharge tariffs.
            </div>
          </div>
        </div>
      )}

      {/* Pricing Tier Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Off-Peak Standard Tier</span>
            <span className="badge badge-main-grid">Standard</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#10b981', marginBottom: '6px' }}>
            $0.12 <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ kWh</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Active from <strong>10:00 PM to 06:00 PM</strong> daily. Lowest rates for running heavy home equipment.
          </div>
        </div>

        <div className="glass-card" style={{ border: '1px solid rgba(245, 158, 11, 0.35)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.78rem', color: '#fbbf24', textTransform: 'uppercase', fontWeight: 600 }}>Peak Evening Window</span>
            <span className="badge badge-renewable">Battery Offset</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f59e0b', marginBottom: '6px' }}>
            $0.28 <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ kWh</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Active from <strong>06:00 PM to 10:00 PM</strong>. Community batteries automatically discharge to buffer against this tariff.
          </div>
        </div>
      </div>

      {/* Helpful FAQ / Best Practices */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '16px' }}>How the Microgrid Saves You Money</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <ShieldCheck size={18} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#fff' }}>Automated Battery Shaving:</strong> During peak hours (06:00–10:00 PM), our controller routes clean stored battery energy directly into residential feeders, shielding your electric bill from surge pricing.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <ShieldCheck size={18} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#fff' }}>Proactive 24-Hour Forecasting:</strong> Machine learning forecasts demand 24 hours ahead using ambient weather telemetry, ensuring battery banks are fully charged prior to sunset.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Leaf, Sun, Wind, Award, Trees, Zap } from 'lucide-react';
import { useMicrogrid } from '../../context/MicrogridContext';

export const ClientSustainability = () => {
  const { forecastData } = useMicrogrid();
  const summary = forecastData?.summary;
  const renewableHours = summary?.renewable_hours || 17;
  const avgDemand = summary?.avg_demand_kw || 195.0;

  // Approximate metrics
  const cleanEnergyKwh = Math.round(renewableHours * avgDemand * 0.75);
  const co2AvoidedKg = Math.round(cleanEnergyKwh * 0.42); // ~0.42 kg CO2 per kWh grid factor
  const treesEquiv = Math.round(co2AvoidedKg / 21); // ~21 kg CO2 absorbed per tree/year

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Green Energy & Carbon Offset
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Track the environmental impact and localized carbon reductions delivered by your microgrid.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Clean Energy Delivered</span>
            <div className="kpi-icon">
              <Zap size={18} color="#10b981" />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: '#10b981' }}>{cleanEnergyKwh.toLocaleString()}</span>
            <span className="kpi-unit">kWh</span>
          </div>
          <div className="kpi-footer">
            <span style={{ color: 'var(--text-secondary)' }}>Generated from solar & battery storage</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Carbon Avoided Today</span>
            <div className="kpi-icon">
              <Leaf size={18} color="#34d399" />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: '#34d399' }}>{co2AvoidedKg.toLocaleString()}</span>
            <span className="kpi-unit">kg CO₂</span>
          </div>
          <div className="kpi-footer">
            <span style={{ color: 'var(--text-secondary)' }}>Offset vs thermal municipal generation</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Ecological Tree Equivalent</span>
            <div className="kpi-icon">
              <Trees size={18} color="#a78bfa" />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: '#a78bfa' }}>{treesEquiv}</span>
            <span className="kpi-unit">Trees</span>
          </div>
          <div className="kpi-footer">
            <span style={{ color: 'var(--text-secondary)' }}>Equivalent annual forest carbon absorption</span>
          </div>
        </div>
      </div>

      {/* Sustainability Breakdown Panel */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Award size={20} color="#34d399" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Decarbonization Rationale</h3>
        </div>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
          By automatically forecasting localized hourly energy demand using <strong>Zoho Catalyst QuickML</strong>, the microgrid isolates from fossil-fuel peaking plants during the high-tariff 18:00–22:00 evening window. When demand surges over 160 kW, clean lithium battery banks discharge instantly, eliminating grid stress and peak transmission tariffs.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 600, color: '#fff', marginBottom: '4px' }}>Solar PV Array Offset</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Captures daytime irradiance up to 488 W/m² to recharge battery reserves without drawing fossil power.</div>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 600, color: '#fff', marginBottom: '4px' }}>Peak Shaving Efficiency</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Cuts carbon-intensive marginal peaking power by switching 17 out of 24 hours to stored renewables.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

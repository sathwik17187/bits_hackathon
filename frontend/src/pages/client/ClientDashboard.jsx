import React from 'react';
import { Leaf, Zap, ShieldCheck, Sun, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMicrogrid } from '../../context/MicrogridContext';
import { DemandChart } from '../../components/DemandChart';

export const ClientDashboard = () => {
  const { forecastData, batterySoc } = useMicrogrid();
  const summary = forecastData?.summary;
  const firstHour = forecastData?.hourly_forecasts?.[0];

  const isRenewable = firstHour?.grid_mode === 'RENEWABLE_STORAGE';
  const renewableHours = summary?.renewable_hours || 17;
  const totalHours = summary?.total_hours || 24;
  const greenPct = Math.round((renewableHours / totalHours) * 100);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Consumer Energy Portal
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Transparent, real-time breakdown of your microgrid power sources and green energy usage.
        </p>
      </div>

      {/* Main Status Hero Card */}
      <div className="glass-card" style={{
        marginBottom: '28px',
        background: isRenewable
          ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(16, 185, 129, 0.08))'
          : 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(56, 189, 248, 0.08))',
        border: `1px solid ${isRenewable ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 600, color: isRenewable ? '#fbbf24' : '#34d399', textTransform: 'uppercase', marginBottom: '6px' }}>
              <ShieldCheck size={16} />
              Current Power Supply State
            </div>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: '6px' }}>
              You are currently on{' '}
              <span style={{ color: isRenewable ? '#f59e0b' : '#10b981' }}>
                {isRenewable ? '100% Clean Battery Storage' : 'Main Utility Grid Power'}
              </span>
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '640px' }}>
              {isRenewable
                ? 'High localized demand or peak evening tariff triggered clean battery dispatch, protecting your neighborhood from peak grid charges.'
                : 'Demand is within normal baseload thresholds. Batteries are quietly replenishing from solar potential.'}
            </p>
          </div>

          <Link to="/client/sustainability" className="btn btn-outline-emerald" style={{ padding: '10px 20px' }}>
            <Leaf size={16} />
            View Sustainability Impact <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Clean Energy Share Today</span>
            <div className="kpi-icon">
              <Leaf size={18} color="#10b981" />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: '#10b981' }}>{greenPct}%</span>
          </div>
          <div className="kpi-footer">
            <span style={{ color: 'var(--text-secondary)' }}>{renewableHours} of 24 hours powered by stored renewables</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Current Neighborhood Load</span>
            <div className="kpi-icon">
              <Zap size={18} color="var(--color-cyan)" />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: 'var(--color-cyan)' }}>
              {firstHour ? firstHour.predicted_demand_kw : '185.0'}
            </span>
            <span className="kpi-unit">kW</span>
          </div>
          <div className="kpi-footer">
            <span style={{ color: 'var(--text-secondary)' }}>Forecasted by QuickML model</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Community Battery Reserve</span>
            <div className="kpi-icon">
              <Sun size={18} color="#f59e0b" />
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" style={{ color: '#38bdf8' }}>{batterySoc.toFixed(1)}%</span>
          </div>
          <div className="kpi-footer">
            <span style={{ color: 'var(--text-secondary)' }}>Sufficient for evening peak hours</span>
          </div>
        </div>
      </div>

      {/* 24h Consumer Load Curve */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>24-Hour Energy Consumption Forecast</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Track when demand is highest and plan EV or high-power usage</p>
          </div>
          <span className="badge badge-main-grid">Consumer View</span>
        </div>

        <DemandChart hourlyForecasts={forecastData?.hourly_forecasts || []} height={340} />
      </div>
    </div>
  );
};

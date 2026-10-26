import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Shield, 
  User, 
  Box, 
  Cpu, 
  BatteryCharging, 
  TrendingUp, 
  CheckCircle,
  ArrowRight,
  Server
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { WeatherSimulator } from '../components/WeatherSimulator';
import { useMicrogrid } from '../context/MicrogridContext';

export const LandingPage = () => {
  const { forecastData, batterySoc } = useMicrogrid();
  const summary = forecastData?.summary;
  const firstHour = forecastData?.hourly_forecasts?.[0];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{
        padding: '80px 24px 60px',
        maxWidth: '1280px',
        margin: '0 auto',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1.2fr 0.8fr',
        gap: '48px',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '9999px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', color: 'var(--color-cyan)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '20px' }}>
            <Cpu size={15} />
            HackSphere 3.0 • Zoho Catalyst QuickML Engine
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '20px',
            background: 'linear-gradient(to right, #ffffff, #94a3b8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Next-Gen Microgrid <span style={{ color: 'var(--color-cyan)', WebkitTextFillColor: 'var(--color-cyan)' }}>Forecasting</span> & Dispatch.
          </h1>

          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '32px', maxWidth: '580px' }}>
            Empowering modern power grids with 24-hour hourly demand forecasting, automated battery-to-grid switching, and real-time critical overload prevention.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' }}>
            <Link to="/admin/overview" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '0.95rem' }}>
              <Shield size={18} />
              Launch Admin Console
            </Link>
            <Link to="/client/dashboard" className="btn btn-secondary" style={{ padding: '12px 24px', fontSize: '0.95rem' }}>
              <User size={18} />
              Consumer Energy Portal
            </Link>
            <Link to="/3d-simulation" className="btn btn-outline-emerald" style={{ padding: '12px 24px', fontSize: '0.95rem' }}>
              <Box size={18} />
              3D Valley Simulator
            </Link>
          </div>

          {/* Highlights Checklist */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={16} color="var(--color-main-grid)" />
              <span>Zoho Catalyst QuickML Pipeline</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={16} color="var(--color-main-grid)" />
              <span>Multi-Model Ensemble (RMSE ~9.04 kW)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={16} color="var(--color-main-grid)" />
              <span>Rule-Based Dispatch (&gt;160kW / 18-22h)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={16} color="var(--color-main-grid)" />
              <span>Battery State of Charge Tracking</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Teaser */}
        <div>
          <WeatherSimulator />
        </div>
      </section>

      {/* Live System Metrics Ticker */}
      <section style={{ borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(15, 23, 42, 0.4)', padding: '24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Active Power Source</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: firstHour?.grid_mode === 'RENEWABLE_STORAGE' ? '#f59e0b' : '#10b981' }}>
              {firstHour ? firstHour.grid_mode : 'MAIN_GRID'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Proactive Smart Switching</div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>24h Peak Demand</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-cyan)' }}>
              {summary ? `${summary.peak_demand_kw} kW` : '289.5 kW'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Threshold: 160 kW</div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Battery Storage SoC</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#34d399' }}>
              {batterySoc ? `${batterySoc.toFixed(1)}%` : '85.0%'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Reserve Optimization Active</div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Model Generalization</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#a78bfa' }}>
              9.04 kW RMSE
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>80.4% lower error vs baseline</div>
          </div>
        </div>
      </section>

      {/* Architecture Cards Section */}
      <section style={{ padding: '80px 24px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '12px' }}>
            Catalyst Microgrid Architecture
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
            A modular cloud pipeline designed for high reliability, real-time demand calculation, and seamless power dispatching.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div className="glass-card">
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: 'var(--color-cyan)' }}>
              <Server size={20} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '8px' }}>Telemetry Ingestion</h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Accepts hourly weather telemetry via interactive web forms or CSV batch uploads. Cleans, checks schema, and handles missing data.
            </p>
          </div>

          <div className="glass-card">
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: '#818cf8' }}>
              <TrendingUp size={20} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '8px' }}>QuickML Forecasting</h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Executes regression pipelines to project 24-hour demand with sub-10kW RMSE, incorporating ambient temperature, humidity, and solar potential.
            </p>
          </div>

          <div className="glass-card">
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: '#fbbf24' }}>
              <Zap size={20} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '8px' }}>Transition Controller</h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Evaluates &gt;160 kW demand and peak evening 18:00–22:00 windows to dispatch battery power and raise &ge;200 kW overload alarms.
            </p>
          </div>

          <div className="glass-card">
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: '#34d399' }}>
              <BatteryCharging size={20} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '8px' }}>Battery Simulation</h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Simulates battery drawdown during renewable discharge and solar/off-peak grid replenishment to maintain healthy reserve margins.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', padding: '32px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
        <div>HackSphere 3.0 • Smart Energy Microgrid & Demand Forecasting Engine</div>
        <div style={{ marginTop: '8px' }}>Deployed on Zoho Catalyst Slate & AppSail • Built for High Reliability & Zero Downtime</div>
      </footer>
    </div>
  );
};

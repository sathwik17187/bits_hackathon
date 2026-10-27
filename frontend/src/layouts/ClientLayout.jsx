import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Activity, 
  Leaf, 
  Bell, 
  Box, 
  Zap, 
  LogOut,
  ShieldCheck,
  ArrowUpRight,
  ArrowLeft
} from 'lucide-react';
import { useMicrogrid } from '../context/MicrogridContext';

export const ClientLayout = () => {
  const navigate = useNavigate();
  const { forecastData } = useMicrogrid();
  const firstHour = forecastData?.hourly_forecasts?.[0];

  const clientNavItems = [
    { to: '/client/dashboard', label: 'Consumer Overview', code: '01', icon: Home },
    { to: '/client/load-curve', label: 'Tariff & Peak Shifter', code: '02', icon: Activity },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }} className="crox-grid-bg">
      {/* Sidebar */}
      <aside style={{
        width: '275px',
        borderRight: '1px solid var(--border-grid)',
        background: '#0d1015',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 40,
      }}>
        <div>
          {/* Logo */}
          <div style={{ padding: '22px 20px', borderBottom: '1px solid var(--border-grid)' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                background: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: '1rem',
                fontFamily: 'var(--font-mono)'
              }}>
                🌱
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
                  CROX <span style={{ color: '#10b981' }}>//</span> CONSUMER
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  ENERGY TRANSPARENCY
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav style={{ padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {clientNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    color: isActive ? '#fff' : 'var(--text-secondary)',
                    background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                    border: isActive ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
                    textDecoration: 'none',
                    fontSize: '0.84rem',
                    fontWeight: isActive ? 600 : 500,
                    transition: 'var(--transition)'
                  })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={17} color="#10b981" />
                    <span>{item.label}</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {item.code}
                  </span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div style={{ padding: '20px 16px', borderTop: '1px solid var(--border-grid)' }}>
          <div style={{
            background: '#12151b',
            border: '1px solid var(--border-grid)',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#34d399', fontWeight: 600, fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
              <ShieldCheck size={14} />
              LIVE POWER FEED
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              Currently powered by <strong style={{ color: '#fff' }}>{firstHour?.grid_mode === 'RENEWABLE_STORAGE' ? 'Renewable Storage' : 'Main Grid'}</strong>.
            </div>
          </div>

          <button
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/');
              }
            }}
            className="btn btn-secondary"
            style={{
              width: '100%',
              marginBottom: '10px',
              padding: '8px 12px',
              fontSize: '0.78rem',
              justifyContent: 'center',
              gap: '6px'
            }}
            title="Navigate to previous page"
          >
            <ArrowLeft size={14} />
            <span>RETURN BACK</span>
          </button>

          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: 'var(--crox-silver)',
            textDecoration: 'none',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)',
            padding: '8px 0',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--crox-seam)'
          }}>
            <Home size={14} />
            PUBLIC PORTAL
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <header style={{
          height: '64px',
          borderBottom: '1px solid var(--border-grid)',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(12, 14, 18, 0.95)',
          backdropFilter: 'var(--backdrop-blur)',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate('/');
                }
              }}
              className="btn btn-secondary"
              style={{
                padding: '6px 14px',
                fontSize: '0.78rem',
                gap: '6px',
                borderColor: 'var(--crox-seam)'
              }}
              title="Go back"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>

            <span className="badge badge-main-grid">
              <span className="pulse-dot" style={{ color: 'var(--color-main-grid)' }}></span>
              CONSUMER TRANSPARENCY PLANE
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link to="/admin/overview" className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
              <span>SWITCH TO ADMIN</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </header>

        {/* Page Outlet */}
        <main style={{ padding: '32px', flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

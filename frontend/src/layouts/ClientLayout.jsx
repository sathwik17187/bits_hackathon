import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { 
  Home, 
  Activity, 
  Leaf, 
  Bell, 
  Box, 
  Zap, 
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useMicrogrid } from '../context/MicrogridContext';

export const ClientLayout = () => {
  const { forecastData } = useMicrogrid();
  const firstHour = forecastData?.hourly_forecasts?.[0];

  const clientNavItems = [
    { to: '/client/dashboard', label: 'Consumer Overview', icon: Home },
    { to: '/client/load-curve', label: 'Hourly Demand Curve', icon: Activity },
    { to: '/client/sustainability', label: 'Green Energy & Offset', icon: Leaf },
    { to: '/client/tariff-alerts', label: 'Tariff & Overload Alerts', icon: Bell },
    { to: '/client/3d-simulation', label: '3D Microgrid Valley', icon: Box },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '270px',
        borderRight: '1px solid var(--border-subtle)',
        background: 'rgba(10, 15, 26, 0.95)',
        backdropFilter: 'var(--backdrop-blur)',
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
          <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, #10b981, #0284c7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)'
              }}>
                <Zap size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                  Energy <span style={{ color: 'var(--color-main-grid)' }}>Portal</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Consumer Transparency</div>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav style={{ padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {clientNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '11px 16px',
                    borderRadius: 'var(--radius-md)',
                    color: isActive ? '#fff' : 'var(--text-secondary)',
                    background: isActive ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.15), rgba(56, 189, 248, 0.1))' : 'transparent',
                    border: isActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                    textDecoration: 'none',
                    fontSize: '0.88rem',
                    fontWeight: isActive ? 600 : 500,
                    transition: 'var(--transition)'
                  })}
                >
                  <Icon size={18} color="var(--color-main-grid)" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div style={{ padding: '20px 16px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#34d399', fontWeight: 600, marginBottom: '4px' }}>
              <ShieldCheck size={14} />
              Live Grid Status
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Currently powered by <strong style={{ color: '#fff' }}>{firstHour?.grid_mode === 'RENEWABLE_STORAGE' ? 'Renewable Storage' : 'Main Grid'}</strong>.
            </div>
          </div>

          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontSize: '0.82rem',
            padding: '6px 0'
          }}>
            <LogOut size={15} />
            Back to Public Site
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <header style={{
          height: '68px',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(7, 10, 18, 0.75)',
          backdropFilter: 'var(--backdrop-blur)',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="badge badge-main-grid">
              <span className="pulse-dot" style={{ color: 'var(--color-main-grid)' }}></span>
              Consumer Transparency Portal
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link to="/admin/overview" className="btn btn-secondary" style={{ padding: '7px 14px', fontSize: '0.82rem' }}>
              Switch to Admin View
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

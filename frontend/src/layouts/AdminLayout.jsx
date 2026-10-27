import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Sliders, 
  UploadCloud, 
  BatteryCharging, 
  Box, 
  Zap, 
  LogOut, 
  AlertTriangle,
  RefreshCw,
  Terminal,
  ArrowLeft,
  Home
} from 'lucide-react';
import { useMicrogrid } from '../context/MicrogridContext';

export const AdminLayout = () => {
  const navigate = useNavigate();
  const { forecastData, overrideMode, setOverrideMode, loadSampleData, engineHealth } = useMicrogrid();
  const summary = forecastData?.summary;

  const navItems = [
    { to: '/admin/overview', label: 'Command Center', code: '01', icon: LayoutDashboard },
    { to: '/admin/forecast-engine', label: 'Forecast Lab', code: '02', icon: TrendingUp },
    { to: '/admin/dispatch-controller', label: 'Dispatch Controller', code: '03', icon: Sliders },
    { to: '/admin/dataset-logs', label: 'Dataset Stream Logs', code: '04', icon: Terminal },
    { to: '/admin/battery-manager', label: 'Battery Reserve', code: '05', icon: BatteryCharging },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }} className="crox-grid-bg">
      {/* Sidebar */}
      <aside style={{
        width: '280px',
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
                background: 'var(--color-precision-orange)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: '1rem',
                fontFamily: 'var(--font-mono)'
              }}>
                ⚡
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
                  CROX <span style={{ color: 'var(--color-precision-orange)' }}>//</span> ADMIN
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  CATALYST CONTROL PLANE
                </div>
              </div>
            </Link>
          </div>

          {/* Nav links */}
          <nav style={{ padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map((item) => {
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
                    background: isActive ? 'rgba(255, 95, 20, 0.12)' : 'transparent',
                    border: isActive ? '1px solid rgba(255, 95, 20, 0.4)' : '1px solid transparent',
                    textDecoration: 'none',
                    fontSize: '0.84rem',
                    fontWeight: isActive ? 600 : 500,
                    transition: 'var(--transition)'
                  })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={17} color="var(--color-precision-orange)" />
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
          {/* Override Mode Switcher */}
          <div style={{ background: '#12151b', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '14px', border: '1px solid var(--border-grid)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
              DISPATCH OVERRIDE
            </div>
            <select
              value={overrideMode}
              onChange={(e) => setOverrideMode(e.target.value)}
              style={{
                width: '100%',
                background: '#090b0e',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-grid)',
                borderRadius: '4px',
                padding: '6px 8px',
                fontSize: '0.8rem',
                outline: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <option value="AUTO">🤖 Automated (Rule Engine)</option>
              <option value="FORCE_MAIN_GRID">🔌 Force Main Grid</option>
              <option value="FORCE_RENEWABLE">🔋 Force Renewable Storage</option>
            </select>
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

            <span className="badge badge-renewable">
              <span className="pulse-dot" style={{ color: 'var(--color-precision-orange)' }}></span>
              PRECISION CONTROL PLANE ACTIVE
            </span>
            {summary?.has_critical_alert && (
              <span className="badge badge-overload">
                <AlertTriangle size={13} />
                CRITICAL OVERLOAD DEFENSE ARMED (≥200 kW)
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button onClick={loadSampleData} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
              <RefreshCw size={13} />
              Reload Telemetry
            </button>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              CORE: <strong style={{ color: 'var(--color-precision-orange)' }}>{engineHealth.quickml_configured ? 'QuickML' : 'Ensemble (~9.04 kW RMSE)'}</strong>
            </div>
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

import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
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
  RefreshCw
} from 'lucide-react';
import { useMicrogrid } from '../context/MicrogridContext';

export const AdminLayout = () => {
  const { forecastData, overrideMode, setOverrideMode, loadSampleData, engineHealth } = useMicrogrid();
  const summary = forecastData?.summary;

  const navItems = [
    { to: '/admin/overview', label: 'Command Center', icon: LayoutDashboard },
    { to: '/admin/forecast-engine', label: 'Forecast Lab', icon: TrendingUp },
    { to: '/admin/dispatch-controller', label: 'Dispatch Controller', icon: Sliders },
    { to: '/admin/data-ingestion', label: 'Data Ingestion', icon: UploadCloud },
    { to: '/admin/battery-manager', label: 'Battery Reserve', icon: BatteryCharging },
    { to: '/admin/3d-simulation', label: '3D Microgrid Valley', icon: Box },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '280px',
        borderRight: '1px solid var(--border-subtle)',
        background: 'rgba(11, 16, 29, 0.95)',
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
                background: 'linear-gradient(135deg, #0284c7, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(56, 189, 248, 0.3)'
              }}>
                <Zap size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                  Microgrid <span style={{ color: 'var(--color-cyan)' }}>Admin</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Catalyst Control Plane</div>
              </div>
            </Link>
          </div>

          {/* Nav links */}
          <nav style={{ padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {navItems.map((item) => {
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
                    background: isActive ? 'linear-gradient(90deg, rgba(56, 189, 248, 0.15), rgba(99, 102, 241, 0.1))' : 'transparent',
                    border: isActive ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                    textDecoration: 'none',
                    fontSize: '0.88rem',
                    fontWeight: isActive ? 600 : 500,
                    transition: 'var(--transition)'
                  })}
                >
                  <Icon size={18} color="var(--color-cyan)" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div style={{ padding: '20px 16px', borderTop: '1px solid var(--border-subtle)' }}>
          {/* Override Mode Switcher */}
          <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '14px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600 }}>
              Dispatch Override
            </div>
            <select
              value={overrideMode}
              onChange={(e) => setOverrideMode(e.target.value)}
              style={{
                width: '100%',
                background: '#090d16',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '6px 8px',
                fontSize: '0.8rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="AUTO">🤖 Automated (Rule Engine)</option>
              <option value="FORCE_MAIN_GRID">🔌 Force Main Grid</option>
              <option value="FORCE_RENEWABLE">🔋 Force Renewable Storage</option>
            </select>
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
            Exit to Public Portal
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span className="badge badge-cyan">
              <span className="pulse-dot" style={{ color: 'var(--color-cyan)' }}></span>
              Admin Control Plane Active
            </span>
            {summary?.has_critical_alert && (
              <span className="badge badge-overload">
                <AlertTriangle size={13} />
                Critical Overload Alert Detected (≥200 kW)
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button onClick={loadSampleData} className="btn btn-secondary" style={{ padding: '7px 14px', fontSize: '0.82rem' }}>
              <RefreshCw size={14} />
              Reload Telemetry
            </button>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Model: <strong style={{ color: 'var(--color-cyan)' }}>{engineHealth.quickml_configured ? 'QuickML' : 'Ensemble (~9 kW RMSE)'}</strong>
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

import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Shield, User, Box } from 'lucide-react';

export const Navbar = () => {
  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '18px 36px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(7, 10, 18, 0.85)',
      backdropFilter: 'var(--backdrop-blur)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: 'var(--radius-sm)',
          background: 'linear-gradient(135deg, #0284c7, #6366f1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(56, 189, 248, 0.3)'
        }}>
          <Zap size={22} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
            HackSphere <span style={{ color: 'var(--color-cyan)' }}>3.0</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Smart Microgrid Intelligence</div>
        </div>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
          Home
        </Link>
        <Link to="/3d-simulation" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Box size={16} color="var(--color-cyan)" />
          3D Valley
        </Link>
        <Link to="/client/dashboard" className="btn btn-secondary" style={{ fontSize: '0.82rem' }}>
          <User size={15} />
          Consumer Portal
        </Link>
        <Link to="/admin/overview" className="btn btn-primary" style={{ fontSize: '0.82rem' }}>
          <Shield size={15} />
          Admin Console
        </Link>
      </div>
    </nav>
  );
};

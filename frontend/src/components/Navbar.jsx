import React from 'react';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(227, 231, 235, 0.95)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--crox-seam)'
    }}>
      {/* Main Nav Strip matching CROX Showcase */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 32px',
        maxWidth: '1440px',
        margin: '0 auto'
      }}>
        {/* Brandmark on left */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <span style={{
            fontSize: '1.4rem',
            fontWeight: 900,
            color: 'var(--crox-black)',
            letterSpacing: '-0.04em',
            textTransform: 'uppercase'
          }}>
            NEXUS<span style={{ color: 'var(--crox-orange)' }}>GRID</span>
          </span>
          <span style={{
            fontSize: '0.65rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--crox-orange)',
            fontWeight: 800,
            background: 'var(--crox-orange-subtle)',
            padding: '2px 6px',
            borderRadius: '2px'
          }}>
            OS 3.0
          </span>
        </Link>
      </div>
    </header>
  );
};


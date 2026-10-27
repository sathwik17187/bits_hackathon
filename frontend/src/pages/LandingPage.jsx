import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  ArrowRight,
  ArrowUpRight,
  Activity,
  Sliders,
  CheckCircle2,
  Download,
  Calendar,
  Layers,
  Cpu,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useMicrogrid } from '../context/MicrogridContext';

export const LandingPage = () => {
  const { forecastData, batterySoc } = useMicrogrid();
  const summary = forecastData?.summary;
  const firstHour = forecastData?.hourly_forecasts?.[0];

  // Interactive ROI Calculator State
  const [communityMwh, setCommunityMwh] = useState(1500);

  const peakShavedKwh = Math.round(communityMwh * 1000 * 0.42);
  const annualSavingsUsd = Math.round(peakShavedKwh * 0.16);
  const co2AvoidedTons = Math.round((peakShavedKwh * 0.42) / 1000);
  const treesEquiv = Math.round((co2AvoidedTons * 1000) / 21);

  const [activeProcessTab, setActiveProcessTab] = useState('ASSESS');

  const workItems = [
    {
      id: '01',
      title: 'SUBSTATION FEEDER MATRIX & CIRCUIT BREAKERS',
      category: 'DETERMINISTIC HARDWARE',
      desc: 'Autonomous 5-circuit feeder matrix with manual shed overrides and unforecasted peak surge isolation.',
      link: '/admin/dispatch-controller'
    },
    {
      id: '02',
      title: '500 KWH LFP ENERGY STORAGE & CHILLER BENCH',
      category: 'ENERGY STORAGE SYSTEM',
      desc: 'Liquid-cooled lithium-iron phosphate battery array with active cell balancing and 15% emergency reserve floor.',
      link: '/admin/battery-manager'
    },
    {
      id: '03',
      title: 'QUICKML 24-HOUR MULTI-HORIZON LOAD ENGINE',
      category: 'MACHINE LEARNING CORE',
      desc: 'Multivariate gradient boosted regression forecasting hourly kilowatt loads from ambient weather vectors (±9.04 kW RMSE).',
      link: '/admin/forecast-engine'
    },
    {
      id: '04',
      title: 'CONSUMER TIME-OF-USE TARIFF & SMART EV SCHEDULER',
      category: 'CONSUMER TRANSPARENCY',
      desc: 'Automated electric vehicle smart charging scheduling that locks in off-peak $0.12/kWh green solar storage windows.',
      link: '/client/load-curve'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--crox-canvas)', display: 'flex', flexDirection: 'column' }} className="crox-blueprint-bg">

      {/* SECTION 1: HERO / CROX INTELLIGENCE (Matches Screen 1 in showcase) */}
      <section style={{
        maxWidth: '1440px',
        margin: '0 auto',
        width: '100%',
        padding: '50px 32px 60px',
        borderBottom: '1px solid var(--crox-seam)'
      }}>
        {/* Top Header Row with Circle Badge and Tagline */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="crox-badge-circle">
              140+
              <span>MODELS</span>
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: 'var(--crox-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                [ PRECISION MICROGRID STUDIO ]
              </div>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--crox-black)' }}>
                HYDERABAD SUBSTATION // HS-3024
              </div>
            </div>
          </div>
        </div>

        {/* Hero Title and Description Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 0.65fr', gap: '48px', alignItems: 'flex-end', marginBottom: '40px' }}>
          <div>
            <h1 style={{
              fontSize: 'clamp(3.2rem, 7vw, 5.8rem)',
              fontWeight: 900,
              lineHeight: 0.95,
              letterSpacing: '-0.04em',
              textTransform: 'uppercase',
              color: 'var(--crox-black)',
              margin: 0
            }}>
              CROX<br />
              INTELLIGENCE
            </h1>
          </div>

          <div>
            <p style={{
              fontSize: '1rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '24px',
              fontWeight: 500
            }}>
              Autonomous microgrid orchestration: multivariate QuickML forecasting, deterministic 160 kW auto-switching, and 500 kWh battery storage engineered as one system, tested before it reaches your line.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/admin/overview" className="btn btn-primary" style={{ padding: '12px 24px' }}>
                <span>ADMIN PORTAL</span>
                <ArrowRight size={15} />
              </Link>
              <Link to="/client/dashboard" className="btn btn-secondary" style={{ padding: '12px 20px' }}>
                <span>CONSUMER PORTAL</span>
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Bottom Split Row: CAD Wireframe + System Status Telemetry */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: '4px',
          background: 'var(--crox-seam)',
          padding: '4px',
          borderRadius: 'var(--radius-sm)'
        }}>
          {/* Left CAD Wireframe Tile */}
          {/* Left: Phase Angle & Waveform Synchronizer Card */}
          <div style={{
            background: 'var(--crox-card-dark)',
            color: '#fff',
            padding: '24px 28px',
            position: 'relative',
            minHeight: '260px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
            overflow: 'hidden'
          }}>
            {/* Orange Safety Accent Strip */}
            <div style={{
              position: 'absolute',
              top: '16px',
              bottom: '16px',
              left: '16px',
              width: '5px',
              background: 'var(--crox-orange)',
              borderRadius: '2px'
            }} />

            {/* Left Telemetry Column */}
            <div style={{ paddingLeft: '16px', flex: '1 1 auto', minWidth: '220px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--crox-orange)', fontFamily: 'var(--font-mono)', fontWeight: 800, textTransform: 'uppercase' }}>
                  PMU // SYNCHROPHASOR
                </span>
                <span style={{
                  fontSize: '0.62rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#10b981',
                  background: 'rgba(16, 185, 129, 0.12)',
                  padding: '2px 6px',
                  borderRadius: '2px',
                  fontWeight: 700
                }}>
                  ● PHASE LOCKED
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                GRID PHASE SYNCHRONIZER
              </h3>

              <div style={{ fontSize: '0.76rem', color: '#8e95a0', fontFamily: 'var(--font-mono)', marginBottom: '14px' }}>
                3-PHASE AC BUS // 480V RMS AUTO-SYNC
              </div>

              {/* Phasor Telemetry Specs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px 16px', fontSize: '0.74rem', fontFamily: 'var(--font-mono)' }}>
                <div>
                  <div style={{ color: '#6b7280', fontSize: '0.66rem' }}>PHASE ANGLE Δθ</div>
                  <div style={{ color: '#fff', fontWeight: 800 }}>+0.42° <span style={{ color: '#10b981', fontSize: '0.66rem' }}>[SYNC]</span></div>
                </div>
                <div>
                  <div style={{ color: '#6b7280', fontSize: '0.66rem' }}>FREQUENCY OFFSET</div>
                  <div style={{ color: 'var(--crox-orange)', fontWeight: 800 }}>Δf = +0.02 Hz</div>
                </div>
                <div>
                  <div style={{ color: '#6b7280', fontSize: '0.66rem' }}>TRANSFER SPEED</div>
                  <div style={{ color: '#fff', fontWeight: 800 }}>&lt; 9.8 ms</div>
                </div>
                <div>
                  <div style={{ color: '#6b7280', fontSize: '0.66rem' }}>INVERTER DROOP</div>
                  <div style={{ color: '#fff', fontWeight: 800 }}>4.8% V/VAR</div>
                </div>
              </div>
            </div>

            {/* Right: Dual AC Waveform & Synchroscope Vector */}
            <div style={{
              width: '260px',
              height: '190px',
              position: 'relative',
              background: 'rgba(10, 12, 14, 0.85)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              flexShrink: 0
            }}>
              {/* Scope Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem', fontFamily: 'var(--font-mono)' }}>
                <span style={{ color: '#8e95a0' }}>OSCILLOSCOPE // 50 Hz</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>99.8% COHERENCE</span>
              </div>

              {/* Sine Waveform Canvas SVG */}
              <svg viewBox="0 0 220 90" style={{ width: '100%', height: '90px', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="waveOrangeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ff5f14" stopOpacity="0.4" />
                    <stop offset="50%" stopColor="#ff5f14" stopOpacity="1" />
                    <stop offset="100%" stopColor="#ff5f14" stopOpacity="0.7" />
                  </linearGradient>
                </defs>

                {/* Scope Grid Lines */}
                <line x1="0" y1="45" x2="220" y2="45" stroke="rgba(255, 255, 255, 0.18)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="18" x2="220" y2="18" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="1" />
                <line x1="0" y1="72" x2="220" y2="72" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="1" />
                <line x1="55" y1="0" x2="55" y2="90" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="1" />
                <line x1="110" y1="0" x2="110" y2="90" stroke="rgba(255, 255, 255, 0.14)" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="165" y1="0" x2="165" y2="90" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="1" />

                {/* Wave 1: Utility Grid 50.00 Hz Reference (Cool Cyan/Silver dashed) */}
                <path
                  d="M 0,45 C 18,12 37,12 55,45 C 73,78 92,78 110,45 C 128,12 147,12 165,45 C 183,78 202,78 220,45"
                  fill="none"
                  stroke="rgba(0, 229, 255, 0.45)"
                  strokeWidth="1.4"
                  strokeDasharray="4 3"
                />

                {/* Wave 2: Microgrid Inverter 50.02 Hz Lock (Vibrant Orange solid line) */}
                <path
                  d="M 0,45 C 17,14 36,14 54,45 C 72,76 91,76 109,45 C 127,14 146,14 164,45 C 182,76 201,76 220,45"
                  fill="none"
                  stroke="url(#waveOrangeGlow)"
                  strokeWidth="2.4"
                />

                {/* Live Zero-Cross Tracking Cursor */}
                <line x1="110" y1="28" x2="110" y2="62" stroke="#ff5f14" strokeWidth="1.5" />
                <circle cx="110" cy="45" r="3.5" fill="#ff5f14" />
                <circle cx="109" cy="45" r="6" fill="none" stroke="rgba(255, 95, 20, 0.4)" strokeWidth="1" />
              </svg>

              {/* Legend Strip */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.62rem', fontFamily: 'var(--font-mono)', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--crox-orange)' }}>
                  <span style={{ width: '10px', height: '2px', background: 'var(--crox-orange)', display: 'inline-block' }} />
                  INVERTER (50.02 Hz)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(0, 229, 255, 0.7)' }}>
                  <span style={{ width: '10px', height: '2px', background: 'rgba(0, 229, 255, 0.7)', borderStyle: 'dashed', display: 'inline-block' }} />
                  GRID REF (50.00 Hz)
                </span>
              </div>
            </div>
          </div>

          {/* Right System Status Tile */}
          <div style={{
            background: 'var(--crox-white)',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--crox-seam)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                  SYSTEM STATUS // TELEMETRY
                </span>
                <span className="badge badge-renewable">LIVE</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                <div>
                  <div style={{ color: 'var(--crox-muted)', fontSize: '0.7rem' }}>GRID FREQ</div>
                  <div style={{ fontWeight: 800, color: 'var(--crox-black)' }}>50.02 HZ</div>
                </div>
                <div>
                  <div style={{ color: 'var(--crox-muted)', fontSize: '0.7rem' }}>VALIDATION RMSE</div>
                  <div style={{ fontWeight: 800, color: '#047857' }}>±9.04 KW</div>
                </div>
                <div>
                  <div style={{ color: 'var(--crox-muted)', fontSize: '0.7rem' }}>TRANSFER TIME</div>
                  <div style={{ fontWeight: 800, color: 'var(--crox-orange)' }}>&lt; 10 MS</div>
                </div>
                <div>
                  <div style={{ color: 'var(--crox-muted)', fontSize: '0.7rem' }}>BATTERY RESERVE</div>
                  <div style={{ fontWeight: 800, color: '#0284c7' }}>{batterySoc.toFixed(1)}%</div>
                </div>
              </div>
            </div>

            <div style={{ paddingTop: '14px', borderTop: '1px solid var(--crox-seam)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', fontFamily: 'var(--font-mono)' }}>
              <span style={{ color: 'var(--crox-muted)' }}>CURRENT DISPATCH:</span>
              <strong style={{ color: firstHour?.grid_mode === 'RENEWABLE_STORAGE' ? 'var(--crox-orange)' : '#047857' }}>
                {firstHour?.grid_mode || 'RENEWABLE_STORAGE'}
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: PROCESS (Matches Screen 2 in showcase) */}
      <section style={{
        maxWidth: '1440px',
        margin: '0 auto',
        width: '100%',
        padding: '70px 32px',
        borderBottom: '1px solid var(--crox-seam)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{
              fontSize: 'clamp(3rem, 6.5vw, 5.2rem)',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '-0.04em',
              lineHeight: 0.95,
              margin: '0 0 16px',
              color: 'var(--crox-black)'
            }}>
              PROCESS
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '580px', margin: 0, fontWeight: 500 }}>
              Continuous 24-hour horizon synthesis. Mechanics, machine learning, and hardware controls verified at every hour step before power routes to community feeders.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/admin/forecast-engine" className="btn btn-primary" style={{ padding: '10px 18px' }}>
              OUR PROCESS LAB <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Process Steps Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          borderTop: '1px solid var(--crox-black)',
          borderBottom: '1px solid var(--crox-black)',
          margin: '36px 0 32px'
        }}>
          {[
            { id: 'ASSESS', step: '+ ASSESS', sub: 'WEATHER VECTOR INGESTION', desc: 'Solar irradiance, humidity, and temperature telemetry sampled continuously.' },
            { id: 'ENGINEER', step: '+ ENGINEER', sub: 'QUICKML DEMAND REGRESSION', desc: 'Multivariate ensemble models calculating 24h kilowatt forecast curves.' },
            { id: 'PROVE', step: '+ PROVE', sub: 'DETERMINISTIC TRANSFER', desc: 'Sub-cycle battery transfer when load crosses 160 kW or evening peak window.' }
          ].map((p) => (
            <div
              key={p.id}
              onClick={() => setActiveProcessTab(p.id)}
              style={{
                padding: '24px 20px',
                borderRight: p.id !== 'PROVE' ? '1px solid var(--crox-black)' : 'none',
                background: activeProcessTab === p.id ? 'var(--crox-white)' : 'transparent',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
            >
              <div style={{ fontSize: '0.95rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--crox-black)', marginBottom: '4px' }}>
                {p.step}
              </div>
              <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--crox-orange)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                {p.sub}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {p.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Process Stats Band: Orange Block + White Block + Dark Block (Matches Screen 2 in showcase) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '4px',
          background: 'var(--crox-seam)',
          padding: '4px',
          borderRadius: 'var(--radius-sm)'
        }}>
          {/* Orange Block */}
          <div style={{ background: 'var(--crox-orange)', color: '#fff', padding: '36px 28px' }}>
            <div style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', opacity: 0.9 }}>
              01 // QUICKML ACCURACY
            </div>
            <div style={{ fontSize: '3.6rem', fontWeight: 900, lineHeight: 1, margin: '8px 0 4px', letterSpacing: '-0.04em' }}>
              ±9.04
            </div>
            <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', opacity: 0.9 }}>
              KILOWATT VALIDATION RMSE
            </div>
          </div>

          {/* White Block */}
          <div style={{ background: 'var(--crox-white)', color: 'var(--crox-black)', padding: '36px 28px' }}>
            <div style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--crox-muted)' }}>
              02 // CLEAN PEAK OFFSET
            </div>
            <div style={{ fontSize: '3.6rem', fontWeight: 900, lineHeight: 1, margin: '8px 0 4px', letterSpacing: '-0.04em' }}>
              17
            </div>
            <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              HOURS STORED SOLAR POWER
            </div>
          </div>

          {/* Dark Block */}
          <div style={{ background: 'var(--crox-card-dark)', color: '#fff', padding: '36px 28px' }}>
            <div style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: '#8e95a0' }}>
              03 // ZERO BLACKOUT
            </div>
            <div style={{ fontSize: '3.6rem', fontWeight: 900, lineHeight: 1, margin: '8px 0 4px', letterSpacing: '-0.04em' }}>
              0
            </div>
            <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: '#8e95a0' }}>
              CRITICAL SHEDDING DROP-OFFS
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: ABOUT / FEASIBILITY (Matches Screen 6 & 7 in showcase) */}
      <section style={{
        maxWidth: '1440px',
        margin: '0 auto',
        width: '100%',
        padding: '70px 32px',
        borderBottom: '1px solid var(--crox-seam)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{
              fontSize: 'clamp(3rem, 6.5vw, 5.2rem)',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '-0.04em',
              lineHeight: 0.95,
              margin: '0 0 14px',
              color: 'var(--crox-black)'
            }}>
              ABOUT
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '580px', margin: 0, fontWeight: 500 }}>
              CROX is a precision engineering studio for clean microgrids. We design mechanics, telemetry pipelines, and deterministic transition controllers tested before deployment.
            </p>
          </div>
        </div>

        {/* 3-Tile Block matching Screen 6 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr 1fr',
          gap: '4px',
          background: 'var(--crox-seam)',
          padding: '4px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '32px'
        }}>
          {/* Tile 1: Orange 140+ */}
          <div style={{ background: 'var(--crox-orange)', color: '#fff', padding: '36px 32px' }}>
            <div style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', opacity: 0.9 }}>
              DEPLOYED CAPACITY
            </div>
            <div style={{ fontSize: '3.6rem', fontWeight: 900, lineHeight: 1, margin: '8px 0 4px', letterSpacing: '-0.03em' }}>
              140+
            </div>
            <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', opacity: 0.9 }}>
              KW PEAK LOAD BUFFERED
            </div>
          </div>

          {/* Tile 2: White 12 */}
          <div style={{ background: 'var(--crox-white)', color: 'var(--crox-black)', padding: '36px 32px' }}>
            <div style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--crox-muted)' }}>
              MICROGRID BATTERIES
            </div>
            <div style={{ fontSize: '3.6rem', fontWeight: 900, lineHeight: 1, margin: '8px 0 4px', letterSpacing: '-0.03em' }}>
              12
            </div>
            <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              RACKS IN LFP ARRAY
            </div>
          </div>

          {/* Tile 3: Dark 0 */}
          <div style={{ background: 'var(--crox-card-dark)', color: '#fff', padding: '36px 32px' }}>
            <div style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: '#8e95a0' }}>
              FAULT ESCALATION
            </div>
            <div style={{ fontSize: '3.6rem', fontWeight: 900, lineHeight: 1, margin: '8px 0 4px', letterSpacing: '-0.03em' }}>
              0
            </div>
            <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: '#8e95a0' }}>
              CRITICAL ALARM OUTAGES
            </div>
          </div>
        </div>

        {/* Live Economic Feasibility Valuation Slider */}
        <div style={{
          background: 'var(--crox-white)',
          border: '1px solid var(--crox-seam)',
          borderRadius: 'var(--radius-sm)',
          padding: '36px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '36px', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: 'var(--crox-orange)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '6px' }}>
                A PLAN YOU CAN PRICE // ANNUAL VALUATION
              </div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 900, textTransform: 'uppercase', margin: '0 0 10px' }}>
                ANNUAL ECONOMIC &amp; CARBON ARBITRAGE
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                Adjust community annual MWh consumption to calculate tariff savings achieved by buffering high-tariff evening windows (18:00–22:00) with solar and stored BESS reserves.
              </p>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Community Consumption:</span>
                  <strong style={{ color: 'var(--crox-orange)', fontFamily: 'var(--font-mono)', fontSize: '1rem' }}>
                    {communityMwh.toLocaleString()} MWh / Year
                  </strong>
                </div>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="100"
                  value={communityMwh}
                  onChange={(e) => setCommunityMwh(parseInt(e.target.value, 10))}
                  style={{ width: '100%', accentColor: 'var(--crox-orange)', cursor: 'pointer', height: '6px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--crox-muted)', fontFamily: 'var(--font-mono)', marginTop: '6px' }}>
                  <span>500 MWh (Campus)</span>
                  <span>2,500 MWh (Township)</span>
                  <span>5,000 MWh (Industrial Feeder)</span>
                </div>
              </div>
            </div>

            {/* Calculations Box */}
            <div style={{
              background: '#0d0f12',
              color: '#fff',
              borderRadius: 'var(--radius-sm)',
              padding: '28px',
              border: '1px solid var(--crox-seam)'
            }}>
              <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ fontSize: '0.72rem', color: '#8e95a0', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                  ANNUAL TARIFF ARBITRAGE SAVINGS
                </div>
                <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#10b981', letterSpacing: '-0.02em', margin: '4px 0' }}>
                  ${annualSavingsUsd.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#8e95a0' }}>
                  Displacing $0.28/kWh peak peaker charges
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#8e95a0', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                    CO₂ OFFSET
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-cyan)', margin: '2px 0' }}>
                    {co2AvoidedTons.toLocaleString()} <span style={{ fontSize: '0.85rem' }}>T</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#8e95a0' }}>Metric tons</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.7rem', color: '#8e95a0', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                    FOREST EQUIV
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#a78bfa', margin: '2px 0' }}>
                    {treesEquiv.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#8e95a0' }}>Trees planted</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: FOOTER CALLOUT (Matches Screen 7 & 8 in showcase) */}
      <footer style={{
        background: 'var(--crox-black)',
        color: '#fff',
        padding: '70px 32px 40px',
        marginTop: 'auto'
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          width: '100%'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '60px',
            flexWrap: 'wrap',
            gap: '32px'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--crox-orange)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.08em' }}>
                [ NEXT-GEN MICROGRID OPERATING SYSTEM ]
              </div>
              <h2 style={{
                fontSize: 'clamp(2.4rem, 5.5vw, 4.4rem)',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '-0.04em',
                lineHeight: 1.05,
                margin: 0
              }}>
                LET'S RUN A GRID<br />
                <span style={{ color: 'var(--crox-orange)' }}>THAT DOESN'T FAIL.</span>
              </h2>
            </div>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <Link to="/admin/overview" className="btn btn-primary" style={{ padding: '14px 26px', fontSize: '0.86rem' }}>
                <span>OPEN COMMAND CONSOLE</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/client/dashboard" className="btn btn-secondary" style={{ padding: '14px 24px', fontSize: '0.86rem' }}>
                <span>CONSUMER ENERGY PORTAL</span>
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            paddingTop: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.76rem',
            fontFamily: 'var(--font-mono)',
            color: '#8e95a0',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              CROX PRECISION MICROGRID OS // HACKSPHERE 3.0 • BITS PILANI HYDERABAD
            </div>
            <div>
              CATALYST QUICKML INFERENCE ENGINE // SUB-10MS TRANSFER ARCHITECTURE
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

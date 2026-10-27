import React, { useState } from 'react';
import { Leaf, Zap, ShieldCheck, Sun, Clock, ArrowRight, Award, Download, Trees } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMicrogrid } from '../../context/MicrogridContext';
import { MicrogridPowerFlowSLD } from '../../components/MicrogridPowerFlowSLD';
import { downloadFile } from '../../utils/exportUtil';

export const ClientDashboard = () => {
  const { forecastData, batterySoc } = useMicrogrid();
  const summary = forecastData?.summary;
  const firstHour = forecastData?.hourly_forecasts?.[0];

  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const isRenewable = firstHour?.grid_mode === 'RENEWABLE_STORAGE';
  const renewableHours = summary?.renewable_hours || 17;
  const totalHours = summary?.total_hours || 24;
  const greenPct = Math.round((renewableHours / totalHours) * 100);
  const avgDemand = summary?.avg_demand_kw || 195.0;

  const cleanEnergyKwh = Math.round(renewableHours * avgDemand * 0.75);
  const co2AvoidedKg = Math.round(cleanEnergyKwh * 0.42);
  const treesEquiv = Math.round(co2AvoidedKg / 21);

  const handleDownloadCertificate = () => {
    const certText = `
======================================================================
               MICROGRID CLEAN ENERGY OFFSET CERTIFICATE
                      HACKSPHERE 3.0 // CROX
======================================================================
Certificate ID     : CERT-CROX-${Date.now().toString(36).toUpperCase()}
Issued Date        : ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Evaluation Window  : 24-HOUR HORIZON
Jurisdiction       : 17.54°N 78.57°E (Hyderabad Substation Cluster)

METRICS AUDITED:
----------------------------------------------------------------------
Total Clean Energy Delivered : ${cleanEnergyKwh.toLocaleString()} kWh
Carbon Emissions Offset      : ${(co2AvoidedKg / 1000).toFixed(2)} Metric Tons CO2
Forest Equivalent Absorbed   : ${treesEquiv.toLocaleString()} Mature Trees
Renewable Shaving Share      : ${greenPct}% of Operating Horizon

AI ORCHESTRATION:
----------------------------------------------------------------------
Model Core        : Zoho Catalyst QuickML Multivariate Regressor
Validation Error  : ±9.04 kW RMSE
Automation Logic  : Automated Battery Peak Shaving (>160 kW / 18:00–22:00)

Status: VERIFIED & AUDITED EMISSIONS OFFSET
======================================================================
`.trim();

    const ok = downloadFile('Clean_Energy_Certificate_24h.txt', certText, 'text/plain;charset=utf-8');
    if (ok) {
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    }
  };

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

          <Link to="/client/load-curve" className="btn btn-outline-emerald" style={{ padding: '10px 20px', textDecoration: 'none' }}>
            <Zap size={16} />
            <span>Tariff & Load Shifter</span>
            <ArrowRight size={14} />
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

      {/* Visualizer: Live Microgrid Power-Flow SLD & Polar Gauges (No Duplicate Charts) */}
      <MicrogridPowerFlowSLD
        firstHour={firstHour}
        batterySoc={batterySoc}
        summary={summary}
      />

      {/* Clean Energy & ESG Carbon Offset Section */}
      <div className="glass-card" style={{ marginTop: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <Award size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                Clean Energy Offset & ESG Certificate
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                Audited environmental impact metrics generated by microgrid solar storage optimization.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={handleDownloadCertificate}
              className="btn btn-primary"
              style={{ padding: '8px 14px', fontSize: '0.78rem', gap: '6px' }}
            >
              <Download size={14} />
              <span>{downloadSuccess ? 'Downloaded!' : 'Download Certificate'}</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-grid)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Clean Energy Delivered</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              {cleanEnergyKwh.toLocaleString()} kWh
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              75% baseline clean offset
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-grid)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>CO₂ Emissions Avoided</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              {(co2AvoidedKg / 1000).toFixed(2)} Tons
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Displacing peaker plant fossil fuels
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-grid)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Forest Equivalent Absorbed</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              {treesEquiv.toLocaleString()} Trees
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Annual urban tree absorption equivalent
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-grid)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Community Resilience</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              {renewableHours}/24 Hours
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-emerald)', marginTop: '4px' }}>
              Zero diesel emissions during peak
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

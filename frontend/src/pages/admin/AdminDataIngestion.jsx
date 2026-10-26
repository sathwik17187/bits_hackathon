import React, { useRef, useState } from 'react';
import { UploadCloud, CheckCircle, FileText, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { useMicrogrid } from '../../context/MicrogridContext';

export const AdminDataIngestion = () => {
  const { uploadCsv, loadSampleData, forecastData, loading } = useMicrogrid();
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);

  const handleFile = async (file) => {
    if (!file.name.endsWith('.csv')) {
      setUploadMsg({ type: 'error', text: 'Please upload a valid .csv file format.' });
      return;
    }
    setUploadMsg({ type: 'info', text: `Parsing and forecasting ${file.name}...` });
    const res = await uploadCsv(file);
    if (res.success) {
      setUploadMsg({ type: 'success', text: `Successfully processed ${file.name}! 24-hour forecast updated.` });
    } else {
      setUploadMsg({ type: 'error', text: res.error });
    }
  };

  const sampleRows = forecastData?.hourly_forecasts?.slice(0, 5) || [];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Telemetry Data Ingestion
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Batch upload historical weather inputs, validate CSV schemas, and update the live forecast model.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', marginBottom: '28px' }}>
        {/* Upload Zone */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '14px' }}>Upload Batch CSV Telemetry</h3>

          <div
            onClick={() => fileInputRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
            }}
            style={{
              border: '2px dashed',
              borderColor: dragOver ? 'var(--color-cyan)' : 'rgba(255, 255, 255, 0.16)',
              borderRadius: 'var(--radius-md)',
              padding: '40px 20px',
              textAlign: 'center',
              background: dragOver ? 'rgba(56, 189, 248, 0.05)' : 'rgba(15, 23, 42, 0.5)',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files.length > 0) handleFile(e.target.files[0]);
              }}
            />
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', color: 'var(--color-cyan)' }}>
              <UploadCloud size={24} />
            </div>
            <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '4px' }}>
              Drag & Drop Telemetry CSV Here
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Compatible with <code>sample_test_input.csv</code> format
            </div>
            <button type="button" className="btn btn-secondary" style={{ fontSize: '0.82rem' }}>
              Browse File System
            </button>
          </div>

          {uploadMsg && (
            <div style={{
              marginTop: '16px',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: uploadMsg.type === 'error' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
              border: `1px solid ${uploadMsg.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
              color: uploadMsg.type === 'error' ? '#fca5a5' : '#34d399'
            }}>
              {uploadMsg.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
              {uploadMsg.text}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button onClick={loadSampleData} disabled={loading} className="btn btn-secondary" style={{ flex: 1, fontSize: '0.82rem' }}>
              <RefreshCw size={14} />
              Load Default 24h Sample
            </button>
          </div>
        </div>

        {/* Schema Requirement Box */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '14px' }}>Telemetry Schema Specification</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Each row must represent one forecast hour and include the following weather indicators:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem' }}>
            <div style={{ padding: '8px 12px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <code>timestamp</code> — Format: <code>YYYY-MM-DD HH:MM:SS</code>
            </div>
            <div style={{ padding: '8px 12px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <code>ambient_temp_c</code> — Float (°C) Outdoor temperature
            </div>
            <div style={{ padding: '8px 12px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <code>humidity_pct</code> — Float (%) Relative humidity
            </div>
            <div style={{ padding: '8px 12px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <code>solar_irradiance_wm2</code> — Float (W/m²) Solar potential
            </div>
          </div>
        </div>
      </div>

      {/* Ingested Samples Preview */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '14px' }}>Active Batch Preview (First 5 Hours)</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.8)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '10px 14px' }}>Timestamp</th>
                <th style={{ padding: '10px 14px' }}>Temp (°C)</th>
                <th style={{ padding: '10px 14px' }}>Humidity (%)</th>
                <th style={{ padding: '10px 14px' }}>Solar (W/m²)</th>
                <th style={{ padding: '10px 14px' }}>Forecast Demand</th>
                <th style={{ padding: '10px 14px' }}>Dispatch State</th>
              </tr>
            </thead>
            <tbody>
              {sampleRows.map((h, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>{h.timestamp}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>{h.ambient_temp_c?.toFixed(1) || '-'}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>{h.humidity_pct?.toFixed(0) || '-'}%</td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>{h.solar_irradiance_wm2?.toFixed(0) || '-'}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--color-cyan)', fontWeight: 700 }}>{h.predicted_demand_kw} kW</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span className={`badge ${h.grid_mode === 'RENEWABLE_STORAGE' ? 'badge-renewable' : 'badge-main-grid'}`}>
                      {h.grid_mode}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

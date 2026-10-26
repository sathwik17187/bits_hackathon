import React from 'react';

export const TimelineBar = ({ hourlyForecasts = [] }) => {
  if (!hourlyForecasts || hourlyForecasts.length === 0) return null;

  return (
    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          24-Hour Power Source Timeline
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Hover segments for hourly telemetry
        </span>
      </div>

      <div style={{
        display: 'flex',
        width: '100%',
        height: '24px',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)'
      }}>
        {hourlyForecasts.map((h, i) => {
          let bg = '#10b981';
          if (h.is_critical_overload) bg = '#ef4444';
          else if (h.grid_mode === 'RENEWABLE_STORAGE') bg = '#f59e0b';

          const d = new Date(h.timestamp);
          const hourStr = `${String(d.getHours()).padStart(2, '0')}:00`;

          return (
            <div
              key={i}
              title={`${hourStr} | Demand: ${h.predicted_demand_kw} kW | Mode: ${h.grid_mode}${h.is_critical_overload ? ' (OVERLOAD)' : ''}`}
              style={{
                flex: 1,
                height: '100%',
                background: bg,
                cursor: 'pointer',
                transition: 'transform 0.15s, filter 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scaleY(1.35)';
                e.currentTarget.style.zIndex = '5';
                e.currentTarget.style.filter = 'brightness(1.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scaleY(1)';
                e.currentTarget.style.zIndex = '1';
                e.currentTarget.style.filter = 'brightness(1)';
              }}
            />
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '24px', marginTop: '10px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#10b981' }}></span>
          <span>Main Grid Mode (&le; 160 kW)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#f59e0b' }}></span>
          <span>Renewable Storage Mode (&gt; 160 kW or 18:00–22:00)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#ef4444' }}></span>
          <span>Critical Overload (&ge; 200 kW)</span>
        </div>
      </div>
    </div>
  );
};

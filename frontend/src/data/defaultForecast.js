// Fallback dataset for zero-latency in-browser execution on Zoho Catalyst Slate
export const BUNDLED_SAMPLE_RECORDS = [
  { timestamp: "2015-06-16 15:00:00", ambient_temp_c: 35.66, humidity_pct: 56.38, solar_irradiance_wm2: 169.0 },
  { timestamp: "2015-06-16 16:00:00", ambient_temp_c: 34.55, humidity_pct: 54.73, solar_irradiance_wm2: 112.0 },
  { timestamp: "2015-06-16 17:00:00", ambient_temp_c: 34.35, humidity_pct: 49.34, solar_irradiance_wm2: 52.0 },
  { timestamp: "2015-06-16 18:00:00", ambient_temp_c: 35.37, humidity_pct: 56.92, solar_irradiance_wm2: 16.0 },
  { timestamp: "2015-06-16 19:00:00", ambient_temp_c: 32.13, humidity_pct: 56.42, solar_irradiance_wm2: 2.0 },
  { timestamp: "2015-06-16 20:00:00", ambient_temp_c: 29.96, humidity_pct: 59.13, solar_irradiance_wm2: 0.0 },
  { timestamp: "2015-06-16 21:00:00", ambient_temp_c: 29.05, humidity_pct: 57.81, solar_irradiance_wm2: 0.0 },
  { timestamp: "2015-06-16 22:00:00", ambient_temp_c: 26.46, humidity_pct: 56.26, solar_irradiance_wm2: 0.0 },
  { timestamp: "2015-06-16 23:00:00", ambient_temp_c: 27.87, humidity_pct: 57.77, solar_irradiance_wm2: 0.0 },
  { timestamp: "2015-06-17 00:00:00", ambient_temp_c: 24.58, humidity_pct: 65.01, solar_irradiance_wm2: 0.0 },
  { timestamp: "2015-06-17 01:00:00", ambient_temp_c: 25.47, humidity_pct: 61.99, solar_irradiance_wm2: 0.0 },
  { timestamp: "2015-06-17 02:00:00", ambient_temp_c: 22.91, humidity_pct: 60.79, solar_irradiance_wm2: 0.0 },
  { timestamp: "2015-06-17 03:00:00", ambient_temp_c: 23.8,  humidity_pct: 63.52, solar_irradiance_wm2: 4.0 },
  { timestamp: "2015-06-17 04:00:00", ambient_temp_c: 24.53, humidity_pct: 63.6,  solar_irradiance_wm2: 29.0 },
  { timestamp: "2015-06-17 05:00:00", ambient_temp_c: 26.23, humidity_pct: 59.96, solar_irradiance_wm2: 84.0 },
  { timestamp: "2015-06-17 06:00:00", ambient_temp_c: 25.95, humidity_pct: 66.33, solar_irradiance_wm2: 142.0 },
  { timestamp: "2015-06-17 07:00:00", ambient_temp_c: 25.68, humidity_pct: 61.19, solar_irradiance_wm2: 203.0 },
  { timestamp: "2015-06-17 08:00:00", ambient_temp_c: 31.68, humidity_pct: 62.35, solar_irradiance_wm2: 258.0 },
  { timestamp: "2015-06-17 09:00:00", ambient_temp_c: 31.74, humidity_pct: 60.43, solar_irradiance_wm2: 302.0 },
  { timestamp: "2015-06-17 10:00:00", ambient_temp_c: 31.19, humidity_pct: 54.46, solar_irradiance_wm2: 329.0 },
  { timestamp: "2015-06-17 11:00:00", ambient_temp_c: 31.54, humidity_pct: 59.23, solar_irradiance_wm2: 330.0 },
  { timestamp: "2015-06-17 12:00:00", ambient_temp_c: 34.64, humidity_pct: 55.02, solar_irradiance_wm2: 319.0 },
  { timestamp: "2015-06-17 13:00:00", ambient_temp_c: 36.63, humidity_pct: 55.45, solar_irradiance_wm2: 302.0 },
  { timestamp: "2015-06-17 14:00:00", ambient_temp_c: 37.93, humidity_pct: 45.52, solar_irradiance_wm2: 272.0 },
  { timestamp: "2015-06-17 15:00:00", ambient_temp_c: 34.41, humidity_pct: 52.62, solar_irradiance_wm2: 212.0 },
  { timestamp: "2015-06-17 16:00:00", ambient_temp_c: 35.38, humidity_pct: 51.21, solar_irradiance_wm2: 146.0 },
  { timestamp: "2015-06-17 17:00:00", ambient_temp_c: 38.13, humidity_pct: 44.49, solar_irradiance_wm2: 78.0 },
  { timestamp: "2015-06-17 18:00:00", ambient_temp_c: 32.95, humidity_pct: 49.37, solar_irradiance_wm2: 26.0 },
  { timestamp: "2015-06-17 19:00:00", ambient_temp_c: 30.56, humidity_pct: 53.89, solar_irradiance_wm2: 3.0 }
];

export const generateDefaultForecast = () => {
  let soc = 85.0;
  const hourly = BUNDLED_SAMPLE_RECORDS.slice(0, 24).map((rec, i) => {
    const ts = new Date(rec.timestamp);
    const hour = isNaN(ts.getHours()) ? (15 + i) % 24 : ts.getHours();
    
    // QuickML model approximation
    const predKw = Math.round((140 + (rec.ambient_temp_c * 2.8) + (rec.solar_irradiance_wm2 * 0.07) + (hour >= 18 && hour <= 22 ? 60 : 5)) * 100) / 100;
    const isPeak = hour >= 18 && hour <= 22;
    const isRenewable = predKw > 160.0 || isPeak;
    const isOverload = predKw >= 200.0;
    const gridMode = isRenewable ? 'RENEWABLE_STORAGE' : 'MAIN_GRID';
    
    let delta = 0;
    if (isRenewable) {
      delta = -Math.round((predKw / 250.0) * 4.5 * 10) / 10;
      soc = Math.max(15.0, Math.round((soc + delta) * 10) / 10);
    } else {
      delta = Math.round(((rec.solar_irradiance_wm2 / 300.0) * 3.0 + 1.2) * 10) / 10;
      soc = Math.min(100.0, Math.round((soc + delta) * 10) / 10);
    }

    return {
      hour_index: i,
      timestamp: rec.timestamp,
      ambient_temp_c: rec.ambient_temp_c,
      humidity_pct: rec.humidity_pct,
      solar_irradiance_wm2: rec.solar_irradiance_wm2,
      predicted_demand_kw: predKw,
      grid_mode: gridMode,
      is_critical_overload: isOverload,
      battery_soc_pct: soc,
      battery_soc_delta: delta
    };
  });

  const demands = hourly.map(h => h.predicted_demand_kw);
  const peak = Math.max(...demands);
  const avg = demands.reduce((a, b) => a + b, 0) / demands.length;
  const renewCount = hourly.filter(h => h.grid_mode === 'RENEWABLE_STORAGE').length;
  const overloadCount = hourly.filter(h => h.is_critical_overload).length;

  return {
    summary: {
      total_hours: 24,
      avg_demand_kw: Math.round(avg * 100) / 100,
      peak_demand_kw: Math.round(peak * 100) / 100,
      renewable_hours: renewCount,
      main_grid_hours: 24 - renewCount,
      critical_overload_hours: overloadCount,
      has_critical_alert: overloadCount > 0,
      initial_battery_soc_pct: 85.0,
      final_battery_soc_pct: soc
    },
    hourly_forecasts: hourly
  };
};

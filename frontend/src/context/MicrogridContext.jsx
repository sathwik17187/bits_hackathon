import React, { createContext, useContext, useState, useEffect } from 'react';

const MicrogridContext = createContext(null);

export const MicrogridProvider = ({ children }) => {
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overrideMode, setOverrideMode] = useState('AUTO'); // 'AUTO' | 'FORCE_MAIN_GRID' | 'FORCE_RENEWABLE'
  const [batterySoc, setBatterySoc] = useState(85.0);
  const [engineHealth, setEngineHealth] = useState({
    status: 'online',
    quickml_configured: false,
    quickml_url: 'Local Multi-Model Ensemble (~9.04 kW RMSE)'
  });

  const RENEWABLE_THRESHOLD = 160.0;
  const OVERLOAD_THRESHOLD = 200.0;

  // Load sample data on mount
  useEffect(() => {
    loadSampleData();
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setEngineHealth(data);
      }
    } catch (err) {
      console.warn('API health check error:', err);
    }
  };

  const loadSampleData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/sample-forecast');
      if (!res.ok) throw new Error('Failed to load sample forecast.');
      const data = await res.json();
      setForecastData(data);
      setBatterySoc(data.summary.final_battery_soc_pct);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadCsv = async (file) => {
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('initial_battery_soc', batterySoc);

    try {
      const res = await fetch('/api/upload-csv', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.detail || 'Failed to upload CSV file.');
      }
      const data = await res.json();
      setForecastData(data);
      setBatterySoc(data.summary.final_battery_soc_pct);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const runSimulation = async ({ hour, temp, humid, solar }) => {
    const today = new Date().toISOString().split('T')[0];
    const timestamp = `${today} ${String(hour).padStart(2, '0')}:00:00`;

    const payload = {
      telemetry: [
        {
          timestamp,
          ambient_temp_c: temp,
          humidity_pct: humid,
          solar_irradiance_wm2: solar,
        }
      ],
      initial_battery_soc: batterySoc
    };

    try {
      const res = await fetch('/api/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Simulation failed.');
      const result = await res.json();
      return result.hourly_forecasts[0];
    } catch (err) {
      throw err;
    }
  };

  return (
    <MicrogridContext.Provider
      value={{
        forecastData,
        loading,
        error,
        overrideMode,
        setOverrideMode,
        batterySoc,
        setBatterySoc,
        engineHealth,
        loadSampleData,
        uploadCsv,
        runSimulation,
        RENEWABLE_THRESHOLD,
        OVERLOAD_THRESHOLD,
      }}
    >
      {children}
    </MicrogridContext.Provider>
  );
};

export const useMicrogrid = () => {
  const context = useContext(MicrogridContext);
  if (!context) {
    throw new Error('useMicrogrid must be used within a MicrogridProvider');
  }
  return context;
};

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MicrogridProvider } from './context/MicrogridContext';

// Layouts
import { AdminLayout } from './layouts/AdminLayout';
import { ClientLayout } from './layouts/ClientLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { Navbar } from './components/Navbar';
import { MicrogridValley3D } from './components/MicrogridValley3D';

// Admin Pages
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminForecastEngine } from './pages/admin/AdminForecastEngine';
import { AdminDispatchController } from './pages/admin/AdminDispatchController';
import { AdminDataIngestion } from './pages/admin/AdminDataIngestion';
import { AdminBatteryManager } from './pages/admin/AdminBatteryManager';

// Client Pages
import { ClientDashboard } from './pages/client/ClientDashboard';
import { ClientLoadCurve } from './pages/client/ClientLoadCurve';
import { ClientSustainability } from './pages/client/ClientSustainability';
import { ClientTariffAlerts } from './pages/client/ClientTariffAlerts';

export function App() {
  return (
    <MicrogridProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Standalone Public 3D Valley */}
          <Route
            path="/3d-simulation"
            element={
              <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
                <Navbar />
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <MicrogridValley3D />
                </div>
              </div>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/overview" replace />} />
            <Route path="overview" element={<AdminOverview />} />
            <Route path="forecast-engine" element={<AdminForecastEngine />} />
            <Route path="dispatch-controller" element={<AdminDispatchController />} />
            <Route path="data-ingestion" element={<AdminDataIngestion />} />
            <Route path="battery-manager" element={<AdminBatteryManager />} />
            <Route path="3d-simulation" element={<MicrogridValley3D />} />
          </Route>

          {/* Client Routes */}
          <Route path="/client" element={<ClientLayout />}>
            <Route index element={<Navigate to="/client/dashboard" replace />} />
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="load-curve" element={<ClientLoadCurve />} />
            <Route path="sustainability" element={<ClientSustainability />} />
            <Route path="tariff-alerts" element={<ClientTariffAlerts />} />
            <Route path="3d-simulation" element={<MicrogridValley3D />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </MicrogridProvider>
  );
}

export default App;

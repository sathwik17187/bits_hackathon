import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MicrogridProvider } from './context/MicrogridContext';

// Layouts
import { AdminLayout } from './layouts/AdminLayout';
import { ClientLayout } from './layouts/ClientLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';

// Admin Pages
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminForecastEngine } from './pages/admin/AdminForecastEngine';
import { AdminDispatchController } from './pages/admin/AdminDispatchController';
import { AdminDatasetLogs } from './pages/admin/AdminDatasetLogs';
import { AdminBatteryManager } from './pages/admin/AdminBatteryManager';

// Client Pages
import { ClientDashboard } from './pages/client/ClientDashboard';
import { ClientLoadCurve } from './pages/client/ClientLoadCurve';

export function App() {
  return (
    <MicrogridProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/overview" replace />} />
            <Route path="overview" element={<AdminOverview />} />
            <Route path="forecast-engine" element={<AdminForecastEngine />} />
            <Route path="dispatch-controller" element={<AdminDispatchController />} />
            <Route path="dataset-logs" element={<AdminDatasetLogs />} />
            <Route path="battery-manager" element={<AdminBatteryManager />} />
            <Route path="data-ingestion" element={<Navigate to="/admin/dataset-logs" replace />} />
          </Route>

          {/* Client Routes */}
          <Route path="/client" element={<ClientLayout />}>
            <Route index element={<Navigate to="/client/dashboard" replace />} />
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="load-curve" element={<ClientLoadCurve />} />
            <Route path="sustainability" element={<Navigate to="/client/dashboard" replace />} />
            <Route path="tariff-alerts" element={<Navigate to="/client/load-curve" replace />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </MicrogridProvider>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ColorModeProvider } from '../context/ColorModeContext';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';

import Login from '../pages/Login';
import ExecutiveDashboard from '../pages/ExecutiveDashboard';
import Operations from '../pages/Operations';
import Audit from '../pages/Audit';
import BranchPerformance from '../pages/BranchPerformance';
import KPI from '../pages/KPI';
import Reports from '../pages/Reports';
import AIInsights from '../pages/AIInsights';
import SystemHealth from '../pages/SystemHealth';
import Settings from '../pages/Settings';
import Profile from '../pages/Profile';
import Notifications from '../pages/Notifications';
import NotFound from '../pages/NotFound';

export default function App() {
  return (
    <ColorModeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
            </Route>

            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<ExecutiveDashboard />} />
              <Route path="/operations" element={<Operations />} />
              <Route path="/audit" element={<Audit />} />
              <Route path="/branches" element={<BranchPerformance />} />
              <Route path="/kpi" element={<KPI />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/ai-insights" element={<AIInsights />} />
              <Route path="/system-health" element={<SystemHealth />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ColorModeProvider>
  );
}

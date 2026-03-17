import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import DashboardView from './views/DashboardView';
import DashboardLayout from './views/DashboardLayout';
import AuthGuard from './components/AuthGuard';
import Step0Welcome from './views/onboarding/Step0Welcome';
import Step1Institution from './views/onboarding/Step1Institution';
import Step2InviteUser from './views/onboarding/Step2InviteUser';
import CalendarView from './views/settings/CalendarView';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Protected Routes Layout */}
        <Route element={<AuthGuard />}>
          <Route path="/dashboard" element={
            <DashboardLayout>
              <DashboardView />
            </DashboardLayout>
          } />

          <Route path="/settings/calendar" element={
            <DashboardLayout>
              <CalendarView />
            </DashboardLayout>
          } />

          <Route path="/onboarding/step-0" element={<Step0Welcome />} />
          <Route path="/onboarding/step-1" element={<Step1Institution />} />
          <Route path="/onboarding/step-2" element={<Step2InviteUser />} />
        </Route>

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

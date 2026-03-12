import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import DashboardView from './views/DashboardView';
import DashboardLayout from './views/DashboardLayout';
import AuthGuard from './components/AuthGuard';
import Step0Welcome from './views/onboarding/Step0Welcome';
import Step1Institution from './views/onboarding/Step1Institution';
import Step2Group from './views/onboarding/Step2Group';
import Step3Students from './views/onboarding/Step3Students';
import Step4Attendance from './views/onboarding/Step4Attendance';
import Step5Collaborator from './views/onboarding/Step5Collaborator';

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

          <Route path="/onboarding/step-0" element={<Step0Welcome />} />
          <Route path="/onboarding/step-1" element={<Step1Institution />} />
          <Route path="/onboarding/step-2" element={<Step2Group />} />
          <Route path="/onboarding/step-3" element={<Step3Students />} />
          <Route path="/onboarding/step-4" element={<Step4Attendance />} />
          <Route path="/onboarding/step-5" element={<Step5Collaborator />} />
        </Route>

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

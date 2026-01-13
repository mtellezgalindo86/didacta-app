import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import DashboardView from './views/DashboardView';
import AuthGuard from './components/AuthGuard';
import Step1Institution from './views/onboarding/Step1Institution';
import Step2Group from './views/onboarding/Step2Group';
import Step3Collaborator from './views/onboarding/Step3Collaborator';


// But as I am generating code, I will reference them assuming they will exist.

export default function App() {
  return (
    <BrowserRouter>
      <Routes>


        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <AuthGuard>
            <DashboardView />
          </AuthGuard>
        } />

        <Route path="/onboarding/step-1" element={
          <AuthGuard>
            <Step1Institution />
          </AuthGuard>
        } />

        <Route path="/onboarding/step-2" element={
          <AuthGuard>
            <Step2Group />
          </AuthGuard>
        } />

        <Route path="/onboarding/step-3" element={
          <AuthGuard>
            <Step3Collaborator />
          </AuthGuard>
        } />

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

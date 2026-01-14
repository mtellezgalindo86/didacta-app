import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import DashboardView from './views/DashboardView';
import DashboardLayout from './views/DashboardLayout';
import AuthGuard from './components/AuthGuard';
import Step1Institution from './views/onboarding/Step1Institution';
import Step2Group from './views/onboarding/Step2Group';
import Step3Collaborator from './views/onboarding/Step3Collaborator';


// But as I am generating code, I will reference them assuming they will exist.

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

          <Route path="/onboarding/step-1" element={<Step1Institution />} />
          <Route path="/onboarding/step-2" element={<Step2Group />} />
          <Route path="/onboarding/step-3" element={<Step3Collaborator />} />
        </Route>

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

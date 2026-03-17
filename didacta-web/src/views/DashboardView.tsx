import { useState, useEffect } from 'react';
import api from '../api/didactaApi';
import WelcomePopup from '../components/dashboard/WelcomePopup';
import SetupGuide from '../components/dashboard/SetupGuide';
import type { SetupProgress } from '../components/dashboard/SetupGuide';

interface MeResponse {
    setupProgress?: SetupProgress;
}

export default function DashboardView() {
    const [showWelcome, setShowWelcome] = useState(false);
    const [setupProgress, setSetupProgress] = useState<SetupProgress | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const alreadyShown = localStorage.getItem('didacta_welcome_popup_shown');
        if (!alreadyShown) {
            setShowWelcome(true);
        }
    }, []);

    useEffect(() => {
        api.get<MeResponse>('/api/me')
            .then(res => {
                if (res.data.setupProgress) {
                    setSetupProgress(res.data.setupProgress);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleCloseWelcome = () => {
        setShowWelcome(false);
        localStorage.setItem('didacta_welcome_popup_shown', 'true');
    };

    const groupCount = setupProgress?.groupCount ?? 0;
    const studentCount = setupProgress?.studentCount ?? 0;
    const collaboratorCount = setupProgress?.collaboratorCount ?? 0;

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center p-8 bg-gray-50">
                <p className="text-gray-500">Cargando...</p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-gray-50">
            <WelcomePopup isOpen={showWelcome} onClose={handleCloseWelcome} />

            <div className="max-w-4xl mx-auto p-6 sm:p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <StatCard
                        label="Planteles"
                        value="1"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l8-4 8 4v14M8 21v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2zM9 10a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" /></svg>}
                    />
                    <StatCard
                        label="Grupos"
                        value={String(groupCount)}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>}
                    />
                    <StatCard
                        label="Alumnos"
                        value={String(studentCount)}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>}
                    />
                    <StatCard
                        label="Colaboradores"
                        value={String(collaboratorCount)}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>}
                    />
                </div>

                {/* Setup Guide */}
                {setupProgress && setupProgress.suggestedNextAction !== 'ALL_DONE' && (
                    <SetupGuide setupProgress={setupProgress} />
                )}
            </div>
        </div>
    );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
    return (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 transition-transform hover:scale-105">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                {icon}
            </div>
            <div className="text-left">
                <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">{label}</p>
            </div>
        </div>
    );
}

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import keycloak from '../auth/keycloak';
import api from '../api/didactaApi';
import LoadingView from '../views/LoadingView';

interface AuthGuardProps {
    children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        const checkAuth = async () => {
            // 1. Check Keycloak Auth
            if (!keycloak.authenticated) {
                keycloak.login();
                return;
            }

            // 2. Check App State (Onboarding)
            try {
                const response = await api.get('/api/me');
                const { onboarding, tenant } = response.data;

                // Save Tenant ID to LocalStorage for interceptor
                if (tenant && tenant.institutionId) {
                    localStorage.setItem('didacta_institution_id', tenant.institutionId);
                }

                const nextStep = onboarding.nextStep; // STEP_1, STEP_2, STEP_3, DONE
                const currentPath = location.pathname;

                // Routing Logic
                if (nextStep === 'DONE') {
                    if (currentPath.startsWith('/onboarding')) {
                        navigate('/dashboard');
                    }
                } else {
                    // User needs onboarding
                    const target = stepToPath(nextStep);
                    if (currentPath !== target) {
                        navigate(target);
                    }
                }
            } catch (error) {
                console.error("Failed to check user status", error);
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [navigate, location]);

    function stepToPath(step: string) {
        switch (step) {
            case 'STEP_1': return '/onboarding/step-1';
            case 'STEP_2': return '/onboarding/step-2';
            case 'STEP_3': return '/onboarding/step-3';
            default: return '/dashboard';
        }
    }

    if (loading) {
        return <LoadingView />;
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Error de conexión</h2>
                    <p className="text-gray-600 mb-4">No pudimos verificar tu estado. Intenta recargar.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Reintentar
                    </button>
                    <pre className="mt-4 text-xs text-left bg-gray-100 p-2 rounded text-red-500 overflow-auto max-w-lg">
                        {JSON.stringify(error, null, 2)}
                    </pre>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

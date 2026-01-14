import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import keycloak from '../auth/keycloak';
import api from '../api/didactaApi';
import LoadingView from '../views/LoadingView';

interface AuthGuardProps {
    children?: React.ReactNode;
}

// Module-level variable to track initial load
let isInitialCheck = true;

export default function AuthGuard({ children }: AuthGuardProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    const [statusMessage, setStatusMessage] = useState("Verificando sesión...");

    // State for user data
    const [userData, setUserData] = useState<any>(null);

    // EFFECT 1: INITIAL LOAD (Runs once)
    useEffect(() => {
        const initAuth = async () => {
            if (!keycloak.authenticated) {
                setStatusMessage("Redirigiendo a inicio de sesión...");
                keycloak.login();
                return;
            }

            // Artificial Delay only on first load (if not marked as done in session)
            const sessionInitDone = sessionStorage.getItem('didacta_init_done');
            if (isInitialCheck && !sessionInitDone) {
                const messages = [
                    "Validando tus credenciales con el servidor...",
                    "Creando tu cuenta institucional segura...",
                    "Estamos configurando tu perfil docente...",
                    "Preparando tu entorno de trabajo...",
                    "¡Todo listo! Ingresando a Didacta..."
                ];
                for (const msg of messages) {
                    setStatusMessage(msg);
                    await new Promise(resolve => setTimeout(resolve, 4000));
                }
                sessionStorage.setItem('didacta_init_done', 'true');
                isInitialCheck = false;
            } else {
                isInitialCheck = false; // Skip if already done
            }

            try {
                let attempts = 0;
                const maxAttempts = 3;
                while (attempts < maxAttempts) {
                    try {
                        const response = await api.get('/api/me');
                        if (response.data.tenant?.institutionId) {
                            localStorage.setItem('didacta_institution_id', response.data.tenant.institutionId);
                        }
                        setUserData(response.data);
                        return;
                    } catch (retryErr) {
                        attempts++;
                        console.warn(`Auth Check attempt ${attempts} failed`);
                        if (attempts >= maxAttempts) {
                            setError(retryErr);
                            break;
                        }
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, []); // Empty dependency array = Mount only

    // EFFECT 2: NAVIGATION CHECKS (Runs on location change)
    useEffect(() => {
        if (!userData || loading) return; // Wait for init

        const { onboarding } = userData;
        const nextStep = onboarding.nextStep;
        const currentPath = location.pathname;

        // Re-fetch in background to keep state sync? 
        // For MVP, we'll verify "me" silently if needed, but let's trust local check for speed first
        // If we want to support step progression, we should probably update userData when we arrive at a new step?
        // Actually, the Views (Step1, Step2) update the backend.
        // So we should ideally re-fetch "me" on navigation but SILENTLY.

        const validateRoute = async () => {
            // Optional: Silent refresh of user status
            try {
                const res = await api.get('/api/me');
                if (res.data.tenant?.institutionId) {
                    localStorage.setItem('didacta_institution_id', res.data.tenant.institutionId);
                }
                const freshData = res.data;
                const freshStep = freshData.onboarding.nextStep;

                if (freshStep === 'DONE') {
                    if (currentPath.startsWith('/onboarding')) {
                        navigate('/dashboard');
                    }
                } else {
                    const stepOrder: Record<string, number> = { 'STEP_1': 1, 'STEP_2': 2, 'STEP_3': 3 };
                    const maxStep = stepOrder[freshStep] || 1;
                    const currentStep = pathToStep(currentPath);

                    if (currentStep > 0) {
                        if (currentStep > maxStep) {
                            navigate(stepToPath(freshStep));
                        }
                    } else {
                        navigate(stepToPath(freshStep));
                    }
                }
            } catch (e) {
                console.error("Silent check failed", e);
            }
        };

        validateRoute();

    }, [location, userData, loading, navigate]);

    function stepToPath(step: string) {
        switch (step) {
            case 'STEP_1': return '/onboarding/step-1';
            case 'STEP_2': return '/onboarding/step-2';
            case 'STEP_3': return '/onboarding/step-3';
            default: return '/dashboard';
        }
    }

    function pathToStep(path: string): number {
        if (path.includes('step-1')) return 1;
        if (path.includes('step-2')) return 2;
        if (path.includes('step-3')) return 3;
        return 0;
    }

    if (loading) {
        return <LoadingView message={statusMessage} />;
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Error de conexión</h2>
                    <p className="text-gray-600 mb-4">No pudimos verificar tu estado. Intenta recargar.</p>
                    <button
                        onClick={() => {
                            // Clear storage on retry just in case
                            localStorage.removeItem('didacta_institution_id');
                            window.location.reload();
                        }}
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

    return <>{children || <Outlet />}</>;
}

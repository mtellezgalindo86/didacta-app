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
                isInitialCheck = false;
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
    }, []);

    // EFFECT 2: NAVIGATION CHECKS (Runs on location change)
    useEffect(() => {
        if (!userData || loading) return;

        const currentPath = location.pathname;

        const validateRoute = async () => {
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
                    const stepOrder: Record<string, number> = {
                        'STEP_0': 0,
                        'STEP_1': 1,
                        'STEP_2': 2,
                        'STEP_3': 3,
                        'STEP_4': 4,
                        'STEP_5': 5,
                    };
                    const maxStep = stepOrder[freshStep] ?? 0;
                    const currentStep = pathToStep(currentPath);

                    if (currentStep >= 0) {
                        // Allow step-0 (welcome) always; guard only steps beyond maxStep
                        if (currentStep > 0 && currentStep > maxStep) {
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
            case 'STEP_0': return '/onboarding/step-0';
            case 'STEP_1': return '/onboarding/step-1';
            case 'STEP_2': return '/onboarding/step-2';
            case 'STEP_3': return '/onboarding/step-3';
            case 'STEP_4': return '/onboarding/step-4';
            case 'STEP_5': return '/onboarding/step-5';
            default: return '/dashboard';
        }
    }

    function pathToStep(path: string): number {
        if (path.includes('step-0')) return 0;
        if (path.includes('step-1')) return 1;
        if (path.includes('step-2')) return 2;
        if (path.includes('step-3')) return 3;
        if (path.includes('step-4')) return 4;
        if (path.includes('step-5')) return 5;
        return -1;
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

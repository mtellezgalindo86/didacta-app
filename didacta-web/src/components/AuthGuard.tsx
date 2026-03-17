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
    const [error, setError] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState("Verificando sesion...");

    // State for user data
    const [userData, setUserData] = useState<Record<string, unknown> | null>(null);

    // EFFECT 1: INITIAL LOAD (Runs once)
    useEffect(() => {
        const initAuth = async () => {
            if (!keycloak.authenticated) {
                setStatusMessage("Redirigiendo a inicio de sesion...");
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
                    "Todo listo! Ingresando a Didacta..."
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
                            setError('No pudimos verificar tu estado. Intenta recargar.');
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
                const hasInstitution = !!freshData.tenant?.institutionId;

                if (freshStep === 'DONE') {
                    // Allow step-2 (invite) even when DONE, as long as user has institution
                    if (currentPath === '/onboarding/step-2' && hasInstitution) {
                        return;
                    }
                    // Redirect away from step-0 and step-1 if already DONE
                    if (currentPath === '/onboarding/step-0' || currentPath === '/onboarding/step-1') {
                        navigate('/dashboard');
                    }
                } else if (freshStep === 'STEP_1') {
                    // User hasn't created institution yet
                    if (!currentPath.startsWith('/onboarding')) {
                        navigate('/onboarding/step-0');
                    }
                    // Allow step-0 and step-1, block step-2 (no institution yet)
                    if (currentPath === '/onboarding/step-2') {
                        navigate('/onboarding/step-1');
                    }
                } else {
                    // For any other step, if user is not in onboarding, redirect to step-0
                    if (!currentPath.startsWith('/onboarding') && !currentPath.startsWith('/dashboard')) {
                        navigate('/onboarding/step-0');
                    }
                }
            } catch (e) {
                console.error("Silent check failed", e);
            }
        };

        validateRoute();

    }, [location, userData, loading, navigate]);

    if (loading) {
        return <LoadingView message={statusMessage} />;
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Error de conexion</h2>
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
                </div>
            </div>
        );
    }

    return <>{children || <Outlet />}</>;
}

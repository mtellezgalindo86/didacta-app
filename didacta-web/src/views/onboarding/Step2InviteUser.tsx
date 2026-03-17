import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/didactaApi';
import OnboardingLayout from './OnboardingLayout';
import InlineError from '../../components/InlineError';

interface RoleCatalogItem {
    value: string;
    label: string;
}

export default function Step2InviteUser() {
    const navigate = useNavigate();
    const [roles, setRoles] = useState<RoleCatalogItem[]>([]);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);

    useEffect(() => {
        api.get('/api/catalogs/roles')
            .then(res => setRoles(res.data))
            .catch(console.error);
    }, []);

    const validateEmail = (value: string): boolean => {
        if (!value) return true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    };

    const handleEmailChange = (value: string) => {
        setEmail(value);
        if (value && !validateEmail(value)) {
            setEmailError('Ingresa un correo valido');
        } else {
            setEmailError(null);
        }
    };

    const canSubmit = email.trim() !== '' && role !== '' && !emailError;

    const handleInviteAndContinue = async () => {
        if (!canSubmit) return;

        setLoading(true);
        setError(null);
        try {
            await api.post('/api/onboarding/collaborators', {
                collaborators: [
                    {
                        email: email.trim(),
                        fullName: fullName.trim(),
                        role,
                    },
                ],
            });
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setError('Error al enviar la invitacion. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        navigate('/dashboard');
    };

    return (
        <OnboardingLayout
            step={2}
            title="Invita a tu equipo"
            subtitle="Agrega a un colaborador para que te ayude a configurar tu escuela."
        >
            <InlineError message={error} />

            {/* Info banner */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 text-sm text-blue-800">
                Este usuario recibira un correo para crear su cuenta y podra comenzar a configurar grupos, alumnos y sesiones.
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre completo
                    </label>
                    <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Ej. Ana Lopez"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Correo electronico <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none ${
                            emailError ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="nombre@institucion.edu"
                        value={email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                    />
                    {emailError && (
                        <p className="text-red-500 text-xs mt-1">{emailError}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rol <span className="text-red-500">*</span>
                    </label>
                    <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option value="">Seleccionar rol</option>
                        {roles.length > 0 ? (
                            roles.map((r) => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))
                        ) : (
                            <>
                                <option value="COORDINATOR">Coordinador</option>
                                <option value="TEACHER">Docente</option>
                                <option value="ADMIN">Administrativo</option>
                            </>
                        )}
                    </select>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-8">
                <button
                    onClick={() => navigate('/onboarding/step-1')}
                    className="text-gray-500 font-medium hover:text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition order-3 sm:order-1"
                >
                    Volver
                </button>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto order-1 sm:order-2">
                    <button
                        onClick={handleSkip}
                        className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium transition"
                    >
                        Omitir por ahora
                    </button>
                    <button
                        onClick={handleInviteAndContinue}
                        disabled={!canSubmit || loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
                    >
                        {loading ? 'Enviando...' : 'Invitar y continuar'}
                    </button>
                </div>
            </div>
        </OnboardingLayout>
    );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/didactaApi';
import OnboardingLayout from './OnboardingLayout';

export default function Step1Institution() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        mainLevel: '',
        country: 'MX',
        timezone: 'America/Mexico_City',
        role: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/api/onboarding/institution', formData);
            // Refresh page to trigger AuthGuard re-check or manually navigate
            // AuthGuard logic re-checks /api/me if we navigate? No, it checks on mount/update.
            // Better to force reload or navigate to next route if we know it.
            // Assuming success means we rely on AuthGuard or just go to step 2.
            navigate('/onboarding/step-2');
            window.location.reload(); // Force re-eval of me state
        } catch (error) {
            console.error(error);
            alert('Error al crear institución');
        } finally {
            setLoading(false);
        }
    };

    return (
        <OnboardingLayout
            step={1}
            title="Configura tu institución"
            subtitle="Ingresa los datos principales de tu centro educativo. Podrás gestionar sedes y permisos más adelante."
        >
            {loading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
                    <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="text-sm font-medium text-blue-600">Guardando...</span>
                    </div>
                </div>
            )}
            <form onSubmit={handleSubmit} className={`space-y-6 ${loading ? 'opacity-20 pointer-events-none' : ''}`}>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la institución *</label>
                    <input
                        type="text"
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Ej. Instituto Montessori"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nivel educativo principal</label>
                    <select
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        value={formData.mainLevel}
                        onChange={(e) => setFormData({ ...formData, mainLevel: e.target.value })}
                    >
                        <option value="">Selecciona un nivel</option>
                        <option value="PREESCOLAR">Preescolar</option>
                        <option value="PRIMARIA">Primaria</option>
                        <option value="SECUNDARIA">Secundaria</option>
                        <option value="MEDIA_SUPERIOR">Media Superior</option>
                        <option value="MIXTO">Mixto</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                        <select disabled className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-gray-500">
                            <option>México</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Zona horaria</label>
                        <select disabled className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-gray-500">
                            <option>GMT-6 (Ciudad de México)</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">¿Cuál es tu rol en la institución?</label>
                    <div className="grid grid-cols-3 gap-4">
                        {['DIRECTOR', 'OWNER', 'COORDINATOR'].map((role) => (
                            <button
                                type="button"
                                key={role}
                                onClick={() => setFormData({ ...formData, role })}
                                className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-2 transition ${formData.role === role
                                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="font-medium text-sm">
                                    {role === 'OWNER' ? 'Dueño' : role === 'DIRECTOR' ? 'Director' : 'Coordinador'}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading || !formData.role}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95"
                    >
                        Continuar →
                    </button>
                </div>
            </form>
        </OnboardingLayout>
    );
}

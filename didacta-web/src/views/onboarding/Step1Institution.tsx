import { useState, useEffect } from 'react';
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
        role: '',
        hasMultipleCampuses: false,
        campusName: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Try to fetch existing details (in case of Back navigation)
        api.get('/api/onboarding/institution-details')
            .then(res => {
                if (res.data) {
                    setFormData(prev => ({
                        ...prev,
                        name: res.data.name || '',
                        mainLevel: res.data.mainLevel || '',
                        country: res.data.country || 'MX',
                        timezone: res.data.timezone || 'America/Mexico_City',
                        role: res.data.role || '',
                        hasMultipleCampuses: res.data.hasMultipleCampuses || false,
                        campusName: res.data.campusName || ''
                    }));
                }
            })
            .catch(() => {
                // Ignore error (404/403) if not created yet
            });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/api/onboarding/institution', formData);
            if (response.data && response.data.institutionId) {
                localStorage.setItem('didacta_institution_id', response.data.institutionId);
            }
            navigate('/onboarding/step-2');

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

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-gray-900">¿Cuentas con múltiples planteles?</h4>
                            <p className="text-xs text-gray-500">Si activas esto, podrás registrar tu sede principal ahora.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={formData.hasMultipleCampuses}
                                onChange={(e) => setFormData({ ...formData, hasMultipleCampuses: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {formData.hasMultipleCampuses && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Plantel Principal *</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                placeholder="Ej. Sede Norte"
                                value={formData.campusName}
                                onChange={(e) => setFormData({ ...formData, campusName: e.target.value })}
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading || !formData.role || (formData.hasMultipleCampuses && !formData.campusName)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95"
                    >
                        {loading ? 'Guardando...' : 'Continuar →'}
                    </button>
                </div>
            </form>
        </OnboardingLayout>
    );
}

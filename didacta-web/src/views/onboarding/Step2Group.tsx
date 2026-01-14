import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/didactaApi';
import OnboardingLayout from './OnboardingLayout';

export default function Step2Group() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        gradeLevel: '',
        shift: 'MATUTINO',
        campusId: ''
    });
    const [campuses, setCampuses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch Campuses
        api.get('/api/onboarding/campuses')
            .then(res => {
                setCampuses(res.data);
                if (res.data.length === 1) {
                    setFormData(prev => ({ ...prev, campusId: res.data[0].id }));
                }
            })
            .catch(console.error);

        // Fetch Existing Groups (to pre-fill if going back)
        api.get('/api/onboarding/groups')
            .then(res => {
                if (res.data && res.data.length > 0) {
                    const existing = res.data[0]; // Take the first one for MVP Step 2
                    setFormData(prev => ({
                        ...prev,
                        name: existing.name,
                        gradeLevel: existing.gradeLevel,
                        shift: existing.shift,
                        campusId: existing.campus ? existing.campus.id : prev.campusId
                    }));
                }
            })
            .catch(console.error);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/api/onboarding/group', formData);
            navigate('/onboarding/step-3');

        } catch (error) {
            console.error(error);
            alert('Error al crear grupo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <OnboardingLayout
            step={2}
            title="Configura tu primer grupo"
            subtitle="Dale identidad a tu clase. Podrás gestionar alumnos y asignaturas una vez creado el espacio."
        >
            <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
                {/* Campus Selection - Show only if > 1 or user explicitly wants to see */}
                {campuses.length > 1 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Plantel / Sede</label>
                        <select
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            value={formData.campusId}
                            onChange={(e) => setFormData({ ...formData, campusId: e.target.value })}
                        >
                            <option value="">Selecciona un plantel</option>
                            {campuses.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del grupo</label>
                    <input
                        type="text"
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Ej. 1ro A"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nivel educativo / Grado</label>
                    <input
                        type="text"
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Ej. 1ro de Primaria"
                        value={formData.gradeLevel}
                        onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Turno horario</label>
                    <div className="grid grid-cols-3 gap-4">
                        {['MATUTINO', 'VESPERTINO', 'MIXTO'].map((shift) => (
                            <button
                                type="button"
                                key={shift}
                                onClick={() => setFormData({ ...formData, shift })}
                                className={`p-3 border rounded-lg flex flex-col items-center justify-center gap-1 transition ${formData.shift === shift
                                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="text-sm font-medium capitalize">{shift.toLowerCase()}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between pt-8 gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/onboarding/step-1')}
                        className="text-gray-500 font-medium hover:text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-100 transition"
                    >
                        ← Volver
                    </button>
                    <button
                        type="submit"
                        disabled={loading || (campuses.length > 1 && !formData.campusId)}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 shadow-sm shadow-blue-200 flex-1"
                    >
                        {loading ? 'Guardando...' : 'Continuar →'}
                    </button>
                </div>
            </form>
        </OnboardingLayout>
    );
}

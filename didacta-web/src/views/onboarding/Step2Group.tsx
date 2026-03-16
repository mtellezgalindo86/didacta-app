import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/didactaApi';
import OnboardingLayout from './OnboardingLayout';
import InlineError from '../../components/InlineError';

interface GradeOption {
    id: string;
    label: string;
}

interface SectionOption {
    id: string;
    level: string;
    accreditationType: string;
}

const LEVEL_LABELS: Record<string, string> = {
    MATERNAL: 'Maternal',
    INICIAL: 'Inicial',
    PREESCOLAR: 'Preescolar',
    PRIMARIA: 'Primaria',
    SECUNDARIA: 'Secundaria',
    MEDIA_SUPERIOR: 'Media Superior',
    EMPRESARIAL: 'Empresarial',
};

export default function Step2Group() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        gradeLevel: '',
        shift: 'MATUTINO',
        campusId: '',
        sectionId: '',
    });
    const [campuses, setCampuses] = useState<{ id: string; name: string }[]>([]);
    const [sections, setSections] = useState<SectionOption[]>([]);
    const [grades, setGrades] = useState<GradeOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

        // Fetch Sections
        api.get('/api/onboarding/sections')
            .then(res => {
                setSections(res.data);
                if (res.data.length === 1) {
                    setFormData(prev => ({ ...prev, sectionId: res.data[0].id }));
                    // Load grades for the single section's level
                    loadGradesForLevel(res.data[0].level);
                }
            })
            .catch(console.error);

        // Fetch Existing Groups (to pre-fill if going back)
        api.get('/api/onboarding/groups')
            .then(res => {
                if (res.data && res.data.length > 0) {
                    const existing = res.data[0];
                    setFormData(prev => ({
                        ...prev,
                        name: existing.name,
                        gradeLevel: existing.gradeLevel || '',
                        shift: existing.shift || 'MATUTINO',
                        campusId: existing.campus ? existing.campus.id : prev.campusId,
                        sectionId: existing.sectionId || prev.sectionId,
                    }));
                }
            })
            .catch(console.error);
    }, []);

    const loadGradesForLevel = (level: string) => {
        api.get(`/api/catalogs/grades?level=${level}`)
            .then(res => {
                if (res?.data) {
                    setGrades(res.data);
                }
            })
            .catch(console.error);
    };

    const handleSectionChange = (sectionId: string) => {
        setFormData(prev => ({ ...prev, sectionId, gradeLevel: '' }));
        const section = sections.find(s => s.id === sectionId);
        if (section) {
            loadGradesForLevel(section.level);
        } else {
            setGrades([]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await api.post('/api/onboarding/group', formData);
            navigate('/onboarding/step-3');
        } catch (err) {
            console.error(err);
            setError('Error al crear el grupo. Verifica los datos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <OnboardingLayout
            step={2}
            title="Configura tu primer grupo"
            subtitle="Dale identidad a tu clase. Podras gestionar alumnos y asignaturas una vez creado el espacio."
        >
            <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
                <InlineError message={error} />

                {/* Campus Selection - Show only if > 1 */}
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
                            {campuses.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Section Selection - Show only if > 1 */}
                {sections.length > 1 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nivel educativo</label>
                        <select
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            value={formData.sectionId}
                            onChange={(e) => handleSectionChange(e.target.value)}
                        >
                            <option value="">Selecciona un nivel</option>
                            {sections.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {LEVEL_LABELS[s.level] || s.level}
                                </option>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grado</label>
                    {grades.length > 0 ? (
                        <select
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            value={formData.gradeLevel}
                            onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                        >
                            <option value="">Selecciona un grado</option>
                            {grades.map(g => (
                                <option key={g.id} value={g.id}>{g.label}</option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type="text"
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Ej. 1ro de Primaria"
                            value={formData.gradeLevel}
                            onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                        />
                    )}
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
                        Volver
                    </button>
                    <button
                        type="submit"
                        disabled={loading || (campuses.length > 1 && !formData.campusId) || (sections.length > 1 && !formData.sectionId)}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 shadow-sm shadow-blue-200 flex-1"
                    >
                        {loading ? 'Guardando...' : 'Continuar'}
                    </button>
                </div>
            </form>
        </OnboardingLayout>
    );
}

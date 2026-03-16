import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/didactaApi';
import OnboardingLayout from './OnboardingLayout';
import InlineError from '../../components/InlineError';

interface SectionEntry {
    level: string;
    accreditationType: string;
    accreditationKey: string;
}

const LEVEL_OPTIONS = [
    { value: 'MATERNAL', label: 'Maternal / Guarderia' },
    { value: 'INICIAL', label: 'Inicial' },
    { value: 'PREESCOLAR', label: 'Preescolar' },
    { value: 'PRIMARIA', label: 'Primaria' },
    { value: 'SECUNDARIA', label: 'Secundaria' },
    { value: 'MEDIA_SUPERIOR', label: 'Media Superior' },
    { value: 'EMPRESARIAL', label: 'Empresarial / Capacitacion' },
];

const ACCREDITATION_OPTIONS = [
    { value: 'NONE', label: 'Ninguna' },
    { value: 'SEP_RVOE', label: 'SEP (RVOE)' },
    { value: 'UNAM_DGIRE', label: 'UNAM (DGIRE)' },
    { value: 'IPN', label: 'IPN' },
    { value: 'OTHER', label: 'Otra' },
];

export default function Step1Institution() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        mainLevel: '',
        country: 'MX',
        timezone: 'America/Mexico_City',
        role: '',
        hasMultipleCampuses: false,
        campusName: '',
        sections: [] as SectionEntry[],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        api.get('/api/onboarding/institution-details')
            .then(res => {
                if (res.data) {
                    const sections: SectionEntry[] = res.data.sections || [];
                    setFormData(prev => ({
                        ...prev,
                        name: res.data.name || '',
                        mainLevel: res.data.mainLevel || '',
                        country: res.data.country || 'MX',
                        timezone: res.data.timezone || 'America/Mexico_City',
                        role: res.data.role || '',
                        hasMultipleCampuses: res.data.hasMultipleCampuses || false,
                        campusName: res.data.campusName || '',
                        sections: sections.length > 0 ? sections : [],
                    }));
                }
            })
            .catch(() => {});
    }, []);

    const toggleLevel = (level: string) => {
        setFormData(prev => {
            const existing = prev.sections.find(s => s.level === level);
            let newSections: SectionEntry[];
            if (existing) {
                newSections = prev.sections.filter(s => s.level !== level);
            } else {
                newSections = [...prev.sections, { level, accreditationType: 'NONE', accreditationKey: '' }];
            }
            // Update mainLevel to be the first selected or empty
            const mainLevel = newSections.length > 0 ? newSections[0].level : '';
            return { ...prev, sections: newSections, mainLevel };
        });
    };

    const updateSectionAccreditation = (level: string, accreditationType: string) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map(s =>
                s.level === level ? { ...s, accreditationType, accreditationKey: accreditationType === 'NONE' ? '' : s.accreditationKey } : s
            ),
        }));
    };

    const updateSectionKey = (level: string, accreditationKey: string) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map(s =>
                s.level === level ? { ...s, accreditationKey } : s
            ),
        }));
    };

    const isLevelSelected = (level: string) => formData.sections.some(s => s.level === level);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.sections.length === 0) {
            setError('Selecciona al menos un nivel educativo.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const payload = {
                ...formData,
                mainLevel: formData.sections[0].level,
            };
            const response = await api.post('/api/onboarding/institution', payload);
            if (response.data && response.data.institutionId) {
                localStorage.setItem('didacta_institution_id', response.data.institutionId);
            }
            navigate('/onboarding/step-2');
        } catch (err) {
            console.error(err);
            setError('No pudimos guardar los datos. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <OnboardingLayout
            step={1}
            title="Configura tu institucion"
            subtitle="Ingresa los datos principales de tu centro educativo. Podras gestionar sedes y permisos mas adelante."
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
                <InlineError message={error} />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la institucion *</label>
                    <input
                        type="text"
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Ej. Instituto Montessori"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                {/* Multi-level selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Niveles educativos *</label>
                    <p className="text-xs text-gray-500 mb-3">Selecciona todos los niveles que ofrece tu institucion.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {LEVEL_OPTIONS.map((opt) => (
                            <button
                                type="button"
                                key={opt.value}
                                onClick={() => toggleLevel(opt.value)}
                                className={`p-3 border rounded-lg text-sm font-medium transition ${
                                    isLevelSelected(opt.value)
                                        ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Accreditation per selected level */}
                {formData.sections.length > 0 && (
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">Incorporacion por nivel</label>
                        {formData.sections.map((section) => {
                            const levelLabel = LEVEL_OPTIONS.find(l => l.value === section.level)?.label || section.level;
                            return (
                                <div key={section.level} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm font-medium text-gray-900">{levelLabel}</span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                                        {ACCREDITATION_OPTIONS.map((acc) => (
                                            <button
                                                type="button"
                                                key={acc.value}
                                                onClick={() => updateSectionAccreditation(section.level, acc.value)}
                                                className={`px-3 py-1.5 border rounded-lg text-xs font-medium transition ${
                                                    section.accreditationType === acc.value
                                                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                                }`}
                                            >
                                                {acc.label}
                                            </button>
                                        ))}
                                    </div>
                                    {section.accreditationType !== 'NONE' && (
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none mt-2"
                                            placeholder={section.accreditationType === 'SEP_RVOE' ? 'Clave RVOE (opcional)' : 'Clave de incorporacion (opcional)'}
                                            value={section.accreditationKey}
                                            onChange={(e) => updateSectionKey(section.level, e.target.value)}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pais</label>
                        <select disabled className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-gray-500">
                            <option>Mexico</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Zona horaria</label>
                        <select disabled className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-gray-500">
                            <option>GMT-6 (Ciudad de Mexico)</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Tu rol en la institucion *</label>
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
                                    {role === 'OWNER' ? 'Dueno' : role === 'DIRECTOR' ? 'Director' : 'Coordinador'}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-gray-900">Multiples planteles?</h4>
                            <p className="text-xs text-gray-500">Si activas esto, podras registrar tu sede principal ahora.</p>
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
                        disabled={loading || !formData.role || formData.sections.length === 0 || (formData.hasMultipleCampuses && !formData.campusName)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95"
                    >
                        {loading ? 'Guardando...' : 'Continuar'}
                    </button>
                </div>
            </form>
        </OnboardingLayout>
    );
}

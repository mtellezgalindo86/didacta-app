import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/didactaApi';
import OnboardingLayout from './OnboardingLayout';

export default function Step2Group() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        gradeLevel: '',
        shift: 'MATUTINO'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/api/onboarding/group', formData);
            navigate('/onboarding/step-3');
            window.location.reload();
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

                <div className="flex justify-between pt-8">
                    <button type="button" className="text-gray-400 text-sm hover:text-gray-600 hidden">Saltar este paso</button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 shadow-sm shadow-blue-200"
                    >
                        {loading ? 'Guardando...' : 'Continuar →'}
                    </button>
                </div>
            </form>
        </OnboardingLayout>
    );
}

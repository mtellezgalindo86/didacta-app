import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/didactaApi';
import OnboardingLayout from './OnboardingLayout';
import InlineError from '../../components/InlineError';

interface StudentDto {
    id: string;
    firstName: string;
    lastName: string;
    status: string;
}

export default function Step3Students() {
    const navigate = useNavigate();
    const [textInput, setTextInput] = useState('');
    const [savedStudents, setSavedStudents] = useState<StudentDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [groupInfo, setGroupInfo] = useState<{ id: string; name: string; gradeLevel: string } | null>(null);

    useEffect(() => {
        // Fetch group info
        api.get('/api/onboarding/groups')
            .then(res => {
                if (res.data && res.data.length > 0) {
                    setGroupInfo(res.data[0]);
                }
            })
            .catch(console.error);

        // Fetch existing students
        api.get('/api/onboarding/students')
            .then(res => {
                if (res.data && res.data.length > 0) {
                    setSavedStudents(res.data);
                }
            })
            .catch(console.error);
    }, []);

    const parsedStudents = useMemo(() => {
        return textInput
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => {
                const parts = line.split(/\s+/);
                return {
                    firstName: parts[0],
                    lastName: parts.slice(1).join(' ') || '(sin apellido)',
                };
            });
    }, [textInput]);

    const handleSaveStudents = async () => {
        if (!groupInfo || parsedStudents.length === 0) return;
        setLoading(true);
        setError(null);
        try {
            const response = await api.post('/api/onboarding/students', {
                groupId: groupInfo.id,
                students: parsedStudents,
            });
            setSavedStudents(response.data.students);
            setTextInput('');
        } catch (err) {
            console.error(err);
            setError('No se pudieron guardar los alumnos. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveStudent = (index: number) => {
        setSavedStudents(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <OnboardingLayout
            step={3}
            title="Agrega a tus alumnos"
            subtitle="Escribe los nombres de tus alumnos, uno por línea."
        >
            <InlineError message={error} />

            {groupInfo && (
                <div className="mb-4">
                    <span className="inline-block bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
                        Grupo: {groupInfo.name} {groupInfo.gradeLevel ? `- ${groupInfo.gradeLevel}` : ''}
                    </span>
                </div>
            )}

            {savedStudents.length === 0 ? (
                <>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Escribe un nombre por línea
                        </label>
                        <textarea
                            className="w-full min-h-[200px] border border-gray-300 rounded-lg p-4 text-base leading-relaxed resize-y focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder={"María García\nJuan López Pérez\nAna Martínez"}
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            disabled={loading}
                        />
                        <p className="text-sm text-gray-500 mt-2">
                            {parsedStudents.length > 0
                                ? `${parsedStudents.length} alumno${parsedStudents.length !== 1 ? 's' : ''} detectado${parsedStudents.length !== 1 ? 's' : ''}`
                                : 'Escribe al menos un nombre para continuar'}
                        </p>
                    </div>

                    <button
                        onClick={handleSaveStudents}
                        disabled={loading || parsedStudents.length === 0}
                        className="w-full min-h-[48px] bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Guardando...
                            </>
                        ) : (
                            'Agregar alumnos'
                        )}
                    </button>
                </>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-4 py-3 text-left text-xs uppercase text-gray-500 font-medium">#</th>
                                <th className="px-4 py-3 text-left text-xs uppercase text-gray-500 font-medium">Nombre</th>
                                <th className="px-4 py-3 text-left text-xs uppercase text-gray-500 font-medium">Apellido</th>
                                <th className="px-4 py-3 text-right text-xs uppercase text-gray-500 font-medium"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {savedStudents.map((student, i) => (
                                <tr key={student.id || i} className="border-b border-gray-100">
                                    <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                                    <td className="px-4 py-3 font-medium text-gray-900">{student.firstName}</td>
                                    <td className="px-4 py-3 text-gray-700">{student.lastName}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => handleRemoveStudent(i)}
                                            className="text-red-500 hover:text-red-700 text-sm"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="flex justify-between pt-8 gap-4">
                <button
                    type="button"
                    onClick={() => navigate('/onboarding/step-2')}
                    className="text-gray-500 font-medium hover:text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-100 transition"
                >
                    ← Volver
                </button>
                <button
                    onClick={() => navigate('/onboarding/step-4')}
                    disabled={savedStudents.length === 0}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 shadow-sm transition-all flex-1"
                >
                    Continuar →
                </button>
            </div>
        </OnboardingLayout>
    );
}

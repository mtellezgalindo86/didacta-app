import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/didactaApi';
import OnboardingLayout from './OnboardingLayout';
import InlineError from '../../components/InlineError';

interface StudentDto {
    id: string;
    firstName: string;
    lastName: string;
}

export default function Step4Attendance() {
    const navigate = useNavigate();
    const [students, setStudents] = useState<StudentDto[]>([]);
    const [attendance, setAttendance] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCelebration, setShowCelebration] = useState(false);
    const [groupInfo, setGroupInfo] = useState<{ id: string; name: string } | null>(null);

    const today = new Date();
    const dateStr = today.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
    const isoDate = today.toISOString().split('T')[0];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [groupsRes, studentsRes] = await Promise.all([
                    api.get('/api/onboarding/groups'),
                    api.get('/api/onboarding/students'),
                ]);

                if (groupsRes.data?.length > 0) {
                    setGroupInfo(groupsRes.data[0]);
                }

                if (studentsRes.data?.length > 0) {
                    setStudents(studentsRes.data);
                    // Default all to present
                    const defaults: Record<string, boolean> = {};
                    studentsRes.data.forEach((s: StudentDto) => {
                        defaults[s.id] = true;
                    });
                    setAttendance(defaults);
                }
            } catch (err) {
                console.error(err);
                setError('No se pudieron cargar los alumnos.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const toggleAttendance = (studentId: string) => {
        setAttendance(prev => ({ ...prev, [studentId]: !prev[studentId] }));
    };

    const summary = useMemo(() => {
        const present = Object.values(attendance).filter(v => v).length;
        const absent = Object.values(attendance).filter(v => !v).length;
        return { present, absent, total: present + absent };
    }, [attendance]);

    const getInitials = (firstName: string, lastName: string) => {
        return (firstName[0] || '') + (lastName[0] || '');
    };

    const handleSave = async () => {
        if (!groupInfo) return;
        setSaving(true);
        setError(null);
        try {
            const entries = students.map(s => ({
                studentId: s.id,
                status: attendance[s.id] ? 'PRESENT' : 'ABSENT',
            }));

            await api.post('/api/onboarding/attendance', {
                groupId: groupInfo.id,
                date: isoDate,
                entries,
            });

            setShowCelebration(true);
        } catch (err) {
            console.error(err);
            setError('No se pudo guardar la asistencia. Intenta de nuevo.');
        } finally {
            setSaving(false);
        }
    };

    if (showCelebration) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-[scaleIn_0.3s_ease-out]">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        ¡Excelente trabajo!
                    </h2>
                    <p className="text-gray-500 mb-6">
                        Acabas de registrar tu primera asistencia.<br />
                        Tu escuela ya está funcionando en Didacta.
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-left space-y-1">
                        <p className="text-gray-600"><span className="font-medium text-green-600">{summary.present} presentes</span></p>
                        <p className="text-gray-600"><span className="font-medium text-gray-500">{summary.absent} ausentes</span></p>
                        {groupInfo && <p className="text-gray-600">Grupo: <span className="font-medium">{groupInfo.name}</span></p>}
                    </div>

                    <button
                        onClick={() => navigate('/onboarding/step-5')}
                        className="min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-8 py-3 w-full transition-all active:scale-95"
                    >
                        Continuar →
                    </button>
                </div>
            </div>
        );
    }

    return (
        <OnboardingLayout
            step={4}
            title="Pasa tu primera asistencia"
            subtitle="Marca quién está presente hoy. Es rápido."
        >
            <InlineError message={error} />

            <div className="flex flex-wrap items-center gap-2 mb-4">
                {groupInfo && (
                    <span className="bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
                        Grupo: {groupInfo.name}
                    </span>
                )}
                <span className="bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1 rounded-full">
                    {dateStr}
                </span>
            </div>

            {!loading && students.length > 0 && (
                <div className="flex items-center gap-4 mb-4 text-sm">
                    <span className="text-green-600 font-medium">Presentes: {summary.present}</span>
                    <span className="text-gray-500">Ausentes: {summary.absent}</span>
                    <span className="text-gray-400">Total: {summary.total}</span>
                </div>
            )}

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="animate-pulse flex items-center justify-between py-3 px-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-32"></div>
                            </div>
                            <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {students.map(student => {
                        const isPresent = attendance[student.id] ?? true;
                        return (
                            <button
                                key={student.id}
                                type="button"
                                onClick={() => toggleAttendance(student.id)}
                                className="w-full flex items-center justify-between py-3 px-4 hover:bg-gray-50 transition rounded-lg"
                                disabled={saving}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                                        {getInitials(student.firstName, student.lastName)}
                                    </span>
                                    <span className="text-base font-medium text-gray-900">
                                        {student.firstName} {student.lastName}
                                    </span>
                                </div>

                                <div className={`relative w-[52px] min-h-[28px] rounded-full transition-colors ${isPresent ? 'bg-green-500' : 'bg-gray-300'}`}>
                                    <div className={`absolute top-[2px] w-6 h-6 bg-white rounded-full shadow transition-transform ${isPresent ? 'left-[26px]' : 'left-[2px]'}`}></div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            <div className="flex justify-between pt-8 gap-4">
                <button
                    type="button"
                    onClick={() => navigate('/onboarding/step-3')}
                    className="text-gray-500 font-medium hover:text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-100 transition"
                >
                    ← Volver
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving || students.length === 0}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 shadow-sm transition-all flex-1 min-h-[48px] flex items-center justify-center gap-2"
                >
                    {saving ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Guardando...
                        </>
                    ) : (
                        'Guardar asistencia →'
                    )}
                </button>
            </div>
        </OnboardingLayout>
    );
}

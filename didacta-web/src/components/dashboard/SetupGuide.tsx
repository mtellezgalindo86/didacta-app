export interface SetupProgress {
    hasGroup: boolean;
    hasStudents: boolean;
    hasAttendance: boolean;
    hasCollaborators: boolean;
    suggestedNextAction: string;
    groupCount: number;
    studentCount: number;
    collaboratorCount: number;
}

interface SetupGuideProps {
    setupProgress: SetupProgress;
}

interface ActionConfig {
    title: string;
    description: string;
    buttonLabel: string;
    icon: React.ReactNode;
}

const actionMap: Record<string, ActionConfig> = {
    CREATE_GROUP: {
        title: 'Crea tu primer grupo para comenzar',
        description: 'Un grupo representa un salon o clase. Define grado, turno y nombre para empezar a registrar alumnos y sesiones.',
        buttonLabel: 'Crear grupo',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
    },
    ADD_STUDENTS: {
        title: 'Agrega alumnos a tus grupos',
        description: 'Registra a los alumnos de cada grupo para poder llevar asistencia y crear sesiones.',
        buttonLabel: 'Agregar alumnos',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
        ),
    },
    TAKE_ATTENDANCE: {
        title: 'Crea tu primera sesion',
        description: 'Registra una clase o jornada y pasa lista de asistencia para comenzar a generar evidencia.',
        buttonLabel: 'Nueva sesion',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
        ),
    },
    INVITE_TEAM: {
        title: 'Invita a tu equipo',
        description: 'Agrega docentes y coordinadores para que colaboren contigo en la gestion de tu escuela.',
        buttonLabel: 'Invitar',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
            </svg>
        ),
    },
};

export default function SetupGuide({ setupProgress }: SetupGuideProps) {
    const action = actionMap[setupProgress.suggestedNextAction];

    if (!action || setupProgress.suggestedNextAction === 'ALL_DONE') {
        return null;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    {action.icon}
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                </div>
                <button
                    onClick={() => {
                        // Placeholder - se conectara despues
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex-shrink-0"
                >
                    {action.buttonLabel}
                </button>
            </div>
        </div>
    );
}


import { useNavigate } from 'react-router-dom';
import UserProfileMenu from '../../components/UserProfileMenu';

const steps = [
    { num: 1, label: 'Registrar tu escuela' },
    { num: 2, label: 'Crear tu primer grupo' },
    { num: 3, label: 'Agregar a tus alumnos' },
    { num: 4, label: 'Pasar tu primera asistencia' },
];

export default function Step0Welcome() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white">
            <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Didacta" className="h-8 w-auto" />
                    </div>
                    <UserProfileMenu />
                </div>
            </header>

            <div className="min-h-screen flex flex-col items-center justify-center p-6 pt-24">
                <div className="max-w-lg w-full text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Bienvenido a Didacta
                    </h1>
                    <p className="text-lg text-gray-500 mb-10 max-w-md mx-auto">
                        Vamos a configurar tu espacio educativo en menos de 3 minutos.
                    </p>

                    <div className="text-left max-w-sm mx-auto mb-10">
                        <p className="text-sm font-medium text-gray-700 mb-4">Qué vamos a hacer:</p>
                        <div className="space-y-3">
                            {steps.map((s) => (
                                <div key={s.num} className="flex items-center gap-3 text-gray-600">
                                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                        {s.num}
                                    </span>
                                    <span className="text-base">{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/onboarding/step-1')}
                        className="min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-xl px-8 py-4 w-full max-w-sm transition-all active:scale-95"
                    >
                        Comenzar
                    </button>
                </div>
            </div>
        </div>
    );
}

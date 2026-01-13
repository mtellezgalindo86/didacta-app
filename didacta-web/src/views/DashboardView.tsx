import { useEffect, useState } from 'react';
import api from '../api/didactaApi';
import DashboardLayout from './DashboardLayout';

interface Stats {
    institutionName: string;
    role: string;
    groupsCount: number;
    collaboratorsCount: number;
}

export default function DashboardView() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch basic status
                const meRes = await api.get('/api/me');

                // For now, these are mocks or derived from minimal data
                // In a real scenario, we would have dedicated endpoints like /api/dashboard
                setStats({
                    institutionName: meRes.data.tenant.name,
                    role: meRes.data.tenant.role,
                    groupsCount: 1, // Placeholder until we have a groups endpoint
                    collaboratorsCount: 0 // Placeholder
                });
            } catch (error) {
                console.error("Dashboard data load failed", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <DashboardLayout
            title={`Bienvenido a ${stats?.institutionName || 'tu institución'}`}
            action={<button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition">Crear nuevo...</button>}
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    label="Grupos Activos"
                    value={stats?.groupsCount || 0}
                    icon="📚"
                    color="bg-purple-100 text-purple-700"
                />
                <StatCard
                    label="Colaboradores"
                    value={stats?.collaboratorsCount || 0}
                    icon="👥"
                    color="bg-green-100 text-green-700"
                />
                <StatCard
                    label="Tu Rol"
                    value={stats?.role === 'OWNER' ? 'Director / Dueño' : 'Docente'}
                    icon="🔑"
                    color="bg-blue-100 text-blue-700"
                />
            </div>

            {/* Empty State / Placeholder Content */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl mb-4">
                    👋
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">¡Todo listo para comenzar!</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                    Has configurado tu institución correctamente. Ahora puedes empezar a crear grupos más específicos, invitar profesores o planear tu ciclo escolar.
                </p>
                <div className="flex justify-center gap-4">
                    <button className="text-blue-600 bg-blue-50 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition">
                        Ver tutorial
                    </button>
                    <button className="text-gray-600 bg-white border border-gray-200 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition">
                        Configuración
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-start justify-between hover:shadow-md transition">
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${color}`}>
                {icon}
            </div>
        </div>
    );
}

export default function DashboardView() {
    return (
        <div className="flex h-full items-center justify-center p-8 bg-gray-50">
            <div className="text-center max-w-lg">
                <div className="w-48 mx-auto mb-6">
                    <img src="/logo.png" alt="Didacta Logo" className="w-full h-auto object-contain" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">¡Bienvenido a Didacta!</h1>
                <p className="text-gray-500 mb-8">Tu espacio educativo está listo. Aún no tienes grupos ni sesiones activas asignadas.</p>

                <div className="grid grid-cols-2 gap-4 mb-8 w-full">
                    <StatCard
                        label="Planteles"
                        value="1"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l8-4 8 4v14M8 21v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2zM9 10a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" /></svg>}
                    />
                    <StatCard
                        label="Grupos"
                        value="0"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>}
                    />
                    <StatCard
                        label="Alumnos"
                        value="0"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>}
                    />
                    <StatCard
                        label="Docentes"
                        value="1"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>}
                    />
                </div>

                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm text-left">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-gray-900">Configuración Pendiente</h3>
                            <p className="text-xs text-gray-500 mt-1">Crea tus primeros grupos para comenzar.</p>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                            Crear Grupo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 transition-transform hover:scale-105">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                {icon}
            </div>
            <div className="text-left">
                <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">{label}</p>
            </div>
        </div>
    );
}

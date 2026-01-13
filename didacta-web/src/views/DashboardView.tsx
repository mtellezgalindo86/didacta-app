import keycloak from '../auth/keycloak';

export default function DashboardView() {
    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <span className="text-xl font-bold text-blue-600">Didacta</span>
                        </div>
                        <div className="flex items-center">
                            <span className="mr-4 text-gray-700">Hola, {keycloak.tokenParsed?.given_name}</span>
                            <button
                                onClick={() => keycloak.logout()}
                                className="text-sm text-red-600 hover:text-red-800"
                            >
                                Cerrar sesión
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center text-gray-500">
                        Dashboard Placeholder
                    </div>
                </div>
            </main>
        </div>
    );
}

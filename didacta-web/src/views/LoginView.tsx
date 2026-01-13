import keycloak from '../auth/keycloak';

export default function LoginView() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
                <div className="flex justify-center mb-6">
                    <div className="flex justify-center mb-6">
                        <img src="/logo.png" alt="Didacta Logo" className="h-16" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold mb-2 text-gray-900">Bienvenido a Didacta</h1>
                <p className="text-gray-500 mb-8">Gestión escolar simplificada.</p>

                <div className="space-y-4">
                    <button
                        onClick={() => keycloak.login()}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                        Iniciar sesión con Didacta
                    </button>

                    <button
                        onClick={() => keycloak.register()}
                        className="w-full py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                    >
                        Crear cuenta con Didacta
                    </button>
                </div>
            </div>
        </div>
    );
}

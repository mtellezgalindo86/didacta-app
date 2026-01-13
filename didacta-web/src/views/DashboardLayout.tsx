import React from 'react';
import keycloak from '../auth/keycloak';

interface DashboardLayoutProps {
    children: React.ReactNode;
    title?: string;
    action?: React.ReactNode;
}

export default function DashboardLayout({ children, title, action }: DashboardLayoutProps) {
    const userInitials = keycloak.tokenParsed?.given_name?.charAt(0) || 'U';

    const handleLogout = () => {
        const handleLogout = () => {
            localStorage.removeItem('didacta_institution_id');
            keycloak.logout();
        };
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col">
                <div className="p-6 border-b border-gray-100 flex items-center gap-2">
                    <img src="/logo.png" alt="Didacta Logo" className="h-8" />
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <NavItem label="Dashboard" active />
                    <NavItem label="Mis Grupos" />
                    <NavItem label="Alumnos" />
                    <NavItem label="Planeaciones" />
                    <NavItem label="Evaluaciones" />
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button onClick={handleLogout} className="flex items-center gap-3 text-gray-500 hover:text-red-600 px-4 py-3 rounded-lg w-full transition text-sm font-medium">
                        <span>Cerrar sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Topbar */}
                <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center h-16">
                    <div className="lg:hidden flex items-center gap-2">
                        <img src="/logo.png" alt="Didacta" className="h-8" />
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                        <div className="border-r border-gray-200 pr-4 mr-2">
                            <span className="text-gray-500 text-sm">Ciclo Escolar 2025-2026</span>
                        </div>
                        <div className="relative group">
                            <button className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition outline-none">
                                <div className="text-right hidden md:block">
                                    <div className="text-sm font-semibold text-gray-900">{keycloak.tokenParsed?.name}</div>
                                    <div className="text-xs text-gray-500">{keycloak.tokenParsed?.email}</div>
                                </div>
                                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold border border-blue-200">
                                    {userInitials}
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 invisible opacity-0 group-focus-within:visible group-focus-within:opacity-100 transition-all duration-200 transform origin-top-right z-50">
                                <div className="px-4 py-3 border-b border-gray-100 md:hidden">
                                    <p className="text-sm font-medium text-gray-900 truncate">{keycloak.tokenParsed?.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{keycloak.tokenParsed?.email}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center gap-2"
                                >
                                    <span>🚪</span> Cerrar sesión
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-8 overflow-y-auto">
                    {(title || action) && (
                        <div className="flex justify-between items-center mb-8">
                            {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
                            {action}
                        </div>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}

function NavItem({ label, active = false }: { label: string; active?: boolean }) {
    return (
        <button
            className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition ${active
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
        >
            {label}
        </button>
    );
}

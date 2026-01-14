import React from 'react';
import keycloak from '../auth/keycloak';

export default function UserProfileMenu() {
    const userInitials = keycloak.tokenParsed?.given_name?.charAt(0) || 'U';

    const handleLogout = () => {
        localStorage.removeItem('didacta_institution_id');
        keycloak.logout();
    };

    return (
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
    );
}

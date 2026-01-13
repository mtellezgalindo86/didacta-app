import axios from 'axios';
import keycloak from '../auth/keycloak';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8088',
});

api.interceptors.request.use(async (config) => {
    if (keycloak.authenticated && keycloak.token) {
        // Update token if expired
        try {
            await keycloak.updateToken(30);
        } catch (e) {
            console.error("Failed to refresh token", e);
            keycloak.login();
        }
        config.headers.Authorization = `Bearer ${keycloak.token}`;

        // Auto-inject Institution ID if present in local storage logic (to be implemented in Onboarding context)
        const institutionId = localStorage.getItem('didacta_institution_id');
        if (institutionId) {
            config.headers['X-Institution-Id'] = institutionId;
        }
    }
    return config;
});

export default api;

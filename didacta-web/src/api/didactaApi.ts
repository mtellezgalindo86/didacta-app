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

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && [401, 403].includes(error.response.status)) {
            // If we get an auth error and have a stored institution ID, it might be stale.
            // Clear it so the user can eventually be redirected or retried correctly.
            const storedId = localStorage.getItem('didacta_institution_id');
            if (storedId) {
                console.warn("Auth error with stored Institution ID. Clearing stale ID.");
                localStorage.removeItem('didacta_institution_id');
                // Optional: retry request? For now, we rely on the UI 'Retry' or reload.
            }
        }
        return Promise.reject(error);
    }
);

export default api;

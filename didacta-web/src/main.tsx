import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import keycloak from './auth/keycloak'

// Initialize Keycloak before rendering React App
keycloak.init({
  onLoad: 'login-required',
  silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
  checkLoginIframe: false // Disable iframe check for simplicity in MVP
}).then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}).catch((error) => {
  console.error("Keycloak init failed", error);
  const root = ReactDOM.createRoot(document.getElementById('root')!);
  root.render(
    <div style={{ padding: 20, color: 'red' }}>
      <h1>Error de Inicialización</h1>
      <p>No se pudo conectar con el servicio de identidad.</p>
      <pre>{JSON.stringify(error, null, 2)}</pre>
      <p>Verifica que Keycloak esté corriendo en http://localhost:8081</p>
    </div>
  );
});

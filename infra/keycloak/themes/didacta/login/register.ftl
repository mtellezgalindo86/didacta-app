<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('firstName','lastName','email','username','password','password-confirm','user.attributes.institution_role'); section>
    <#if section = "header">
        <!-- Header content moved inside form -->
    <#elseif section = "form">
        <div class="didacta-logo-container">
            <img src="${url.resourcesPath}/img/logo.png" alt="Didacta Logo" class="didacta-logo-img" />
        </div>
        
        <h1 id="kc-page-title">Crea tu cuenta en Didacta</h1>
        <p class="didacta-subtitle">Empieza creando tu usuario. La configuración de tu institución viene después.</p>

        <form id="kc-register-form" class="${properties.kcFormClass!}" action="${url.registrationAction}" method="post">
            
            <div class="form-row">
                <div class="form-group half-width">
                    <label for="firstName" class="form-label">Nombre</label>
                    <input type="text" id="firstName" class="pf-c-form-control" name="firstName"
                           value="${(register.formData.firstName!'')}" placeholder="Tu nombre" />
                </div>

                <div class="form-group half-width">
                    <label for="lastName" class="form-label">Apellido</label>
                    <input type="text" id="lastName" class="pf-c-form-control" name="lastName"
                           value="${(register.formData.lastName!'')}" placeholder="Tu apellido" />
                </div>
            </div>

            <div class="form-group">
                <label for="email" class="form-label">Correo electrónico</label>
                <div class="input-icon-wrapper">
                    <input type="text" id="email" class="pf-c-form-control" name="email"
                           value="${(register.formData.email!'')}" autocomplete="email" placeholder="nombre@institucion.com" />
                </div>
            </div>

            <#if !realm.registrationEmailAsUsername>
                <div class="form-group">
                    <label for="username" class="form-label">${msg("username")}</label>
                    <input type="text" id="username" class="pf-c-form-control" name="username"
                           value="${(register.formData.username!'')}" autocomplete="username" />
                </div>
            </#if>

            <div class="form-group">
                <label for="password" class="form-label">Contraseña</label>
                <input type="password" id="password" class="pf-c-form-control" name="password"
                       autocomplete="new-password" placeholder="Mínimo 8 caracteres" />
            </div>

            <div class="form-group">
                <label for="password-confirm" class="form-label">Confirmar contraseña</label>
                <input type="password" id="password-confirm" class="pf-c-form-control" name="password-confirm"
                       placeholder="Repite tu contraseña" />
            </div>

            <!-- Role Selection with Solid SVGs matching design -->
            <div class="form-group role-selection-section">
                <label class="form-label">Rol en la institución</label>
                <div class="role-grid">
                    <label class="role-card">
                        <input type="radio" name="institution_role" value="director" required>
                        <div class="role-card-content">
                            <!-- Icon: Bank/Building (Solid) -->
                            <svg class="role-icon" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm19-12h-2V7h2v3zm-5-3H5V5h12v2zM2 10h1v3H2v-3zm0 5h1v3H2v-3zM11.5 1L2 6v2h19V6L11.5 1z"/>
                            </svg>
                            <span class="role-name">Director</span>
                        </div>
                    </label>
                    <label class="role-card">
                        <input type="radio" name="institution_role" value="owner">
                        <div class="role-card-content">
                            <!-- Icon: Shield Check (Solid) -->
                            <svg class="role-icon" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                            </svg>
                            <span class="role-name">Dueño</span>
                        </div>
                    </label>
                    <label class="role-card">
                        <input type="radio" name="institution_role" value="coordinator">
                        <div class="role-card-content">
                            <!-- Icon: 3 Users (Solid) -->
                            <svg class="role-icon" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                            </svg>
                            <span class="role-name">Coordinador</span>
                        </div>
                    </label>
                </div>
            </div>

            <div class="form-group terms-checkbox">
                <label>
                    <input type="checkbox" id="termsAccepted" name="terms_accepted" value="true" required>
                    <span class="terms-text">Acepto los <a href="#">términos y condiciones</a> de la plataforma.</span>
                </label>
            </div>

            <div class="form-group" style="margin-top: 24px;">
                <button class="pf-c-button pf-m-primary" type="submit">
                    Crear cuenta
                </button>
            </div>
            
            <div class="login-footer">
                ¿Ya tienes una cuenta? <a href="${url.loginUrl}">Iniciar sesión</a>
            </div>

        </form>
    </#if>
</@layout.registrationLayout>

<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password') displayInfo=realm.password && realm.registrationAllowed && !registrationDisabled??; section>
    <#if section = "header">
        <!-- Header content moved to form to be inside the card -->
    <#elseif section = "form">
        <div class="didacta-logo-container">
            <img src="${url.resourcesPath}/img/logo.png" alt="Didacta Logo" class="didacta-logo-img" />
        </div>
        <h1 id="kc-page-title">Accede a tu institución</h1>
        <p class="didacta-subtitle">Evidencia diaria y visibilidad estratégica para la dirección académica.</p>

        <div id="kc-form">
          <div id="kc-form-wrapper">
            <#if realm.password>
                <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">
                    <#if messagesPerField.existsError('username','password')>
                        <div class="pf-c-alert pf-m-danger">
                             Invalid username or password.
                        </div>
                    </#if>

                    <div class="form-group">
                        <label for="username" class="sr-only"><#if !realm.loginWithEmailAllowed>${msg("username")}<#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}<#else>${msg("email")}</#if></label>
                        <input tabindex="1" id="username" class="pf-c-form-control" name="username" value="${(login.username!'')}"  type="text" autofocus autocomplete="off"
                               placeholder="<#if !realm.loginWithEmailAllowed>${msg("username")}<#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}<#else>${msg("email")}</#if>" />
                    </div>

                    <div class="form-group" style="margin-top: 16px;">
                        <label for="password" class="sr-only">${msg("password")}</label>
                        <input tabindex="2" id="password" class="pf-c-form-control" name="password" type="password" autocomplete="off" placeholder="${msg("password")}" />
                    </div>

                    <div class="form-group login-options">
                        <#if realm.rememberMe && !login.rememberMeDisabled??>
                            <div class="checkbox">
                                <label>
                                    <#if login.rememberMe??>
                                        <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox" checked> Recuérdame
                                    <#else>
                                        <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox"> Recuérdame
                                    </#if>
                                </label>
                            </div>
                        </#if>
                        <#if realm.resetPasswordAllowed>
                            <div class="forgot-password">
                                <a tabindex="5" href="${url.loginResetCredentialsUrl}">¿Olvidaste tu contraseña?</a>
                            </div>
                        </#if>
                    </div>

                    <div id="kc-form-buttons" style="margin-top: 24px;">
                        <input type="hidden" id="id-hidden-input" name="credentialId" <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>/>
                        <button tabindex="4" class="pf-c-button pf-m-primary" name="login" id="kc-login" type="submit">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>
                            Iniciar sesión con Didacta
                        </button>
                    </div>
                </form>
            </#if>
            </div>
        </div>

        <!-- Secondary Actions (Mocked based on image) -->
        <a href="${url.registrationUrl}" class="secondary-button" tabindex="5">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
            Crear cuenta con Didacta
        </a>
        
        <div class="login-footer">
            <a href="#">Ayuda</a>
            <a href="#">Privacidad</a>
            <a href="#">Términos</a>
        </div>
    </#if>
</@layout.registrationLayout>

<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=true displayMessage=!messagesPerField.existsError('username'); section>
    <#if section = "header">
        <!-- Header content moved inside form -->
    <#elseif section = "form">
        <div class="didacta-logo-container">
            <img src="${url.resourcesPath}/img/logo.png" alt="Didacta Logo" class="didacta-logo-img" />
        </div>
        
        <h1 id="kc-page-title">Recuperar contraseña</h1>
        <p class="didacta-subtitle">Ingresa tu correo electrónico y te enviaremos instrucciones para crear una nueva contraseña.</p>

        <#if message?has_content && (message.type = 'error' || message.type = 'warning' || message.type = 'success' || message.type = 'info')>
            <div class="pf-c-alert pf-m-${message.type}">
                ${kcSanitize(message.summary)?no_esc}
            </div>
        </#if>

        <form id="kc-reset-password-form" class="${properties.kcFormClass!}" action="${url.loginAction}" method="post">
            <div class="form-group">
                <label for="username" class="form-label"><#if !realm.loginWithEmailAllowed>${msg("username")}<#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}<#else>${msg("email")}</#if></label>
                <input type="text" id="username" name="username" class="pf-c-form-control" autofocus value="${(auth.attemptedUsername!'')}" aria-invalid="<#if messagesPerField.existsError('username')>true</#if>"/>
                <#if messagesPerField.existsError('username')>
                    <span id="input-error-username" class="${properties.kcInputErrorMessageClass!}" aria-live="polite">
                        ${kcSanitize(messagesPerField.get('username'))?no_esc}
                    </span>
                </#if>
            </div>

            <div class="form-group login-options">
                <div class="forgot-password">
                    <a href="${url.loginUrl}">« Volver al inicio de sesión</a>
                </div>
            </div>

            <div class="form-group" style="margin-top: 24px;">
                <button class="pf-c-button pf-m-primary" type="submit">
                    Enviar instrucciones
                </button>
            </div>
            
            <div class="login-footer">
                <a href="#">Ayuda</a>
                <a href="#">Privacidad</a>
                <a href="#">Términos</a>
            </div>

        </form>
    <#elseif section = "info" >
        <!-- Info section hidden or customized if needed -->
    </#if>
</@layout.registrationLayout>

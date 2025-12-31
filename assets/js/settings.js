/**
 * Settings Page JavaScript
 * Gestiona la navegación y funcionalidad de la página de configuración
 */

(function() {
    'use strict';

    // Inicialización
    document.addEventListener('DOMContentLoaded', function() {
        initNavigation();
        initFormHandlers();
        initToggleSwitches();
        initSessionHandlers();
        initApiKeyHandlers();
        initIntegrationHandlers();
        initExportHandlers();
        loadUserSettings();
    });

    /**
     * Inicializa la navegación por pestañas
     */
    function initNavigation() {
        const navBtns = document.querySelectorAll('.velvz-settings__nav-btn');
        const sections = document.querySelectorAll('.velvz-settings__section');

        navBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const sectionId = this.dataset.section;

                // Actualizar botones
                navBtns.forEach(b => b.classList.remove('velvz-settings__nav-btn--active'));
                this.classList.add('velvz-settings__nav-btn--active');

                // Actualizar secciones
                sections.forEach(s => s.classList.remove('velvz-settings__section--active'));
                const targetSection = document.getElementById('section-' + sectionId);
                if (targetSection) {
                    targetSection.classList.add('velvz-settings__section--active');
                }

                // Actualizar URL hash
                history.replaceState(null, null, '#' + sectionId);
            });
        });

        // Cargar sección desde hash de URL
        const hash = window.location.hash.replace('#', '');
        if (hash) {
            const targetBtn = document.querySelector(`[data-section="${hash}"]`);
            if (targetBtn) {
                targetBtn.click();
            }
        }
    }

    /**
     * Inicializa los handlers de formularios
     */
    function initFormHandlers() {
        // Guardar configuración general
        const saveGeneralBtn = document.getElementById('saveGeneralSettings');
        if (saveGeneralBtn) {
            saveGeneralBtn.addEventListener('click', saveGeneralSettings);
        }

        // Cambiar contraseña
        const changePasswordBtn = document.getElementById('changePassword');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', changePassword);
        }

        // Activar 2FA
        const enable2FABtn = document.getElementById('enable2FA');
        if (enable2FABtn) {
            enable2FABtn.addEventListener('click', enable2FA);
        }

        // Eliminar cuenta
        const deleteAccountBtn = document.getElementById('deleteAccount');
        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', deleteAccount);
        }

        // Crear API Key
        const createApiKeyBtn = document.getElementById('createApiKey');
        if (createApiKeyBtn) {
            createApiKeyBtn.addEventListener('click', createApiKey);
        }

        // Guardar webhook
        const saveWebhookBtn = document.getElementById('saveWebhook');
        if (saveWebhookBtn) {
            saveWebhookBtn.addEventListener('click', saveWebhook);
        }
    }

    /**
     * Inicializa los toggle switches de notificaciones
     */
    function initToggleSwitches() {
        const toggles = document.querySelectorAll('.velvz-toggle input[type="checkbox"]');

        // Cargar estados guardados
        toggles.forEach(toggle => {
            const savedState = localStorage.getItem('velvz_setting_' + toggle.id);
            if (savedState !== null) {
                toggle.checked = savedState === 'true';
            }
        });

        // Guardar al cambiar
        toggles.forEach(toggle => {
            toggle.addEventListener('change', function() {
                localStorage.setItem('velvz_setting_' + this.id, this.checked);

                const label = this.closest('.velvz-setting-item')?.querySelector('.velvz-setting-item__label')?.textContent || 'Configuración';
                showNotification(`${label}: ${this.checked ? 'Activado' : 'Desactivado'}`, 'success');
            });
        });

        // Guardar horario DND
        const dndFrom = document.getElementById('dndFrom');
        const dndTo = document.getElementById('dndTo');

        if (dndFrom) {
            const savedFrom = localStorage.getItem('velvz_setting_dndFrom');
            if (savedFrom) dndFrom.value = savedFrom;

            dndFrom.addEventListener('change', function() {
                localStorage.setItem('velvz_setting_dndFrom', this.value);
                showNotification('Horario de inicio actualizado', 'success');
            });
        }

        if (dndTo) {
            const savedTo = localStorage.getItem('velvz_setting_dndTo');
            if (savedTo) dndTo.value = savedTo;

            dndTo.addEventListener('change', function() {
                localStorage.setItem('velvz_setting_dndTo', this.value);
                showNotification('Horario de fin actualizado', 'success');
            });
        }
    }

    /**
     * Inicializa los handlers de sesiones
     */
    function initSessionHandlers() {
        // Cerrar sesión individual
        document.querySelectorAll('.velvz-session .velvz-btn--danger').forEach(btn => {
            btn.addEventListener('click', function() {
                const session = this.closest('.velvz-session');
                const device = session?.querySelector('.velvz-session__device')?.textContent || 'Dispositivo';

                if (confirm(`¿Cerrar sesión en "${device}"?`)) {
                    // Animación de eliminación
                    session.style.transition = 'all 0.3s ease';
                    session.style.opacity = '0';
                    session.style.transform = 'translateX(20px)';

                    setTimeout(() => {
                        session.remove();
                        showNotification(`Sesión en "${device}" cerrada`, 'success');
                    }, 300);
                }
            });
        });

        // Cerrar todas las sesiones
        const closeAllSessionsBtn = document.querySelector('.velvz-sessions-list')?.closest('.velvz-settings-card')?.querySelector('.velvz-settings-card__footer .velvz-btn');
        if (closeAllSessionsBtn && closeAllSessionsBtn.textContent.includes('Cerrar todas')) {
            closeAllSessionsBtn.addEventListener('click', function() {
                if (confirm('¿Cerrar todas las sesiones excepto la actual?\n\nTendrás que volver a iniciar sesión en los otros dispositivos.')) {
                    const sessions = document.querySelectorAll('.velvz-session:not(.velvz-session--current)');

                    sessions.forEach((session, index) => {
                        setTimeout(() => {
                            session.style.transition = 'all 0.3s ease';
                            session.style.opacity = '0';
                            session.style.transform = 'translateX(20px)';

                            setTimeout(() => session.remove(), 300);
                        }, index * 100);
                    });

                    setTimeout(() => {
                        showNotification('Todas las otras sesiones han sido cerradas', 'success');
                    }, sessions.length * 100 + 300);
                }
            });
        }
    }

    /**
     * Inicializa los handlers de API Keys
     */
    function initApiKeyHandlers() {
        // Copiar API Key
        document.querySelectorAll('.velvz-api-key__copy').forEach(btn => {
            btn.addEventListener('click', function() {
                const code = this.previousElementSibling;
                if (code) {
                    navigator.clipboard.writeText(code.textContent.trim());

                    // Cambiar icono temporalmente
                    const icon = this.querySelector('i');
                    if (icon) {
                        icon.className = 'fas fa-check';
                        setTimeout(() => {
                            icon.className = 'fas fa-copy';
                        }, 2000);
                    }

                    showNotification('API Key copiada al portapapeles', 'success');
                }
            });
        });

        // Ver/Ocultar API Key
        document.querySelectorAll('.velvz-api-key__actions .velvz-btn--ghost:not(.velvz-btn--danger)').forEach(btn => {
            if (btn.querySelector('.fa-eye')) {
                btn.addEventListener('click', function() {
                    const apiKey = this.closest('.velvz-api-key');
                    const code = apiKey?.querySelector('code');
                    const icon = this.querySelector('i');

                    if (code && icon) {
                        if (icon.classList.contains('fa-eye')) {
                            // Mostrar key completa (simulado)
                            const keyName = apiKey.querySelector('.velvz-api-key__name')?.textContent || '';
                            const fullKey = keyName.includes('Production')
                                ? 'velvz_pk_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z67f3a'
                                : 'velvz_dk_z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a42b1c';
                            code.textContent = fullKey;
                            icon.className = 'fas fa-eye-slash';
                            showNotification('API Key visible (se ocultará en 10 segundos)', 'info');

                            // Ocultar después de 10 segundos
                            setTimeout(() => {
                                if (icon.classList.contains('fa-eye-slash')) {
                                    code.textContent = keyName.includes('Production')
                                        ? 'velvz_pk_****************************7f3a'
                                        : 'velvz_dk_****************************2b1c';
                                    icon.className = 'fas fa-eye';
                                }
                            }, 10000);
                        } else {
                            // Ocultar key
                            const keyName = apiKey.querySelector('.velvz-api-key__name')?.textContent || '';
                            code.textContent = keyName.includes('Production')
                                ? 'velvz_pk_****************************7f3a'
                                : 'velvz_dk_****************************2b1c';
                            icon.className = 'fas fa-eye';
                        }
                    }
                });
            }
        });

        // Eliminar API Key
        document.querySelectorAll('.velvz-api-key__actions .velvz-btn--danger').forEach(btn => {
            btn.addEventListener('click', function() {
                const apiKey = this.closest('.velvz-api-key');
                const keyName = apiKey?.querySelector('.velvz-api-key__name')?.textContent || 'API Key';

                if (confirm(`¿Eliminar "${keyName}"?\n\nEsta acción no se puede deshacer y cualquier aplicación que use esta key dejará de funcionar.`)) {
                    // Animación de eliminación
                    apiKey.style.transition = 'all 0.3s ease';
                    apiKey.style.opacity = '0';
                    apiKey.style.transform = 'translateX(20px)';

                    setTimeout(() => {
                        apiKey.remove();
                        showNotification(`"${keyName}" eliminada correctamente`, 'success');
                    }, 300);
                }
            });
        });
    }

    /**
     * Inicializa los handlers de integraciones
     */
    function initIntegrationHandlers() {
        document.querySelectorAll('.velvz-integration .velvz-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const integration = this.closest('.velvz-integration');
                const name = integration?.querySelector('.velvz-integration__name')?.textContent || 'Integración';

                if (this.textContent.trim() === 'Conectar') {
                    // Simular proceso de conexión
                    this.disabled = true;
                    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Conectando...';

                    setTimeout(() => {
                        this.disabled = false;
                        this.innerHTML = '<i class="fas fa-check"></i> Conectado';
                        this.classList.remove('velvz-btn--secondary');
                        this.classList.add('velvz-btn--primary');

                        showNotification(`${name} conectado correctamente`, 'success');
                    }, 2000);
                } else if (this.textContent.trim().includes('Conectado')) {
                    if (confirm(`¿Desconectar ${name}?`)) {
                        this.innerHTML = 'Conectar';
                        this.classList.remove('velvz-btn--primary');
                        this.classList.add('velvz-btn--secondary');

                        showNotification(`${name} desconectado`, 'info');
                    }
                }
            });
        });

        // Checkboxes de webhook
        document.querySelectorAll('.velvz-checkbox-group .velvz-checkbox input').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const label = this.closest('.velvz-checkbox')?.querySelector('span:last-child')?.textContent || 'Evento';
                showNotification(`Evento "${label}": ${this.checked ? 'Activado' : 'Desactivado'}`, 'success');
            });
        });
    }

    /**
     * Inicializa los handlers de exportación
     */
    function initExportHandlers() {
        document.querySelectorAll('.velvz-export-options .velvz-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const format = this.textContent.includes('CSV') ? 'CSV' : 'JSON';

                // Simular proceso de exportación
                this.disabled = true;
                const originalHtml = this.innerHTML;
                this.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Generando ${format}...`;

                setTimeout(() => {
                    this.disabled = false;
                    this.innerHTML = originalHtml;

                    // Simular descarga
                    const data = format === 'CSV'
                        ? 'chatbot_id,name,conversations,created_at\n1,Soporte Técnico,1234,2024-01-15\n2,Ventas Online,987,2024-02-20\n3,FAQ Assistant,626,2024-03-10'
                        : JSON.stringify({
                            export_date: new Date().toISOString(),
                            chatbots: [
                                { id: 1, name: 'Soporte Técnico', conversations: 1234 },
                                { id: 2, name: 'Ventas Online', conversations: 987 },
                                { id: 3, name: 'FAQ Assistant', conversations: 626 }
                            ]
                        }, null, 2);

                    const blob = new Blob([data], { type: format === 'CSV' ? 'text/csv' : 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `velvz_export_${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    showNotification(`Datos exportados en formato ${format}`, 'success');
                }, 1500);
            });
        });
    }

    /**
     * Carga la configuración del usuario
     */
    function loadUserSettings() {
        // En producción, esto cargaría datos del API
        const user = JSON.parse(localStorage.getItem('velvz_user') || '{}');

        if (user.name) {
            const nameInput = document.getElementById('settingsName');
            if (nameInput) nameInput.value = user.name;
        }

        if (user.email) {
            const emailInput = document.getElementById('settingsEmail');
            if (emailInput) emailInput.value = user.email;
        }

        // Cargar otros campos guardados
        const savedCompany = localStorage.getItem('velvz_setting_company');
        const savedPhone = localStorage.getItem('velvz_setting_phone');
        const savedLanguage = localStorage.getItem('velvz_setting_language');
        const savedTimezone = localStorage.getItem('velvz_setting_timezone');

        if (savedCompany) {
            const companyInput = document.getElementById('settingsCompany');
            if (companyInput) companyInput.value = savedCompany;
        }
        if (savedPhone) {
            const phoneInput = document.getElementById('settingsPhone');
            if (phoneInput) phoneInput.value = savedPhone;
        }
        if (savedLanguage) {
            const languageSelect = document.getElementById('settingsLanguage');
            if (languageSelect) languageSelect.value = savedLanguage;
        }
        if (savedTimezone) {
            const timezoneSelect = document.getElementById('settingsTimezone');
            if (timezoneSelect) timezoneSelect.value = savedTimezone;
        }
    }

    /**
     * Guarda la configuración general
     */
    function saveGeneralSettings() {
        const name = document.getElementById('settingsName')?.value;
        const company = document.getElementById('settingsCompany')?.value;
        const phone = document.getElementById('settingsPhone')?.value;
        const language = document.getElementById('settingsLanguage')?.value;
        const timezone = document.getElementById('settingsTimezone')?.value;

        // Validación básica
        if (!name || name.trim() === '') {
            showNotification('El nombre es obligatorio', 'error');
            return;
        }

        // Guardar en localStorage
        localStorage.setItem('velvz_setting_company', company || '');
        localStorage.setItem('velvz_setting_phone', phone || '');
        localStorage.setItem('velvz_setting_language', language || 'es');
        localStorage.setItem('velvz_setting_timezone', timezone || 'Europe/Madrid');

        // Actualizar nombre del usuario
        const user = JSON.parse(localStorage.getItem('velvz_user') || '{}');
        user.name = name;
        localStorage.setItem('velvz_user', JSON.stringify(user));

        // Actualizar UI del header si existe
        const headerName = document.getElementById('mobileUserName');
        if (headerName) headerName.textContent = name;

        // Actualizar avatar
        const avatarCircle = document.querySelector('.velvz-header__avatar-circle');
        if (avatarCircle) avatarCircle.textContent = name.charAt(0).toUpperCase();

        console.log('Guardando configuración:', { name, company, phone, language, timezone });
        showNotification('Configuración guardada correctamente', 'success');
    }

    /**
     * Cambia la contraseña
     */
    function changePassword() {
        const currentPassword = document.getElementById('currentPassword')?.value;
        const newPassword = document.getElementById('newPassword')?.value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;

        // Validaciones
        if (!currentPassword || !newPassword || !confirmPassword) {
            showNotification('Todos los campos son obligatorios', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showNotification('Las contraseñas no coinciden', 'error');
            return;
        }

        if (newPassword.length < 8) {
            showNotification('La contraseña debe tener al menos 8 caracteres', 'error');
            return;
        }

        // Simular cambio de contraseña
        const btn = document.getElementById('changePassword');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cambiando...';
        }

        setTimeout(() => {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-key"></i> Cambiar Contraseña';
            }

            // Limpiar campos
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';

            showNotification('Contraseña actualizada correctamente', 'success');
        }, 1500);
    }

    /**
     * Activa 2FA
     */
    function enable2FA() {
        // Simular activación de 2FA
        const btn = document.getElementById('enable2FA');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando código...';
        }

        setTimeout(() => {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-shield-alt"></i> Activar 2FA';
            }

            // Mostrar código QR simulado
            const qrCode = prompt('Código de verificación 2FA (simulado):\n\nEscanea el código QR con tu app de autenticación o introduce este código:\n\nVELVZ-2FA-DEMO-1234\n\nIntroduce el código de 6 dígitos de tu app:');

            if (qrCode && qrCode.length === 6 && /^\d+$/.test(qrCode)) {
                // Actualizar badge
                const badge = btn?.closest('.velvz-settings-card')?.querySelector('.velvz-badge');
                if (badge) {
                    badge.className = 'velvz-badge velvz-badge--success';
                    badge.innerHTML = '<i class="fas fa-check-circle"></i> Activado';
                }

                btn.textContent = 'Desactivar 2FA';
                showNotification('Autenticación en dos pasos activada', 'success');
            } else if (qrCode !== null) {
                showNotification('Código inválido. Debe ser un número de 6 dígitos.', 'error');
            }
        }, 1500);
    }

    /**
     * Elimina la cuenta
     */
    function deleteAccount() {
        const confirmed = confirm('¿Estás seguro de que quieres eliminar tu cuenta?\n\nEsta acción es PERMANENTE y eliminará todos tus chatbots, conversaciones y datos.');

        if (confirmed) {
            const doubleConfirm = prompt('Para confirmar, escribe "ELIMINAR" (en mayúsculas):');

            if (doubleConfirm === 'ELIMINAR') {
                showNotification('Procesando solicitud de eliminación...', 'warning');

                setTimeout(() => {
                    // En producción, esto llamaría al API para eliminar la cuenta
                    localStorage.clear();
                    showNotification('Tu cuenta ha sido eliminada. Redirigiendo...', 'info');

                    setTimeout(() => {
                        window.location.href = '/';
                    }, 2000);
                }, 2000);
            } else if (doubleConfirm !== null) {
                showNotification('Eliminación cancelada - texto no coincide', 'info');
            }
        }
    }

    /**
     * Crea una nueva API Key
     */
    function createApiKey() {
        const name = prompt('Nombre para la nueva API Key:');

        if (name && name.trim() !== '') {
            // Generar key aleatoria
            const randomKey = 'velvz_' + Math.random().toString(36).substring(2, 6) + '_' +
                             Array.from({length: 40}, () => Math.random().toString(36).charAt(2)).join('');

            // Crear elemento de API Key
            const apiKeyContainer = document.querySelector('.velvz-settings-card__body .velvz-api-key')?.parentElement;

            if (apiKeyContainer) {
                const newApiKey = document.createElement('div');
                newApiKey.className = 'velvz-api-key';
                newApiKey.style.animation = 'slideIn 0.3s ease';
                newApiKey.innerHTML = `
                    <div class="velvz-api-key__info">
                        <span class="velvz-api-key__name">${name}</span>
                        <span class="velvz-api-key__created">Creada ahora</span>
                    </div>
                    <div class="velvz-api-key__value">
                        <code>${randomKey.substring(0, 10)}****************************${randomKey.slice(-4)}</code>
                        <button class="velvz-api-key__copy" title="Copiar">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                    <div class="velvz-api-key__actions">
                        <button class="velvz-btn velvz-btn--ghost velvz-btn--sm">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="velvz-btn velvz-btn--ghost velvz-btn--sm velvz-btn--danger">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;

                apiKeyContainer.insertBefore(newApiKey, apiKeyContainer.firstChild);

                // Reinicializar handlers
                initApiKeyHandlers();

                // Mostrar key completa temporalmente
                alert(`Tu nueva API Key:\n\n${randomKey}\n\n¡IMPORTANTE! Guarda esta key ahora, no podrás verla completa de nuevo.`);
            }

            showNotification(`API Key "${name}" creada correctamente`, 'success');
        }
    }

    /**
     * Guarda la configuración del webhook
     */
    function saveWebhook() {
        const webhookUrl = document.getElementById('webhookUrl')?.value;

        if (!webhookUrl || webhookUrl.trim() === '') {
            showNotification('Introduce una URL de webhook', 'error');
            return;
        }

        // Validar URL
        try {
            new URL(webhookUrl);
        } catch (e) {
            showNotification('La URL no es válida', 'error');
            return;
        }

        // Simular guardado
        const btn = document.getElementById('saveWebhook');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        }

        setTimeout(() => {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-save"></i> Guardar Webhook';
            }

            localStorage.setItem('velvz_webhook_url', webhookUrl);

            // Guardar eventos seleccionados
            const events = [];
            document.querySelectorAll('.velvz-checkbox-group .velvz-checkbox input:checked').forEach(cb => {
                const label = cb.closest('.velvz-checkbox')?.querySelector('span:last-child')?.textContent;
                if (label) events.push(label);
            });
            localStorage.setItem('velvz_webhook_events', JSON.stringify(events));

            showNotification('Webhook guardado correctamente', 'success');
        }, 1000);
    }

    /**
     * Muestra una notificación
     */
    function showNotification(message, type = 'info') {
        // Usar el sistema de notificaciones existente si está disponible
        if (typeof window.showVelvzNotification === 'function') {
            window.showVelvzNotification(message, type);
            return;
        }

        // Remover notificaciones anteriores
        document.querySelectorAll('.velvz-notification').forEach(n => n.remove());

        // Fallback simple
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#6366f1'
        };

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        const notification = document.createElement('div');
        notification.className = 'velvz-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${colors[type] || colors.info};
            color: white;
            border-radius: 0.5rem;
            font-size: 0.9rem;
            font-weight: 500;
            z-index: 9999;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            max-width: 400px;
        `;
        notification.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${message}</span>
        `;

        // Añadir animación CSS si no existe
        if (!document.getElementById('velvz-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'velvz-notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

})();

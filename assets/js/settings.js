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

        // Copiar API Key
        document.querySelectorAll('.velvz-api-key__copy').forEach(btn => {
            btn.addEventListener('click', function() {
                const code = this.previousElementSibling;
                if (code) {
                    navigator.clipboard.writeText(code.textContent.trim());
                    showNotification('API Key copiada al portapapeles', 'success');
                }
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

        // Simular guardado
        console.log('Guardando configuración:', { name, company, phone, language, timezone });

        // En producción, esto enviaría datos al API
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

        // En producción, esto enviaría datos al API
        console.log('Cambiando contraseña...');
        showNotification('Contraseña actualizada correctamente', 'success');

        // Limpiar campos
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    }

    /**
     * Activa 2FA
     */
    function enable2FA() {
        // En producción, esto abriría un modal con el código QR
        showNotification('Funcionalidad 2FA próximamente disponible', 'info');
    }

    /**
     * Elimina la cuenta
     */
    function deleteAccount() {
        const confirmed = confirm('¿Estás seguro de que quieres eliminar tu cuenta?\n\nEsta acción es PERMANENTE y eliminará todos tus chatbots, conversaciones y datos.');

        if (confirmed) {
            const doubleConfirm = prompt('Para confirmar, escribe "ELIMINAR" (en mayúsculas):');

            if (doubleConfirm === 'ELIMINAR') {
                // En producción, esto llamaría al API para eliminar la cuenta
                showNotification('Procesando solicitud de eliminación...', 'warning');
            } else {
                showNotification('Eliminación cancelada', 'info');
            }
        }
    }

    /**
     * Crea una nueva API Key
     */
    function createApiKey() {
        const name = prompt('Nombre para la nueva API Key:');

        if (name && name.trim() !== '') {
            // En producción, esto llamaría al API
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

        // En producción, esto enviaría datos al API
        console.log('Guardando webhook:', webhookUrl);
        showNotification('Webhook guardado correctamente', 'success');
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

        // Fallback simple
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#6366f1'
        };

        const notification = document.createElement('div');
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
        `;
        notification.textContent = message;

        // Añadir animación CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

})();

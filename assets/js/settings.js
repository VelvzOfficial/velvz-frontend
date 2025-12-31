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

        // Eliminar cuenta
        const deleteAccountBtn = document.getElementById('deleteAccount');
        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', deleteAccount);
        }
    }

    /**
     * Carga la configuración del usuario
     */
    function loadUserSettings() {
        const user = JSON.parse(localStorage.getItem('velvz_user') || '{}');

        if (user.name || user.full_name) {
            const nameInput = document.getElementById('settingsName');
            if (nameInput) nameInput.value = user.name || user.full_name;
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
    async function saveGeneralSettings() {
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

        const btn = document.getElementById('saveGeneralSettings');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        }

        try {
            // Intentar actualizar en el servidor si hay autenticación disponible
            if (window.velvzAuth && window.velvzAuth.getToken()) {
                const token = window.velvzAuth.getToken();
                const result = await window.velvzAuth.updateProfile(token, { full_name: name });

                if (!result.success) {
                    console.warn('No se pudo actualizar en el servidor:', result.message);
                }
            }

            // Guardar en localStorage
            localStorage.setItem('velvz_setting_company', company || '');
            localStorage.setItem('velvz_setting_phone', phone || '');
            localStorage.setItem('velvz_setting_language', language || 'es');
            localStorage.setItem('velvz_setting_timezone', timezone || 'Europe/Madrid');

            // Actualizar nombre del usuario
            const user = JSON.parse(localStorage.getItem('velvz_user') || '{}');
            user.name = name;
            user.full_name = name;
            localStorage.setItem('velvz_user', JSON.stringify(user));

            // Actualizar UI del header si existe
            const headerName = document.getElementById('mobileUserName');
            if (headerName) headerName.textContent = name;

            // Actualizar avatar
            const avatarCircle = document.querySelector('.velvz-header__avatar-circle');
            if (avatarCircle) avatarCircle.textContent = name.charAt(0).toUpperCase();

            showNotification('Configuración guardada correctamente', 'success');
        } catch (error) {
            console.error('Error guardando configuración:', error);
            showNotification('Error al guardar. Intenta de nuevo.', 'error');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
            }
        }
    }

    /**
     * Cambia la contraseña - Envía email de reset
     */
    async function changePassword() {
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

        if (newPassword.length < 6) {
            showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        const btn = document.getElementById('changePassword');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        }

        try {
            // Obtener email del usuario
            const user = JSON.parse(localStorage.getItem('velvz_user') || '{}');
            const userEmail = user.email;

            if (!userEmail) {
                showNotification('No se encontró el email del usuario', 'error');
                return;
            }

            // Usar forgot-password para enviar email de reset
            if (window.velvzAuth) {
                const result = await window.velvzAuth.forgotPassword(userEmail);

                if (result.success) {
                    // Limpiar campos
                    document.getElementById('currentPassword').value = '';
                    document.getElementById('newPassword').value = '';
                    document.getElementById('confirmPassword').value = '';

                    showNotification('Te hemos enviado un email para cambiar tu contraseña', 'success');
                } else {
                    showNotification(result.message || 'Error al procesar la solicitud', 'error');
                }
            } else {
                showNotification('Sistema de autenticación no disponible', 'error');
            }
        } catch (error) {
            console.error('Error cambiando contraseña:', error);
            showNotification('Error al procesar la solicitud', 'error');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-envelope"></i> Enviar Email de Cambio';
            }
        }
    }

    /**
     * Elimina la cuenta - Abre email a soporte
     */
    function deleteAccount() {
        const user = JSON.parse(localStorage.getItem('velvz_user') || '{}');
        const userEmail = user.email || 'mi-email@ejemplo.com';
        const subject = encodeURIComponent('Solicitud de eliminación de cuenta');
        const body = encodeURIComponent(`Hola equipo de Velvz,\n\nSolicito la eliminación de mi cuenta asociada al email: ${userEmail}\n\nEntiendo que esta acción es permanente y eliminará todos mis chatbots, conversaciones y datos.\n\nGracias.`);

        window.location.href = `mailto:soporte@velvz.com?subject=${subject}&body=${body}`;
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

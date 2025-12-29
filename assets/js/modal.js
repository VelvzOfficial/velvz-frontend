/**
 * Modal de confirmación personalizado para Velvz
 * Reemplaza los alert() y confirm() del navegador con un diseño consistente
 */

class VelvzModal {
    constructor() {
        console.log('🎭 [MODAL] Constructor called');

        this.modal = document.getElementById('velvzConfirmModal');
        console.log('🎭 [MODAL] Modal element:', this.modal);

        this.overlay = this.modal?.querySelector('.velvz-modal__overlay');
        this.title = document.getElementById('velvzModalTitle');
        this.message = document.getElementById('velvzModalMessage');
        this.confirmBtn = document.getElementById('velvzModalConfirm');
        this.cancelBtn = document.getElementById('velvzModalCancel');

        console.log('🎭 [MODAL] Elements found:', {
            modal: !!this.modal,
            overlay: !!this.overlay,
            title: !!this.title,
            message: !!this.message,
            confirmBtn: !!this.confirmBtn,
            cancelBtn: !!this.cancelBtn
        });

        this.resolvePromise = null;
        this.rejectPromise = null;

        this.init();
    }

    init() {
        console.log('🎭 [MODAL] Init called');

        if (!this.modal) {
            console.error('❌ [MODAL] Modal element not found! Cannot initialize.');
            return;
        }

        // Close on overlay click
        this.overlay?.addEventListener('click', () => {
            this.close(false);
        });

        // Close on cancel
        this.cancelBtn?.addEventListener('click', () => {
            this.close(false);
        });

        // Confirm action
        this.confirmBtn?.addEventListener('click', () => {
            this.close(true);
        });

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display !== 'none') {
                this.close(false);
            }
        });

        console.log('✅ [MODAL] Event listeners attached successfully');
    }

    /**
     * Show confirmation modal
     * @param {Object} options - Modal options
     * @param {string} options.title - Modal title
     * @param {string} options.message - Modal message
     * @param {string} options.confirmText - Confirm button text
     * @param {string} options.cancelText - Cancel button text
     * @param {string} options.type - Modal type (danger, warning, info)
     * @returns {Promise<boolean>} - Resolves to true if confirmed, false if canceled
     */
    confirm(options = {}) {
        console.log('🎭 [MODAL] confirm() called with options:', options);

        const {
            title = '¿Confirmar acción?',
            message = '¿Estás seguro de que deseas continuar?',
            confirmText = 'Confirmar',
            cancelText = 'Cancelar',
            type = 'warning'
        } = options;

        return new Promise((resolve, reject) => {
            this.resolvePromise = resolve;
            this.rejectPromise = reject;

            console.log('🎭 [MODAL] Promise created, showing modal...');

            // Set content
            this.title.textContent = title;
            this.message.textContent = message;
            this.confirmBtn.textContent = confirmText;
            this.cancelBtn.textContent = cancelText;

            // Set icon based on type
            const icon = this.modal.querySelector('.velvz-modal__icon');
            icon.className = 'velvz-modal__icon fas';

            switch (type) {
                case 'danger':
                    icon.classList.add('fa-exclamation-circle');
                    icon.style.color = '#ef4444';
                    this.confirmBtn.className = 'velvz-modal__btn velvz-modal__btn--danger';
                    break;
                case 'warning':
                    icon.classList.add('fa-exclamation-triangle');
                    icon.style.color = '#f59e0b';
                    this.confirmBtn.className = 'velvz-modal__btn velvz-modal__btn--danger';
                    break;
                case 'info':
                    icon.classList.add('fa-info-circle');
                    icon.style.color = '#3b82f6';
                    this.confirmBtn.className = 'velvz-modal__btn velvz-modal__btn--primary';
                    break;
                default:
                    icon.classList.add('fa-exclamation-triangle');
                    icon.style.color = '#f59e0b';
            }

            // Show modal
            this.modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            console.log('✅ [MODAL] Modal displayed');
        });
    }

    close(confirmed) {
        console.log('🎭 [MODAL] close() called with confirmed:', confirmed);

        this.modal.style.display = 'none';
        document.body.style.overflow = '';

        if (this.resolvePromise) {
            console.log('🎭 [MODAL] Resolving promise with:', confirmed);
            this.resolvePromise(confirmed);
            this.resolvePromise = null;
            this.rejectPromise = null;
        }

        console.log('✅ [MODAL] Modal closed');
    }

    /**
     * Show alert modal (single button)
     */
    alert(options = {}) {
        const {
            title = 'Información',
            message = '',
            confirmText = 'Aceptar',
            type = 'info'
        } = options;

        this.cancelBtn.style.display = 'none';

        return this.confirm({
            title,
            message,
            confirmText,
            type
        }).finally(() => {
            this.cancelBtn.style.display = '';
        });
    }
}

// Initialize modal globally
let velvzModal;

document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 [MODAL] DOMContentLoaded fired');

    velvzModal = new VelvzModal();
    window.velvzModal = velvzModal;

    console.log('✅ [MODAL] VelvzModal initialized and assigned to window.velvzModal');
    console.log('📄 [MODAL] window.velvzModal available:', typeof window.velvzModal !== 'undefined');
});

// Export for use in other scripts
window.VelvzModal = VelvzModal;
console.log('📄 [MODAL] VelvzModal class exported to window.VelvzModal');

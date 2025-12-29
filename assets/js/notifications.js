// =====================================================
// SISTEMA DE NOTIFICACIONES GLOBAL - VELVZ
// =====================================================

/**
 * Sistema de notificaciones consistente para toda la aplicación
 * Uso: VelvzNotify.success('Mensaje'), VelvzNotify.error('Mensaje'), etc.
 */

const VelvzNotify = {
  // Contenedor de notificaciones
  container: null,

  // Inicializar el sistema
  init() {
    if (this.container) return;

    // Crear contenedor
    this.container = document.createElement("div");
    this.container.className = "velvz-notify-container";
    document.body.appendChild(this.container);

    // Añadir estilos si no existen
    if (!document.getElementById("velvz-notify-styles")) {
      const styles = document.createElement("style");
      styles.id = "velvz-notify-styles";
      styles.innerHTML = `
        .velvz-notify-container {
          position: fixed;
          top: 100px;
          right: 20px;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-width: 400px;
          pointer-events: none;
        }

        .velvz-notify {
          background: var(--dark-bg-secondary, #1a1a2e);
          border: 1px solid var(--dark-border, rgba(255, 255, 255, 0.1));
          border-radius: 14px;
          padding: 1rem 1.25rem;
          display: flex;
          align-items: flex-start;
          gap: 0.875rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
          animation: velvzNotifySlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: auto;
          position: relative;
          overflow: hidden;
        }

        .velvz-notify::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
        }

        .velvz-notify--success {
          border-color: rgba(34, 197, 94, 0.3);
        }

        .velvz-notify--success::before {
          background: linear-gradient(180deg, #22c55e 0%, #16a34a 100%);
        }

        .velvz-notify--error {
          border-color: rgba(239, 68, 68, 0.3);
        }

        .velvz-notify--error::before {
          background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
        }

        .velvz-notify--warning {
          border-color: rgba(245, 158, 11, 0.3);
        }

        .velvz-notify--warning::before {
          background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
        }

        .velvz-notify--info {
          border-color: rgba(59, 130, 246, 0.3);
        }

        .velvz-notify--info::before {
          background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
        }

        .velvz-notify__icon {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          flex-shrink: 0;
        }

        .velvz-notify--success .velvz-notify__icon {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }

        .velvz-notify--error .velvz-notify__icon {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .velvz-notify--warning .velvz-notify__icon {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }

        .velvz-notify--info .velvz-notify__icon {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
        }

        .velvz-notify__content {
          flex: 1;
          min-width: 0;
        }

        .velvz-notify__title {
          font-weight: 600;
          color: var(--dark-text, #eee6ff);
          font-size: 0.95rem;
          margin-bottom: 0.25rem;
        }

        .velvz-notify__message {
          color: var(--dark-text-secondary, #a5a5c9);
          font-size: 0.875rem;
          line-height: 1.4;
          margin: 0;
        }

        .velvz-notify__close {
          background: transparent;
          border: none;
          color: var(--dark-text-secondary, #a5a5c9);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 6px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .velvz-notify__close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--dark-text, #eee6ff);
        }

        .velvz-notify--exiting {
          animation: velvzNotifySlideOut 0.3s cubic-bezier(0.4, 0, 1, 1) forwards;
        }

        .velvz-notify__progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          background: rgba(255, 255, 255, 0.2);
          animation: velvzNotifyProgress linear forwards;
        }

        @keyframes velvzNotifySlideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes velvzNotifySlideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        @keyframes velvzNotifyProgress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        @media (max-width: 768px) {
          .velvz-notify-container {
            top: 80px;
            right: 10px;
            left: 10px;
            max-width: none;
          }
        }
      `;
      document.head.appendChild(styles);
    }
  },

  // Mostrar notificación
  show(options) {
    this.init();

    const {
      type = "info",
      title = "",
      message = "",
      duration = 5000,
      closable = true,
    } = options;

    // Iconos según tipo
    const icons = {
      success: "fa-check-circle",
      error: "fa-times-circle",
      warning: "fa-exclamation-triangle",
      info: "fa-info-circle",
    };

    // Crear notificación
    const notification = document.createElement("div");
    notification.className = `velvz-notify velvz-notify--${type}`;
    notification.innerHTML = `
      <div class="velvz-notify__icon">
        <i class="fas ${icons[type]}"></i>
      </div>
      <div class="velvz-notify__content">
        ${title ? `<div class="velvz-notify__title">${title}</div>` : ""}
        <p class="velvz-notify__message">${message}</p>
      </div>
      ${
        closable
          ? `
        <button class="velvz-notify__close" aria-label="Cerrar">
          <i class="fas fa-times"></i>
        </button>
      `
          : ""
      }
      ${
        duration > 0
          ? `<div class="velvz-notify__progress" style="animation-duration: ${duration}ms;"></div>`
          : ""
      }
    `;

    // Añadir al contenedor
    this.container.appendChild(notification);

    // Evento de cerrar
    const closeBtn = notification.querySelector(".velvz-notify__close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.dismiss(notification));
    }

    // Auto-cerrar
    if (duration > 0) {
      setTimeout(() => this.dismiss(notification), duration);
    }

    return notification;
  },

  // Cerrar notificación
  dismiss(notification) {
    if (!notification || notification.classList.contains("velvz-notify--exiting")) return;

    notification.classList.add("velvz-notify--exiting");
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  },

  // Métodos de conveniencia
  success(message, title = "Guardado") {
    return this.show({ type: "success", title, message });
  },

  error(message, title = "Error") {
    return this.show({ type: "error", title, message, duration: 8000 });
  },

  warning(message, title = "Atención") {
    return this.show({ type: "warning", title, message, duration: 6000 });
  },

  info(message, title = "Información") {
    return this.show({ type: "info", title, message });
  },

  // Notificaciones predefinidas
  saved() {
    return this.success("Los cambios se han guardado correctamente", "Cambios guardados");
  },

  deleted(itemName = "elemento") {
    return this.success(`El ${itemName} ha sido eliminado correctamente`, "Eliminado");
  },

  created(itemName = "elemento") {
    return this.success(`El ${itemName} ha sido creado correctamente`, "Creado");
  },

  connectionError() {
    return this.error(
      "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
      "Error de conexión"
    );
  },

  authError() {
    return this.error(
      "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
      "Sesión expirada"
    );
  },

  validationError(message = "Por favor, revisa los campos del formulario.") {
    return this.warning(message, "Campos inválidos");
  },

  loading(message = "Procesando...") {
    return this.show({
      type: "info",
      title: "",
      message: `<i class="fas fa-spinner fa-spin" style="margin-right: 8px;"></i>${message}`,
      duration: 0,
      closable: false,
    });
  },
};

// Exportar globalmente
window.VelvzNotify = VelvzNotify;

// Inicializar cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => VelvzNotify.init());
} else {
  VelvzNotify.init();
}

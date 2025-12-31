// =====================================================
// CONFIGURACIÓN DEL CHATBOT - VERSIÓN SIMPLE Y FUNCIONAL
// Solo usa dashboardAPI - Sin conflictos
// =====================================================

console.log("🚀 chatbot-config.js cargando...");

// Variables globales
let currentChatbot = null;
let originalData = null;
let hasUnsavedChanges = false;
let isLoading = false;

// =====================================================
// INICIALIZACIÓN PRINCIPAL
// =====================================================

document.addEventListener("DOMContentLoaded", async function () {
  console.log("🔧 DOM cargado, inicializando configuración...");

  // Esperar a que dashboard API esté disponible
  await waitForDashboardAPI();

  // Verificar autenticación
  if (!window.dashboardAPI || !window.dashboardAPI.token) {
    console.warn("❌ No hay autenticación, redirigiendo...");
    window.location.href = "/cuenta/";
    return;
  }

  // Obtener ID del chatbot
  const chatbotId = getChatbotIdFromUrl();
  if (!chatbotId) {
    console.error("❌ No hay ID de chatbot en la URL");
    showError("ID de chatbot no válido");
    return;
  }

  console.log(`🎯 Cargando chatbot ID: ${chatbotId}`);

  try {
    // Inicializar la aplicación
    await initializeApp(chatbotId);
  } catch (error) {
    console.error("❌ Error inicializando aplicación:", error);
    showError("Error al cargar la configuración: " + error.message);
  }
});

// =====================================================
// ESPERAR DASHBOARD API
// =====================================================

function waitForDashboardAPI() {
  return new Promise((resolve) => {
    if (window.dashboardAPI) {
      console.log("✅ Dashboard API ya disponible");
      resolve();
      return;
    }

    const checkInterval = setInterval(() => {
      if (window.dashboardAPI) {
        console.log("✅ Dashboard API cargado");
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);

    // Timeout de seguridad
    setTimeout(() => {
      clearInterval(checkInterval);
      console.warn("⚠️ Timeout esperando Dashboard API");
      resolve();
    }, 5000);
  });
}

// =====================================================
// OBTENER ID DEL CHATBOT
// =====================================================

function getChatbotIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// =====================================================
// INICIALIZAR APLICACIÓN
// =====================================================

async function initializeApp(chatbotId) {
  try {
    showLoading("Cargando configuración del chatbot...");

    // Cargar datos del chatbot
    await loadChatbotData(chatbotId);

    // Configurar interfaz
    setupEventListeners();

    // Cargar estadísticas de archivos
    await loadFileStats(chatbotId);

    // Cargar documentos
    await loadDocuments(chatbotId);

    hideLoading();
    console.log("✅ Aplicación inicializada correctamente");
  } catch (error) {
    console.error("❌ Error en inicialización:", error);
    hideLoading();
    throw error;
  }
}

// =====================================================
// CARGAR DATOS DEL CHATBOT
// =====================================================

async function loadChatbotData(chatbotId) {
  try {
    console.log(`📡 Cargando chatbot ${chatbotId}...`);

    const response = await window.dashboardAPI.getChatbot(chatbotId);

    if (!response.success) {
      throw new Error(response.message || "Error al cargar el chatbot");
    }

    currentChatbot = response.data.chatbot;
    originalData = { ...currentChatbot };

    console.log("✅ Chatbot cargado:", currentChatbot);

    // Actualizar interfaz
    updateUI();
    // Cargar configuración de dominios
    if (window.loadImplementationData) {
      await window.loadImplementationData(chatbotId);
    }
  } catch (error) {
    console.error("❌ Error cargando chatbot:", error);

    if (error.message.includes("404")) {
      showError("Chatbot no encontrado");
      setTimeout(() => {
        window.location.href = "/app/chatbots/";
      }, 2000);
    } else {
      throw error;
    }
  }
}

// =====================================================
// ACTUALIZAR INTERFAZ
// =====================================================

function updateUI() {
  if (!currentChatbot) return;

  // Llamar a la función modular de configuración
  updateConfigurationUI();

  // Estado del chatbot
  updateStatus(currentChatbot.status);

  // Resetear flag de cambios
  hasUnsavedChanges = false;
  updateSaveButton();

  // 🆕 AÑADIR: Verificar estado de sincronización OpenAI
  if (currentChatbot.assistant_id) {
    updateOpenAIStatus("synced");
    console.log(
      `🤖 Chatbot conectado a OpenAI Assistant: ${currentChatbot.openai_assistant_id}`
    );
  } else {
    updateOpenAIStatus("error");
    console.warn(`⚠️ Chatbot sin conexión OpenAI - ID faltante`);
  }

  console.log("✅ Interfaz actualizada");
}

// =====================================================
// ACTUALIZAR ESTADO
// =====================================================

function updateStatus(status) {
  const statusContainer = document.getElementById("chatbotStatus");
  if (!statusContainer) return;

  const statusEl = statusContainer.querySelector(".velvz-status");
  const textEl = statusContainer.querySelector(".velvz-status__text");

  if (statusEl && textEl) {
    // Limpiar clases anteriores
    statusEl.className = "velvz-status";

    switch (status) {
      case "active":
        statusEl.classList.add("velvz-status--active");
        textEl.textContent = "Activo";
        break;
      case "inactive":
        statusEl.classList.add("velvz-status--inactive");
        textEl.textContent = "Inactivo";
        break;
      case "draft":
        statusEl.classList.add("velvz-status--warning");
        textEl.textContent = "Borrador";
        break;
      default:
        statusEl.classList.add("velvz-status--inactive");
        textEl.textContent = "Desconocido";
    }
  }
}

// =====================================================
// EVENT LISTENERS - VERSIÓN DUAL (DESKTOP + MÓVIL)
// =====================================================

function setupEventListeners() {
  console.log("🔗 Configurando event listeners duales...");

  // Botones principales DESKTOP
  const saveBtn = document.getElementById("saveChangesBtn");
  const previewBtn = document.getElementById("previewBtn");

  // Botones principales MÓVIL
  const saveBtnMobile = document.getElementById("saveChangesBtnMobile");
  const previewBtnMobile = document.getElementById("previewBtnMobile");

  // Botón del footer
  const saveFooterBtn = document.getElementById("saveChangesFooterBtn");

  // Event listeners para DESKTOP
  if (saveBtn) saveBtn.addEventListener("click", handleSave);
  if (previewBtn) previewBtn.addEventListener("click", handlePreview);

  // Event listeners para MÓVIL
  if (saveBtnMobile) saveBtnMobile.addEventListener("click", handleSave);
  if (previewBtnMobile)
    previewBtnMobile.addEventListener("click", handlePreview);

  // Event listener para FOOTER
  if (saveFooterBtn) saveFooterBtn.addEventListener("click", handleSave);

  // Navegación con cambios sin guardar
  window.addEventListener("beforeunload", (e) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue =
        "¿Estás seguro de que quieres salir? Los cambios no guardados se perderán.";
    }
  });

  // Configurar desplegables personalizados
  setupCustomSelects();

  // Configurar pestañas de navegación
  setupTabs();

  // Inicializar sección de configuración (modular)
  initializeConfigurationSection();

  // Inicializar sección de archivos (modular)
  initializeArchivesSection();
  
  // Inicializar sección de personalización (modular)
  if (typeof initializeCustomizationSection === 'function') {
    initializeCustomizationSection();
    console.log("✅ Sección de personalización inicializada");
  }

  // Inicializar sección de estadísticas (modular)
  if (typeof initializeStatisticsSection === 'function') {
    initializeStatisticsSection();
    console.log("✅ Sección de estadísticas inicializada");
  }

  console.log("✅ Event listeners duales configurados");

  // Al final de setupEventListeners(), añadir:
  console.log("🔍 Verificando funciones disponibles:");
  console.log("- handleSave:", typeof handleSave !== "undefined" ? "✅" : "❌");
  console.log(
    "- markAsChanged:",
    typeof markAsChanged !== "undefined" ? "✅" : "❌"
  );
  console.log(
    "- collectFormData:",
    typeof collectFormData !== "undefined" ? "✅" : "❌"
  );
}

// =====================================================
// CONFIGURACIÓN DE PESTAÑAS
// =====================================================

function setupTabs() {
  console.log("🔧 Configurando pestañas de navegación...");

  const tabs = document.querySelectorAll(".velvz-config__tab");

  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const targetTab = this.dataset.tab;

      // Remover clase activa de todas las pestañas
      tabs.forEach((t) => t.classList.remove("velvz-config__tab--active"));

      // Añadir clase activa a la pestaña clickeada
      this.classList.add("velvz-config__tab--active");

      // Guardar pestaña seleccionada en localStorage
      const chatbotId = getChatbotIdFromUrl();
      if (chatbotId) {
        localStorage.setItem(`velvz_config_tab_${chatbotId}`, targetTab);
      }

      console.log(`📑 Pestaña seleccionada: ${targetTab}`);

      // Mostrar contenido de la pestaña
      showTabContent(targetTab);
    });
  });

  // Verificar si hay una sección específica en la URL (ej: ?section=statistics)
  const urlParams = new URLSearchParams(window.location.search);
  const urlSection = urlParams.get('section');

  // Restaurar pestaña guardada o usar "configuration" por defecto
  const chatbotId = getChatbotIdFromUrl();
  const savedTab = chatbotId ? localStorage.getItem(`velvz_config_tab_${chatbotId}`) : null;

  // Prioridad: URL > localStorage > default
  const initialTab = urlSection || savedTab || "configuration";

  // Activar la pestaña correcta visualmente
  tabs.forEach((t) => t.classList.remove("velvz-config__tab--active"));
  const activeTabElement = document.querySelector(`.velvz-config__tab[data-tab="${initialTab}"]`);
  if (activeTabElement) {
    activeTabElement.classList.add("velvz-config__tab--active");
  }

  showTabContent(initialTab);

  console.log("✅ Pestañas configuradas");
}

// Función para mostrar contenido según la pestaña
function showTabContent(tabName) {
  console.log(`🔄 Mostrando contenido de: ${tabName}`);

  // Obtener todas las secciones
  const allSections = document.querySelectorAll(".velvz-config__section");

  // Ocultar todas las secciones primero
  allSections.forEach((section) => {
    section.style.display = "none";
  });

  // Mostrar solo las secciones que coincidan con la pestaña seleccionada
  const targetSections = document.querySelectorAll(
    `.velvz-config__section[data-tab="${tabName}"]`
  );
  targetSections.forEach((section) => {
    // Usar flex para secciones con cfg-section, block para las demás
    if (section.classList.contains("cfg-section")) {
      section.style.display = "flex";
    } else {
      section.style.display = "block";
    }
  });

  // Reiniciar animaciones de los paneles de configuración cuando se muestra la pestaña
  if (tabName === "configuration") {
    const cfgPanels = document.querySelectorAll(".cfg-panel");
    cfgPanels.forEach((panel) => {
      // Forzar reinicio de animación removiendo y re-agregando la clase
      panel.style.animation = "none";
      panel.offsetHeight; // Forzar reflow
      panel.style.animation = "";
    });
  }

  // Si no hay secciones para esta pestaña, mostrar mensaje
  if (targetSections.length === 0) {
    console.log(`ℹ️ No hay contenido para la pestaña: ${tabName}`);
  }

  // 🔄 Manejar pestaña de estadísticas
  if (tabName === 'statistics') {
    console.log('📊 Pestaña de estadísticas seleccionada, cargando datos...');
    if (typeof loadRealStatistics === 'function') {
      loadRealStatistics(true);
    }
    // Iniciar auto-refresh
    if (typeof startStatsAutoRefresh === 'function') {
      startStatsAutoRefresh();
    }
  } else {
    // Detener auto-refresh cuando se sale de estadísticas
    if (typeof stopStatsAutoRefresh === 'function') {
      stopStatsAutoRefresh();
    }
  }
}

// =====================================================
// VISTA PREVIA MEJORADA - CARGA WIDGET REAL DEL BACKEND
// =====================================================

// Estado del preview modal
let previewWidgetLoaded = false;

function handlePreview() {
  console.log("👁️ Mostrando vista previa del chatbot");

  // Feedback táctil en móvil
  if (navigator.vibrate) {
    navigator.vibrate(30);
  }

  // Obtener el chatbot ID actual
  const chatbotId = window.currentChatbotId || getChatbotIdFromUrl();

  if (!chatbotId) {
    showError("No se pudo obtener el ID del chatbot");
    return;
  }

  // Abrir el modal de preview
  openPreviewModal(chatbotId);
}

function getChatbotIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

function openPreviewModal(chatbotId) {
  const modal = document.getElementById('velvzPreviewModal');
  if (!modal) {
    console.error("Modal de preview no encontrado");
    return;
  }

  // Mostrar modal
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  // Actualizar info del chatbot en el sidebar
  updatePreviewChatbotInfo();

  // Cargar el widget REAL desde el backend
  loadRealWidget(chatbotId);

  // Configurar event listeners del modal
  setupPreviewModalListeners(modal, chatbotId);

  // Restaurar URL guardada del preview
  restoreSavedPreviewUrl(chatbotId);

  console.log("✅ Modal de preview abierto para chatbot:", chatbotId);
}

/**
 * Restaura la URL guardada del preview y la carga automáticamente
 */
function restoreSavedPreviewUrl(chatbotId) {
  const savedUrl = localStorage.getItem(`velvz_preview_url_${chatbotId}`);
  const domainInput = document.getElementById('previewDomainInput');

  if (savedUrl && domainInput) {
    domainInput.value = savedUrl;
    // Cargar automáticamente la URL guardada
    setTimeout(() => {
      const loadBtn = document.getElementById('loadDomainBtn');
      if (loadBtn) {
        loadBtn.click();
      }
    }, 100);
    console.log("🔗 URL de preview restaurada:", savedUrl);
  }
}

/**
 * Actualiza la información del chatbot en el sidebar del preview
 */
function updatePreviewChatbotInfo() {
  const chatbotInfo = document.getElementById('previewChatbotInfo');
  if (!chatbotInfo) return;

  const name = currentChatbot?.name || 'Mi Chatbot';
  chatbotInfo.innerHTML = `
    <span class="velvz-preview-modal__chatbot-name">${name}</span>
  `;
}

/**
 * Carga el widget real del chatbot desde el backend
 * Esto asegura que el widget tenga la personalización configurada
 */
function loadRealWidget(chatbotId) {
  const widgetContainer = document.getElementById('previewWidgetContainer');
  if (!widgetContainer) return;

  // Limpiar cualquier widget previo
  widgetContainer.innerHTML = '';

  // Eliminar scripts de widget previos
  const oldScripts = document.querySelectorAll('script[data-velvz-preview]');
  oldScripts.forEach(s => s.remove());

  // Eliminar estilos de widget previos
  const oldStyles = document.querySelectorAll('style[data-velvz-preview]');
  oldStyles.forEach(s => s.remove());

  // Eliminar cualquier widget existente del DOM global (por si el script lo crea fuera del container)
  const existingWidgets = document.querySelectorAll('[id^="velvz-widget"], [class^="velvz-widget"]');
  existingWidgets.forEach(w => {
    if (!widgetContainer.contains(w)) {
      w.remove();
    }
  });

  console.log(`🔄 Cargando widget real para chatbot: ${chatbotId}`);

  // Crear el script que cargará el widget real desde el backend
  // Usamos ?preview=true para permitir cargar widgets de chatbots en draft
  const script = document.createElement('script');
  script.src = `${window.CHATBOT_API_BASE}/api/widget/script/${chatbotId}?preview=true`;
  script.async = true;
  script.setAttribute('data-velvz-preview', 'true');
  script.setAttribute('data-chatbot-id', chatbotId);

  // Manejadores de carga
  script.onload = () => {
    console.log("✅ Widget real cargado exitosamente");
    previewWidgetLoaded = true;

    // El widget del backend se posiciona en fixed, necesitamos ajustarlo
    // Esperamos un poco para que el widget se renderice
    setTimeout(() => {
      repositionWidgetInPreview();
    }, 500);
  };

  script.onerror = () => {
    console.error("❌ Error cargando widget del backend");
    // Mostrar mensaje de error en el container
    widgetContainer.innerHTML = `
      <div style="
        padding: 20px;
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: 12px;
        text-align: center;
        color: #ef4444;
      ">
        <i class="fas fa-exclamation-circle" style="font-size: 24px; margin-bottom: 10px; display: block;"></i>
        <p style="margin: 0; font-size: 14px;">No se pudo cargar el widget</p>
      </div>
    `;
  };

  // Añadir el script al documento
  document.body.appendChild(script);
}

/**
 * Reposiciona el widget cargado dentro del preview area
 * El widget del backend crea un elemento con id="velvz-widget-container"
 * posicionado en fixed. Necesitamos moverlo al preview container.
 */
let repositionAttempts = 0;
const MAX_REPOSITION_ATTEMPTS = 10;

function repositionWidgetInPreview() {
  const previewArea = document.getElementById('previewArea');
  const widgetContainer = document.getElementById('previewWidgetContainer');

  if (!previewArea || !widgetContainer) {
    console.log("❌ No se encontró previewArea o widgetContainer");
    return;
  }

  // El widget del backend SIEMPRE crea un elemento con id="velvz-widget-container"
  const widget = document.getElementById('velvz-widget-container');

  if (widget) {
    console.log("✅ Widget encontrado: #velvz-widget-container");
    console.log("📍 Widget parent antes:", widget.parentElement?.id || widget.parentElement?.className);

    // Obtener la posición configurada desde customizationSettings
    const position = window.getCustomizationSettings ? window.getCustomizationSettings().position : 'bottom-right';
    console.log("📍 Posición configurada:", position);

    // CRÍTICO: Eliminar o modificar la etiqueta <style> interna del widget
    // que contiene position: fixed y sobrescribe nuestros estilos
    const internalStyle = widget.querySelector('style');
    if (internalStyle) {
      // Modificar el CSS interno para usar position: absolute y permitir overflow
      let cssText = internalStyle.textContent;
      cssText = cssText.replace(/position:\s*fixed\s*;?/gi, 'position: absolute;');
      cssText = cssText.replace(/z-index:\s*\d+\s*;?/gi, 'z-index: 1000;');
      // Asegurar que el chat window pueda expandirse
      cssText = cssText.replace(/overflow:\s*hidden\s*;?/gi, 'overflow: visible;');
      internalStyle.textContent = cssText;
      console.log("🔧 Estilos internos del widget modificados (fixed → absolute, overflow → visible)");
    }

    // Verificar que no esté ya dentro del preview
    if (!widgetContainer.contains(widget)) {
      // Ajustar estilos inline - el widget container debe ocupar todo el área
      widget.style.cssText = `
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100% !important;
        height: 100% !important;
        z-index: 1000 !important;
        transform: none !important;
        overflow: visible !important;
        pointer-events: none !important;
      `;

      // Mover al container
      widgetContainer.appendChild(widget);
      console.log("✅ Widget movido al preview container");
      console.log("📍 Widget parent después:", widget.parentElement?.id || widget.parentElement?.className);

      // Asegurar que el container padre permita overflow
      widgetContainer.style.overflow = 'visible';
    }

    // Aplicar posición al botón del widget
    const button = document.getElementById('velvz-widget-button');
    if (button) {
      // Resetear estilos de posición
      button.style.top = 'auto';
      button.style.bottom = 'auto';
      button.style.left = 'auto';
      button.style.right = 'auto';
      button.style.transform = 'none';
      button.style.position = 'absolute';
      button.style.pointerEvents = 'auto'; // Asegurar que sea clicable

      // Aplicar posición según configuración
      switch (position) {
        case 'top-left':
          button.style.top = '20px';
          button.style.left = '20px';
          break;
        case 'top-center':
          button.style.top = '20px';
          button.style.left = '50%';
          button.style.transform = 'translateX(-50%)';
          break;
        case 'top-right':
          button.style.top = '20px';
          button.style.right = '20px';
          break;
        case 'center-left':
          button.style.top = '50%';
          button.style.left = '20px';
          button.style.transform = 'translateY(-50%)';
          break;
        case 'center-right':
          button.style.top = '50%';
          button.style.right = '20px';
          button.style.transform = 'translateY(-50%)';
          break;
        case 'bottom-left':
          button.style.bottom = '20px';
          button.style.left = '20px';
          break;
        case 'bottom-center':
          button.style.bottom = '20px';
          button.style.left = '50%';
          button.style.transform = 'translateX(-50%)';
          break;
        case 'bottom-right':
        default:
          button.style.bottom = '20px';
          button.style.right = '20px';
          break;
      }
      console.log("📐 Botón del widget posicionado en:", position);
    }

    // Ajustar también el chat window si existe
    const chatWindow = document.getElementById('velvz-widget-chat');
    if (chatWindow) {
      // Resetear estilos de posición
      chatWindow.style.top = 'auto';
      chatWindow.style.bottom = 'auto';
      chatWindow.style.left = 'auto';
      chatWindow.style.right = 'auto';
      chatWindow.style.transform = 'none';
      chatWindow.style.position = 'absolute';
      chatWindow.style.maxHeight = '450px';
      chatWindow.style.maxWidth = '380px';
      chatWindow.style.zIndex = '1001';
      chatWindow.style.borderRadius = '16px';
      chatWindow.style.overflow = 'hidden';
      chatWindow.style.pointerEvents = 'auto'; // Asegurar que sea interactivo

      // Aplicar posición según configuración
      switch (position) {
        case 'top-left':
          chatWindow.style.top = '90px';
          chatWindow.style.left = '20px';
          break;
        case 'top-center':
          chatWindow.style.top = '90px';
          chatWindow.style.left = '50%';
          chatWindow.style.transform = 'translateX(-50%)';
          break;
        case 'top-right':
          chatWindow.style.top = '90px';
          chatWindow.style.right = '20px';
          break;
        case 'center-left':
          chatWindow.style.top = '50%';
          chatWindow.style.left = '100px';
          chatWindow.style.transform = 'translateY(-50%)';
          break;
        case 'center-right':
          chatWindow.style.top = '50%';
          chatWindow.style.right = '100px';
          chatWindow.style.transform = 'translateY(-50%)';
          break;
        case 'bottom-left':
          chatWindow.style.bottom = '90px';
          chatWindow.style.left = '20px';
          break;
        case 'bottom-center':
          chatWindow.style.bottom = '90px';
          chatWindow.style.left = '50%';
          chatWindow.style.transform = 'translateX(-50%)';
          break;
        case 'bottom-right':
        default:
          chatWindow.style.bottom = '90px';
          chatWindow.style.right = '20px';
          break;
      }
      console.log("🔧 Chat window posicionado en:", position);
    }

    repositionAttempts = 0;
    return;
  }

  // Si no encontramos el widget, reintentar
  repositionAttempts++;
  if (repositionAttempts < MAX_REPOSITION_ATTEMPTS) {
    console.log(`⏳ Widget no encontrado aún, reintentando... (${repositionAttempts}/${MAX_REPOSITION_ATTEMPTS})`);
    setTimeout(() => {
      repositionWidgetInPreview();
    }, 500);
  } else {
    console.log("❌ No se pudo encontrar el widget después de varios intentos");
    repositionAttempts = 0;
  }
}

/**
 * Limpia el widget del preview
 */
function cleanupPreviewWidget() {
  // Eliminar scripts
  const scripts = document.querySelectorAll('script[data-velvz-preview]');
  scripts.forEach(s => s.remove());

  // Eliminar estilos
  const styles = document.querySelectorAll('style[data-velvz-preview]');
  styles.forEach(s => s.remove());

  // Eliminar el widget container del backend (id="velvz-widget-container")
  const backendWidget = document.getElementById('velvz-widget-container');
  if (backendWidget) {
    backendWidget.remove();
  }

  // Limpiar nuestro container de preview
  const widgetContainer = document.getElementById('previewWidgetContainer');
  if (widgetContainer) {
    widgetContainer.innerHTML = '';
  }

  // Resetear contador de intentos
  repositionAttempts = 0;
  previewWidgetLoaded = false;
}

function setupPreviewModalListeners(modal, chatbotId) {
  const overlay = modal.querySelector('.velvz-preview-modal__overlay');
  const closeBtn = document.getElementById('closePreviewModal');
  const closeBtnFooter = document.getElementById('closePreviewBtn');
  const resetBtn = document.getElementById('resetPreviewBtn');
  const loadDomainBtn = document.getElementById('loadDomainBtn');
  const domainInput = document.getElementById('previewDomainInput');

  // Cerrar modal
  const closeModal = () => {
    modal.style.display = 'none';
    document.body.style.overflow = '';

    // Limpiar iframe si existe
    const iframe = document.getElementById('previewDomainIframe');
    if (iframe) iframe.src = '';

    // Limpiar widget
    cleanupPreviewWidget();

    // Restaurar placeholder
    const background = document.getElementById('previewBackground');
    if (background) {
      background.style.display = 'block';
      background.innerHTML = `
        <div class="velvz-preview-modal__placeholder">
          <div class="velvz-preview-modal__placeholder-content">
            <i class="fas fa-desktop"></i>
            <p>Tu sitio web aparecerá aquí</p>
            <span>Introduce una URL a la izquierda o prueba el chatbot directamente</span>
          </div>
        </div>
      `;
    }
  };

  // Remover listeners previos para evitar duplicados
  const newOverlay = overlay?.cloneNode(true);
  const newCloseBtn = closeBtn?.cloneNode(true);
  const newCloseBtnFooter = closeBtnFooter?.cloneNode(true);
  const newResetBtn = resetBtn?.cloneNode(true);
  const newLoadDomainBtn = loadDomainBtn?.cloneNode(true);

  if (overlay && newOverlay) {
    overlay.parentNode.replaceChild(newOverlay, overlay);
    newOverlay.addEventListener('click', closeModal);
  }

  if (closeBtn && newCloseBtn) {
    closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
    newCloseBtn.addEventListener('click', closeModal);
  }

  if (closeBtnFooter && newCloseBtnFooter) {
    closeBtnFooter.parentNode.replaceChild(newCloseBtnFooter, closeBtnFooter);
    newCloseBtnFooter.addEventListener('click', closeModal);
  }

  // Cerrar con Escape
  const handleEscape = (e) => {
    if (e.key === 'Escape' && modal.style.display !== 'none') {
      closeModal();
    }
  };
  document.removeEventListener('keydown', handleEscape);
  document.addEventListener('keydown', handleEscape);

  // Reset preview
  if (resetBtn && newResetBtn) {
    resetBtn.parentNode.replaceChild(newResetBtn, resetBtn);
    newResetBtn.addEventListener('click', () => {
      // Limpiar iframe
      const iframe = document.getElementById('previewDomainIframe');
      const background = document.getElementById('previewBackground');
      if (iframe) {
        iframe.style.display = 'none';
        iframe.src = '';
      }
      if (background) {
        background.style.display = 'block';
        background.innerHTML = `
          <div class="velvz-preview-modal__placeholder">
            <div class="velvz-preview-modal__placeholder-content">
              <i class="fas fa-desktop"></i>
              <p>Tu sitio web aparecerá aquí</p>
              <span>Introduce una URL a la izquierda o prueba el chatbot directamente</span>
            </div>
          </div>
        `;
      }
      if (domainInput) domainInput.value = '';

      // Limpiar URL guardada del localStorage
      localStorage.removeItem(`velvz_preview_url_${chatbotId}`);
      console.log("🗑️ URL de preview eliminada");

      // Limpiar y recargar widget
      cleanupPreviewWidget();
      loadRealWidget(chatbotId);
    });
  }

  // Cargar dominio en iframe
  if (loadDomainBtn && newLoadDomainBtn && domainInput) {
    loadDomainBtn.parentNode.replaceChild(newLoadDomainBtn, loadDomainBtn);

    const loadDomain = () => {
      let url = domainInput.value.trim();
      if (!url) return;

      // Añadir https si no tiene protocolo
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      // Guardar URL en localStorage para persistencia
      localStorage.setItem(`velvz_preview_url_${chatbotId}`, url);
      console.log("💾 URL de preview guardada:", url);

      const iframe = document.getElementById('previewDomainIframe');
      const background = document.getElementById('previewBackground');

      if (iframe && background) {
        // Mostrar loading
        background.innerHTML = `
          <div class="velvz-preview-modal__iframe-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Cargando sitio web...</p>
          </div>
        `;
        background.style.display = 'flex';

        // Timeout para detectar si el iframe no carga (muchas webs bloquean iframes)
        let loadTimeout = setTimeout(() => {
          // Si después de 8 segundos sigue el loading, probablemente está bloqueado
          if (background.style.display !== 'none') {
            showIframeBlockedError(background, iframe, url);
          }
        }, 8000);

        iframe.src = url;
        iframe.style.display = 'block';

        iframe.onload = () => {
          clearTimeout(loadTimeout);

          // Verificar si realmente cargó contenido (algunas webs cargan pero muestran error)
          try {
            // Intentar acceder al contenido del iframe para ver si funcionó
            // Esto lanzará error si hay restricciones CORS, pero al menos el iframe cargó algo
            background.style.display = 'none';
            console.log("✅ Sitio web cargado en iframe");
          } catch (e) {
            // El iframe cargó pero puede estar vacío o bloqueado
            background.style.display = 'none';
            console.log("⚠️ Iframe cargó pero puede tener restricciones");
          }
        };

        iframe.onerror = () => {
          clearTimeout(loadTimeout);
          showIframeBlockedError(background, iframe, url);
        };
      }
    };

    newLoadDomainBtn.addEventListener('click', loadDomain);

    // También para el input
    domainInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') loadDomain();
    });
  }
}

/**
 * Muestra error cuando un iframe no puede cargar por restricciones de seguridad
 */
function showIframeBlockedError(background, iframe, url) {
  background.innerHTML = `
    <div class="velvz-preview-modal__error">
      <i class="fas fa-shield-alt"></i>
      <p>Este sitio no permite previsualizaciones</p>
      <span>
        <strong>${new URL(url).hostname}</strong> tiene restricciones de seguridad (X-Frame-Options o CSP) que impiden mostrarlo en un iframe.
        <br><br>
        Esto es común en sitios como Apple, Google, Facebook, etc.
        <br><br>
        <em>Puedes seguir probando tu chatbot aquí sobre el fondo gris.</em>
      </span>
    </div>
  `;
  background.style.display = 'flex';
  iframe.style.display = 'none';
  console.log("⚠️ Sitio web bloqueado por X-Frame-Options/CSP:", url);
}

// =====================================================
// UTILIDADES
// =====================================================

function formatFileSize(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

// =====================================================
// ESTADOS DE UI
// =====================================================

function showLoading(message = "Cargando...") {
  console.log(`⏳ ${message}`);

  // Buscar overlay existente o crear uno simple
  let overlay = document.querySelector(".velvz-loading-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "velvz-loading-overlay";
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      color: white;
      font-family: Inter, sans-serif;
    `;
    overlay.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 2rem; margin-bottom: 1rem;">⏳</div>
        <div class="loading-text">${message}</div>
      </div>
    `;
    document.body.appendChild(overlay);
  } else {
    overlay.style.display = "flex";
    const text = overlay.querySelector(".loading-text");
    if (text) text.textContent = message;
  }
}

function hideLoading() {
  const overlay = document.querySelector(".velvz-loading-overlay");
  if (overlay) {
    overlay.style.display = "none";
  }
}

function showError(message) {
  console.error(`Error: ${message}`);
  if (window.VelvzNotify) {
    VelvzNotify.error(message);
  }
}

function showSuccess(message) {
  console.log(`Success: ${message}`);
  if (window.VelvzNotify) {
    VelvzNotify.success(message);
  }
}

function showInfo(message) {
  console.log(`Info: ${message}`);
  if (window.VelvzNotify) {
    VelvzNotify.info(message);
  }
}

// =====================================================
// ACTUALIZAR ESTADO DE BOTONES
// =====================================================

function updateButtonsLoadingState(loading) {
  // Botones desktop
  const saveBtn = document.getElementById("saveChangesBtn");
  const previewBtn = document.getElementById("previewBtn");

  // Botones móvil
  const saveBtnMobile = document.getElementById("saveChangesBtnMobile");
  const previewBtnMobile = document.getElementById("previewBtnMobile");

  // Botón footer
  const saveFooterBtn = document.getElementById("saveChangesFooterBtn");

  // Array con todos los botones de guardar
  const saveButtons = [saveBtn, saveBtnMobile, saveFooterBtn].filter(Boolean);
  const previewButtons = [previewBtn, previewBtnMobile].filter(Boolean);

  // Actualizar botones de guardar
  saveButtons.forEach((btn) => {
    if (loading) {
      btn.classList.add("velvz-btn-header--loading", "velvz-icon-btn--loading");
      btn.disabled = true;
      const icon = btn.querySelector("i");
      if (icon) {
        icon.className = "fas fa-spinner";
      }
    } else {
      btn.classList.remove(
        "velvz-btn-header--loading",
        "velvz-icon-btn--loading"
      );
      btn.disabled = false;
      const icon = btn.querySelector("i");
      if (icon) {
        icon.className = "fas fa-save";
      }
    }
  });

  // Deshabilitar botones de preview durante carga
  previewButtons.forEach((btn) => {
    btn.disabled = loading;
    if (loading) {
      btn.style.opacity = "0.5";
    } else {
      btn.style.opacity = "1";
    }
  });
}

function updateSaveButton() {
  // Botones desktop
  const saveBtn = document.getElementById("saveChangesBtn");

  // Botones móvil
  const saveBtnMobile = document.getElementById("saveChangesBtnMobile");

  // Botón footer
  const saveFooterBtn = document.getElementById("saveChangesFooterBtn");

  // Array con todos los botones de guardar
  const allSaveButtons = [saveBtn, saveBtnMobile, saveFooterBtn].filter(
    Boolean
  );

  allSaveButtons.forEach((btn) => {
    if (btn) {
      if (hasUnsavedChanges) {
        btn.classList.add("velvz-btn--highlight");
        btn.disabled = false;
      } else {
        btn.classList.remove("velvz-btn--highlight");
        btn.disabled = false;
      }
    }
  });

  console.log(
    `📱 ${allSaveButtons.length} botones actualizados - Cambios: ${hasUnsavedChanges}`
  );
}

// =====================================================
// NUEVAS FUNCIONES DE UI PARA ESTADO OPENAI
// =====================================================

function updateOpenAIStatus(status) {
  const statusIndicator = document.getElementById("openaiSyncStatus");
  if (!statusIndicator) return;

  // Limpiar clases previas
  statusIndicator.className = "velvz-openai-status";

  switch (status) {
    case "synced":
      statusIndicator.classList.add("velvz-openai-status--synced");
      statusIndicator.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>Sincronizado con OpenAI</span>
      `;
      break;

    case "error":
      statusIndicator.classList.add("velvz-openai-status--error");
      statusIndicator.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>Error sincronización OpenAI</span>
      `;
      break;

    case "syncing":
      statusIndicator.classList.add("velvz-openai-status--syncing");
      statusIndicator.innerHTML = `
        <i class="fas fa-sync-alt fa-spin"></i>
        <span>Sincronizando...</span>
      `;
      break;

    default:
      statusIndicator.classList.add("velvz-openai-status--unknown");
      statusIndicator.innerHTML = `
        <i class="fas fa-question-circle"></i>
        <span>Estado desconocido</span>
      `;
  }
}

function triggerSuccessAnimation() {
  // Añadir clase de animación de éxito a elementos clave
  const saveButtons = document.querySelectorAll('[id*="saveChanges"]');
  saveButtons.forEach((btn) => {
    btn.classList.add("velvz-btn--success-pulse");
    setTimeout(() => {
      btn.classList.remove("velvz-btn--success-pulse");
    }, 2000);
  });
}

function showWarning(message) {
  console.log(`Warning: ${message}`);
  if (window.VelvzNotify) {
    VelvzNotify.warning(message);
  }
}

// =====================================================
// NUEVAS FUNCIONES DE UI PARA ESTADO OPENAI
// =====================================================

function updateOpenAIStatus(status) {
  const statusIndicator = document.getElementById("openaiSyncStatus");
  if (!statusIndicator) return;

  // Limpiar clases previas
  statusIndicator.className = "velvz-openai-status";

  switch (status) {
    case "synced":
      statusIndicator.classList.add("velvz-openai-status--synced");
      statusIndicator.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>Sincronizado con OpenAI</span>
      `;
      break;

    case "error":
      statusIndicator.classList.add("velvz-openai-status--error");
      statusIndicator.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>Error sincronización OpenAI</span>
      `;
      break;

    case "syncing":
      statusIndicator.classList.add("velvz-openai-status--syncing");
      statusIndicator.innerHTML = `
        <i class="fas fa-sync-alt fa-spin"></i>
        <span>Sincronizando...</span>
      `;
      break;

    default:
      statusIndicator.classList.add("velvz-openai-status--unknown");
      statusIndicator.innerHTML = `
        <i class="fas fa-question-circle"></i>
        <span>Estado desconocido</span>
      `;
  }
}

function triggerSuccessAnimation() {
  // Añadir clase de animación de éxito a elementos clave
  const saveButtons = document.querySelectorAll('[id*="saveChanges"]');
  saveButtons.forEach((btn) => {
    btn.classList.add("velvz-btn--success-pulse");
    setTimeout(() => {
      btn.classList.remove("velvz-btn--success-pulse");
    }, 2000);
  });
}

function showWarning(message) {
  console.log(`Warning: ${message}`);
  if (window.VelvzNotify) {
    VelvzNotify.warning(message);
  }
}

// =====================================================
// FUNCIONALIDAD DESPLEGABLES PERSONALIZADOS
// =====================================================

function setupCustomSelects() {
  console.log("🔧 Configurando desplegables personalizados...");

  // Buscar todos los selects personalizados
  const customSelects = document.querySelectorAll(".velvz-custom-select");

  customSelects.forEach((select) => {
    setupSingleCustomSelect(select);
  });

  // Cerrar desplegables al hacer click fuera
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".velvz-custom-select")) {
      closeAllCustomSelects();
    }
  });

  console.log(`✅ ${customSelects.length} desplegables configurados`);
}

function setupSingleCustomSelect(selectElement) {
  const trigger = selectElement.querySelector(".velvz-custom-select__trigger");
  const options = selectElement.querySelector(".velvz-custom-select__options");
  const optionItems = selectElement.querySelectorAll(
    ".velvz-custom-select__option"
  );

  if (!trigger || !options) return;

  // Click en el trigger para abrir/cerrar
  trigger.addEventListener("click", (e) => {
    e.stopPropagation();

    // 🔧 FIX: Verificar estado ANTES de cerrar otros
    const isCurrentlyOpen = selectElement.classList.contains(
      "velvz-custom-select--open"
    );

    // Cerrar otros desplegables
    closeAllCustomSelects();

    // 🎯 Toggle: Si estaba cerrado, abrirlo; si estaba abierto, dejarlo cerrado
    if (!isCurrentlyOpen) {
      selectElement.classList.add("velvz-custom-select--open");
    }
    // Si estaba abierto, closeAllCustomSelects() ya lo cerró
  });

  // Click en las opciones (sin cambios)
  optionItems.forEach((option) => {
    option.addEventListener("click", (e) => {
      e.stopPropagation();

      const value = option.dataset.value;
      const text = option.textContent.trim();

      // Actualizar el trigger
      const selectedText = trigger.querySelector(
        ".velvz-custom-select__selected"
      );
      if (selectedText) {
        selectedText.textContent = text;
      }

      // Marcar opción como seleccionada
      optionItems.forEach((opt) =>
        opt.classList.remove("velvz-custom-select__option--selected")
      );
      option.classList.add("velvz-custom-select__option--selected");

      // Cerrar desplegable
      selectElement.classList.remove("velvz-custom-select--open");

      // Disparar evento de cambio
      handleCustomSelectChange(selectElement, value, text);

      console.log(`🔧 Select actualizado: ${selectElement.id} = ${value}`);
    });
  });
}

function closeAllCustomSelects() {
  document.querySelectorAll(".velvz-custom-select--open").forEach((select) => {
    select.classList.remove("velvz-custom-select--open");
  });
}

function handleCustomSelectChange(selectElement, value, text) {
  // Marcar como cambiado para activar botón guardar
  markAsChanged();

  // Manejar casos específicos
  const selectId = selectElement.id;

  switch (selectId) {
    case "chatbotStatusSelect":
      console.log(`📊 Estado del chatbot cambiado a: ${value}`);
      // Actualizar estado visual si es necesario
      updateStatus(value);
      break;

    case "maxTokensSelect":
      console.log(`🎛️ Max tokens cambiado a: ${value}`);
      break;

    default:
      console.log(`🔧 Select ${selectId} cambiado a: ${value}`);
  }
}

// =====================================================
// FUNCIONES AUXILIARES PARA CUSTOM SELECTS
// =====================================================

// Función para obtener modelo seleccionado (radio buttons)
function getSelectedModel() {
  const selectedRadio = document.querySelector('input[name="aiModel"]:checked');
  return selectedRadio ? selectedRadio.value : null;
}

function getCustomSelectValue(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return null;

  // Nuevo diseño: buscar boton con clase cfg-status-btn--active o cfg-status-btn--selected
  const activeBtn = select.querySelector(".cfg-status-btn--active, .cfg-status-btn--selected");
  if (activeBtn) {
    return activeBtn.dataset.value || null;
  }

  // Nuevo diseño: buscar boton de tokens seleccionado
  const selectedTokenBtn = select.querySelector(".cfg-tokens-btn--selected");
  if (selectedTokenBtn) {
    return selectedTokenBtn.dataset.value || null;
  }

  // Diseño antiguo: buscar opcion seleccionada
  const selectedOption = select.querySelector(
    ".velvz-custom-select__option--selected"
  );
  return selectedOption ? selectedOption.dataset.value : null;
}

function setCustomSelectValue(selectId, value) {
  const select = document.getElementById(selectId);
  if (!select) return;

  // Nuevo diseño: selector con botones cfg-status-btn
  const statusBtns = select.querySelectorAll(".cfg-status-btn");
  if (statusBtns.length > 0) {
    statusBtns.forEach((btn) => {
      btn.classList.remove("cfg-status-btn--active", "cfg-status-btn--selected");
      if (btn.dataset.value === value) {
        btn.classList.add("cfg-status-btn--selected");
        // Actualizar indicador de estado en el header
        updateConfigStatusIndicator(value);
      }
    });
    console.log(`Select ${selectId} actualizado a: ${value}`);
    return;
  }

  // Nuevo diseño: selector de tokens con botones cfg-tokens-btn
  const tokensBtns = select.querySelectorAll(".cfg-tokens-btn");
  if (tokensBtns.length > 0) {
    tokensBtns.forEach((btn) => {
      btn.classList.remove("cfg-tokens-btn--selected");
      if (btn.dataset.value === String(value)) {
        btn.classList.add("cfg-tokens-btn--selected");
      }
    });
    console.log(`Tokens ${selectId} actualizado a: ${value}`);
    return;
  }

  // Diseño antiguo: custom select con opciones
  const trigger = select.querySelector(".velvz-custom-select__trigger");
  const selectedText = trigger?.querySelector(".velvz-custom-select__selected");
  const options = select.querySelectorAll(".velvz-custom-select__option");

  // Buscar la opción que coincida
  let targetOption = null;
  options.forEach((option) => {
    option.classList.remove("velvz-custom-select__option--selected");
    if (option.dataset.value === value) {
      targetOption = option;
    }
  });

  if (targetOption && selectedText) {
    targetOption.classList.add("velvz-custom-select__option--selected");
    selectedText.textContent = targetOption.textContent.trim();
    console.log(
      `Select ${selectId} programaticamente actualizado a: ${value}`
    );
  }
}

// Actualizar indicador de estado en el header del panel
function updateConfigStatusIndicator(status) {
  const indicator = document.getElementById("configStatusIndicator");
  if (!indicator) return;

  const dot = indicator.querySelector(".cfg-status-dot");
  const text = indicator.querySelector(".cfg-status-text");

  if (!dot || !text) return;

  // Limpiar clases previas
  dot.classList.remove("cfg-status-dot--active", "cfg-status-dot--inactive", "cfg-status-dot--draft");
  indicator.style.background = "";
  indicator.style.borderColor = "";

  switch (status) {
    case "active":
      dot.classList.add("cfg-status-dot--active");
      text.textContent = "Activo";
      text.style.color = "#10b981";
      indicator.style.background = "rgba(16, 185, 129, 0.1)";
      indicator.style.borderColor = "rgba(16, 185, 129, 0.2)";
      break;
    case "inactive":
      dot.classList.add("cfg-status-dot--inactive");
      text.textContent = "Inactivo";
      text.style.color = "#6b7280";
      indicator.style.background = "rgba(107, 114, 128, 0.1)";
      indicator.style.borderColor = "rgba(107, 114, 128, 0.2)";
      break;
    case "draft":
      dot.classList.add("cfg-status-dot--draft");
      text.textContent = "Borrador";
      text.style.color = "#f59e0b";
      indicator.style.background = "rgba(245, 158, 11, 0.1)";
      indicator.style.borderColor = "rgba(245, 158, 11, 0.2)";
      break;
  }
}

// =====================================================
// FUNCIONES DE LOADING GLOBAL - AGREGAR A chatbot-config.js
// =====================================================

/**
 * Muestra el overlay de carga global
 * @param {string} text - Texto principal a mostrar
 * @param {string} subtitle - Subtítulo opcional
 */
function showGlobalLoading(text = "Cargando...", subtitle = "") {
  // Buscar overlay existente o crear uno nuevo
  let overlay = document.getElementById("globalLoadingOverlay");

  if (!overlay) {
    // Crear el overlay si no existe
    overlay = document.createElement("div");
    overlay.id = "globalLoadingOverlay";
    overlay.className = "velvz-loading-overlay";
    overlay.innerHTML = `
      <div class="velvz-loading-overlay__spinner"></div>
      <div class="velvz-loading-overlay__text" id="loadingText">${text}</div>
      <div class="velvz-loading-overlay__subtitle" id="loadingSubtitle">${subtitle}</div>
    `;
    document.body.appendChild(overlay);

    // Agregar estilos si no existen
    if (!document.getElementById("loading-overlay-styles")) {
      const styles = document.createElement("style");
      styles.id = "loading-overlay-styles";
      styles.innerHTML = `
        .velvz-loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 15, 35, 0.95);
          backdrop-filter: blur(8px);
          z-index: 10000;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }
        
        .velvz-loading-overlay--show {
          opacity: 1;
          visibility: visible;
        }
        
        .velvz-loading-overlay__spinner {
          width: 60px;
          height: 60px;
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .velvz-loading-overlay__text {
          color: #fff;
          font-size: 1.1rem;
          font-weight: 500;
          text-align: center;
          max-width: 300px;
          line-height: 1.5;
        }
        
        .velvz-loading-overlay__subtitle {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
          text-align: center;
          max-width: 400px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(styles);
    }
  } else {
    // Actualizar textos si el overlay ya existe
    const textEl = document.getElementById("loadingText");
    const subtitleEl = document.getElementById("loadingSubtitle");
    if (textEl) textEl.textContent = text;
    if (subtitleEl) subtitleEl.textContent = subtitle;
  }

  // Mostrar el overlay
  setTimeout(() => {
    overlay.classList.add("velvz-loading-overlay--show");
    document.body.style.overflow = "hidden";
  }, 10);
}

/**
 * Actualiza el texto del overlay de carga
 * @param {string} text - Nuevo texto principal
 * @param {string} subtitle - Nuevo subtítulo
 */
function updateGlobalLoading(text, subtitle = "") {
  const textEl = document.getElementById("loadingText");
  const subtitleEl = document.getElementById("loadingSubtitle");

  if (textEl) textEl.textContent = text;
  if (subtitleEl) subtitleEl.textContent = subtitle;
}

/**
 * Oculta el overlay de carga global
 */
function hideGlobalLoading() {
  const overlay = document.getElementById("globalLoadingOverlay");

  if (overlay) {
    overlay.classList.remove("velvz-loading-overlay--show");
    document.body.style.overflow = "";

    // Remover el overlay después de la animación
    setTimeout(() => {
      if (
        overlay &&
        !overlay.classList.contains("velvz-loading-overlay--show")
      ) {
        overlay.remove();
      }
    }, 300);
  }
}

// showError ya está definida arriba, usamos VelvzNotify

// Hacer las funciones disponibles globalmente
window.showGlobalLoading = showGlobalLoading;
window.updateGlobalLoading = updateGlobalLoading;
window.hideGlobalLoading = hideGlobalLoading;
window.showError = showError;

// =====================================================
// LOG FINAL
// =====================================================

console.log("✅ chatbot-config.js cargado - Esperando DOM...");

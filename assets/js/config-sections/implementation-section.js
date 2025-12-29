// =====================================================
// SECCIÓN IMPLEMENTACIÓN - GESTIÓN DOMINIOS Y WIDGET
// =====================================================

// Variables globales
let allowedDomains = [];
let hasUnsavedDomainChanges = false;
let domainEventsInitialized = false;

// =====================================================
// INICIALIZACIÓN
// =====================================================

function initImplementationSection() {
  console.log("🔧 Inicializando sección de implementación...");

  const implementationSection = document.querySelector(
    '[data-tab="implementation"]'
  );
  if (!implementationSection) {
    console.log("ℹ️ Sección de implementación no encontrada");
    return;
  }

  // Evitar inicialización múltiple
  if (domainEventsInitialized) {
    console.log("⚠️ Eventos ya inicializados, saltando...");
    return;
  }

  setupImplementationEvents();
  updateImplementationCode();
  loadExistingDomains();
  domainEventsInitialized = true;

  console.log("✅ Sección de implementación inicializada");
}

// =====================================================
// CONFIGURACIÓN DE EVENTOS
// =====================================================

function setupImplementationEvents() {
  // Botón copiar código
  const copyBtn = document.getElementById("copyImplementationCode");
  if (copyBtn) {
    copyBtn.removeEventListener("click", copyImplementationCode); // Remover listener anterior
    copyBtn.addEventListener("click", copyImplementationCode);
    console.log("✅ Botón copiar configurado");
  }

  // Botón añadir dominio
  const addDomainBtn = document.getElementById("addDomainBtn");
  if (addDomainBtn) {
    addDomainBtn.removeEventListener("click", handleAddDomain); // Remover listener anterior
    addDomainBtn.addEventListener("click", handleAddDomain);
    console.log("✅ Botón añadir dominio configurado");
  }

  // Enter en el input de dominio
  const domainInput = document.getElementById("domainInput");
  if (domainInput) {
    // Remover listeners anteriores
    domainInput.removeEventListener("keypress", handleDomainKeypress);
    domainInput.removeEventListener("input", clearDomainError);

    // Añadir nuevos listeners
    domainInput.addEventListener("keypress", handleDomainKeypress);
    domainInput.addEventListener("input", clearDomainError);
    console.log("✅ Input dominio configurado");
  }
}

function handleDomainKeypress(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    handleAddDomain();
  }
}

// =====================================================
// GESTIÓN DE CÓDIGO DE IMPLEMENTACIÓN
// =====================================================

function copyImplementationCode() {
  const codeElement = document.getElementById("implementationCode");
  if (!codeElement) return;

  const codeText = codeElement.textContent || codeElement.innerText;

  navigator.clipboard
    .writeText(codeText)
    .then(() => {
      const copyBtn = document.getElementById("copyImplementationCode");
      const originalText = copyBtn.innerHTML;

      copyBtn.innerHTML = '<i class="fas fa-check"></i> ¡Copiado!';
      copyBtn.style.background = "#10b981";

      setTimeout(() => {
        copyBtn.innerHTML = originalText;
        copyBtn.style.background = "";
      }, 2000);

      console.log("✅ Código copiado al portapapeles");
    })
    .catch((err) => {
      console.error("❌ Error copiando código:", err);
    });
}

function updateImplementationCode() {
  const codeElement = document.getElementById("implementationCode");
  if (!codeElement) return;

  // Obtener ID del chatbot actual
  const chatbotId =
    new URLSearchParams(window.location.search).get("id") || "CHATBOT_ID";

  // ACTUALIZADO: Usar la URL del backend que genera el widget personalizado
  const code = `<script
  src="https://velvz-unified-backend-production.up.railway.app/api/widget/script/${chatbotId}"
  async
></script>`;

  codeElement.textContent = code;
  console.log("✅ Código de implementación actualizado con widget estático");
}

// =====================================================
// GESTIÓN DE DOMINIOS
// =====================================================

function handleAddDomain() {
  const domainInput = document.getElementById("domainInput");
  if (!domainInput) {
    console.warn("⚠️ Input de dominio no encontrado");
    return;
  }

  const domain = domainInput.value.trim();

  console.log("🌐 Intentando añadir dominio:", domain);

  if (!domain) {
    showDomainError("Por favor, introduce un dominio");
    return;
  }

  // Validación de formato
  if (!isValidDomain(domain)) {
    showDomainError(
      "Formato de dominio inválido. Ej: midominio.com o *.midominio.com"
    );
    return;
  }

  // Verificar si ya existe
  if (allowedDomains.includes(domain)) {
    showDomainError("Este dominio ya está en la lista");
    return;
  }

  // Añadir dominio
  allowedDomains.push(domain);
  domainInput.value = "";
  hasUnsavedDomainChanges = true;

  updateDomainsDisplay();
  markAsChangedIfAvailable();

  console.log("✅ Dominio añadido:", domain);
  console.log("📋 Lista actual:", allowedDomains);
}

function removeDomain(domain) {
  console.log("🗑️ Eliminando dominio:", domain);

  const index = allowedDomains.indexOf(domain);
  if (index > -1) {
    allowedDomains.splice(index, 1);
    hasUnsavedDomainChanges = true;

    updateDomainsDisplay();
    markAsChangedIfAvailable();

    console.log("✅ Dominio eliminado:", domain);
    console.log("📋 Lista actualizada:", allowedDomains);
  }
}

function isValidDomain(domain) {
  // Permitir wildcards
  if (domain.startsWith("*.")) {
    domain = domain.substring(2);
  }

  // Validar que no esté vacío después de quitar wildcard
  if (!domain) return false;

  // Validación básica de dominio
  const domainRegex =
    /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/;
  return domainRegex.test(domain);
}

// =====================================================
// VALIDACIÓN Y FEEDBACK VISUAL
// =====================================================

function showDomainError(message) {
  const domainInput = document.getElementById("domainInput");
  if (!domainInput) return;

  console.warn("⚠️ Error de dominio:", message);

  domainInput.style.borderColor = "#ef4444";
  domainInput.style.boxShadow = "0 0 0 3px rgba(239, 68, 68, 0.1)";

  // Remover tooltip anterior si existe
  const existingTooltip = document.getElementById("domainErrorTooltip");
  if (existingTooltip) {
    existingTooltip.remove();
  }

  // Crear nuevo tooltip
  const tooltip = document.createElement("div");
  tooltip.id = "domainErrorTooltip";
  tooltip.style.cssText = `
    position: absolute;
    background: #ef4444;
    color: white;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    font-size: 0.8rem;
    z-index: 1000;
    margin-top: 0.5rem;
    animation: fadeIn 0.2s ease;
    max-width: 300px;
  `;

  tooltip.textContent = message;

  // Asegurar que el contenedor padre tenga position relative
  const parent = domainInput.parentElement;
  if (parent) {
    parent.style.position = "relative";
    parent.appendChild(tooltip);
  }

  // Auto-remover después de 4 segundos
  setTimeout(() => {
    clearDomainError();
  }, 4000);
}

function clearDomainError() {
  const domainInput = document.getElementById("domainInput");
  const tooltip = document.getElementById("domainErrorTooltip");

  if (domainInput) {
    domainInput.style.borderColor = "";
    domainInput.style.boxShadow = "";
  }

  if (tooltip) {
    tooltip.remove();
  }
}

// =====================================================
// ACTUALIZACIÓN DE INTERFAZ
// =====================================================

function updateDomainsDisplay() {
  const domainsList = document.getElementById("domainsList");
  if (!domainsList) {
    console.warn("⚠️ Lista de dominios no encontrada");
    return;
  }

  console.log("🔄 Actualizando lista de dominios:", allowedDomains.length);

  // Limpiar lista
  domainsList.innerHTML = "";

  if (allowedDomains.length === 0) {
    // Mostrar estado vacío (requerido)
    const emptyState = createRequiredEmptyState();
    domainsList.appendChild(emptyState);
    domainsList.classList.add("velvz-domains-list--empty");
  } else {
    // Mostrar dominios
    domainsList.classList.remove("velvz-domains-list--empty");
    allowedDomains.forEach((domain, index) => {
      const domainElement = createDomainElement(domain, index);
      domainsList.appendChild(domainElement);
    });
  }
}

function createRequiredEmptyState() {
  const emptyState = document.createElement("div");
  emptyState.className =
    "velvz-domains-list__empty velvz-domains-list__empty--required";
  emptyState.id = "domainsEmpty";
  emptyState.innerHTML = `
    <i class="fas fa-exclamation-triangle"></i>
    <p>⚠️ Debes añadir al menos un dominio</p>
    <small>Por seguridad, es obligatorio especificar dominios permitidos</small>
  `;
  return emptyState;
}

function createDomainElement(domain, index) {
  const domainItem = document.createElement("div");
  domainItem.className = "velvz-domain-item";
  domainItem.dataset.domain = domain;

  domainItem.innerHTML = `
    <div class="velvz-domain-item__info">
      <i class="fas fa-globe velvz-domain-item__icon"></i>
      <span class="velvz-domain-item__url">${escapeHtml(domain)}</span>
    </div>
    <button type="button" class="velvz-domain-item__remove" data-domain="${escapeHtml(
      domain
    )}">
      <i class="fas fa-times"></i>
    </button>
  `;

  // Añadir evento al botón de eliminar
  const removeBtn = domainItem.querySelector(".velvz-domain-item__remove");
  if (removeBtn) {
    removeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const domainToRemove = e.currentTarget.dataset.domain;
      removeDomain(domainToRemove);
    });
  }

  return domainItem;
}

// =====================================================
// CARGA Y GUARDADO
// =====================================================

function loadExistingDomains() {
  const chatbotId = new URLSearchParams(window.location.search).get("id");
  if (chatbotId && window.dashboardAPI) {
    console.log("🔄 Cargando dominios desde backend...");
    loadDomainsFromBackend(chatbotId);
  } else {
    console.log("ℹ️ No hay chatbot ID o API disponible, usando datos locales");
    updateDomainsDisplay();
  }
}

async function loadDomainsFromBackend(chatbotId) {
  try {
    console.log(
      `🔄 Cargando dominios desde backend para chatbot: ${chatbotId}`
    );

    if (!window.dashboardAPI) {
      console.warn("⚠️ Dashboard API no disponible");
      return;
    }

    try {
      const response = await window.dashboardAPI.getChatbot(chatbotId);
      console.log("📦 Respuesta completa del chatbot:", response);

      // FIX: La respuesta viene en data.chatbot, no en data directamente
      const chatbotData = response.data?.chatbot || response.data;

      if (response.success && chatbotData) {
        // Debug para ver exactamente qué viene
        console.log("🔍 Datos del chatbot:", chatbotData);
        console.log("🔍 Campo allowed_domains:", chatbotData.allowed_domains);

        // Cargar dominios existentes
        allowedDomains = chatbotData.allowed_domains || [];

        console.log(`✅ Dominios encontrados:`, allowedDomains);
        updateDomainsDisplay();
        updateImplementationCode();
        console.log(`✅ ${allowedDomains.length} dominios cargados`);
      } else {
        console.warn("⚠️ No se encontró el chatbot en la respuesta");
        allowedDomains = [];
        updateDomainsDisplay();
      }
    } catch (error) {
      console.error("❌ Error obteniendo chatbot:", error);
      allowedDomains = [];
      updateDomainsDisplay();
    }
  } catch (error) {
    console.error("❌ Error cargando dominios:", error);
    allowedDomains = [];
    updateDomainsDisplay();
  }
}

async function saveDomains() {
  const chatbotId = new URLSearchParams(window.location.search).get("id");
  if (!chatbotId || !window.dashboardAPI) {
    console.warn("⚠️ No se puede guardar - falta chatbot ID o API");
    return true;
  }

  try {
    console.log(
      `💾 Guardando ${allowedDomains.length} dominios para chatbot: ${chatbotId}`
    );
    console.log("📋 Dominios a guardar:", allowedDomains);

    // Usar la ruta específica de dominios PUT /api/chatbots/:id/domains
    const response = await window.dashboardAPI.put(
      `/api/chatbots/${chatbotId}/domains`,
      {
        allowed_domains: allowedDomains,
        security_level: "strict",
      }
    );

    if (response.success) {
      hasUnsavedDomainChanges = false;
      console.log("✅ Dominios guardados exitosamente:", response.data);

      // Actualizar con los dominios confirmados del servidor
      if (response.data && response.data.allowed_domains) {
        allowedDomains = response.data.allowed_domains;
        updateDomainsDisplay();
      }

      return true;
    } else {
      throw new Error(response.message || "Error guardando dominios");
    }
  } catch (error) {
    console.error("❌ Error guardando dominios:", error);
    if (typeof showError === "function") {
      showError("Error guardando configuración de dominios: " + error.message);
    }
    return false;
  }
}

// =====================================================
// VALIDACIÓN ANTES DE GUARDAR
// =====================================================

function validateDomainsBeforeSave() {
  if (allowedDomains.length === 0) {
    if (typeof showError === "function") {
      showError("Debes añadir al menos un dominio antes de guardar");
    }

    // Cambiar a la pestaña de implementación
    const implementationTab = document.querySelector(
      '[data-tab="implementation"]'
    );
    if (implementationTab) {
      implementationTab.click();
    }

    return false;
  }
  return true;
}

// =====================================================
// UTILIDADES
// =====================================================

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function markAsChangedIfAvailable() {
  if (typeof markAsChanged === "function") {
    markAsChanged();
  }
}

// =====================================================
// FUNCIONES GLOBALES PARA INTEGRACIÓN
// =====================================================

window.removeDomain = removeDomain;
window.validateDomainsBeforeSave = validateDomainsBeforeSave;
window.saveDomains = saveDomains;
window.loadImplementationData = loadDomainsFromBackend;
window.saveImplementationData = saveDomains;

// =====================================================
// AUTO-INICIALIZACIÓN
// =====================================================

document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    initImplementationSection();
  }, 1000);
});

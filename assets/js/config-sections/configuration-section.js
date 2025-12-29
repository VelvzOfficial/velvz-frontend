// =====================================================
// CONFIGURACIÓN BÁSICA DEL CHATBOT
// =====================================================

// =====================================================
// MANEJO DE CAMBIOS
// =====================================================

function markAsChanged() {
  // Asegurar que hasUnsavedChanges existe
  if (typeof hasUnsavedChanges === 'undefined') {
    window.hasUnsavedChanges = false;
    try {
      hasUnsavedChanges = false;
    } catch(e) {}
  }

  // Usar window.hasUnsavedChanges para garantizar acceso
  if (!window.hasUnsavedChanges) {
    window.hasUnsavedChanges = true;
    if (typeof hasUnsavedChanges !== 'undefined') {
      hasUnsavedChanges = true;
    }

    if (typeof updateSaveButton === 'function') {
      updateSaveButton();
    }

    showUnsavedChangesWarning();
  }
}

// Exponer funciones globalmente
window.markAsChanged = markAsChanged;
window.showUnsavedChangesWarning = showUnsavedChangesWarning;
window.hideUnsavedChangesWarning = hideUnsavedChangesWarning;

function showUnsavedChangesWarning() {
  // Verificar que el DOM esté listo
  if (!document.body) {
    setTimeout(showUnsavedChangesWarning, 100);
    return;
  }

  // Crear o actualizar el indicador de cambios sin guardar
  let warningBar = document.getElementById("unsavedChangesWarning");

  if (!warningBar) {
    warningBar = document.createElement("div");
    warningBar.id = "unsavedChangesWarning";
    warningBar.className = "unsaved-changes-warning";
    warningBar.innerHTML = `
      <div class="unsaved-warning__main">
        <i class="fas fa-circle" style="font-size: 8px; color: #f59e0b;"></i>
        <span>Cambios sin guardar</span>
      </div>
      <div class="unsaved-warning__actions">
        <button type="button" class="unsaved-warning__btn unsaved-warning__btn--discard" id="discardChangesBtn">
          <i class="fas fa-times"></i>
          Descartar
        </button>
        <button type="button" class="unsaved-warning__btn unsaved-warning__btn--save" id="saveChangesQuickBtn">
          <i class="fas fa-save"></i>
          Guardar
        </button>
      </div>
    `;
    warningBar.style.cssText = `
      position: fixed !important;
      bottom: 20px !important;
      right: 20px !important;
      background: rgba(30, 41, 59, 0.98) !important;
      color: #e2e8f0 !important;
      padding: 12px 18px !important;
      border-radius: 10px !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 0px !important;
      z-index: 999999 !important;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4) !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      border-left: 4px solid #f59e0b !important;
      pointer-events: auto !important;
      opacity: 1 !important;
      visibility: visible !important;
      cursor: pointer !important;
      transition: all 0.25s ease !important;
      overflow: hidden !important;
    `;

    // Añadir estilos de animación y hover
    if (!document.getElementById("unsavedChangesStyles")) {
      const style = document.createElement("style");
      style.id = "unsavedChangesStyles";
      style.textContent = `
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        #unsavedChangesWarning {
          animation: slideUp 0.3s ease forwards !important;
        }
        #unsavedChangesWarning .unsaved-warning__main {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        #unsavedChangesWarning .unsaved-warning__actions {
          display: flex;
          gap: 8px;
          margin-top: 0;
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          transition: all 0.25s ease;
        }
        #unsavedChangesWarning:hover .unsaved-warning__actions {
          max-height: 50px;
          opacity: 1;
          margin-top: 12px;
        }
        #unsavedChangesWarning .unsaved-warning__btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          flex: 1;
          justify-content: center;
        }
        #unsavedChangesWarning .unsaved-warning__btn--discard {
          background: rgba(255, 255, 255, 0.1);
          color: #e2e8f0;
        }
        #unsavedChangesWarning .unsaved-warning__btn--discard:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
        }
        #unsavedChangesWarning .unsaved-warning__btn--save {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }
        #unsavedChangesWarning .unsaved-warning__btn--save:hover {
          background: linear-gradient(135deg, #059669, #047857);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(warningBar);

    // Event listeners para los botones
    const discardBtn = warningBar.querySelector("#discardChangesBtn");
    const saveBtn = warningBar.querySelector("#saveChangesQuickBtn");

    if (discardBtn) {
      discardBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        discardUnsavedChanges();
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (typeof handleSave === "function") {
          handleSave();
        }
      });
    }
  }

  // Forzar visibilidad
  warningBar.style.display = "flex";
  warningBar.style.visibility = "visible";
  warningBar.style.opacity = "1";
}

async function discardUnsavedChanges() {
  // Usar modal personalizado en lugar de confirm() nativo
  const confirmDiscard = await window.velvzModal.confirm({
    title: 'Descartar cambios',
    message: '¿Estás seguro de que quieres descartar los cambios sin guardar? Esta acción no se puede deshacer.',
    confirmText: 'Descartar',
    cancelText: 'Volver',
    type: 'warning'
  });

  if (confirmDiscard) {
    window.location.reload();
  }
}

function hideUnsavedChangesWarning() {
  const warningBar = document.getElementById("unsavedChangesWarning");
  if (warningBar) {
    warningBar.style.display = "none";
  }
}

function updateSaveButton() {
  const saveBtn = document.getElementById("saveChangesBtn");
  const saveFooterBtn = document.getElementById("saveChangesFooterBtn");

  [saveBtn, saveFooterBtn].forEach((btn) => {
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
}

// =====================================================
// GUARDAR CAMBIOS - VERSIÓN MEJORADA
// =====================================================

async function handleSave() {
  if (isLoading) return;

  try {
    isLoading = true;

    // Actualizar estado visual de los botones
    updateButtonsLoadingState(true);
    showLoading("Guardando cambios y sincronizando con OpenAI...");

    const formData = collectFormData();
    const chatbotId = getChatbotIdFromUrl();

    const response = await window.dashboardAPI.updateChatbot(
      chatbotId,
      formData
    );

    // Guardar configuración de dominios
    if (window.saveImplementationData) {
      const domainsSaved = await window.saveImplementationData(chatbotId);
      if (!domainsSaved) {
        console.warn("⚠️ Error guardando dominios, pero continuando...");
      }
    }

    // Guardar configuración de personalización
    if (window.saveCustomizationSettings) {
      try {
        await window.saveCustomizationSettings();
      } catch (error) {
        console.error("Error guardando personalización:", error);
      }
    }

    // =====================================================
    // EJECUTAR ELIMINACIONES PENDIENTES DE DOCUMENTOS
    // =====================================================
    if (window.hasPendingDeletions && window.hasPendingDeletions()) {
      const pendingCount = window.getPendingDeletions().length;
      console.log("🗑️ Ejecutando eliminaciones pendientes de documentos...");

      // Actualizar mensaje de loading para informar al usuario
      showLoading(`Eliminando ${pendingCount} documento${pendingCount > 1 ? 's' : ''}...`);

      try {
        const deletionResult = await window.executePendingDeletions();
        if (deletionResult.deleted > 0) {
          console.log(`✅ ${deletionResult.deleted} documento(s) eliminado(s)`);
        }
        if (deletionResult.errors && deletionResult.errors.length > 0) {
          console.warn(`⚠️ ${deletionResult.errors.length} documento(s) no se pudieron eliminar`);
        }
      } catch (error) {
        console.error("Error ejecutando eliminaciones pendientes:", error);
      }
    }

    if (response.success) {
      currentChatbot = { ...currentChatbot, ...formData };
      originalData = { ...currentChatbot };
      hasUnsavedChanges = false;
      updateSaveButton();
      hideUnsavedChangesWarning();

      // Solo mostrar mensaje de OpenAI si realmente hay error
      if (
        response.data &&
        response.data.openai_sync === false &&
        response.openai_error
      ) {
        showInfo("Cambios guardados. Sincronización con OpenAI pendiente.");
      } else {
        showSuccess("Cambios guardados correctamente");
      }
    } else {
      throw new Error(response.message || "Error desconocido");
    }
  } catch (error) {
    console.error("❌ Error al guardar:", error);
    showError(`Error al guardar: ${error.message}`);
  } finally {
    isLoading = false;
    hideLoading();
    updateButtonsLoadingState(false);
  }
}

// =====================================================
// RECOLECCIÓN DE DATOS DEL FORMULARIO
// =====================================================

function collectFormData() {
  const nameInput = document.getElementById("chatbotName");
  const descInput = document.getElementById("chatbotDescription");
  const instructionsInput = document.getElementById("chatbotInstructions");

  // Obtener temperatura
  const temperatureValueEl = document.getElementById("temperatureValue");
  const temperatureFromSlider = document.getElementById("temperatureSlider");

  const temperature = parseFloat(
    temperatureFromSlider?.value || temperatureValueEl?.textContent || "1.0"
  );

  // Obtener valores de desplegables
  const status =
    getCustomSelectValue("chatbotStatusSelect") ||
    currentChatbot?.status ||
    "active";

  // Obtener modelo seleccionado (radio buttons)
  const selectedModel = document.querySelector('input[name="aiModel"]:checked');
  const model =
    selectedModel?.value || currentChatbot?.model || "gpt-3.5-turbo-0125";

  // Obtener max_tokens
  const maxTokens = parseInt(
    getCustomSelectValue("maxTokensSelect") ||
      currentChatbot?.max_tokens ||
      "2000"
  );

  return {
    name: nameInput?.value?.trim() || "",
    description: descInput?.value?.trim() || "",
    instructions: instructionsInput?.value?.trim() || "",
    model: model,
    status: status,
    max_tokens: maxTokens,
    temperature: temperature,
  };
}

// =====================================================
// ACTUALIZAR INTERFAZ DEL FORMULARIO
// =====================================================

function updateConfigurationUI() {
  if (!currentChatbot) return;

  try {
    // Título y meta información
    const titleEl = document.getElementById("chatbotTitle");
    const lastUpdatedEl = document.getElementById("lastUpdated");

    if (titleEl) {
      titleEl.textContent = currentChatbot.name;
    }

    if (lastUpdatedEl && currentChatbot.updated_at) {
      const date = new Date(currentChatbot.updated_at);
      lastUpdatedEl.textContent = `Última actualización: ${date.toLocaleDateString(
        "es-ES"
      )}`;
    }

    // Campos del formulario
    const nameInput = document.getElementById("chatbotName");
    const descInput = document.getElementById("chatbotDescription");
    const instructionsInput = document.getElementById("chatbotInstructions");

    if (nameInput) nameInput.value = currentChatbot.name || "";
    if (descInput) descInput.value = currentChatbot.description || "";
    if (instructionsInput)
      instructionsInput.value = currentChatbot.instructions || "";

    // 🆕 CARGAR VALORES EN DESPLEGABLES PERSONALIZADOS
    setCustomSelectValue(
      "chatbotStatusSelect",
      currentChatbot.status || "draft"
    );

    // Cargar max_tokens si existe (valor por defecto 2000)
    const maxTokens = currentChatbot.max_tokens || 2000;
    setCustomSelectValue("maxTokensSelect", maxTokens.toString());

    // Cargar modelo seleccionado
    if (currentChatbot.model) {
      const modelRadio = document.querySelector(
        `input[name="aiModel"][value="${currentChatbot.model}"]`
      );
      if (modelRadio) {
        modelRadio.checked = true;

        // Actualizar estilos visuales - soportar todas las clases
        document.querySelectorAll(".velvz-model-option, .velvz-model-card, .cfg-model").forEach((option) => {
          option.classList.remove("velvz-model-option--selected");
          option.classList.remove("velvz-model-card--selected");
          option.classList.remove("cfg-model--selected");
        });

        const selectedOption = modelRadio.closest(".velvz-model-option") || modelRadio.closest(".velvz-model-card") || modelRadio.closest(".cfg-model");
        if (selectedOption) {
          if (selectedOption.classList.contains("cfg-model")) {
            selectedOption.classList.add("cfg-model--selected");
          } else if (selectedOption.classList.contains("velvz-model-card")) {
            selectedOption.classList.add("velvz-model-card--selected");
          } else {
            selectedOption.classList.add("velvz-model-option--selected");
          }
        }
      }
    }

    // Actualizar contadores de caracteres despues de cargar valores
    if (typeof setupCharacterCounters === "function") {
      setTimeout(setupCharacterCounters, 100);
    }

    // Cargar temperatura
    const temperatureSlider = document.getElementById("temperatureSlider");
    const temperatureValue = document.getElementById("temperatureValue");

    if (temperatureSlider && temperatureValue) {
      const temperature =
        currentChatbot.temperature != null &&
        !isNaN(currentChatbot.temperature) &&
        typeof currentChatbot.temperature === "number"
          ? currentChatbot.temperature
          : 1.0;

      temperatureSlider.value = temperature;
      temperatureValue.textContent = temperature.toFixed(1);
    }
  } catch (error) {
    console.error("Error actualizando interfaz de configuración:", error);
  }
}

// =====================================================
// VALIDACIONES DE FORMULARIO
// =====================================================

function validateFormData(data) {
  const errors = [];

  if (!data.name || data.name.length < 2) {
    errors.push("El nombre debe tener al menos 2 caracteres");
  }

  if (data.name && data.name.length > 100) {
    errors.push("El nombre no puede exceder 100 caracteres");
  }

  if (data.description && data.description.length > 500) {
    errors.push("La descripción no puede exceder 500 caracteres");
  }

  if (data.instructions && data.instructions.length > 2000) {
    errors.push("Las instrucciones no pueden exceder 2000 caracteres");
  }

  if (data.max_tokens < 100 || data.max_tokens > 4000) {
    errors.push("Max tokens debe estar entre 100 y 4000");
  }

  if (data.temperature < 0 || data.temperature > 2) {
    errors.push("La temperatura debe estar entre 0 y 2");
  }

  return errors;
}

// =====================================================
// MANEJO DE EVENTOS DEL FORMULARIO
// =====================================================

function setupConfigurationListeners() {
  // Listener para cambios en todos los campos del formulario
  const formFields = [
    "chatbotName",
    "chatbotDescription",
    "chatbotInstructions",
  ];

  formFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener("input", markAsChanged);
      field.addEventListener("change", markAsChanged);
    }
  });

  // Contadores de caracteres para textareas
  setupCharacterCounters();

  // NUEVO: Listener para botones de estado (cfg-status-btn)
  const statusBtns = document.querySelectorAll(".cfg-status-btn");
  statusBtns.forEach((btn) => {
    btn.addEventListener("click", function() {
      // Quitar seleccion de todos
      statusBtns.forEach(b => {
        b.classList.remove("cfg-status-btn--active", "cfg-status-btn--selected");
      });
      // Seleccionar este
      this.classList.add("cfg-status-btn--selected");

      // Actualizar indicador en el header
      const value = this.dataset.value;
      if (typeof updateConfigStatusIndicator === "function") {
        updateConfigStatusIndicator(value);
      }

      markAsChanged();
    });
  });

  // NUEVO: Listener para modelos (cfg-model)
  const modelCards = document.querySelectorAll(".cfg-model");
  modelCards.forEach((card) => {
    card.addEventListener("click", function() {
      const radio = this.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;

        // Actualizar estilos visuales
        modelCards.forEach(c => c.classList.remove("cfg-model--selected"));
        this.classList.add("cfg-model--selected");

        markAsChanged();
      }
    });
  });

  // Listener para radio buttons del modelo (ambos diseños)
  const modelRadios = document.querySelectorAll('input[name="aiModel"]');

  modelRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      // Actualizar estilos visuales - soportar todas las clases
      document.querySelectorAll(".velvz-model-option, .velvz-model-card, .cfg-model").forEach((option) => {
        option.classList.remove("velvz-model-option--selected");
        option.classList.remove("velvz-model-card--selected");
        option.classList.remove("cfg-model--selected");
      });

      const selectedOption = this.closest(".velvz-model-option") || this.closest(".velvz-model-card") || this.closest(".cfg-model");
      if (selectedOption) {
        if (selectedOption.classList.contains("cfg-model")) {
          selectedOption.classList.add("cfg-model--selected");
        } else if (selectedOption.classList.contains("velvz-model-card")) {
          selectedOption.classList.add("velvz-model-card--selected");
        } else {
          selectedOption.classList.add("velvz-model-option--selected");
        }
      }

      markAsChanged();
    });
  });

  // Click en tarjetas de modelo para seleccionar (diseño antiguo)
  document.querySelectorAll(".velvz-model-card").forEach((card) => {
    card.addEventListener("click", function () {
      const radio = this.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        radio.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
  });

  // Slider de temperatura
  const temperatureSlider = document.getElementById("temperatureSlider");
  const temperatureValue = document.getElementById("temperatureValue");

  if (temperatureSlider) {
    // Asegurar valor inicial correcto
    if (!temperatureSlider.value || temperatureSlider.value === "0.7") {
      temperatureSlider.value = "1.0";
      if (temperatureValue) {
        temperatureValue.textContent = "1.0";
      }
    }

    temperatureSlider.addEventListener("input", (e) => {
      const value = parseFloat(e.target.value);
      const display = document.getElementById("temperatureValue");
      if (display) {
        const safeValue = !isNaN(value) && value != null ? value : 1.0;
        display.textContent = safeValue.toFixed(1);
      }
      if (typeof markAsChanged === "function") {
        markAsChanged();
      }
    });

    temperatureSlider.addEventListener("change", () => {
      markAsChanged();
    });
  }

  // NUEVO: Listener para selector de tokens
  const tokensBtns = document.querySelectorAll(".cfg-tokens-btn");
  tokensBtns.forEach((btn) => {
    btn.addEventListener("click", function() {
      // Quitar seleccion de todos
      tokensBtns.forEach(b => b.classList.remove("cfg-tokens-btn--selected"));
      // Seleccionar este
      this.classList.add("cfg-tokens-btn--selected");
      markAsChanged();
    });
  });

  // NUEVO: Listener para toggles de configuracion avanzada
  const toggleCheckboxes = document.querySelectorAll(".cfg-toggle input[type='checkbox']");
  toggleCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", markAsChanged);
  });
}

// Configurar contadores de caracteres
function setupCharacterCounters() {
  const descriptionTextarea = document.getElementById("chatbotDescription");
  const descriptionCount = document.getElementById("descriptionCount");

  if (descriptionTextarea && descriptionCount) {
    descriptionTextarea.addEventListener("input", function() {
      descriptionCount.textContent = this.value.length;
    });
    // Valor inicial
    descriptionCount.textContent = descriptionTextarea.value.length;
  }

  const instructionsTextarea = document.getElementById("chatbotInstructions");
  const instructionsCount = document.getElementById("instructionsCount");

  if (instructionsTextarea && instructionsCount) {
    instructionsTextarea.addEventListener("input", function() {
      instructionsCount.textContent = this.value.length;
    });
    // Valor inicial
    instructionsCount.textContent = instructionsTextarea.value.length;
  }
}

// =====================================================
// INICIALIZACIÓN DE CONFIGURACIÓN
// =====================================================

function initializeConfigurationSection() {
  window.handleSave = handleSave;

  // Ejecutar inmediatamente y con fallbacks
  setupConfigurationListeners();
  setTimeout(() => setupConfigurationListeners(), 500);
  setTimeout(() => setupConfigurationListeners(), 1000);

  initDeleteChatbot();
}

// =====================================================
// FUNCIÓN HELPER PARA TEMPERATURA SEGURA
// =====================================================

function safeTemperature(temp) {
  return temp != null && !isNaN(temp) && typeof temp === "number" ? temp : 0.7;
}

// =====================================================
// ELIMINACIÓN DE CHATBOT - IMPLEMENTACIÓN NUEVA
// =====================================================

function initDeleteChatbot() {
  const checkbox = document.getElementById("confirmDeletion");
  const deleteBtn = document.getElementById("deleteChatbotBtn");

  if (!checkbox || !deleteBtn) return;

  // Estado inicial - usar clases CSS
  deleteBtn.disabled = true;
  deleteBtn.classList.remove("cfg-danger-btn--enabled");

  // Listener para el checkbox
  checkbox.addEventListener("change", function () {
    if (this.checked) {
      deleteBtn.disabled = false;
      deleteBtn.classList.add("cfg-danger-btn--enabled");
    } else {
      deleteBtn.disabled = true;
      deleteBtn.classList.remove("cfg-danger-btn--enabled");
    }
  });

  // Listener para el botón de eliminar
  deleteBtn.addEventListener("click", async function () {
    if (!this.disabled && currentChatbot) {
      showDeleteConfirmationModal();
    }
  });
}

// =====================================================
// MODAL DE CONFIRMACIÓN - CREACIÓN DINÁMICA
// =====================================================

function createDeleteModal() {
  // Verificar si ya existe
  if (document.getElementById("deleteConfirmModal")) {
    return document.getElementById("deleteConfirmModal");
  }

  // Crear estructura del modal
  const modal = document.createElement("div");
  modal.id = "deleteConfirmModal";
  modal.className = "velvz-delete-modal";
  modal.innerHTML = `
    <div class="velvz-delete-modal__backdrop"></div>
    <div class="velvz-delete-modal__container">
      <div class="velvz-delete-modal__content">
        <div class="velvz-delete-modal__header">
          <div class="velvz-delete-modal__icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h2 class="velvz-delete-modal__title">
            ¿Eliminar chatbot permanentemente?
          </h2>
          <button type="button" class="velvz-delete-modal__close" id="deleteModalClose">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="velvz-delete-modal__body">
          <div class="velvz-delete-modal__warning">
            <p class="velvz-delete-modal__chatbot-name">
              Estás a punto de eliminar: <strong id="chatbotNameToDelete"></strong>
            </p>
            <p class="velvz-delete-modal__description">
              Esta acción es <strong>permanente e irreversible</strong>. 
              Se eliminarán todos los datos, archivos, conversaciones y configuraciones asociadas.
            </p>
          </div>
          
          <div class="velvz-delete-modal__confirm-section">
            <label class="velvz-delete-modal__label">
              Para confirmar, escribe <strong>ELIMINAR</strong> en el campo de abajo:
            </label>
            <input 
              type="text" 
              id="deleteConfirmInput" 
              class="velvz-delete-modal__input"
              placeholder="Escribe ELIMINAR"
              autocomplete="off"
            >
            <small class="velvz-delete-modal__hint" id="deleteHint"></small>
          </div>
        </div>
        
        <div class="velvz-delete-modal__footer">
          <button type="button" class="velvz-delete-modal__btn velvz-delete-modal__btn--cancel" id="deleteModalCancel">
            Cancelar
          </button>
          <button type="button" class="velvz-delete-modal__btn velvz-delete-modal__btn--delete" id="deleteModalConfirm" disabled>
            <i class="fas fa-trash-alt"></i>
            <span>Eliminar Permanentemente</span>
          </button>
        </div>
      </div>
    </div>
  `;

  // Añadir al body
  document.body.appendChild(modal);

  // Añadir estilos CSS inline (temporalmente, luego los moveremos a un archivo CSS)
  const styles = document.createElement("style");
  styles.innerHTML = `
    .velvz-delete-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 10000;
      display: none;
    }
    
    .velvz-delete-modal--open {
      display: block;
    }
    
    .velvz-delete-modal__backdrop {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(8px);
      animation: fadeIn 0.3s ease;
    }
    
    .velvz-delete-modal__container {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      pointer-events: none;
    }
    
    .velvz-delete-modal__content {
      background: var(--dark-bg-secondary);
      border: 2px solid rgba(239, 68, 68, 0.3);
      border-radius: 20px;
      max-width: 500px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      pointer-events: all;
      animation: slideUp 0.3s ease;
      box-shadow: 0 20px 60px rgba(239, 68, 68, 0.2);
    }
    
    .velvz-delete-modal__header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      border-bottom: 1px solid rgba(239, 68, 68, 0.2);
    }
    
    .velvz-delete-modal__icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #ef4444, #dc2626);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
      flex-shrink: 0;
    }
    
    .velvz-delete-modal__title {
      flex: 1;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--dark-text);
      margin: 0;
    }
    
    .velvz-delete-modal__close {
      width: 36px;
      height: 36px;
      background: transparent;
      border: 1px solid var(--dark-border);
      border-radius: 8px;
      color: var(--dark-text-secondary);
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .velvz-delete-modal__close:hover {
      background: var(--dark-bg-tertiary);
      color: var(--dark-text);
    }
    
    .velvz-delete-modal__body {
      padding: 1.5rem;
    }
    
    .velvz-delete-modal__warning {
      background: rgba(239, 68, 68, 0.05);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 12px;
      padding: 1rem;
      margin-bottom: 1.5rem;
    }
    
    .velvz-delete-modal__chatbot-name {
      font-size: 1.1rem;
      color: var(--dark-text);
      margin: 0 0 0.75rem 0;
    }
    
    .velvz-delete-modal__description {
      color: var(--dark-text-secondary);
      margin: 0;
      line-height: 1.5;
    }
    
    .velvz-delete-modal__confirm-section {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .velvz-delete-modal__label {
      color: var(--dark-text);
      font-size: 0.95rem;
    }
    
    .velvz-delete-modal__input {
      background: var(--dark-bg-tertiary);
      border: 2px solid var(--dark-border);
      border-radius: 8px;
      padding: 0.75rem 1rem;
      color: var(--dark-text);
      font-size: 1rem;
      font-family: inherit;
      transition: all 0.3s ease;
    }
    
    .velvz-delete-modal__input:focus {
      outline: none;
      border-color: rgba(239, 68, 68, 0.5);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
    
    .velvz-delete-modal__input--valid {
      border-color: #22c55e;
    }
    
    .velvz-delete-modal__hint {
      color: var(--dark-text-secondary);
      font-size: 0.85rem;
      min-height: 1.2rem;
    }
    
    .velvz-delete-modal__footer {
      display: flex;
      gap: 1rem;
      padding: 1.5rem;
      border-top: 1px solid var(--dark-border);
      justify-content: flex-end;
    }
    
    .velvz-delete-modal__btn {
      padding: 0.75rem 1.5rem;
      border-radius: 10px;
      font-weight: 500;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.3s ease;
      border: none;
      font-family: inherit;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .velvz-delete-modal__btn--cancel {
      background: var(--dark-bg-tertiary);
      color: var(--dark-text);
      border: 1px solid var(--dark-border);
    }
    
    .velvz-delete-modal__btn--cancel:hover {
      background: var(--dark-bg-primary);
    }
    
    .velvz-delete-modal__btn--delete {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
    }
    
    .velvz-delete-modal__btn--delete:hover:not(:disabled) {
      background: linear-gradient(135deg, #dc2626, #b91c1c);
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
    }
    
    .velvz-delete-modal__btn--delete:disabled {
      background: var(--dark-bg-tertiary);
      color: var(--dark-text-secondary);
      cursor: not-allowed;
      opacity: 0.5;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(styles);

  return modal;
}

// =====================================================
// MOSTRAR/OCULTAR MODAL
// =====================================================

// =====================================================
// MOSTRAR/OCULTAR MODAL - CONECTADO CON API
// =====================================================

function showDeleteConfirmationModal() {
  const modal = createDeleteModal();
  const input = document.getElementById("deleteConfirmInput");
  const confirmBtn = document.getElementById("deleteModalConfirm");
  const cancelBtn = document.getElementById("deleteModalCancel");
  const closeBtn = document.getElementById("deleteModalClose");
  const nameEl = document.getElementById("chatbotNameToDelete");
  const hintEl = document.getElementById("deleteHint");

  // Establecer nombre del chatbot
  if (nameEl && currentChatbot) {
    nameEl.textContent = currentChatbot.name;
  }

  // Limpiar estado
  input.value = "";
  confirmBtn.disabled = true;
  hintEl.textContent = "";
  input.classList.remove("velvz-delete-modal__input--valid");

  // Mostrar modal
  modal.classList.add("velvz-delete-modal--open");
  document.body.style.overflow = "hidden";

  // Focus en el input después de un pequeño delay
  setTimeout(() => input.focus(), 100);

  // Validación en tiempo real
  input.addEventListener("input", function () {
    const value = this.value.trim().toUpperCase();

    if (value === "ELIMINAR") {
      confirmBtn.disabled = false;
      hintEl.textContent = "✅ Correcto. Puedes proceder con la eliminación.";
      hintEl.style.color = "#22c55e";
      this.classList.add("velvz-delete-modal__input--valid");
    } else if (value.length > 0) {
      confirmBtn.disabled = true;
      hintEl.textContent = "❌ Escribe exactamente: ELIMINAR";
      hintEl.style.color = "#ef4444";
      this.classList.remove("velvz-delete-modal__input--valid");
    } else {
      confirmBtn.disabled = true;
      hintEl.textContent = "";
      this.classList.remove("velvz-delete-modal__input--valid");
    }
  });

  // Función para cerrar el modal
  const closeModal = () => {
    modal.classList.remove("velvz-delete-modal--open");
    document.body.style.overflow = "";
  };

  // Event listeners
  cancelBtn.addEventListener("click", closeModal);
  closeBtn.addEventListener("click", closeModal);

  // Cerrar con ESC
  const escHandler = (e) => {
    if (e.key === "Escape") {
      closeModal();
      document.removeEventListener("keydown", escHandler);
    }
  };
  document.addEventListener("keydown", escHandler);

  // Click en backdrop
  modal
    .querySelector(".velvz-delete-modal__backdrop")
    .addEventListener("click", closeModal);

  // Botón de confirmar
  confirmBtn.addEventListener("click", async function () {
    if (!this.disabled && currentChatbot) {
      closeModal();
      await deleteChatbotWithAPI();
    }
  });
}

// =====================================================
// ELIMINACIÓN CON API - PROCESO COMPLETO
// =====================================================

async function deleteChatbotWithAPI() {
  if (!currentChatbot || !currentChatbot.id) return;

  const chatbotName = currentChatbot.name;

  // Desmarcar el checkbox mientras procesamos
  const checkbox = document.getElementById("confirmDeletion");
  if (checkbox) {
    checkbox.checked = false;
    checkbox.dispatchEvent(new Event("change"));
  }

  // Mostrar loading con el mensaje correcto
  showGlobalLoading(
    "Eliminando chatbot...",
    "Limpiando todos los recursos asociados. Esto puede tardar unos momentos..."
  );

  try {
    // Verificar que dashboardAPI existe
    if (
      !window.dashboardAPI ||
      typeof window.dashboardAPI.deleteChatbot !== "function"
    ) {
      throw new Error("API de dashboard no disponible");
    }

    // Llamar a la API con el parámetro permanent=true
    const response = await window.dashboardAPI.deleteChatbot(
      currentChatbot.id,
      true // permanent = true para eliminar de OpenAI también
    );

    if (response && response.success) {
      updateGlobalLoading(
        "¡Chatbot eliminado!",
        "Redirigiendo al dashboard..."
      );

      // Guardar mensaje de éxito en sessionStorage
      sessionStorage.setItem(
        "delete_success",
        JSON.stringify({
          message: `El chatbot "${chatbotName}" ha sido eliminado permanentemente`,
          timestamp: Date.now(),
        })
      );

      // Esperar un momento para que el usuario vea el mensaje
      setTimeout(() => {
        window.location.href = "/app/chatbots/";
      }, 1500);
    } else {
      const errorMsg =
        response?.message ||
        response?.error ||
        "Error desconocido al eliminar el chatbot";
      throw new Error(errorMsg);
    }
  } catch (error) {
    hideGlobalLoading();
    const errorMessage = error.message || "Error desconocido al eliminar el chatbot";
    showError(`Error al eliminar: ${errorMessage}`);
  }
}

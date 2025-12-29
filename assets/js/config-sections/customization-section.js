// =====================================================
// SECCIÓN DE PERSONALIZACIÓN DEL CHATBOT
// =====================================================

let customizationSettings = {
  color: "#667eea",
  position: "bottom-right",
  style: "modern",
  showBadge: true,
  showTypingIndicator: true,
  autoGreeting: true,
  bubbleSize: "medium",
  windowStyle: "rounded",
  icon: "comments",
  customIcon: null,
  iconScale: 100,
  iconPosX: 0,
  iconPosY: 0,
  welcomeMessage:
    "¡Hola! 👋 Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?",
  assistantName: "Asistente Virtual",
  inputPlaceholder: "Escribe tu mensaje...",
  fontFamily: "Inter",
  customFont: null,
};

let isChatOpen = false;

// =====================================================
// INICIALIZACIÓN
// =====================================================

function initializeCustomizationSection() {

  // Configurar event listeners
  setupColorPickers();
  setupPositionControls();
  setupStyleControls();
  setupIconControls();
  setupToggleControls();
  setupTextInputs();
  setupFontControls();
  setupChatPreview();

  // Cargar configuración existente si existe
  loadExistingCustomization();

  // Aplicar configuración inicial
  applyCustomization();

  // Aplicar estado inicial de los toggles
  toggleAutoGreeting(customizationSettings.autoGreeting);
  toggleBadge(customizationSettings.showBadge);

  // Verificar y aplicar contraste de color e icono inmediatamente
  setTimeout(() => {
    const chatBubble = document.querySelector(".chat-bubble");
    const chatWindow = document.querySelector(".chat-window");
    if (needsDarkText(customizationSettings.color)) {
      if (chatBubble) chatBubble.classList.add("light-background");
      if (chatWindow) chatWindow.classList.add("light-background");
    } else {
      if (chatBubble) chatBubble.classList.remove("light-background");
      if (chatWindow) chatWindow.classList.remove("light-background");
    }

    // También actualizar el icono del chat window
    if (
      customizationSettings.icon === "custom" &&
      customizationSettings.customIcon
    ) {
      updateBubbleIcon("custom", customizationSettings.customIcon);
    } else if (customizationSettings.icon) {
      updateBubbleIcon(customizationSettings.icon);
    }
  }, 100);

}

// =====================================================
// COLOR CONTROLS
// =====================================================

function setupColorPickers() {
  // Referencias a elementos
  const colorOptions = document.querySelectorAll(".color-option");
  const customColorInput = document.getElementById("customColorInput");
  const customColorText = document.getElementById("customColorText");
  const customColorDisplay = document.getElementById("customColorDisplay");

  // Función para activar un color
  function activateColor(color, isCustom = false) {
    // Remover active de todos los colores predefinidos
    colorOptions.forEach((opt) => opt.classList.remove("active"));

    // Remover active del color personalizado
    if (customColorDisplay) {
      customColorDisplay.classList.remove("active");
    }

    if (isCustom) {
      // Si es custom, activar el display personalizado
      if (customColorDisplay) {
        customColorDisplay.classList.add("active");
        customColorDisplay.style.background = color;
        document.documentElement.style.setProperty("--custom-color", color);
      }
    } else {
      // Si es predefinido, buscar y activar el correspondiente
      const matchingOption = document.querySelector(
        `.color-option[data-color="${color}"]`
      );
      if (matchingOption) {
        matchingOption.classList.add("active");
      }
    }

    // Actualizar inputs de color personalizado
    if (customColorInput) customColorInput.value = color;
    if (customColorText) customColorText.value = color;
    if (customColorDisplay) customColorDisplay.style.background = color;

    // Aplicar color
    customizationSettings.color = color;
    // Solo actualizar el color, sin reposicionar elementos
    document.documentElement.style.setProperty("--widget-color", color);

    // Verificar contraste
    const chatBubble = document.querySelector(".chat-bubble");
    const chatWindow = document.querySelector(".chat-window");

    if (needsDarkText(color)) {
      if (chatBubble) chatBubble.classList.add("light-background");
      if (chatWindow) chatWindow.classList.add("light-background");
    } else {
      if (chatBubble) chatBubble.classList.remove("light-background");
      if (chatWindow) chatWindow.classList.remove("light-background");
    }
  }

  // Colores predefinidos
  colorOptions.forEach((option) => {
    option.addEventListener("click", function () {
      const color = this.dataset.color;
      activateColor(color, false);
      markAsChanged();
    });
  });

  // Click en el display de color personalizado
  if (customColorDisplay) {
    customColorDisplay.addEventListener("click", function () {
      // El input de color se activará automáticamente
      customColorInput.click();
    });
  }

  // Color personalizado - Input de color
  if (customColorInput) {
    customColorInput.addEventListener("input", function () {
      activateColor(this.value, true);
      markAsChanged();
    });

    // Al hacer click en el input, activar el color personalizado
    customColorInput.addEventListener("click", function () {
      setTimeout(() => {
        activateColor(this.value, true);
      }, 10);
    });
  }

  // Color personalizado - Input de texto
  if (customColorText) {
    customColorText.addEventListener("input", function () {
      const value = this.value.trim();
      if (/^#[0-9A-F]{6}$/i.test(value)) {
        activateColor(value, true);
        markAsChanged();
      }
    });

    // Validación al perder el foco
    customColorText.addEventListener("blur", function () {
      const value = this.value.trim();
      if (!value.startsWith("#")) {
        this.value = "#" + value;
      }
      if (!/^#[0-9A-F]{6}$/i.test(this.value)) {
        this.value = customizationSettings.color;
      }
    });

    // Al hacer foco en el input de texto, activar color personalizado
    customColorText.addEventListener("focus", function () {
      activateColor(this.value, true);
    });
  }

  // Inicializar con el color por defecto
  if (customColorDisplay) {
    customColorDisplay.style.background = customizationSettings.color;
  }
}

// =====================================================
// POSITION CONTROLS
// =====================================================

function setupPositionControls() {
  const positionOptions = document.querySelectorAll(".position-option");

  positionOptions.forEach((option) => {
    option.addEventListener("click", function () {
      // Remover clase active de todos
      positionOptions.forEach((opt) => opt.classList.remove("active"));
      // Añadir active al seleccionado
      this.classList.add("active");

      // Obtener posición y aplicar
      const position = this.dataset.position;
      customizationSettings.position = position;
      applyPosition();
      markAsChanged();
    });
  });
}

// =====================================================
// STYLE CONTROLS
// =====================================================

function setupStyleControls() {
  const styleOptions = document.querySelectorAll(".style-option");

  styleOptions.forEach((option) => {
    option.addEventListener("click", function () {
      // Remover clase active de todos
      styleOptions.forEach((opt) => opt.classList.remove("active"));
      // Añadir active al seleccionado
      this.classList.add("active");

      // Obtener estilo y aplicar
      const style = this.dataset.style;
      customizationSettings.style = style;
      applyStyle();
      markAsChanged();
    });
  });

  // Tamaño de burbuja - Custom Select
  setupBubbleSizeSelect();
}

function setupBubbleSizeSelect() {
  const trigger = document.getElementById("bubbleSizeTrigger");
  const options = document.getElementById("bubbleSizeOptions");
  const optionElements = options
    ? options.querySelectorAll(".custom-select__option")
    : [];
  const valueSpan = trigger
    ? trigger.querySelector(".custom-select__value")
    : null;

  if (!trigger || !options) return;

  // Toggle dropdown
  trigger.addEventListener("click", function (e) {
    e.stopPropagation();
    const isOpen = options.classList.contains("open");

    // Cerrar otros dropdowns si hay
    document.querySelectorAll(".custom-select__options.open").forEach((dd) => {
      dd.classList.remove("open");
    });
    document.querySelectorAll(".custom-select__trigger.open").forEach((dd) => {
      dd.classList.remove("open");
    });

    if (!isOpen) {
      options.classList.add("open");
      trigger.classList.add("open");
    } else {
      options.classList.remove("open");
      trigger.classList.remove("open");
    }
  });

  // Seleccionar opción
  optionElements.forEach((option) => {
    option.addEventListener("click", function (e) {
      e.stopPropagation();

      // Remover active de todas las opciones
      optionElements.forEach((opt) => opt.classList.remove("active"));
      // Añadir active a la seleccionada
      this.classList.add("active");

      // Obtener valor y texto
      const value = this.dataset.value;
      const text = this.querySelector("span").textContent;

      // Actualizar trigger
      if (valueSpan) {
        valueSpan.textContent = text;
      }

      // Cerrar dropdown
      options.classList.remove("open");
      trigger.classList.remove("open");

      // Aplicar tamaño
      customizationSettings.bubbleSize = value;
      applyBubbleSize();
      markAsChanged();
    });
  });

  // Cerrar al hacer click fuera
  document.addEventListener("click", function () {
    if (options.classList.contains("open")) {
      options.classList.remove("open");
      trigger.classList.remove("open");
    }
  });
}

// =====================================================
// ICON CONTROLS
// =====================================================

function setupIconControls() {
  const iconOptions = document.querySelectorAll(".icon-option");
  const customIconFile = document.getElementById("customIconFile");
  const customIconControls = document.getElementById("customIconControls");
  const iconScale = document.getElementById("iconScale");
  const iconScaleValue = document.getElementById("iconScaleValue");
  const iconPosX = document.getElementById("iconPosX");
  const iconPosXValue = document.getElementById("iconPosXValue");
  const iconPosY = document.getElementById("iconPosY");
  const iconPosYValue = document.getElementById("iconPosYValue");
  const resetIcon = document.getElementById("resetIcon");

  // Si hay una imagen custom guardada, mostrar los controles
  if (customizationSettings.customIcon && customIconControls) {
    customIconControls.style.display = "block";
    // Actualizar valores de los controles
    if (iconScale) iconScale.value = customizationSettings.iconScale;
    if (iconScaleValue)
      iconScaleValue.textContent = customizationSettings.iconScale + "%";
    if (iconPosX) iconPosX.value = customizationSettings.iconPosX;
    if (iconPosXValue)
      iconPosXValue.textContent = customizationSettings.iconPosX + "px";
    if (iconPosY) iconPosY.value = customizationSettings.iconPosY;
    if (iconPosYValue)
      iconPosYValue.textContent = customizationSettings.iconPosY + "px";
  }

  // Función para manejar clicks en iconos
  function handleIconClick(e) {
    const option = e.currentTarget;

    // Remover active de todos
    document
      .querySelectorAll(".icon-option")
      .forEach((opt) => opt.classList.remove("active"));
    // Añadir active al seleccionado
    option.classList.add("active");

    if (option.classList.contains("custom-image")) {
      // Es la imagen personalizada
      if (customizationSettings.customIcon) {
        customizationSettings.icon = "custom";
        updateBubbleIcon("custom", customizationSettings.customIcon);

        // Aplicar transformaciones guardadas
        setTimeout(() => {
          updateCustomIconTransform();
        }, 10);

        // Mostrar controles de imagen personalizada
        if (customIconControls) {
          customIconControls.style.display = "block";
        }

        // Restaurar valores de los controles
        if (iconScale) iconScale.value = customizationSettings.iconScale;
        if (iconScaleValue)
          iconScaleValue.textContent = customizationSettings.iconScale + "%";
        if (iconPosX) iconPosX.value = customizationSettings.iconPosX;
        if (iconPosXValue)
          iconPosXValue.textContent = customizationSettings.iconPosX + "px";
        if (iconPosY) iconPosY.value = customizationSettings.iconPosY;
        if (iconPosYValue)
          iconPosYValue.textContent = customizationSettings.iconPosY + "px";
      }
    } else {
      // Es un icono predefinido
      const icon = option.dataset.icon;
      customizationSettings.icon = icon;
      // NO borrar customIcon, mantenerlo para cuando vuelva a seleccionar

      // Actualizar icono en la burbuja
      updateBubbleIcon(icon);

      // Ocultar controles de imagen personalizada
      if (customIconControls) {
        customIconControls.style.display = "none";
      }
    }

    markAsChanged();
  }

  // Selección de iconos predefinidos
  iconOptions.forEach((option) => {
    option.addEventListener("click", handleIconClick);
  });

  // Subir imagen personalizada
  if (customIconFile) {
    customIconFile.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = function (event) {
          // Crear opción de imagen personalizada
          let customOption = document.querySelector(
            ".icon-option.custom-image"
          );
          if (!customOption) {
            customOption = document.createElement("div");
            customOption.className = "icon-option custom-image";
            customOption.dataset.icon = "custom";
            const iconOptionsContainer =
              document.querySelector(".icon-options");
            iconOptionsContainer.appendChild(customOption);
            // Añadir event listener a la nueva opción
            customOption.addEventListener("click", handleIconClick);
          }

          // Establecer imagen
          customOption.innerHTML = `<img src="${event.target.result}" alt="Custom">`;
          customOption.dataset.icon = "custom";

          // Activar opción personalizada
          document
            .querySelectorAll(".icon-option")
            .forEach((opt) => opt.classList.remove("active"));
          customOption.classList.add("active");

          // Guardar imagen y mostrar controles
          customizationSettings.customIcon = event.target.result;
          customizationSettings.icon = "custom";

          if (customIconControls) {
            customIconControls.style.display = "block";
          }

          updateBubbleIcon("custom", event.target.result);
          markAsChanged();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Controles de ajuste de imagen
  if (iconScale) {
    iconScale.addEventListener("input", function () {
      customizationSettings.iconScale = this.value;
      if (iconScaleValue) {
        iconScaleValue.textContent = this.value + "%";
      }
      updateCustomIconTransform();
      markAsChanged();
    });
  }

  if (iconPosX) {
    iconPosX.addEventListener("input", function () {
      customizationSettings.iconPosX = this.value;
      if (iconPosXValue) {
        iconPosXValue.textContent = this.value + "px";
      }
      updateCustomIconTransform();
      markAsChanged();
    });
  }

  if (iconPosY) {
    iconPosY.addEventListener("input", function () {
      customizationSettings.iconPosY = this.value;
      if (iconPosYValue) {
        iconPosYValue.textContent = this.value + "px";
      }
      updateCustomIconTransform();
      markAsChanged();
    });
  }

  // Botón reset
  if (resetIcon) {
    resetIcon.addEventListener("click", function () {
      customizationSettings.iconScale = 100;
      customizationSettings.iconPosX = 0;
      customizationSettings.iconPosY = 0;

      if (iconScale) iconScale.value = 100;
      if (iconScaleValue) iconScaleValue.textContent = "100%";
      if (iconPosX) iconPosX.value = 0;
      if (iconPosXValue) iconPosXValue.textContent = "0px";
      if (iconPosY) iconPosY.value = 0;
      if (iconPosYValue) iconPosYValue.textContent = "0px";

      updateCustomIconTransform();
      markAsChanged();
    });
  }
}

function updateBubbleIcon(icon, customSrc = null) {
  const chatBubble = document.querySelector(".chat-bubble");
  const chatWindowIcon = document.querySelector(".chat-window__avatar");

  if (!chatBubble) return;

  // Eliminar todos los iconos existentes
  const existingIcons = chatBubble.querySelectorAll("i, .chat-bubble__icon");
  existingIcons.forEach((el) => el.remove());

  // Preservar el badge si existe
  const badge = chatBubble.querySelector(".chat-bubble__badge");

  // Crear nuevo contenedor de icono
  const bubbleIcon = document.createElement("div");
  bubbleIcon.className = "chat-bubble__icon";

  if (icon === "custom" && customSrc) {
    bubbleIcon.innerHTML = `<img src="${customSrc}" style="width: 28px; height: 28px; object-fit: contain;">`;
    if (chatWindowIcon) {
      chatWindowIcon.innerHTML = `<img src="${customSrc}" style="width: 20px; height: 20px; object-fit: contain; filter: brightness(0) invert(1);">`;
    }
  } else {
    // Mapear iconos
    const iconMap = {
      comments: "fas fa-comments",
      robot: "fas fa-robot",
      message: "fas fa-message",
      headset: "fas fa-headset",
      question: "fas fa-question-circle",
      user: "fas fa-user-circle",
    };
    const iconClass = iconMap[icon] || "fas fa-comments";
    bubbleIcon.innerHTML = `<i class="${iconClass}"></i>`;
    // Actualizar también el icono del chat window
    if (chatWindowIcon) {
      chatWindowIcon.innerHTML = `<i class="${iconClass}"></i>`;
    }
  }

  // Añadir el nuevo icono
  chatBubble.insertBefore(bubbleIcon, chatBubble.firstChild);

  // Restaurar el badge si existía
  if (badge && !chatBubble.contains(badge)) {
    chatBubble.appendChild(badge);
  }
}

function updateCustomIconTransform() {
  const customImg = document.querySelector(".chat-bubble__icon img");
  if (customImg) {
    const scale = customizationSettings.iconScale / 100;
    const x = customizationSettings.iconPosX;
    const y = customizationSettings.iconPosY;
    customImg.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  }
}

// =====================================================
// TOGGLE CONTROLS
// =====================================================

function setupToggleControls() {
  const toggles = document.querySelectorAll(".toggle-switch");

  toggles.forEach((toggle) => {
    const setting = toggle.dataset.setting;

    // Establecer estado inicial del toggle basado en customizationSettings
    if (customizationSettings[setting]) {
      toggle.classList.add("active");
    } else {
      toggle.classList.remove("active");
    }

    toggle.addEventListener("click", function () {
      this.classList.toggle("active");
      const setting = this.dataset.setting;
      const isActive = this.classList.contains("active");

      customizationSettings[setting] = isActive;

      // Aplicar cambios específicos según el toggle
      if (setting === "showBadge") {
        toggleBadge(isActive);
      } else if (setting === "showTypingIndicator") {
        // Se aplicará cuando esté escribiendo
      } else if (setting === "autoGreeting") {
        toggleAutoGreeting(isActive);
      }

      markAsChanged();
    });
  });
}

// =====================================================
// TEXT INPUT CONTROLS
// =====================================================

function setupTextInputs() {
  // Mensaje de bienvenida
  const welcomeMessageInput = document.getElementById("welcomeMessage");
  if (welcomeMessageInput) {
    welcomeMessageInput.value = customizationSettings.welcomeMessage;
    welcomeMessageInput.addEventListener("input", function () {
      customizationSettings.welcomeMessage = this.value;
      updateWelcomeMessage();
      markAsChanged();
    });
  }

  // Nombre del asistente
  const assistantNameInput = document.getElementById("assistantName");
  if (assistantNameInput) {
    assistantNameInput.value = customizationSettings.assistantName;
    assistantNameInput.addEventListener("input", function () {
      customizationSettings.assistantName = this.value;
      updateAssistantName();
      markAsChanged();
    });
  }

  // Placeholder del input
  const inputPlaceholderInput = document.getElementById("inputPlaceholder");
  if (inputPlaceholderInput) {
    inputPlaceholderInput.value = customizationSettings.inputPlaceholder;
    inputPlaceholderInput.addEventListener("input", function () {
      customizationSettings.inputPlaceholder = this.value;
      updateInputPlaceholder();
      markAsChanged();
    });
  }
}

// =====================================================
// FONT CONTROLS
// =====================================================

function setupFontControls() {
  const fontOptions = document.querySelectorAll(".font-option");
  const customFontInput = document.getElementById("customFontName");

  fontOptions.forEach((option) => {
    option.addEventListener("click", function () {
      // Remover active de todos
      fontOptions.forEach((opt) => opt.classList.remove("active"));
      // Añadir active al seleccionado
      this.classList.add("active");

      // Limpiar campo de fuente personalizada
      if (customFontInput) {
        customFontInput.value = "";
        customFontInput.classList.remove("active");
      }

      // Obtener fuente y aplicar
      const font = this.dataset.font;
      customizationSettings.fontFamily = font;
      customizationSettings.customFont = null;
      applyFontFamily();
      markAsChanged();
    });
  });

  // Configurar input de fuente personalizada
  if (customFontInput) {
    customFontInput.addEventListener("input", function () {
      const customFontValue = this.value.trim();

      if (customFontValue) {
        // Desactivar todas las opciones predefinidas
        fontOptions.forEach((opt) => opt.classList.remove("active"));

        // Activar campo personalizado
        this.classList.add("active");

        // Guardar fuente personalizada
        customizationSettings.customFont = customFontValue;
        customizationSettings.fontFamily = "custom";

        applyFontFamily();
        markAsChanged();
      } else {
        // Si se borra, volver a la fuente por defecto
        this.classList.remove("active");
        customizationSettings.customFont = null;

        // Reactivar Inter por defecto
        const interOption = document.querySelector(
          '.font-option[data-font="Inter"]'
        );
        if (interOption) {
          interOption.click();
        }
      }
    });

    customFontInput.addEventListener("focus", function () {
      if (this.value.trim()) {
        fontOptions.forEach((opt) => opt.classList.remove("active"));
        this.classList.add("active");
      }
    });
  }
}

// =====================================================
// CHAT PREVIEW
// =====================================================

function setupChatPreview() {
  const chatBubble = document.querySelector(".chat-bubble");
  const closeBtn = document.querySelector(".chat-window__close");

  if (chatBubble) {
    chatBubble.addEventListener("click", function () {
      const chatWindow = document.querySelector(".chat-window");
      if (!chatWindow) {
        console.error("Chat window not found");
        return;
      }

      isChatOpen = !isChatOpen;
      if (isChatOpen) {
        // Primero aplicar la posición correcta
        applyPosition();
        // Luego mostrar con animación
        chatWindow.style.display = "flex";
        setTimeout(() => {
          chatWindow.classList.add("show");
        }, 10);
        // No simular mensajes automáticos al abrir
      } else {
        chatWindow.classList.remove("show");
        setTimeout(() => {
          chatWindow.style.display = "none";
        }, 300);
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      const chatWindow = document.querySelector(".chat-window");
      if (chatWindow) {
        isChatOpen = false;
        chatWindow.classList.remove("show");
        setTimeout(() => {
          chatWindow.style.display = "none";
        }, 300);
      }
    });
  }

  // Simular envío de mensaje
  const sendBtn = document.querySelector(".chat-send-btn");
  const chatInput = document.querySelector(".chat-input");

  if (sendBtn && chatInput) {
    sendBtn.addEventListener("click", function () {
      const message = chatInput.value.trim();
      if (message) {
        addUserMessage(message);
        chatInput.value = "";

        // Mostrar indicador de escritura si está habilitado
        if (customizationSettings.showTypingIndicator) {
          simulateTyping();
          // Simular respuesta del bot después del typing
          setTimeout(() => {
            addBotMessage(
              "¡Gracias por tu mensaje! Esta es una vista previa de cómo se verá tu chatbot."
            );
          }, 2000); // Aumentar delay para dar tiempo al typing indicator
        } else {
          // Respuesta directa sin typing
          setTimeout(() => {
            addBotMessage(
              "¡Gracias por tu mensaje! Esta es una vista previa de cómo se verá tu chatbot."
            );
          }, 800);
        }
      }
    });

    chatInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendBtn.click();
      }
    });
  }
}

// =====================================================
// APLICAR PERSONALIZACIÓN
// =====================================================

// Función para determinar si un color necesita texto oscuro
function needsDarkText(hexColor) {
  // Convertir hex a RGB
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calcular luminancia relativa
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Si la luminancia es mayor a 0.6, necesita texto oscuro
  return luminance > 0.6;
}

function applyCustomization() {
  // Aplicar color
  document.documentElement.style.setProperty(
    "--widget-color",
    customizationSettings.color
  );

  // Verificar contraste y ajustar color del texto
  const chatBubble = document.querySelector(".chat-bubble");
  const chatWindow = document.querySelector(".chat-window");

  if (needsDarkText(customizationSettings.color)) {
    // Color claro - usar texto oscuro
    if (chatBubble) chatBubble.classList.add("light-background");
    if (chatWindow) chatWindow.classList.add("light-background");
  } else {
    // Color oscuro - usar texto blanco
    if (chatBubble) chatBubble.classList.remove("light-background");
    if (chatWindow) chatWindow.classList.remove("light-background");
  }

  // Aplicar otros estilos
  applyPosition();
  applyStyle();
  applyBubbleSize();

  // Aplicar textos personalizados
  updateAssistantName();
  updateInputPlaceholder();
  updateWelcomeMessage();

  // Aplicar fuente
  applyFontFamily();

  // Aplicar icono
  if (
    customizationSettings.icon === "custom" &&
    customizationSettings.customIcon
  ) {
    updateBubbleIcon("custom", customizationSettings.customIcon);
    // Aplicar transformaciones después de actualizar el icono
    setTimeout(() => {
      updateCustomIconTransform();
    }, 50);
  } else if (customizationSettings.icon) {
    updateBubbleIcon(customizationSettings.icon);
  }
}

function applyPosition() {
  const chatBubble = document.querySelector(".chat-bubble");
  const chatWindow = document.querySelector(".chat-window");
  if (!chatBubble || !chatWindow) return;

  // Usar posicionamiento absoluto dentro del contenedor
  chatBubble.style.position = "absolute";
  chatWindow.style.position = "absolute";

  // Guardar transición actual
  const currentTransition = chatBubble.style.transition;

  // Asegurar que la transición esté activa
  if (!currentTransition || currentTransition === "none") {
    chatBubble.style.transition = "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)";
  }

  chatBubble.style.removeProperty("top");
  chatBubble.style.removeProperty("bottom");
  chatBubble.style.removeProperty("left");
  chatBubble.style.removeProperty("right");
  chatBubble.style.removeProperty("transform");

  chatWindow.style.removeProperty("top");
  chatWindow.style.removeProperty("bottom");
  chatWindow.style.removeProperty("left");
  chatWindow.style.removeProperty("right");
  chatWindow.style.removeProperty("transform");

  // Aplicar nueva posición según el caso
  switch (customizationSettings.position) {
    case "top-left":
      // Burbuja
      chatBubble.style.top = "20px";
      chatBubble.style.left = "20px";
      // Ventana de chat (debajo de la burbuja)
      chatWindow.style.top = "90px";
      chatWindow.style.left = "20px";
      break;

    case "top-center":
      // Burbuja
      chatBubble.style.top = "20px";
      chatBubble.style.left = "50%";
      chatBubble.style.transform = "translateX(-50%)";
      // Ventana de chat
      chatWindow.style.top = "90px";
      chatWindow.style.left = "50%";
      chatWindow.style.transform = "translateX(-50%)";
      break;

    case "top-right":
      // Burbuja
      chatBubble.style.top = "20px";
      chatBubble.style.right = "20px";
      // Ventana de chat (debajo de la burbuja)
      chatWindow.style.top = "90px";
      chatWindow.style.right = "20px";
      break;

    case "center-left":
      // Burbuja
      chatBubble.style.top = "50%";
      chatBubble.style.left = "20px";
      chatBubble.style.transform = "translateY(-50%)";
      // Ventana de chat (centrada verticalmente, a la derecha)
      chatWindow.style.top = "50%";
      chatWindow.style.left = "100px";
      chatWindow.style.transform = "translateY(-50%)";
      break;

    case "center-right":
      // Burbuja
      chatBubble.style.top = "50%";
      chatBubble.style.right = "20px";
      chatBubble.style.transform = "translateY(-50%)";
      // Ventana de chat (centrada verticalmente, a la izquierda)
      chatWindow.style.top = "50%";
      chatWindow.style.right = "100px";
      chatWindow.style.transform = "translateY(-50%)";
      break;

    case "bottom-left":
      // Burbuja
      chatBubble.style.bottom = "20px";
      chatBubble.style.left = "20px";
      // Ventana de chat (encima de la burbuja)
      chatWindow.style.bottom = "90px";
      chatWindow.style.left = "20px";
      break;

    case "bottom-center":
      // Burbuja
      chatBubble.style.bottom = "20px";
      chatBubble.style.left = "50%";
      chatBubble.style.transform = "translateX(-50%)";
      // Ventana de chat
      chatWindow.style.bottom = "90px";
      chatWindow.style.left = "50%";
      chatWindow.style.transform = "translateX(-50%)";
      break;

    case "bottom-right":
    default:
      // Burbuja
      chatBubble.style.bottom = "20px";
      chatBubble.style.right = "20px";
      // Ventana de chat (encima de la burbuja)
      chatWindow.style.bottom = "90px";
      chatWindow.style.right = "20px";
      break;
  }
}

function applyStyle() {
  const chatBubble = document.querySelector(".chat-bubble");
  const chatWindow = document.querySelector(".chat-window");

  if (!chatBubble || !chatWindow) return;

  // Preservar el estado show si existe
  const isShowing = chatWindow.classList.contains("show");
  // Preservar el estado de contraste
  const hasLightBackground = chatBubble.classList.contains("light-background");

  // Resetear clases de estilo pero mantener las clases base
  chatBubble.className = "chat-bubble";
  chatWindow.className = "chat-window";

  // Restaurar estado show si existía
  if (isShowing) {
    chatWindow.classList.add("show");
  }
  
  // Restaurar contraste si existía
  if (hasLightBackground) {
    chatBubble.classList.add("light-background");
    chatWindow.classList.add("light-background");
  }

  // Aplicar nuevo estilo
  switch (customizationSettings.style) {
    case "minimal":
      chatBubble.classList.add("chat-bubble--minimal");
      chatWindow.classList.add("chat-window--minimal");
      break;
    case "flat":
      chatBubble.classList.add("chat-bubble--flat");
      chatWindow.classList.add("chat-window--flat");
      break;
    case "neumorphic":
      chatBubble.classList.add("chat-bubble--neumorphic");
      chatWindow.classList.add("chat-window--neumorphic");
      break;
    case "modern":
    default:
      // Estilo por defecto, no necesita clases adicionales
      break;
  }
}

function applyBubbleSize() {
  const chatBubble = document.querySelector(".chat-bubble");
  if (!chatBubble) return;

  switch (customizationSettings.bubbleSize) {
    case "small":
      chatBubble.style.width = "50px";
      chatBubble.style.height = "50px";
      break;
    case "large":
      chatBubble.style.width = "70px";
      chatBubble.style.height = "70px";
      break;
    case "medium":
    default:
      chatBubble.style.width = "60px";
      chatBubble.style.height = "60px";
      break;
  }
}

// =====================================================
// FUNCIONES DE PREVIEW
// =====================================================

function toggleBadge(show) {
  const badge = document.querySelector(".chat-bubble__badge");
  if (badge) {
    badge.style.display = show ? "flex" : "none";
  }
}

function toggleAutoGreeting(show) {
  const messagesContainer = document.querySelector(".chat-window__messages");
  if (!messagesContainer) return;

  // Buscar el mensaje de bienvenida existente
  const greetingMessage = messagesContainer.querySelector(
    ".chat-message--greeting"
  );

  if (show) {
    // Si debe mostrarse y no existe, crearlo
    if (!greetingMessage) {
      const newGreeting = document.createElement("div");
      newGreeting.className =
        "chat-message chat-message--bot chat-message--greeting";
      newGreeting.innerHTML = `
                <div class="chat-message__bubble">
                    ${customizationSettings.welcomeMessage}
                </div>
            `;
      // Insertar al principio
      messagesContainer.insertBefore(newGreeting, messagesContainer.firstChild);
    } else {
      // Si ya existe, simplemente mostrarlo
      greetingMessage.style.display = "";
    }
  } else {
    // Ocultar el mensaje de bienvenida si existe
    if (greetingMessage) {
      greetingMessage.style.display = "none";
    }
  }
}

function updateWelcomeMessage() {
  const greetingMessage = document.querySelector(
    ".chat-message--greeting .chat-message__bubble"
  );
  if (greetingMessage) {
    greetingMessage.textContent = customizationSettings.welcomeMessage;
  }
}

function updateAssistantName() {
  const assistantNameEl = document.querySelector(".chat-window__name");
  if (assistantNameEl) {
    assistantNameEl.textContent = customizationSettings.assistantName;
  }
}

function updateInputPlaceholder() {
  const chatInput = document.querySelector(".chat-input");
  if (chatInput) {
    chatInput.placeholder = customizationSettings.inputPlaceholder;
  }
}

function applyFontFamily() {
  const chatWindow = document.querySelector(".chat-window");
  if (chatWindow) {
    let fontFamily;

    if (
      customizationSettings.fontFamily === "custom" &&
      customizationSettings.customFont
    ) {
      // Usar fuente personalizada
      // Procesar el input del usuario para asegurar formato correcto
      let customFont = customizationSettings.customFont;

      // Si no tiene comillas y contiene espacios, agregar comillas
      if (
        !customFont.includes('"') &&
        !customFont.includes("'") &&
        customFont.includes(" ")
      ) {
        customFont = `'${customFont}'`;
      }

      // Agregar fallback genérico si no lo tiene
      if (
        !customFont.includes("serif") &&
        !customFont.includes("monospace") &&
        !customFont.includes("cursive")
      ) {
        fontFamily = `${customFont}, sans-serif`;
      } else {
        fontFamily = customFont;
      }

    } else {
      // Mapear fuentes predefinidas a sus stacks completos
      const fontStacks = {
        Inter: "'Inter', sans-serif",
        Roboto: "'Roboto', sans-serif",
        "Open Sans": "'Open Sans', sans-serif",
        Poppins: "'Poppins', sans-serif",
        Montserrat: "'Montserrat', sans-serif",
        Lato: "'Lato', sans-serif",
        Raleway: "'Raleway', sans-serif",
        "system-ui":
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      };

      fontFamily =
        fontStacks[customizationSettings.fontFamily] || "'Inter', sans-serif";
    }

    chatWindow.style.fontFamily = fontFamily;
  }
}

function simulateTyping() {
  const messagesContainer = document.querySelector(".chat-window__messages");
  if (!messagesContainer) return;

  // Remover indicador anterior si existe
  const existingIndicator =
    messagesContainer.querySelector(".typing-indicator");
  if (existingIndicator) {
    existingIndicator.remove();
  }

  const typingIndicator = document.createElement("div");
  typingIndicator.className = "typing-indicator";
  typingIndicator.innerHTML = `
        <div class="typing-indicator__dots">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        </div>
    `;
  messagesContainer.appendChild(typingIndicator);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  // No remover automáticamente - será removido cuando llegue el mensaje del bot
}

function addUserMessage(text) {
  const messagesContainer = document.querySelector(".chat-window__messages");
  if (!messagesContainer) return;

  const message = document.createElement("div");
  message.className = "chat-message chat-message--user";
  message.innerHTML = `
        <div class="chat-message__bubble">${text}</div>
    `;
  messagesContainer.appendChild(message);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addBotMessage(text) {
  const messagesContainer = document.querySelector(".chat-window__messages");
  if (!messagesContainer) return;

  // Remover indicador de escritura si existe
  const typingIndicator = messagesContainer.querySelector(".typing-indicator");
  if (typingIndicator) {
    typingIndicator.remove();
  }

  const message = document.createElement("div");
  message.className = "chat-message chat-message--bot";
  message.innerHTML = `
        <div class="chat-message__bubble">${text}</div>
    `;
  messagesContainer.appendChild(message);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// =====================================================
// CARGAR CONFIGURACIÓN EXISTENTE
// =====================================================

async function loadExistingCustomization() {
  const urlParams = new URLSearchParams(window.location.search);
  const chatbotId = urlParams.get("id");

  if (!chatbotId) return;

  try {
    const baseURL =
      window.dashboardAPI?.baseURL ||
      "https://velvz-unified-backend-production.up.railway.app";
    const token = localStorage.getItem("velvz_token");

    const response = await fetch(
      `${baseURL}/api/chatbots/${chatbotId}/widget/config`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      const config = data.data || data.config || {};

      // Actualizar customizationSettings con los datos del backend
      customizationSettings = {
        color: config.main_color || "#667eea",
        position: config.widget_position || "bottom-right",
        style: config.style || "modern",
        showBadge: config.show_badge !== false,
        showTypingIndicator: config.show_typing_indicator !== false,
        autoGreeting: config.auto_greeting !== false,
        bubbleSize: config.bubble_size || "medium",
        windowStyle: "rounded", // Por ahora fijo
        icon: config.custom_icon ? "custom" : config.icon_type || "comments",
        customIcon: config.custom_icon || null,
        iconScale: config.icon_scale || 100,
        iconPosX: config.icon_pos_x || 0,
        iconPosY: config.icon_pos_y || 0,
        welcomeMessage:
          config.greeting_message ||
          "¡Hola! 👋 Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?",
        assistantName: config.assistant_name || "Asistente Virtual",
        inputPlaceholder: config.placeholder_text || "Escribe tu mensaje...",
        fontFamily: config.custom_font
          ? "custom"
          : config.font_family || "Inter",
        customFont: config.custom_font || null,
      };

      updateUIFromSettings();
    }
  } catch (error) {
    // Usar configuración por defecto si hay error
  }
}

// Función para actualizar la UI con los valores de customizationSettings
function updateUIFromSettings() {
  // Actualizar color
  const isCustomColor = ![
    "#667eea",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
  ].includes(customizationSettings.color);
  const colorOptions = document.querySelectorAll(".color-option");
  const customColorInput = document.getElementById("customColorInput");
  const customColorText = document.getElementById("customColorText");
  const customColorDisplay = document.getElementById("customColorDisplay");

  colorOptions.forEach((opt) => opt.classList.remove("active"));

  if (isCustomColor) {
    if (customColorDisplay) {
      customColorDisplay.classList.add("active");
      customColorDisplay.style.background = customizationSettings.color;
    }
    if (customColorInput) customColorInput.value = customizationSettings.color;
    if (customColorText) customColorText.value = customizationSettings.color;
  } else {
    const matchingOption = document.querySelector(
      `.color-option[data-color="${customizationSettings.color}"]`
    );
    if (matchingOption) matchingOption.classList.add("active");
  }

  // Actualizar posición
  document.querySelectorAll(".position-option").forEach((opt) => {
    opt.classList.toggle(
      "active",
      opt.dataset.position === customizationSettings.position
    );
  });

  // Actualizar estilo
  document.querySelectorAll(".style-option").forEach((opt) => {
    opt.classList.toggle(
      "active",
      opt.dataset.style === customizationSettings.style
    );
  });

  // Actualizar tamaño de burbuja
  const bubbleSizeTrigger = document.getElementById("bubbleSizeTrigger");
  if (bubbleSizeTrigger) {
    const sizeText =
      customizationSettings.bubbleSize === "small"
        ? "Pequeño"
        : customizationSettings.bubbleSize === "large"
        ? "Grande"
        : "Mediano";
    bubbleSizeTrigger.querySelector(".custom-select__value").textContent =
      sizeText;
  }

  // Actualizar icono
  if (
    customizationSettings.icon === "custom" &&
    customizationSettings.customIcon
  ) {
    // Primero desactivar todos los iconos predefinidos
    document
      .querySelectorAll(".icon-option")
      .forEach((opt) => opt.classList.remove("active"));

    // Crear opción de imagen personalizada si existe
    let customOption = document.querySelector(".icon-option.custom-image");
    if (!customOption) {
      customOption = document.createElement("div");
      customOption.className = "icon-option custom-image";
      customOption.dataset.icon = "custom";
      const iconOptionsContainer = document.querySelector(".icon-options");
      if (iconOptionsContainer) {
        iconOptionsContainer.appendChild(customOption);
      }

      // Asegurarse de que el evento click esté configurado
      customOption.addEventListener("click", function () {
        document
          .querySelectorAll(".icon-option")
          .forEach((opt) => opt.classList.remove("active"));
        this.classList.add("active");
        customizationSettings.icon = "custom";
        updateBubbleIcon("custom", customizationSettings.customIcon);
        markAsChanged();
      });
    }
    customOption.innerHTML = `<img src="${customizationSettings.customIcon}" alt="Custom" style="width: 100%; height: 100%; object-fit: contain;">`;
    customOption.classList.add("active");
  } else {
    document.querySelectorAll(".icon-option").forEach((opt) => {
      opt.classList.toggle(
        "active",
        opt.dataset.icon === customizationSettings.icon
      );
    });
  }

  // Actualizar controles de escala y posición si hay imagen custom
  if (customizationSettings.customIcon) {
    const iconScale = document.getElementById("iconScale");
    const iconScaleValue = document.getElementById("iconScaleValue");
    const iconPosX = document.getElementById("iconPosX");
    const iconPosXValue = document.getElementById("iconPosXValue");
    const iconPosY = document.getElementById("iconPosY");
    const iconPosYValue = document.getElementById("iconPosYValue");
    const customIconControls = document.getElementById("customIconControls");

    if (iconScale) iconScale.value = customizationSettings.iconScale;
    if (iconScaleValue)
      iconScaleValue.textContent = customizationSettings.iconScale + "%";
    if (iconPosX) iconPosX.value = customizationSettings.iconPosX;
    if (iconPosXValue)
      iconPosXValue.textContent = customizationSettings.iconPosX + "px";
    if (iconPosY) iconPosY.value = customizationSettings.iconPosY;
    if (iconPosYValue)
      iconPosYValue.textContent = customizationSettings.iconPosY + "px";

    // Mostrar controles de personalización
    if (customIconControls) {
      customIconControls.style.display = "block";
    }
  }

  // Actualizar toggles
  document.querySelectorAll(".toggle-switch").forEach((toggle) => {
    const setting = toggle.dataset.setting;
    toggle.classList.toggle("active", customizationSettings[setting]);
  });

  // Aplicar efectos de los toggles (badge, autoGreeting)
  toggleBadge(customizationSettings.showBadge);
  toggleAutoGreeting(customizationSettings.autoGreeting);

  // Actualizar inputs de texto
  const welcomeMessageInput = document.getElementById("welcomeMessage");
  if (welcomeMessageInput)
    welcomeMessageInput.value = customizationSettings.welcomeMessage;

  const assistantNameInput = document.getElementById("assistantName");
  if (assistantNameInput)
    assistantNameInput.value = customizationSettings.assistantName;

  const inputPlaceholderInput = document.getElementById("inputPlaceholder");
  if (inputPlaceholderInput)
    inputPlaceholderInput.value = customizationSettings.inputPlaceholder;

  // Actualizar fuente
  if (
    customizationSettings.fontFamily === "custom" &&
    customizationSettings.customFont
  ) {
    const customFontInput = document.getElementById("customFontName");
    if (customFontInput) {
      customFontInput.value = customizationSettings.customFont;
      customFontInput.classList.add("active");
      document
        .querySelectorAll(".font-option")
        .forEach((opt) => opt.classList.remove("active"));
    }
  } else {
    document.querySelectorAll(".font-option").forEach((opt) => {
      opt.classList.toggle(
        "active",
        opt.dataset.font === customizationSettings.fontFamily
      );
    });
  }

  // Aplicar toda la personalización
  applyCustomization();

  // Forzar actualización del contraste después de cargar
  setTimeout(() => {
    const chatBubble = document.querySelector(".chat-bubble");
    const chatWindow = document.querySelector(".chat-window");
    if (needsDarkText(customizationSettings.color)) {
      if (chatBubble) chatBubble.classList.add("light-background");
      if (chatWindow) chatWindow.classList.add("light-background");
    } else {
      if (chatBubble) chatBubble.classList.remove("light-background");
      if (chatWindow) chatWindow.classList.remove("light-background");
    }
  }, 200);

  // Aplicar icono actual - forzar actualización del icono del chat window
  setTimeout(() => {
    if (
      customizationSettings.icon === "custom" &&
      customizationSettings.customIcon
    ) {
      updateBubbleIcon("custom", customizationSettings.customIcon);
      // Aplicar transformaciones después de actualizar el icono
      setTimeout(() => {
        updateCustomIconTransform();
      }, 50);
    } else if (customizationSettings.icon) {
      updateBubbleIcon(customizationSettings.icon);
    }
  }, 150);

  // Solo necesitamos actualizar los controles del custom icon si existe
  if (customizationSettings.customIcon) {
    const customIconControls = document.getElementById("customIconControls");
    if (customIconControls) {
      customIconControls.style.display = "block";
    }
  }
}

// =====================================================
// MARCAR COMO CAMBIADO
// =====================================================

function markAsChanged() {
  if (typeof window.showUnsavedChangesWarning === "function") {
    window.hasUnsavedChanges = true;
    if (typeof hasUnsavedChanges !== 'undefined') {
      hasUnsavedChanges = true;
    }
    window.showUnsavedChangesWarning();
  }
}

// =====================================================
// GUARDAR CONFIGURACIÓN
// =====================================================

async function saveCustomizationSettings() {
  const urlParams = new URLSearchParams(window.location.search);
  const chatbotId = urlParams.get("id");

  if (!chatbotId) return false;

  // Preparar los datos para enviar al backend
  const dataToSave = {
    main_color: customizationSettings.color,
    widget_position: customizationSettings.position,
    greeting_message: customizationSettings.welcomeMessage,
    placeholder_text: customizationSettings.inputPlaceholder,
    bubble_size: customizationSettings.bubbleSize,
    style: customizationSettings.style,
    icon_type: customizationSettings.icon,
    custom_icon:
      customizationSettings.icon === "custom"
        ? customizationSettings.customIcon
        : null,
    icon_scale: customizationSettings.iconScale,
    icon_pos_x: customizationSettings.iconPosX,
    icon_pos_y: customizationSettings.iconPosY,
    show_badge: customizationSettings.showBadge,
    show_typing_indicator: customizationSettings.showTypingIndicator,
    auto_greeting: customizationSettings.autoGreeting,
    assistant_name: customizationSettings.assistantName,
    font_family:
      customizationSettings.fontFamily === "custom"
        ? null
        : customizationSettings.fontFamily,
    custom_font:
      customizationSettings.fontFamily === "custom"
        ? customizationSettings.customFont
        : null,
  };

  try {
    const baseURL =
      window.dashboardAPI?.baseURL ||
      "https://velvz-unified-backend-production.up.railway.app";
    const token = localStorage.getItem("velvz_token");

    const response = await fetch(
      `${baseURL}/api/chatbots/${chatbotId}/widget/config`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSave),
      }
    );

    if (response.ok) {
      return true;
    } else {
      if (window.showErrorMessage) {
        window.showErrorMessage("Error al guardar la configuración");
      }
      return false;
    }
  } catch (error) {
    if (window.showErrorMessage) {
      window.showErrorMessage("Error de conexión al guardar");
    }
    return false;
  }
}

// =====================================================
// FUNCIONES DE MENSAJES
// =====================================================

window.showSuccessMessage = function (message) {
  if (window.showSuccess) {
    window.showSuccess(message);
  } else {
    console.log("✅", message);
  }
};

window.showErrorMessage = function (message) {
  if (window.showError) {
    window.showError(message);
  } else {
    console.error("❌", message);
  }
};

// =====================================================
// EXPORTAR FUNCIONES
// =====================================================

window.initializeCustomizationSection = initializeCustomizationSection;
window.getCustomizationSettings = function () {
  return customizationSettings;
};
window.saveCustomizationSettings = saveCustomizationSettings;

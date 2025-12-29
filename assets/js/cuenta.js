// =====================================================
// CUENTA.JS - PARTE 1/2
// INICIALIZACIÓN, CONFIGURACIÓN Y EVENT LISTENERS
// =====================================================

// =====================================================
// VARIABLES GLOBALES
// =====================================================

let currentMode = "login";
let isLoading = false;
let retryCount = 0;
const MAX_RETRIES = 3;

// Elementos DOM - Inicialización segura
let authToggle, authTitle, authSubtitle, emailForm;
let nameGroup, termsGroup, submitBtn, errorMessage, successMessage;
let passwordToggle, passwordInput;

// =====================================================
// SISTEMA DE LOGS MEJORADO (SIN CONFLICTOS)
// =====================================================

const CuentaLogger = {
  isDev:
    window.location.hostname === "localhost" ||
    window.location.hostname.includes("127.0.0.1"),

  log(message, data = null) {
    if (this.isDev) {
      console.log(`🔐 Cuenta: ${message}`, data || "");
    }
  },

  error(message, error = null) {
    console.error(`❌ Cuenta Error: ${message}`, error || "");
  },

  success(message, data = null) {
    if (this.isDev) {
      console.log(`✅ Cuenta Success: ${message}`, data || "");
    }
  },

  warn(message, data = null) {
    console.warn(`⚠️ Cuenta Warning: ${message}`, data || "");
  },
};

// =====================================================
// INICIALIZACIÓN MEJORADA Y SEGURA
// =====================================================

document.addEventListener("DOMContentLoaded", function () {
  CuentaLogger.log("Inicializando portal de autenticación Velvz");

  // Verificar dependencias críticas primero
  if (!checkDependencies()) {
    showCriticalError("Error del sistema: Dependencias no disponibles");
    return;
  }

  // Inicializar elementos DOM de forma segura
  if (!initializeDOMElements()) {
    showCriticalError("Error del sistema: Elementos DOM no encontrados");
    return;
  }

  // Inicialización ordenada y con manejo de errores
  try {
    setupEventListeners();
    setupFormAnimations();
    setupMobileHeaderCompat(); // Compatibilidad con public-pages.js

    // Verificaciones asíncronas
    setTimeout(() => {
      checkExistingSession();
      checkBackendConnection();
    }, 100);

    CuentaLogger.success("Portal inicializado correctamente");
  } catch (error) {
    CuentaLogger.error("Error durante la inicialización", error);
    showError("Error al inicializar la página. Recarga e inténtalo de nuevo.");
  }
});

// =====================================================
// INICIALIZACIÓN DE ELEMENTOS DOM
// =====================================================

function initializeDOMElements() {
  try {
    // Elementos principales del formulario
    authToggle = document.getElementById("authToggle");
    authTitle = document.getElementById("authTitle");
    authSubtitle = document.getElementById("authSubtitle");
    emailForm = document.getElementById("emailForm");

    // Grupos de campos
    nameGroup = document.getElementById("nameGroup");
    termsGroup = document.getElementById("termsGroup");

    // Botones y controles
    submitBtn = document.getElementById("submitBtn");
    passwordToggle = document.getElementById("passwordToggle");
    passwordInput = document.getElementById("passwordInput");

    // Mensajes
    errorMessage = document.getElementById("errorMessage");
    successMessage = document.getElementById("successMessage");

    // Verificar que los elementos críticos existen y son accesibles
    if (!nameGroup) {
      CuentaLogger.warn("nameGroup no encontrado - verificar HTML");
    }
    if (!termsGroup) {
      CuentaLogger.warn("termsGroup no encontrado - verificar HTML");
    }
    if (!submitBtn) {
      CuentaLogger.error("submitBtn no encontrado - crítico!");
      return false;
    }

    // Verificar elementos críticos
    const criticalElements = [authToggle, emailForm, submitBtn];
    const missingElements = criticalElements.filter((el) => !el);

    if (missingElements.length > 0) {
      CuentaLogger.error("Elementos DOM faltantes:", missingElements);
      return false;
    }

    return true;
  } catch (error) {
    CuentaLogger.error("Error inicializando elementos DOM:", error);
    return false;
  }
}

// =====================================================
// VERIFICACIÓN DE DEPENDENCIAS MEJORADA
// =====================================================

function checkDependencies() {
  const required = [
    { name: "velvzAuth", obj: window.velvzAuth, critical: true },
    { name: "fetch", obj: window.fetch, critical: true },
    { name: "localStorage", obj: window.localStorage, critical: false },
  ];

  const missing = required.filter((dep) => !dep.obj);
  const criticalMissing = missing.filter((dep) => dep.critical);

  if (missing.length > 0) {
    CuentaLogger.warn(
      "Dependencias faltantes:",
      missing.map((d) => d.name)
    );
  }

  if (criticalMissing.length > 0) {
    CuentaLogger.error(
      "Dependencias críticas faltantes:",
      criticalMissing.map((d) => d.name)
    );
    return false;
  }

  return true;
}

// =====================================================
// EVENT LISTENERS MEJORADOS Y SEGUROS
// =====================================================

function setupEventListeners() {
  try {
    // Toggle entre login y register
    if (authToggle) {
      const toggleBtns = authToggle.querySelectorAll(
        ".velvz-cuenta__toggle-option"
      );
      toggleBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          const mode = btn.getAttribute("data-mode");
          if (mode && mode !== currentMode) {
            switchMode(mode);
          }
        });
      });
    }

    // Formulario principal
    if (emailForm) {
      emailForm.addEventListener("submit", handleFormSubmit);
    }

    // Validación en tiempo real
    const emailInput = document.getElementById("emailInput");
    const passwordInputEl = document.getElementById("passwordInput");

    if (emailInput) {
      emailInput.addEventListener("blur", validateEmailField);
      emailInput.addEventListener("input", clearFieldErrors);
    }

    if (passwordInputEl) {
      passwordInputEl.addEventListener("input", validatePasswordField);
      passwordInputEl.addEventListener("blur", validatePasswordField);
    }

    // Toggle de contraseña
    if (passwordToggle && passwordInput) {
      passwordToggle.addEventListener("click", togglePasswordVisibility);
    }

    // Forgot password
    const forgotPasswordLink = document.getElementById("forgotPassword");
    if (forgotPasswordLink) {
      forgotPasswordLink.addEventListener("click", handleForgotPassword);
    }

    // Auth toggle link
    const authToggleLink = document.getElementById("authToggleLink");
    if (authToggleLink) {
      authToggleLink.addEventListener("click", (e) => {
        e.preventDefault();
        switchMode(currentMode === "login" ? "register" : "login");
      });
    }

    // Detectar parámetros URL para mostrar mensajes
    checkUrlParameters();

    CuentaLogger.log("Event listeners configurados correctamente");
  } catch (error) {
    CuentaLogger.error("Error configurando event listeners:", error);
    throw error;
  }
}

// =====================================================
// COMPATIBILIDAD CON PUBLIC-PAGES.JS
// =====================================================

function setupMobileHeaderCompat() {
  // Evitar conflictos con public-pages.js en el manejo del header móvil
  // Solo configurar si no está ya inicializado

  const mobileToggle = document.querySelector(".velvz-header__mobile-toggle");
  const mobileBackdrop = document.querySelector(
    ".velvz-header__mobile-backdrop"
  );
  const mobileMenu = document.querySelector(".velvz-header__mobile-menu");
  const mobileClose = document.querySelector(".velvz-header__mobile-close");

  if (!mobileToggle || mobileToggle.dataset.initialized) {
    return; // Ya inicializado por public-pages.js
  }

  // Marcar como inicializado para evitar duplicación
  mobileToggle.dataset.initialized = "true";

  // Configurar solo si public-pages.js no lo hizo
  if (mobileToggle && mobileBackdrop && mobileMenu) {
    mobileToggle.addEventListener("click", () => {
      mobileMenu.classList.add("velvz-header__mobile-menu--active");
      mobileBackdrop.classList.add("velvz-header__mobile-backdrop--active");
      document.body.style.overflow = "hidden";
    });

    const closeMobileMenu = () => {
      mobileMenu.classList.remove("velvz-header__mobile-menu--active");
      mobileBackdrop.classList.remove("velvz-header__mobile-backdrop--active");
      document.body.style.overflow = "";
    };

    if (mobileClose) {
      mobileClose.addEventListener("click", closeMobileMenu);
    }

    if (mobileBackdrop) {
      mobileBackdrop.addEventListener("click", closeMobileMenu);
    }
  }
}

// =====================================================
// MANEJO DE PARÁMETROS URL
// =====================================================

function checkUrlParameters() {
  try {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get("verified") === "true") {
      showSuccess(
        "🎉 ¡Email verificado correctamente! Ya puedes iniciar sesión.",
        8000
      );
      // Limpiar URL sin recargar
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (urlParams.get("reset") === "true") {
      showSuccess(
        "🔐 ¡Contraseña actualizada! Ya puedes iniciar sesión con tu nueva contraseña.",
        8000
      );
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (urlParams.get("expired") === "true") {
      const userName = urlParams.get("user");
      if (userName) {
        showError(`👋 Hola ${userName}, tu sesión ha expirado. Por favor, inicia sesión de nuevo.`);
      } else {
        showError("⏰ Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (urlParams.get("error")) {
      const errorMsg = urlParams.get("error");
      showError(`Error: ${decodeURIComponent(errorMsg)}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  } catch (error) {
    CuentaLogger.error("Error procesando parámetros URL:", error);
  }
}

// =====================================================
// ANIMACIONES Y UX
// =====================================================

function setupFormAnimations() {
  function showFormElements() {
    const elements = document.querySelectorAll(".form-element");
    elements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add("visible");
      }, index * 100);
    });
  }

  // Iniciar animaciones después de un breve delay
  setTimeout(showFormElements, 200);
}

// =====================================================
// CUENTA.JS - PARTE 2/2
// AUTENTICACIÓN, BACKEND Y FUNCIONES DE UI
// =====================================================

// =====================================================
// VERIFICACIONES INICIALES MEJORADAS
// =====================================================

async function checkBackendConnection() {
  try {
    showConnectionStatus("Verificando conexión...", "loading");

    // Verificar si velvzAuth está disponible antes de usarlo
    if (
      !window.velvzAuth ||
      typeof window.velvzAuth.checkHealth !== "function"
    ) {
      showConnectionStatus("⚠️ Sistema de auth no disponible", "warning");
      CuentaLogger.warn("velvzAuth no está disponible o no tiene checkHealth");
      return;
    }

    const health = await window.velvzAuth.checkHealth();

    if (health && health.success) {
      showConnectionStatus("✅ Conectado", "success");
      setTimeout(() => hideConnectionStatus(), 2000);
    } else {
      showConnectionStatus("⚠️ Problemas de conexión", "warning");
      CuentaLogger.warn("Backend con problemas:", health);
    }
  } catch (error) {
    CuentaLogger.error("Error conectando con backend:", error);
    showConnectionStatus("❌ Modo offline", "error");
    // No mostrar error intrusivo, solo log
    setTimeout(() => hideConnectionStatus(), 3000);
  }
}

async function checkExistingSession() {
  if (!window.velvzAuth || typeof window.velvzAuth.isLoggedIn !== "function") {
    CuentaLogger.warn("velvzAuth no disponible para verificar sesión");
    return;
  }

  if (!window.velvzAuth.isLoggedIn()) {
    return;
  }

  CuentaLogger.log("Verificando sesión existente...");

  try {
    const profile = await window.velvzAuth.getProfile();

    if (profile && profile.success && profile.user) {
      CuentaLogger.success("Sesión válida encontrada:", profile.user.email);

      showSuccess(
        `¡Sesión activa como <strong>${
          profile.user.name || profile.user.email
        }</strong>!<br>` +
          `<a href="/app/" style="color: #667eea; text-decoration: underline; font-weight: 600;">🚀 Ir a la aplicación</a>`,
        0
      );

      // Disparar evento para que otros scripts sepan del cambio
      window.dispatchEvent(
        new CustomEvent("velvz-auth-changed", {
          detail: { user: profile.user, action: "session-verified" },
        })
      );
    } else {
      CuentaLogger.log("Sesión inválida, limpiando...");
      window.velvzAuth.logout();
    }
  } catch (error) {
    CuentaLogger.error("Error verificando sesión:", error);
    if (window.velvzAuth && typeof window.velvzAuth.logout === "function") {
      window.velvzAuth.logout();
    }
  }
}

// =====================================================
// CAMBIO DE MODO MEJORADO
// =====================================================

function switchMode(mode) {
  if (currentMode === mode || isLoading) return;

  console.log(`CAMBIANDO MODO: ${currentMode} -> ${mode}`);

  currentMode = mode;
  console.log(`MODO ACTUAL DESPUÉS DEL CAMBIO: ${currentMode}`);

  // Animación de salida (solo elementos visibles actualmente)
  const visibleElements = document.querySelectorAll(
    ".form-element:not(#nameGroup):not(#termsGroup)"
  );
  visibleElements.forEach((element) => {
    element.classList.remove("visible");
  });

  // Actualizar toggle visual
  if (authToggle) {
    authToggle.classList.toggle(
      "velvz-cuenta__toggle--register",
      mode === "register"
    );

    const toggleBtns = authToggle.querySelectorAll(
      ".velvz-cuenta__toggle-option"
    );
    toggleBtns.forEach((btn) => {
      btn.classList.toggle(
        "velvz-cuenta__toggle-option--active",
        btn.getAttribute("data-mode") === mode
      );
    });
  }

  // Actualizar contenido
  setTimeout(() => {
    updateFormContent(mode);
    clearMessages();
    clearFieldErrors();

    // Animación de entrada - solo elementos que deben ser visibles
    setTimeout(() => {
      const selector =
        mode === "register"
          ? ".form-element"
          : ".form-element:not(#nameGroup):not(#termsGroup)";

      const elementsToShow = document.querySelectorAll(selector);
      elementsToShow.forEach((element, index) => {
        setTimeout(() => {
          element.classList.add("visible");
        }, index * 50);
      });
    }, 50);
  }, 150);
}

function updateFormContent(mode) {
  // Re-obtener elementos por si se perdieron las referencias
  const nameGroupEl = document.getElementById("nameGroup");
  const termsGroupEl = document.getElementById("termsGroup");
  const submitBtnEl = document.getElementById("submitBtn");

  if (mode === "login") {
    // Modo LOGIN
    if (authTitle) authTitle.textContent = "Accede a tu cuenta";
    if (authSubtitle)
      authSubtitle.textContent = "Gestiona tus chatbots y configuraciones";

    // FORZAR ocultación de campos de registro
    if (nameGroupEl) {
      nameGroupEl.style.cssText = "display: none !important;";
      nameGroupEl.classList.remove("visible");
    }
    if (termsGroupEl) {
      termsGroupEl.style.cssText = "display: none !important;";
      termsGroupEl.classList.remove("visible");
    }

    // FORZAR actualización del botón
    if (submitBtnEl) {
      submitBtnEl.innerHTML = "Iniciar Sesión";
      submitBtnEl.textContent = "Iniciar Sesión";
      submitBtnEl.value = "Iniciar Sesión";
    }

    // Mostrar enlace de forgot password
    const forgotLink = document.getElementById("forgotPassword");
    if (forgotLink) forgotLink.style.display = "block";

    // Quitar required
    const nameInput = document.getElementById("nameInput");
    const termsCheckbox = document.getElementById("termsCheckbox");
    if (nameInput) nameInput.removeAttribute("required");
    if (termsCheckbox) termsCheckbox.removeAttribute("required");
  } else if (mode === "register") {
    // Modo REGISTRO
    if (authTitle) authTitle.textContent = "Crea tu cuenta";
    if (authSubtitle)
      authSubtitle.textContent = "Únete a Velvz y potencia tu negocio con IA";

    // FORZAR visualización de campos de registro
    if (nameGroupEl) {
      nameGroupEl.style.cssText = "display: block !important;";
      nameGroupEl.classList.add("form-element");
      setTimeout(() => nameGroupEl.classList.add("visible"), 50);
    }
    if (termsGroupEl) {
      termsGroupEl.style.cssText = "display: block !important;";
      termsGroupEl.classList.add("form-element");
      setTimeout(() => termsGroupEl.classList.add("visible"), 100);
    }

    // FORZAR actualización del botón
    if (submitBtnEl) {
      submitBtnEl.innerHTML = "Crear Cuenta";
      submitBtnEl.textContent = "Crear Cuenta";
      submitBtnEl.value = "Crear Cuenta";
    }

    // Ocultar enlace de forgot password
    const forgotLink = document.getElementById("forgotPassword");
    if (forgotLink) forgotLink.style.display = "none";

    // Agregar required
    const nameInput = document.getElementById("nameInput");
    const termsCheckbox = document.getElementById("termsCheckbox");
    if (nameInput) nameInput.setAttribute("required", "");
    if (termsCheckbox) termsCheckbox.setAttribute("required", "");
  }

  // Actualizar texto del toggle link
  const authToggleText = document.getElementById("authToggleText");
  if (authToggleText) {
    if (mode === "login") {
      authToggleText.innerHTML =
        '¿No tienes cuenta? <a href="#" id="authToggleLink" class="auth-link">Créala aquí</a>';
    } else {
      authToggleText.innerHTML =
        '¿Ya tienes cuenta? <a href="#" id="authToggleLink" class="auth-link">Inicia sesión</a>';
    }

    // Re-bind event listener
    const newToggleLink = document.getElementById("authToggleLink");
    if (newToggleLink) {
      newToggleLink.addEventListener("click", (e) => {
        e.preventDefault();
        switchMode(currentMode === "login" ? "register" : "login");
      });
    }
  }

  // VERIFICACIÓN FINAL - Asegurar que los cambios persistan
  setTimeout(() => {
    const finalCheck = {
      nameGroup: document.getElementById("nameGroup"),
      termsGroup: document.getElementById("termsGroup"),
      submitBtn: document.getElementById("submitBtn"),
    };

    if (mode === "register") {
      if (
        finalCheck.nameGroup &&
        finalCheck.nameGroup.style.display === "none"
      ) {
        CuentaLogger.warn(
          "DETECTADO: nameGroup fue revertido, forzando de nuevo..."
        );
        finalCheck.nameGroup.style.cssText = "display: block !important;";
      }
      if (
        finalCheck.termsGroup &&
        finalCheck.termsGroup.style.display === "none"
      ) {
        CuentaLogger.warn(
          "DETECTADO: termsGroup fue revertido, forzando de nuevo..."
        );
        finalCheck.termsGroup.style.cssText = "display: block !important;";
      }
      if (
        finalCheck.submitBtn &&
        finalCheck.submitBtn.textContent.includes("Iniciar")
      ) {
        CuentaLogger.warn(
          "DETECTADO: submitBtn fue revertido, forzando de nuevo..."
        );
        finalCheck.submitBtn.innerHTML = "Crear Cuenta";
        finalCheck.submitBtn.textContent = "Crear Cuenta";
      }
    }
  }, 300);

  CuentaLogger.log(`Formulario actualizado a modo: ${mode}`);
}

// =====================================================
// MANEJO DE FORMULARIOS MEJORADO
// =====================================================

async function handleFormSubmit(e) {
  e.preventDefault();

  if (isLoading) return;

  const formData = new FormData(emailForm);
  const email = formData.get("email")?.trim() || "";
  const password = formData.get("password") || "";
  const name = formData.get("name")?.trim() || "";

  // DEBUG: Verificar qué modo está activo
  console.log("MODO ACTUAL:", currentMode);
  console.log("DATOS:", { name, email, password });

  // Validaciones
  if (!validateForm(email, password, name)) {
    return;
  }

  if (currentMode === "login") {
    console.log("Llamando a handleLogin");
    await handleLogin(email, password);
  } else if (currentMode === "register") {
    console.log("Llamando a handleRegister");
    await handleRegister(name, email, password);
  } else {
    console.error("Modo no reconocido:", currentMode);
  }
}

function validateForm(email, password, name) {
  clearMessages();
  clearFieldErrors();

  let isValid = true;
  let firstInvalidField = null;

  // Validar email
  if (!email || !isValidEmail(email)) {
    showError("Por favor ingresa un email válido");
    const emailInput = document.getElementById("emailInput");
    if (emailInput) {
      emailInput.focus();
      firstInvalidField = emailInput;
    }
    isValid = false;
  }

  // Validar contraseña
  if (!password || password.length < 6) {
    if (isValid) showError("La contraseña debe tener al menos 6 caracteres");
    const passwordInputEl = document.getElementById("passwordInput");
    if (passwordInputEl && !firstInvalidField) {
      passwordInputEl.focus();
      firstInvalidField = passwordInputEl;
    }
    isValid = false;
  }

  // Validar nombre en registro
  if (currentMode === "register") {
    if (!name || name.length < 2) {
      if (isValid) showError("Por favor ingresa tu nombre completo");
      const nameInput = document.getElementById("nameInput");
      if (nameInput && !firstInvalidField) {
        nameInput.focus();
        firstInvalidField = nameInput;
      }
      isValid = false;
    }

    const termsCheckbox = document.getElementById("termsCheckbox");
    if (termsCheckbox && !termsCheckbox.checked) {
      if (isValid) showError("Debes aceptar los términos y condiciones");
      isValid = false;
    }
  }

  return isValid;
}

async function handleLogin(email, password) {
  CuentaLogger.log("Iniciando sesión para:", email);

  setLoading(true, "Verificando credenciales...");

  try {
    if (!window.velvzAuth || typeof window.velvzAuth.login !== "function") {
      throw new Error("Sistema de autenticación no disponible");
    }

    const result = await window.velvzAuth.login(email, password);

    if (result && result.success && result.user) {
      CuentaLogger.success(
        "Login exitoso:",
        result.user.name || result.user.email
      );

      // Guardar token en localStorage para persistir la sesión
      if (result.token) {
        localStorage.setItem("velvz_token", result.token);
        localStorage.setItem("velvz_user", JSON.stringify(result.user));
        CuentaLogger.log("Token guardado en localStorage");
      }

      setLoading(true, "¡Acceso concedido! Redirigiendo...");
      showSuccess(
        `¡Bienvenido de vuelta, <strong>${
          result.user.name || result.user.email
        }</strong>!`
      );

      window.dispatchEvent(
        new CustomEvent("velvz-auth-changed", {
          detail: { user: result.user, action: "login" },
        })
      );

      setTimeout(() => {
        window.location.href = "/app/";
      }, 1500);
    } else {
      handleLoginError(result, email);
    }
  } catch (error) {
    CuentaLogger.error("Error crítico en login:", error);
    handleConnectionError();
  } finally {
    setLoading(false);
  }
}

function handleLoginError(result, email) {
  retryCount++;

  if (result && result.message) {
    if (
      result.message.includes("verificar tu email") ||
      result.message.includes("verify")
    ) {
      showEmailNotVerifiedError(email, result.message);
    } else if (result.status === 429) {
      showError(
        "Demasiados intentos. Espera unos minutos antes de intentar de nuevo."
      );
    } else if (result.status >= 500) {
      if (retryCount < MAX_RETRIES) {
        showError("Error del servidor. Reintentando automáticamente...");
        setTimeout(() => {
          if (submitBtn) submitBtn.click();
        }, 2000);
      } else {
        showError("Error persistente del servidor. Inténtalo más tarde.");
      }
    } else {
      showError(result.message || "Credenciales incorrectas");
    }
  } else {
    showError(
      "Error de conexión. Verifica tus credenciales e inténtalo de nuevo."
    );
  }
}

async function handleRegister(name, email, password) {
  CuentaLogger.log("Registrando usuario:", email);

  setLoading(true, "Creando tu cuenta...");

  try {
    if (!window.velvzAuth || typeof window.velvzAuth.register !== "function") {
      throw new Error("Sistema de autenticación no disponible");
    }

    const result = await window.velvzAuth.register({ name, email, password });

    if (result && result.success) {
      CuentaLogger.success("Registro exitoso - verificación pendiente");
      showEmailSentMessage(email, name);
    } else {
      handleRegisterError(result);
    }
  } catch (error) {
    CuentaLogger.error("Error crítico en registro:", error);
    handleConnectionError();
  } finally {
    setLoading(false);
  }
}

function handleRegisterError(result) {
  let errorMessage = (result && result.message) || "Error al crear la cuenta";

  if (
    errorMessage.includes("existe una cuenta") ||
    errorMessage.includes("already exists") ||
    errorMessage.includes("email is already")
  ) {
    errorMessage =
      "Ya existe una cuenta con este email. ¿Quieres <a href='#' onclick='switchMode(\"login\")' style='color: #667eea; text-decoration: underline;'>iniciar sesión</a>?";
  }

  showError(errorMessage);
}

function handleConnectionError() {
  showError("Error de conexión. Verifica tu internet e inténtalo de nuevo.");
  showConnectionStatus("❌ Sin conexión", "error");
}

// =====================================================
// VALIDACIÓN EN TIEMPO REAL
// =====================================================

function validateEmailField(e) {
  const email = e.target.value.trim();
  const isValid = email === "" || isValidEmail(email);

  e.target.style.borderColor =
    email === "" ? "" : isValid ? "#10b981" : "#ef4444";

  if (email !== "" && !isValid) {
    showFieldError(e.target, "Email inválido");
  } else {
    hideFieldError(e.target);
  }
}

function validatePasswordField(e) {
  const password = e.target.value;
  const isValid = password.length >= 6; // Válido si tiene 6+ caracteres

  // Aplicar color del borde según validez
  if (password === "") {
    // Campo vacío - sin color
    e.target.style.borderColor = "";
    e.target.style.boxShadow = "";
    hideFieldError(e.target);
  } else if (isValid) {
    // Contraseña válida - borde verde
    e.target.style.borderColor = "#10b981";
    e.target.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.1)";
    hideFieldError(e.target);
  } else {
    // Contraseña inválida - borde rojo
    e.target.style.borderColor = "#ef4444";
    e.target.style.boxShadow = "0 0 0 3px rgba(239, 68, 68, 0.1)";
    showFieldError(e.target, "Mínimo 6 caracteres");
  }
}

function clearFieldErrors() {
  document.querySelectorAll(".field-error").forEach((el) => el.remove());
  document.querySelectorAll(".form-input").forEach((input) => {
    input.style.borderColor = "";
  });
}

function showFieldError(field, message) {
  let errorEl = field.parentNode.querySelector(".field-error");

  if (!errorEl) {
    errorEl = document.createElement("div");
    errorEl.className = "field-error";
    errorEl.style.cssText = `
      color: #ef4444;
      font-size: 12px;
      margin-top: 4px;
      font-weight: 500;
    `;
    field.parentNode.appendChild(errorEl);
  }

  errorEl.textContent = message;
}

function hideFieldError(field) {
  const errorEl = field.parentNode.querySelector(".field-error");
  if (errorEl) {
    errorEl.remove();
  }
}

// =====================================================
// UI DE ESTADO DE CONEXIÓN
// =====================================================

function showConnectionStatus(message, type) {
  let statusEl = document.getElementById("connectionStatus");

  if (!statusEl) {
    statusEl = document.createElement("div");
    statusEl.id = "connectionStatus";
    statusEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      z-index: 10001;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    `;
    document.body.appendChild(statusEl);
  }

  const colors = {
    loading: "background: rgba(102, 126, 234, 0.9); color: white;",
    success: "background: rgba(16, 185, 129, 0.9); color: white;",
    warning: "background: rgba(245, 158, 11, 0.9); color: white;",
    error: "background: rgba(239, 68, 68, 0.9); color: white;",
  };

  statusEl.style.cssText += colors[type] || colors.loading;
  statusEl.textContent = message;
  statusEl.style.opacity = "1";
  statusEl.style.transform = "translateX(0)";
}

function hideConnectionStatus() {
  const statusEl = document.getElementById("connectionStatus");
  if (statusEl) {
    statusEl.style.opacity = "0";
    statusEl.style.transform = "translateX(100%)";
    setTimeout(() => statusEl.remove(), 300);
  }
}

// =====================================================
// FUNCIONES DE UI Y MENSAJES
// =====================================================

function setLoading(loading, text = "") {
  isLoading = loading;

  if (!submitBtn) return;

  if (loading) {
    submitBtn.disabled = true;
    submitBtn.style.opacity = "0.7";
    submitBtn.innerHTML = `
      <span style="display: inline-flex; align-items: center; gap: 8px;">
        <span style="width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: white; animation: spin 1s linear infinite;"></span>
        ${text}
      </span>
    `;

    // Añadir animación de loading si no existe
    if (!document.querySelector("#loading-animation")) {
      const style = document.createElement("style");
      style.id = "loading-animation";
      style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
      document.head.appendChild(style);
    }
  } else {
    submitBtn.disabled = false;
    submitBtn.style.opacity = "1";
    submitBtn.textContent =
      currentMode === "login" ? "Iniciar Sesión" : "Crear Cuenta";
  }
}

function showError(message) {
  if (!errorMessage) return;
  clearMessages();
  errorMessage.innerHTML = message;
  errorMessage.style.display = "block";
  scrollToMessage();
  CuentaLogger.error("Error mostrado:", message);
}

function showSuccess(message, duration = 4000) {
  if (!successMessage) return;
  clearMessages();
  successMessage.innerHTML = message;
  successMessage.style.display = "block";
  scrollToMessage();

  if (duration > 0) {
    setTimeout(() => {
      successMessage.style.display = "none";
    }, duration);
  }

  CuentaLogger.success("Éxito mostrado:", message);
}

function clearMessages() {
  if (errorMessage) errorMessage.style.display = "none";
  if (successMessage) successMessage.style.display = "none";
}

// =====================================================
// FUNCIONES AUXILIARES
// =====================================================

function togglePasswordVisibility() {
  if (!passwordInput || !passwordToggle) return;

  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";

  const icon = passwordToggle.querySelector("i");
  if (icon) {
    icon.className = isPassword ? "fas fa-eye-slash" : "fas fa-eye";
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function scrollToMessage() {
  const visibleMessage =
    errorMessage && errorMessage.style.display === "block"
      ? errorMessage
      : successMessage && successMessage.style.display === "block"
      ? successMessage
      : null;

  if (visibleMessage) {
    const messageRect = visibleMessage.getBoundingClientRect();
    const offset = window.innerWidth <= 768 ? 100 : 120;
    const messagePosition = window.pageYOffset + messageRect.top;
    const scrollTarget = messagePosition - offset;

    window.scrollTo({
      top: Math.max(0, scrollTarget),
      behavior: "smooth",
    });
  }
}

// =====================================================
// FORGOT PASSWORD Y VERIFICACIONES DE EMAIL
// =====================================================

async function handleForgotPassword(e) {
  e.preventDefault();

  const emailInput = document.getElementById("emailInput");
  const email = emailInput ? emailInput.value.trim() : "";

  if (!email) {
    showError("Por favor ingresa tu email para recuperar la contraseña");
    if (emailInput) emailInput.focus();
    return;
  }

  if (!isValidEmail(email)) {
    showError("Por favor ingresa un email válido");
    if (emailInput) emailInput.focus();
    return;
  }

  CuentaLogger.log("Solicitando reset de contraseña para:", email);

  const forgotBtn = document.getElementById("forgotPassword");
  const originalText = forgotBtn ? forgotBtn.textContent : "";

  if (forgotBtn) {
    forgotBtn.textContent = "Enviando...";
    forgotBtn.style.opacity = "0.6";
  }

  try {
    if (
      !window.velvzAuth ||
      typeof window.velvzAuth.forgotPassword !== "function"
    ) {
      throw new Error("Sistema de autenticación no disponible");
    }

    const result = await window.velvzAuth.forgotPassword(email);

    if (result && result.success) {
      CuentaLogger.success("Solicitud de reset enviada:", email);

      showSuccess(
        `<div style="text-align: center; padding: 12px;">
          <div style="font-size: 2rem; margin-bottom: 12px;">🔐</div>
          <strong>Email de recuperación enviado</strong><br><br>
          Si <strong>${email}</strong> está registrado, recibirás un enlace de recuperación en unos minutos.<br><br>
          <small style="color: #64748b;">
            • Revisa tu bandeja de entrada y spam<br>
            • El enlace expira en 1 hora<br>
            • Si no lo recibes, puedes intentar de nuevo
          </small>
        </div>`,
        0
      );

      if (emailInput) emailInput.value = "";
    } else {
      CuentaLogger.log(
        "Error en solicitud de reset:",
        result ? result.message : "Unknown"
      );
      showError((result && result.message) || "Error al procesar la solicitud");
    }
  } catch (error) {
    CuentaLogger.error("Error crítico en forgot password:", error);
    showError("Error de conexión. Inténtalo de nuevo.");
  } finally {
    if (forgotBtn) {
      forgotBtn.textContent = originalText;
      forgotBtn.style.opacity = "1";
    }
  }
}

function showEmailSentMessage(email, name) {
  clearMessages();

  const messageContent = `
    <div style="text-align: center; padding: 24px;">
      <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);">
        <span style="font-size: 24px; color: white;">📧</span>
      </div>
      <h3 style="margin: 0 0 12px; color: #10b981; font-size: 18px;">¡Cuenta creada exitosamente!</h3>
      <p style="margin: 0 0 16px; color: #374151; line-height: 1.5;">
        Hola <strong>${name}</strong>, hemos enviado un enlace de verificación a:<br>
        <strong style="color: #667eea;">${email}</strong>
      </p>
      <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p style="margin: 0; color: #0c4a6e; font-size: 14px; line-height: 1.4;">
          <strong>📋 Próximos pasos:</strong><br>
          1. Revisa tu bandeja de entrada (y spam)<br>
          2. Haz click en el enlace de verificación<br>
          3. ¡Regresa aquí para iniciar sesión!
        </p>
      </div>
    </div>
  `;

  if (successMessage) {
    successMessage.innerHTML = messageContent;
    successMessage.style.display = "block";
    scrollToMessage();
  }

  CuentaLogger.success("Mensaje de verificación mostrado para:", email);
}

function showEmailNotVerifiedError(email, message) {
  clearMessages();

  const messageContent = `
    <div style="text-align: center; padding: 24px;">
      <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 8px 24px rgba(245, 158, 11, 0.3);">
        <span style="font-size: 24px; color: white;">⚠️</span>
      </div>
      <h3 style="margin: 0 0 12px; color: #d97706; font-size: 18px;">Email no verificado</h3>
      <p style="margin: 0 0 16px; color: #374151; line-height: 1.5;">
        Necesitas verificar tu email antes de poder iniciar sesión.<br>
        <strong style="color: #667eea;">${email}</strong>
      </p>
      <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.4;">
          <strong>🔍 ¿No encuentras el email?</strong><br>
          • Revisa tu carpeta de spam<br>
          • Puede tardar unos minutos en llegar<br>
          • Verifica que el email sea correcto
        </p>
      </div>
    </div>
  `;

  if (errorMessage) {
    errorMessage.innerHTML = messageContent;
    errorMessage.style.display = "block";
    scrollToMessage();
  }

  CuentaLogger.log("Email no verificado para:", email);
}

// =====================================================
// FUNCIONES DE ERROR CRÍTICO
// =====================================================

function showCriticalError(message) {
  document.body.innerHTML = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: 'Inter', sans-serif; background: linear-gradient(135deg, #fee2e2, #fecaca); color: #dc2626; text-align: center; padding: 2rem;">
      <div style="background: white; padding: 2rem; border-radius: 16px; box-shadow: 0 20px 40px rgba(220, 38, 38, 0.2); max-width: 400px;">
        <div style="font-size: 4rem; margin-bottom: 1rem;">💥</div>
        <h1 style="font-size: 1.5rem; margin-bottom: 1rem;">Error Crítico</h1>
        <p style="margin-bottom: 2rem;">${message}</p>
        <button onclick="location.reload()" style="background: #dc2626; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600;">
          🔄 Recargar página
        </button>
      </div>
    </div>
  `;
}

// =====================================================
// DEBUG TOOLS (SOLO EN DESARROLLO)
// =====================================================

if (CuentaLogger.isDev) {
  window.velvzCuentaDebug = {
    switchToLogin: () => switchMode("login"),
    switchToRegister: () => switchMode("register"),
    testBackend: () => checkBackendConnection(),
    getCurrentMode: () => currentMode,
    simulateEmailSent: () =>
      showEmailSentMessage("test@ejemplo.com", "Test User"),
    simulateEmailNotVerified: () =>
      showEmailNotVerifiedError("test@ejemplo.com", "Verificación requerida"),
    showConnectionStatus: (msg, type) => showConnectionStatus(msg, type),
    clearMessages: clearMessages,
    logger: CuentaLogger,
    forceLogin: async (email = "test@velvz.com", password = "123456") => {
      document.getElementById("emailInput").value = email;
      document.getElementById("passwordInput").value = password;
      switchMode("login");
      await handleLogin(email, password);
    },
  };

  CuentaLogger.log("🔧 Debug tools disponibles en: window.velvzCuentaDebug");
}

// PROTECCIÓN CONTRA REVERSIÓN DE CAMBIOS
let protectionInterval = null;
function protectFormState() {
  if (protectionInterval) clearInterval(protectionInterval);

  protectionInterval = setInterval(() => {
    if (currentMode === "register") {
      const ng = document.getElementById("nameGroup");
      const tg = document.getElementById("termsGroup");
      const sb = document.getElementById("submitBtn");

      if (ng && ng.style.display === "none") {
        ng.style.cssText = "display: block !important;";
      }
      if (tg && tg.style.display === "none") {
        tg.style.cssText = "display: block !important;";
      }
      if (sb && sb.textContent.includes("Iniciar")) {
        sb.textContent = "Crear Cuenta";
      }
    }
  }, 100);

  // Detener la protección después de 2 segundos
  setTimeout(() => {
    if (protectionInterval) {
      clearInterval(protectionInterval);
      protectionInterval = null;
    }
  }, 2000);
}

// Modificar switchMode para activar la protección
const originalSwitchMode = switchMode;
switchMode = function (mode) {
  originalSwitchMode(mode);
  if (mode === "register") {
    protectFormState();
  }
};

// =====================================================
// INICIALIZACIÓN FINAL
// =====================================================

CuentaLogger.success(
  "Sistema de autenticación Velvz completamente cargado y funcional"
);

// =====================================================
// PÁGINA DE CONTACTO - FUNCIONALIDAD COMPLETA
// =====================================================

document.addEventListener("DOMContentLoaded", function () {
  // Elementos principales
  const contactToggle = document.getElementById("contactToggle");
  const emailForm = document.getElementById("emailForm");
  const proposalForm = document.getElementById("proposalForm");
  const emailModeBtn = document.querySelector('[data-mode="email"]');
  const proposalModeBtn = document.querySelector('[data-mode="proposal"]');

  // Estado actual
  let currentMode = "email";
  let currentStep = 1;
  let proposalData = {};

  // =====================================================
  // SISTEMA DE MODAL PERSONALIZADO
  // =====================================================

  const modal = document.getElementById("notificationModal");
  const modalIcon = document.getElementById("modalIcon");
  const modalTitle = document.getElementById("modalTitle");
  const modalMessage = document.getElementById("modalMessage");
  const modalButton = document.getElementById("modalButton");
  const modalBackdrop = modal?.querySelector(".velvz-modal__backdrop");

  function showModal(options = {}) {
    const {
      type = "success", // success, error, warning
      icon = "✅",
      title = "¡Éxito!",
      message = "",
      buttonText = "Aceptar",
      onClose = null
    } = options;

    if (!modal) return;

    // Limpiar clases anteriores
    modal.classList.remove("velvz-modal--error", "velvz-modal--warning");

    // Aplicar tipo
    if (type === "error") {
      modal.classList.add("velvz-modal--error");
    } else if (type === "warning") {
      modal.classList.add("velvz-modal--warning");
    }

    // Configurar contenido
    modalIcon.textContent = icon;
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalButton.textContent = buttonText;

    // Mostrar modal
    modal.classList.add("velvz-modal--active");
    document.body.style.overflow = "hidden";

    // Configurar cierre
    const closeModal = () => {
      modal.classList.remove("velvz-modal--active");
      document.body.style.overflow = "";
      if (onClose) onClose();
    };

    modalButton.onclick = closeModal;
    modalBackdrop.onclick = closeModal;

    // Cerrar con Escape
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        closeModal();
        document.removeEventListener("keydown", handleEscape);
      }
    };
    document.addEventListener("keydown", handleEscape);
  }

  // =====================================================
  // NAVEGACIÓN DEL HEADER
  // =====================================================

  // Agregar funcionalidad a los enlaces del header
  const headerLinks = document.querySelectorAll(
    ".velvz-header__link, .velvz-header__mobile-link"
  );
  headerLinks.forEach((link) => {
    const href = link.getAttribute("href");

    // Sólo interceptamos desplazamientos "in-page"
    if (href.startsWith("#")) {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      });
    }
    // ¡NO interceptamos /, /contacto/, etc!
  });

  // Logo click to home
  const headerLogo = document.querySelector(".velvz-header__logo");
  if (headerLogo) {
    headerLogo.addEventListener("click", () => {
      window.location.href = "/";
    });
  }

  // =====================================================
  // TOGGLE PRINCIPAL (EMAIL vs PROPUESTA) - CORREGIDO
  // =====================================================

  function switchToMode(mode) {
    if (currentMode === mode) return;

    currentMode = mode;

    // Actualizar toggle visual
    contactToggle.classList.toggle(
      "velvz-contact__toggle--proposal",
      mode === "proposal"
    );

    // Cambio inmediato sin animaciones confusas
    if (mode === "email") {
      // Ocultar propuesta inmediatamente
      proposalForm.style.display = "none";
      proposalForm.style.opacity = "0";
      proposalForm.style.animation = "none"; // Desactivar animación

      // Mostrar email inmediatamente
      emailForm.style.display = "block";
      emailForm.style.opacity = "1";
      emailForm.style.animation = "none"; // Desactivar animación
    } else {
      // Ocultar email inmediatamente
      emailForm.style.display = "none";
      emailForm.style.opacity = "0";
      emailForm.style.animation = "none"; // Desactivar animación

      // Mostrar propuesta inmediatamente
      proposalForm.style.display = "block";
      proposalForm.style.opacity = "1";
      proposalForm.style.animation = "none"; // Desactivar animación

      // Mostrar el paso actual guardado
      showProposalStep(currentStep);
    }
  }

  // Event listeners para el toggle
  if (emailModeBtn) {
    emailModeBtn.addEventListener("click", () => switchToMode("email"));
  }
  if (proposalModeBtn) {
    proposalModeBtn.addEventListener("click", () => switchToMode("proposal"));
  }

  // =====================================================
  // FORMULARIO DE EMAIL
  // =====================================================

  const emailContactForm = document.getElementById("emailContactForm");
  if (emailContactForm) {
    emailContactForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const formData = new FormData(this);
      const data = Object.fromEntries(formData);

      const submitBtn = this.querySelector(".velvz-contact__form-submit");
      const originalText = submitBtn.querySelector(
        ".velvz-contact__form-submit-text"
      ).textContent;

      submitBtn.disabled = true;
      submitBtn.querySelector(".velvz-contact__form-submit-text").textContent =
        "Enviando...";

      try {
        const response = await fetch(
          "https://velvz-unified-backend-production.up.railway.app/api/contact/email",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }
        );

        const result = await response.json();

        if (response.ok) {
          showModal({
            type: "success",
            icon: "✅",
            title: "¡Mensaje enviado!",
            message: "Hemos recibido tu mensaje. Te responderemos en menos de 24 horas.",
            buttonText: "Perfecto"
          });
          this.reset();
          clearSavedData();
        } else {
          showModal({
            type: "error",
            icon: "❌",
            title: "Error al enviar",
            message: "No pudimos enviar tu mensaje. Por favor, inténtalo de nuevo.",
            buttonText: "Reintentar"
          });
          console.error("Error:", result);
        }
      } catch (error) {
        showModal({
          type: "error",
          icon: "⚠️",
          title: "Error de conexión",
          message: "Verifica tu conexión a internet e inténtalo de nuevo.",
          buttonText: "Entendido"
        });
        console.error("Network error:", error);
      } finally {
        submitBtn.disabled = false;
        submitBtn.querySelector(
          ".velvz-contact__form-submit-text"
        ).textContent = originalText;
      }
    });
  }

  // =====================================================
  // FORMULARIO DE PROPUESTA - NAVEGACIÓN ENTRE PASOS
  // =====================================================

  function showProposalStep(stepNumber) {
    currentStep = stepNumber;

    // Cambio inmediato entre pasos sin animaciones confusas
    document
      .querySelectorAll(".velvz-contact__proposal-step")
      .forEach((step) => {
        step.classList.remove("velvz-contact__proposal-step--active");
      });

    // Mostrar paso actual
    const currentStepEl = document.getElementById(`proposalStep${stepNumber}`);
    if (currentStepEl) {
      currentStepEl.classList.add("velvz-contact__proposal-step--active");
      currentStepEl.style.opacity = "1"; // Asegurar que sea visible inmediatamente
    }
  }

  function resetProposal() {
    currentStep = 1;
    proposalData = {};

    // Limpiar todos los formularios
    document.querySelectorAll("#proposalForm form").forEach((form) => {
      form.reset();
    });

    // Resetear slider
    const slider = document.getElementById("budget_range");
    const budgetValue = document.getElementById("budgetValue");
    if (slider && budgetValue) {
      slider.value = 50; // Cambiar valor inicial a 50
      budgetValue.textContent = "50€";
    }

    // Resetear checkbox
    const studyCheckbox = document.getElementById("includeStudy");
    if (studyCheckbox) {
      studyCheckbox.checked = false;
    }

    showProposalStep(1);
  }

  // =====================================================
  // PASO 1: DATOS BÁSICOS
  // =====================================================

  const proposalStep1Form = document.getElementById("proposalStep1Form");
  if (proposalStep1Form) {
    proposalStep1Form.addEventListener("submit", function (e) {
      e.preventDefault();

      const formData = new FormData(this);

      // Validar campos requeridos
      const companyName = formData.get("company_name");
      const contactEmail = formData.get("contact_email");

      if (!companyName || !contactEmail) {
        showModal({
          type: "warning",
          icon: "⚠️",
          title: "Campos incompletos",
          message: "Por favor, completa todos los campos obligatorios.",
          buttonText: "Entendido"
        });
        return;
      }

      // Guardar datos
      proposalData.companyName = companyName;
      proposalData.companyWebsite = formData.get("company_website") || "";
      proposalData.contactEmail = contactEmail;

      console.log("Step 1 data:", proposalData);

      // Avanzar al siguiente paso
      showProposalStep(2);
    });
  }

  // =====================================================
  // PASO 2: DETALLES DEL PROYECTO
  // =====================================================

  // Slider de presupuesto
  const budgetSlider = document.getElementById("budget_range");
  const budgetValue = document.getElementById("budgetValue");

  if (budgetSlider && budgetValue) {
    function updateBudgetValue() {
      const value = parseInt(budgetSlider.value);
      budgetValue.textContent = value.toLocaleString("es-ES") + "€";
    }

    budgetSlider.addEventListener("input", updateBudgetValue);
    budgetSlider.addEventListener("change", updateBudgetValue);

    // Inicializar valor
    updateBudgetValue();
  }

  const proposalStep2Form = document.getElementById("proposalStep2Form");
  if (proposalStep2Form) {
    proposalStep2Form.addEventListener("submit", function (e) {
      e.preventDefault();

      const formData = new FormData(this);

      // Guardar datos del paso 2
      proposalData.budget = parseInt(budgetSlider.value);
      proposalData.projectDescription =
        formData.get("project_description") || "";

      console.log("Step 2 data:", proposalData);

      // Avanzar al siguiente paso
      showProposalStep(3);
    });
  }

  // Botón atrás paso 2
  const backToStep1 = document.getElementById("backToStep1");
  if (backToStep1) {
    backToStep1.addEventListener("click", () => {
      showProposalStep(1);
    });
  }

  // =====================================================
  // PASO 3: ESTUDIO PERSONALIZADO
  // =====================================================

  const backToStep2 = document.getElementById("backToStep2");
  if (backToStep2) {
    backToStep2.addEventListener("click", () => {
      showProposalStep(2);
    });
  }

  const submitProposal = document.getElementById("submitProposal");
  if (submitProposal) {
    submitProposal.addEventListener("click", async function (e) {
      e.preventDefault();

      // Obtener estado del checkbox del estudio
      const includeStudy = document.getElementById("includeStudy");
      proposalData.includeStudy = includeStudy ? includeStudy.checked : false;

      console.log("Final proposal data:", proposalData);

      const originalText = this.querySelector(
        ".velvz-contact__form-submit-text"
      ).textContent;

      this.disabled = true;
      this.querySelector(".velvz-contact__form-submit-text").textContent =
        "Enviando...";

      try {
        // Mapear los datos del frontend al formato que espera el backend
        const backendData = {
          name: proposalData.companyName,
          email: proposalData.contactEmail,
          company: proposalData.companyName,
          description: proposalData.projectDescription || "Sin descripción",
          budget: proposalData.budget,
          includeStudy: proposalData.includeStudy
        };

        const response = await fetch(
          "https://velvz-unified-backend-production.up.railway.app/api/contact/proposal",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(backendData),
          }
        );

        const result = await response.json();

        if (response.ok) {
          showProposalStep(4);
          displayProposalSummary();
          clearSavedData();
        } else {
          showModal({
            type: "error",
            icon: "❌",
            title: "Error al enviar",
            message: "No pudimos enviar tu propuesta. Por favor, inténtalo de nuevo.",
            buttonText: "Reintentar"
          });
          console.error("Error:", result);
        }
      } catch (error) {
        showModal({
          type: "error",
          icon: "⚠️",
          title: "Error de conexión",
          message: "Verifica tu conexión a internet e inténtalo de nuevo.",
          buttonText: "Entendido"
        });
        console.error("Network error:", error);
      } finally {
        this.disabled = false;
        this.querySelector(".velvz-contact__form-submit-text").textContent =
          originalText;
      }
    });
  }

  // =====================================================
  // PASO 4: CONFIRMACIÓN
  // =====================================================

  function displayProposalSummary() {
    const summaryContainer = document.getElementById("proposalSummary");
    if (!summaryContainer) return;

    let summaryHTML = `
      <h4>Resumen de tu solicitud:</h4>
      <p><strong>Empresa:</strong> ${proposalData.companyName}</p>
      <p><strong>Email:</strong> ${proposalData.contactEmail}</p>
    `;

    if (proposalData.companyWebsite) {
      summaryHTML += `<p><strong>Web:</strong> ${proposalData.companyWebsite}</p>`;
    }

    if (proposalData.budget) {
      summaryHTML += `<p><strong>Presupuesto orientativo:</strong> ${proposalData.budget.toLocaleString(
        "es-ES"
      )}€</p>`;
    }

    if (proposalData.projectDescription) {
      summaryHTML += `<p><strong>Descripción:</strong> ${proposalData.projectDescription}</p>`;
    }

    if (proposalData.includeStudy) {
      summaryHTML += `<p><strong>Estudio personalizado:</strong> ✅ Incluido (+100€)</p>`;
    }

    summaryContainer.innerHTML = summaryHTML;
  }

  const newProposal = document.getElementById("newProposal");
  if (newProposal) {
    newProposal.addEventListener("click", () => {
      resetProposal();
    });
  }

  // =====================================================
  // EFECTOS VISUALES Y ANIMACIONES
  // =====================================================

  // Efecto hover en las características de info
  const infoFeatures = document.querySelectorAll(
    ".velvz-contact__info-feature"
  );
  infoFeatures.forEach((feature) => {
    feature.addEventListener("mouseenter", () => {
      feature.style.transform = "translateX(5px)";
      feature.style.transition = "transform 0.3s ease";
    });

    feature.addEventListener("mouseleave", () => {
      feature.style.transform = "translateX(0)";
    });
  });

  // Animación de los inputs al hacer focus
  const inputs = document.querySelectorAll(
    ".velvz-contact__form-input, .velvz-contact__form-select, .velvz-contact__form-textarea"
  );

  inputs.forEach((input) => {
    input.addEventListener("focus", () => {
      const label = input.parentElement.querySelector(
        ".velvz-contact__form-label"
      );
      if (label) {
        label.style.color = "#667eea";
        label.style.transform = "translateY(-2px)";
        label.style.transition = "all 0.3s ease";
      }
    });

    input.addEventListener("blur", () => {
      const label = input.parentElement.querySelector(
        ".velvz-contact__form-label"
      );
      if (label) {
        label.style.color = "";
        label.style.transform = "";
      }
    });
  });

  // Validación en tiempo real
  const emailInputs = document.querySelectorAll('input[type="email"]');
  emailInputs.forEach((input) => {
    input.addEventListener("input", () => {
      const isValid = input.checkValidity();
      if (input.value && !isValid) {
        input.style.borderColor = "#dc3545";
        input.style.boxShadow = "0 0 0 3px rgba(220, 53, 69, 0.1)";
      } else {
        input.style.borderColor = "";
        input.style.boxShadow = "";
      }
    });
  });

  // Contador de caracteres para textarea
  const textareas = document.querySelectorAll(".velvz-contact__form-textarea");
  textareas.forEach((textarea) => {
    const maxLength = 1000;

    // Crear contador
    const counter = document.createElement("div");
    counter.style.fontSize = "0.8rem";
    counter.style.color = "#666";
    counter.style.textAlign = "right";
    counter.style.marginTop = "0.5rem";

    textarea.parentElement.appendChild(counter);

    function updateCounter() {
      const remaining = maxLength - textarea.value.length;
      counter.textContent = `${textarea.value.length}/${maxLength} caracteres`;

      if (remaining < 100) {
        counter.style.color = "#dc3545";
      } else if (remaining < 200) {
        counter.style.color = "#ffc107";
      } else {
        counter.style.color = "#666";
      }
    }

    textarea.addEventListener("input", updateCounter);
    updateCounter(); // Inicializar
  });

  // Efecto de ripple en botones
  const buttons = document.querySelectorAll(".velvz-contact__form-submit");
  buttons.forEach((button) => {
    button.addEventListener("click", function (e) {
      const ripple = document.createElement("span");
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = x + "px";
      ripple.style.top = y + "px";
      ripple.style.position = "absolute";
      ripple.style.borderRadius = "50%";
      ripple.style.background = "rgba(255, 255, 255, 0.3)";
      ripple.style.transform = "scale(0)";
      ripple.style.animation = "ripple 0.6s linear";
      ripple.style.pointerEvents = "none";

      this.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });

  // Añadir CSS para la animación ripple
  const style = document.createElement("style");
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // =====================================================
  // INTERSECTION OBSERVER PARA ANIMACIONES - MODIFICADO
  // =====================================================

  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Solo activar animaciones si el elemento es visible y no está siendo cambiado por el toggle
        if (entry.target.style.display !== "none") {
          entry.target.style.animationPlayState = "running";
        }
      }
    });
  }, observerOptions);

  // Observar elementos animados - MODIFICADO para evitar conflictos
  const animatedElements = document.querySelectorAll(
    ".velvz-contact__badge, .velvz-contact__title, .velvz-contact__subtitle, .velvz-contact__toggle-container"
  );

  animatedElements.forEach((el) => {
    if (el) {
      el.style.animationPlayState = "paused";
      observer.observe(el);
    }
  });

  // Para los formularios, manejar las animaciones manualmente
  if (emailForm) {
    emailForm.style.animationPlayState = "paused";
  }
  if (proposalForm) {
    proposalForm.style.animationPlayState = "paused";
  }

  // =====================================================
  // SCROLL EFFECTS PARA AMBIENT PULSES
  // =====================================================

  if (window.innerWidth > 768) {
    window.addEventListener("scroll", () => {
      const scrolled = window.pageYOffset;

      // Ambient pulses para contacto
      document
        .querySelectorAll(".velvz-contact__ambient-pulse")
        .forEach((pulse, index) => {
          const speed = 0.02 + index * 0.008;
          pulse.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
  }

  // =====================================================
  // AUTOGUARDADO (LOCAL STORAGE)
  // =====================================================

  // Guardar datos del formulario mientras se escribe
  function saveFormData() {
    const formData = {
      email: currentMode === "email" ? getEmailFormData() : null,
      proposal: currentMode === "proposal" ? proposalData : null,
      currentStep: currentStep,
      mode: currentMode,
    };

    try {
      localStorage.setItem("velvz_contact_form", JSON.stringify(formData));
    } catch (e) {
      console.log("LocalStorage not available");
    }
  }

  function getEmailFormData() {
    const form = document.getElementById("emailContactForm");
    if (!form) return {};

    const formData = new FormData(form);
    return Object.fromEntries(formData);
  }

  function loadFormData() {
    try {
      const saved = localStorage.getItem("velvz_contact_form");
      if (saved) {
        const data = JSON.parse(saved);

        // Solo cargar si no han pasado más de 24 horas
        const savedTime = localStorage.getItem("velvz_contact_form_time");
        if (
          savedTime &&
          Date.now() - parseInt(savedTime) > 24 * 60 * 60 * 1000
        ) {
          localStorage.removeItem("velvz_contact_form");
          localStorage.removeItem("velvz_contact_form_time");
          return;
        }

        // Restaurar datos del email
        if (data.email && data.mode === "email") {
          Object.keys(data.email).forEach((key) => {
            const input = document.querySelector(`[name="${key}"]`);
            if (input && data.email[key]) {
              input.value = data.email[key];
            }
          });
        }

        // Restaurar datos de propuesta
        if (data.proposal && data.mode === "proposal") {
          proposalData = data.proposal;
          currentStep = data.currentStep || 1; // Restaurar paso actual

          // Restaurar campos del paso 1
          if (proposalData.companyName) {
            const companyNameInput = document.getElementById("company_name");
            if (companyNameInput)
              companyNameInput.value = proposalData.companyName;
          }
          if (proposalData.companyWebsite) {
            const websiteInput = document.getElementById("company_website");
            if (websiteInput) websiteInput.value = proposalData.companyWebsite;
          }
          if (proposalData.contactEmail) {
            const emailInput = document.getElementById("contact_email");
            if (emailInput) emailInput.value = proposalData.contactEmail;
          }

          // Restaurar campos del paso 2
          if (proposalData.budget) {
            const budgetSlider = document.getElementById("budget_range");
            const budgetValue = document.getElementById("budgetValue");
            if (budgetSlider && budgetValue) {
              budgetSlider.value = proposalData.budget;
              budgetValue.textContent =
                proposalData.budget.toLocaleString("es-ES") + "€";
            }
          }
          if (proposalData.projectDescription) {
            const descInput = document.getElementById("project_description");
            if (descInput) descInput.value = proposalData.projectDescription;
          }

          // Restaurar checkbox del estudio
          if (proposalData.includeStudy !== undefined) {
            const studyCheckbox = document.getElementById("includeStudy");
            if (studyCheckbox)
              studyCheckbox.checked = proposalData.includeStudy;
          }
        }
      }
    } catch (e) {
      console.log("Error loading form data");
    }
  }

  // Guardar automáticamente mientras se escribe
  document.addEventListener("input", () => {
    saveFormData();
    try {
      localStorage.setItem("velvz_contact_form_time", Date.now().toString());
    } catch (e) {
      console.log("LocalStorage not available");
    }
  });

  // Cargar datos guardados al inicio
  loadFormData();

  // Limpiar datos guardados cuando se envía exitosamente
  function clearSavedData() {
    try {
      localStorage.removeItem("velvz_contact_form");
      localStorage.removeItem("velvz_contact_form_time");
    } catch (e) {
      console.log("LocalStorage not available");
    }
  }

  // =====================================================
  // VALIDACIÓN AVANZADA DE FORMULARIOS
  // =====================================================

  function validateStep1() {
    const companyName = document.getElementById("company_name");
    const contactEmail = document.getElementById("contact_email");
    const website = document.getElementById("company_website");

    let isValid = true;

    // Validar nombre de empresa
    if (!companyName.value.trim()) {
      showFieldError(companyName, "El nombre de la empresa es obligatorio");
      isValid = false;
    } else {
      clearFieldError(companyName);
    }

    // Validar email
    if (!contactEmail.value.trim()) {
      showFieldError(contactEmail, "El email de contacto es obligatorio");
      isValid = false;
    } else if (!contactEmail.checkValidity()) {
      showFieldError(contactEmail, "Por favor, introduce un email válido");
      isValid = false;
    } else {
      clearFieldError(contactEmail);
    }

    // Validar website si se proporciona
    if (website.value.trim() && !website.checkValidity()) {
      showFieldError(website, "Por favor, introduce una URL válida");
      isValid = false;
    } else {
      clearFieldError(website);
    }

    return isValid;
  }

  function showFieldError(field, message) {
    clearFieldError(field);

    field.style.borderColor = "#dc3545";
    field.style.boxShadow = "0 0 0 3px rgba(220, 53, 69, 0.1)";

    const errorDiv = document.createElement("div");
    errorDiv.className = "velvz-contact__field-error";
    errorDiv.style.color = "#dc3545";
    errorDiv.style.fontSize = "0.8rem";
    errorDiv.style.marginTop = "0.25rem";
    errorDiv.textContent = message;

    field.parentElement.appendChild(errorDiv);
  }

  function clearFieldError(field) {
    field.style.borderColor = "";
    field.style.boxShadow = "";

    const existingError = field.parentElement.querySelector(
      ".velvz-contact__field-error"
    );
    if (existingError) {
      existingError.remove();
    }
  }

  // Actualizar el evento de submit del paso 1 para usar validación avanzada
  if (proposalStep1Form) {
    proposalStep1Form.removeEventListener("submit", proposalStep1Form._handler);
    proposalStep1Form._handler = function (e) {
      e.preventDefault();

      if (!validateStep1()) {
        return;
      }

      const formData = new FormData(this);

      // Guardar datos
      proposalData.companyName = formData.get("company_name");
      proposalData.companyWebsite = formData.get("company_website") || "";
      proposalData.contactEmail = formData.get("contact_email");

      console.log("Step 1 data:", proposalData);

      // Avanzar al siguiente paso
      showProposalStep(2);
    };
    proposalStep1Form.addEventListener("submit", proposalStep1Form._handler);
  }

  // =====================================================
  // INICIALIZACIÓN - MODIFICADA
  // =====================================================

  // Asegurar que comenzamos en el modo correcto y activar animaciones
  switchToMode("email");

  // Activar animaciones del formulario inicial después de un pequeño delay
  setTimeout(() => {
    if (emailForm && emailForm.style.display !== "none") {
      emailForm.style.animationPlayState = "running";
    }

    // También activar para info island
    const infoIsland = document.querySelector(".velvz-contact__info-island");
    if (infoIsland) {
      infoIsland.style.animationPlayState = "running";
    }
  }, 100);

  console.log("Página de contacto inicializada correctamente");
});

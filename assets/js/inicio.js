// HERO ANIMATION TIMING
document.addEventListener("DOMContentLoaded", function () {
  // Después de 2s (cuando VELVZ ya apareció), centrar el contenido
  setTimeout(() => {
    const heroContent = document.querySelector(".velvz-hero__content");
    if (heroContent) {
      heroContent.classList.add("velvz-hero__content--centered");
    }
  }, 2000);
});

document.addEventListener("DOMContentLoaded", function () {
  const logos = document.querySelectorAll(
    ".velvz-header__logo, .velvz-footer__logo"
  );

  logos.forEach((logo) => {
    logo.addEventListener("mouseenter", () => {
      const eyes = logo.querySelectorAll(
        ".velvz-header__logo-eye, .velvz-footer__logo-eye"
      );
      const mouth = logo.querySelector(
        ".velvz-header__logo-mouth, .velvz-footer__logo-mouth"
      );

      // Parpadeo de ojos
      eyes.forEach((eye) => {
        eye.style.transform = "scaleY(0.2)";
        setTimeout(() => {
          eye.style.transform = "scaleY(1)";
        }, 150);
      });

      // Boca se convierte en círculo (sorpresa "o")
      if (mouth) {
        // Detectar si es el logo del footer
        if (logo.classList.contains("velvz-footer__logo")) {
          mouth.style.width = "7px";
          mouth.style.height = "7px";
        } else {
          // Hacer que la boca sorprendida tenga el mismo tamaño que los ojos
          const logoSize = logo.offsetWidth;
          if (logoSize <= 32) {
            // móvil pequeño
            mouth.style.width = "5px";
            mouth.style.height = "5px";
          } else if (logoSize <= 36) {
            // móvil
            mouth.style.width = "6px";
            mouth.style.height = "6px";
          } else {
            // desktop
            mouth.style.width = "8px";
            mouth.style.height = "8px";
          }
        }
        mouth.style.borderRadius = "50%";
      }
    });

    logo.addEventListener("mouseleave", () => {
      const mouth = logo.querySelector(
        ".velvz-header__logo-mouth, .velvz-footer__logo-mouth"
      );

      // Restaurar boca a valores normales
      if (mouth) {
        mouth.style.width = "";
        mouth.style.height = "";
        mouth.style.borderRadius = "";
      }
    });

    // Efecto especial en click - solo header
    if (logo.classList.contains("velvz-header__logo")) {
      logo.addEventListener("click", () => {
        const shape = logo.querySelector(".velvz-header__logo-shape");
        shape.style.transform = "scale(1.1) rotate(5deg)";
        setTimeout(() => {
          shape.style.transform = "";
        }, 300);

        // Scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
      });

      // Solucionar problema de hover persistente en móvil
      logo.addEventListener("touchend", () => {
        // Forzar la restauración del estado normal después del touch
        setTimeout(() => {
          const eyes = logo.querySelectorAll(".velvz-header__logo-eye");
          const mouth = logo.querySelector(".velvz-header__logo-mouth");
          const shape = logo.querySelector(".velvz-header__logo-shape");

          // Restaurar todos los elementos a su estado normal
          eyes.forEach((eye) => {
            eye.style.transform = "";
          });

          if (mouth) {
            mouth.style.width = "";
            mouth.style.height = "";
            mouth.style.borderRadius = "";
          }

          if (shape) {
            shape.style.transform = "";
          }
        }, 100);
      });
    }
  });

  // Footer logo click to top
  const footerLogoLink = document.querySelector(".velvz-footer__logo-link");
  if (footerLogoLink) {
    footerLogoLink.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
});

// MOBILE MENU TOGGLE
document.addEventListener("DOMContentLoaded", function () {
  const mobileToggle = document.querySelector(".velvz-header__mobile-toggle");
  const hamburger = document.querySelector(".velvz-header__hamburger");
  const mobileMenu = document.querySelector(".velvz-header__mobile-menu");
  const backdrop = document.querySelector(".velvz-header__mobile-backdrop");
  const closeButton = document.querySelector(".velvz-header__mobile-close");
  const body = document.body;

  function openMobileMenu() {
    hamburger.classList.add("velvz-header__hamburger--active");
    mobileMenu.classList.add("velvz-header__mobile-menu--active");
    backdrop.classList.add("velvz-header__mobile-backdrop--active");
    body.style.overflow = "hidden";
  }

  function closeMobileMenu() {
    hamburger.classList.remove("velvz-header__hamburger--active");
    mobileMenu.classList.remove("velvz-header__mobile-menu--active");
    backdrop.classList.remove("velvz-header__mobile-backdrop--active");
    body.style.overflow = "";
  }

  if (mobileToggle) {
    mobileToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      if (hamburger.classList.contains("velvz-header__hamburger--active")) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (backdrop) {
    backdrop.addEventListener("click", closeMobileMenu);
  }

  if (closeButton) {
    closeButton.addEventListener("click", closeMobileMenu);
  }

  // Close menu when clicking on links
  const mobileLinks = document.querySelectorAll(".velvz-header__mobile-link");
  mobileLinks.forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  // Close menu on escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMobileMenu();
    }
  });
});

// COUNTER ANIMATION
function animateCounter(element, target, duration = 2000, suffix = "") {
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }

    if (suffix === "%") {
      element.textContent = Math.floor(current) + "%";
    } else if (suffix === "h") {
      element.textContent = Math.floor(current) + "h";
    } else {
      element.textContent = Math.floor(current).toLocaleString();
    }
  }, 16);
}

// INTERSECTION OBSERVER PARA COUNTERS
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.getAttribute("data-target"));
        const text = entry.target.textContent;

        if (text.includes("%")) {
          animateCounter(entry.target, target, 2000, "%");
        } else if (text.includes("h")) {
          animateCounter(entry.target, target, 2000, "h");
        } else {
          animateCounter(entry.target, target, 2000);
        }

        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll("[data-target]").forEach((el) => {
  counterObserver.observe(el);
});

// SMOOTH SCROLL PARA NAVEGACIÓN
document.querySelectorAll(".velvz-header__link").forEach((link) => {
  link.addEventListener("click", (e) => {
    const href = e.target.getAttribute("href");

    // Solo prevenir el comportamiento predeterminado para anclas internas
    if (href && href.startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
    // Para enlaces externos (como contacto.html), dejar que navegue normalmente
  });
});

// SCROLL HEADER EFFECT (SOLO DESKTOP)
window.addEventListener("scroll", () => {
  const scrolled = window.pageYOffset;
  const header = document.querySelector(".velvz-header");

  // Solo aplicar en desktop
  if (window.innerWidth > 768) {
    if (scrolled > 50) {
      header.classList.add("velvz-header--scrolled");
    } else {
      header.classList.remove("velvz-header--scrolled");
    }
  }

  // Ambient pulses (solo en desktop)
  if (window.innerWidth > 768) {
    document
      .querySelectorAll(".velvz-landing__ambient-pulse")
      .forEach((pulse, index) => {
        const speed = 0.02 + index * 0.01;
        pulse.style.transform = `translateY(${scrolled * speed}px)`;
      });

    document
      .querySelectorAll(".velvz-hero__ambient-pulse")
      .forEach((pulse, index) => {
        const speed = 0.01 + index * 0.005;
        pulse.style.transform = `translateY(${scrolled * speed}px)`;
      });

    // Ambient pulses para "Cómo Funciona"
    document
      .querySelectorAll(".velvz-how-it-works__ambient-pulse")
      .forEach((pulse, index) => {
        const speed = 0.015 + index * 0.008;
        pulse.style.transform = `translateY(${scrolled * speed}px)`;
      });

    // Ambient pulses para "Características"
    document
      .querySelectorAll(".velvz-features__ambient-pulse")
      .forEach((pulse, index) => {
        const speed = 0.018 + index * 0.006;
        pulse.style.transform = `translateY(${scrolled * speed}px)`;
      });
  }
});

// PERFORMANCE: Throttle scroll events
function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Aplicar throttling a scroll
window.addEventListener(
  "scroll",
  throttle(() => {
    // Eventos de scroll optimizados
  }, 16)
); // ~60fps

// RESPONSIVE HANDLER
function handleResize() {
  const isMobile = window.innerWidth <= 768;
  const hamburger = document.querySelector(".velvz-header__hamburger");
  const mobileMenu = document.querySelector(".velvz-header__mobile-menu");
  const backdrop = document.querySelector(".velvz-header__mobile-backdrop");
  const body = document.body;

  if (!isMobile) {
    // Reset mobile menu state on desktop
    if (hamburger)
      hamburger.classList.remove("velvz-header__hamburger--active");
    if (mobileMenu)
      mobileMenu.classList.remove("velvz-header__mobile-menu--active");
    if (backdrop)
      backdrop.classList.remove("velvz-header__mobile-backdrop--active");
    body.style.overflow = "";
  }
}

window.addEventListener("resize", throttle(handleResize, 250));
handleResize(); // Call on load

// =====================================================
// SECCIÓN CÓMO FUNCIONA - TOGGLE FUNCTIONALITY
// =====================================================
document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("serviceToggle");

  // Verificar si el toggle existe en la página antes de continuar
  if (!toggle) return;

  const managedBtn = document.querySelector('[data-service="managed"]');
  const selfhostedBtn = document.querySelector('[data-service="selfhosted"]');

  // Elementos que cambian con el toggle
  const infoIsland = document.getElementById("infoIsland");
  const visualIsland = document.getElementById("visualIsland");
  const infoTitle = document.getElementById("infoTitle");
  const infoDescription = document.getElementById("infoDescription");
  const mockupTitle = document.getElementById("mockupTitle");
  const chatMockup = document.getElementById("chatMockup");
  const mockupHeader = document.getElementById("mockupHeader");
  const botAvatar = document.getElementById("botAvatar");
  const botAvatar2 = document.getElementById("botAvatar2");
  const botMessage1 = document.getElementById("botMessage1");
  const botMessage2 = document.getElementById("botMessage2");

  // Elementos de los pasos
  const stepsList = document.getElementById("stepsList");
  const step1Title = document.getElementById("step1Title");
  const step1Desc = document.getElementById("step1Desc");
  const step2Title = document.getElementById("step2Title");
  const step2Desc = document.getElementById("step2Desc");
  const step3Title = document.getElementById("step3Title");
  const step3Desc = document.getElementById("step3Desc");
  const step4Title = document.getElementById("step4Title");
  const step4Desc = document.getElementById("step4Desc");

  // Contenido para modalidad gestionada
  const managedContent = {
    title: "Servicio Completo",
    description:
      "Nosotros nos encargamos de todo: desarrollo, alojamiento, integración y mantenimiento. Solo tienes que decirnos qué necesitas y el chatbot estará funcionando en tu web.",
    mockupTitle: "Asistente de Velvz",
    steps: [
      {
        title: "Consulta y Análisis",
        description:
          "Analizamos tus necesidades específicas y diseñamos la solución perfecta para tu negocio.",
      },
      {
        title: "Desarrollo y Personalización",
        description:
          "Creamos tu chatbot con IA personalizada, diseño a medida y funcionalidades específicas.",
      },
      {
        title: "Integración Seamless",
        description:
          "Instalamos el chatbot en tu web sin complicaciones, asegurándonos de que funcione perfectamente.",
      },
      {
        title: "Soporte y Optimización",
        description:
          "Mantenimiento continuo, actualizaciones de IA y optimización basada en analíticas reales.",
      },
    ],
    messages: [
      "¡Hola! Nuestro horario de atención es de lunes a viernes de 9:00 a 18:00. ¿En qué más puedo ayudarte? 😊",
      "¡Por supuesto! Te ayudo con el inicio de sesión. Completa el formulario:",
    ],
  };

  // Contenido para modalidad self-hosted
  const selfhostedContent = {
    title: "Solución Self-Hosted",
    description:
      "Recibes el código completo del chatbot para alojarlo en tus propios servidores. Control total, personalización avanzada y máxima seguridad de datos.",
    mockupTitle: "Asistente de Velvz",
    steps: [
      {
        title: "Requerimientos Técnicos",
        description:
          "Definimos la arquitectura, APIs necesarias y especificaciones técnicas según tu infraestructura.",
      },
      {
        title: "Desarrollo del Core",
        description:
          "Entregamos el código fuente completo, documentación técnica y configuraciones personalizadas.",
      },
      {
        title: "Deploy y Configuración",
        description:
          "Te asistimos en el despliegue inicial y configuración en tus servidores (opcional).",
      },
      {
        title: "Soporte Técnico",
        description:
          "Documentación completa, actualizaciones del core y soporte técnico para desarrolladores.",
      },
    ],
    messages: [
      "¡Hola! Nuestro horario de atención es de lunes a viernes de 9:00 a 18:00. ¿En qué más puedo ayudarte? 😊",
      "¡Por supuesto! Te ayudo con el inicio de sesión. Completa el formulario:",
    ],
  };

  let currentMode = "managed";

  function switchToMode(mode) {
    if (currentMode === mode) return;

    currentMode = mode;
    const content = mode === "managed" ? managedContent : selfhostedContent;

    // Actualizar el toggle
    toggle.classList.toggle(
      "velvz-how-it-works__toggle--selfhosted",
      mode === "selfhosted"
    );

    // Actualizar contenido principal
    if (infoTitle) infoTitle.textContent = content.title;
    if (infoDescription) infoDescription.textContent = content.description;
    if (mockupTitle) mockupTitle.textContent = content.mockupTitle;

    // Actualizar pasos
    if (step1Title) step1Title.textContent = content.steps[0].title;
    if (step1Desc) step1Desc.textContent = content.steps[0].description;
    if (step2Title) step2Title.textContent = content.steps[1].title;
    if (step2Desc) step2Desc.textContent = content.steps[1].description;
    if (step3Title) step3Title.textContent = content.steps[2].title;
    if (step3Desc) step3Desc.textContent = content.steps[2].description;
    if (step4Title) step4Title.textContent = content.steps[3].title;
    if (step4Desc) step4Desc.textContent = content.steps[3].description;

    // Actualizar mensajes del chat
    if (botMessage1) botMessage1.textContent = content.messages[0];
    if (botMessage2) {
      botMessage2.innerHTML =
        content.messages[1] +
        '<div class="velvz-how-it-works__login-form' +
        (mode === "selfhosted"
          ? " velvz-how-it-works__login-form--selfhosted"
          : "") +
        '" id="loginForm"><div class="velvz-how-it-works__form-group"><label class="velvz-how-it-works__form-label' +
        (mode === "selfhosted"
          ? " velvz-how-it-works__form-label--selfhosted"
          : "") +
        '" id="emailLabel">Email</label><input type="email" class="velvz-how-it-works__form-input' +
        (mode === "selfhosted"
          ? " velvz-how-it-works__form-input--selfhosted"
          : "") +
        '" id="emailInput" placeholder="tu@email.com"></div><div class="velvz-how-it-works__form-group"><label class="velvz-how-it-works__form-label' +
        (mode === "selfhosted"
          ? " velvz-how-it-works__form-label--selfhosted"
          : "") +
        '" id="passwordLabel">Contraseña</label><input type="password" class="velvz-how-it-works__form-input' +
        (mode === "selfhosted"
          ? " velvz-how-it-works__form-input--selfhosted"
          : "") +
        '" id="passwordInput" placeholder="••••••••"></div><button class="velvz-how-it-works__form-button' +
        (mode === "selfhosted"
          ? " velvz-how-it-works__form-button--selfhosted"
          : "") +
        '" id="loginButton">Iniciar Sesión</button></div>';
    }

    // Aplicar clases de estilo
    const isSelfhosted = mode === "selfhosted";

    // Info island
    if (infoIsland) {
      infoIsland.classList.toggle(
        "velvz-how-it-works__info-island--selfhosted",
        isSelfhosted
      );
    }
    if (infoTitle) {
      infoTitle.classList.toggle(
        "velvz-how-it-works__info-title--selfhosted",
        isSelfhosted
      );
    }
    if (infoDescription) {
      infoDescription.classList.toggle(
        "velvz-how-it-works__info-description--selfhosted",
        isSelfhosted
      );
    }

    // Visual island
    if (visualIsland) {
      visualIsland.classList.toggle(
        "velvz-how-it-works__visual-island--selfhosted",
        isSelfhosted
      );
    }
    if (chatMockup) {
      chatMockup.classList.toggle(
        "velvz-how-it-works__mockup--selfhosted",
        isSelfhosted
      );
    }
    if (mockupHeader) {
      mockupHeader.classList.toggle(
        "velvz-how-it-works__mockup-header--selfhosted",
        isSelfhosted
      );
    }
    if (mockupTitle) {
      mockupTitle.classList.toggle(
        "velvz-how-it-works__mockup-title--selfhosted",
        isSelfhosted
      );
    }

    // Steps
    if (stepsList) {
      const stepElements = stepsList.querySelectorAll(
        ".velvz-how-it-works__step"
      );
      stepElements.forEach((stepElement) => {
        stepElement.classList.toggle(
          "velvz-how-it-works__step--selfhosted",
          isSelfhosted
        );
        const stepTitle = stepElement.querySelector(
          ".velvz-how-it-works__step-title"
        );
        const stepDesc = stepElement.querySelector(
          ".velvz-how-it-works__step-description"
        );
        if (stepTitle)
          stepTitle.classList.toggle(
            "velvz-how-it-works__step-title--selfhosted",
            isSelfhosted
          );
        if (stepDesc)
          stepDesc.classList.toggle(
            "velvz-how-it-works__step-description--selfhosted",
            isSelfhosted
          );
      });
    }

    // Avatares y mensajes del bot
    if (botAvatar)
      botAvatar.classList.toggle(
        "velvz-how-it-works__avatar--selfhosted",
        isSelfhosted
      );
    if (botAvatar2)
      botAvatar2.classList.toggle(
        "velvz-how-it-works__avatar--selfhosted",
        isSelfhosted
      );
    if (botMessage1)
      botMessage1.classList.toggle(
        "velvz-how-it-works__message-content--selfhosted",
        isSelfhosted
      );
    if (botMessage2)
      botMessage2.classList.toggle(
        "velvz-how-it-works__message-content--selfhosted",
        isSelfhosted
      );
  }

  // Event listeners para los botones
  if (managedBtn) {
    managedBtn.addEventListener("click", () => switchToMode("managed"));
  }
  if (selfhostedBtn) {
    selfhostedBtn.addEventListener("click", () => switchToMode("selfhosted"));
  }

  // Animación de escritura en tiempo real para los mensajes
  function typeWriter(element, text, speed = 50) {
    if (!element) return;
    element.textContent = "";
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
  }

  // Efecto de hover en los pasos
  const stepElements = document.querySelectorAll(".velvz-how-it-works__step");
  stepElements.forEach((stepElement, index) => {
    stepElement.addEventListener("mouseenter", () => {
      stepElement.style.transform = "translateX(10px)";
      stepElement.style.transition = "transform 0.3s ease";
    });

    stepElement.addEventListener("mouseleave", () => {
      stepElement.style.transform = "translateX(0)";
    });
  });

  // Animación sutil de los mensajes al hacer hover
  const messageElements = document.querySelectorAll(
    ".velvz-how-it-works__message"
  );
  messageElements.forEach((messageElement) => {
    messageElement.addEventListener("mouseenter", () => {
      messageElement.style.transform = "scale(1.02)";
      messageElement.style.transition = "transform 0.2s ease";
    });

    messageElement.addEventListener("mouseleave", () => {
      messageElement.style.transform = "scale(1)";
    });
  });
});

// =====================================================
// INTERSECTION OBSERVER PARA ANIMACIONES "CÓMO FUNCIONA"
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  // Intersection Observer para animaciones on-scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = "running";
      }
    });
  }, observerOptions);

  // Observar elementos animados de "Cómo Funciona"
  const howItWorksAnimatedElements = document.querySelectorAll(
    ".velvz-how-it-works__badge, .velvz-how-it-works__title, .velvz-how-it-works__subtitle, .velvz-how-it-works__toggle-container, .velvz-how-it-works__info-island, .velvz-how-it-works__visual-island"
  );

  howItWorksAnimatedElements.forEach((el) => {
    if (el) {
      el.style.animationPlayState = "paused";
      observer.observe(el);
    }
  });
});

// =====================================================
// NUEVA SECCIÓN CARACTERÍSTICAS - FUNCIONALIDAD COMPLETA
// =====================================================

document.addEventListener("DOMContentLoaded", function () {
  // Configuración de temas por sector
  const themes = {
    oficinas: {
      name: "Asistente Corporativo",
      message:
        "¡Hola! Soy tu asistente para consultas empresariales. ¿Cómo puedo ayudarte?",
      avatarBg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      messageBg: "rgba(102, 126, 234, 0.1)",
      messageBorder: "rgba(102, 126, 234, 0.2)",
      previewBg: "linear-gradient(135deg, #667eea15, #764ba220)",
      eyeColor: "white",
      mouthColor: "white",
    },
    veterinaria: {
      name: "Asistente Veterinario",
      message:
        "¡Hola! Estoy aquí para ayudarte con el cuidado de tu mascota. ¿Qué necesitas saber?",
      avatarBg: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      messageBg: "rgba(67, 233, 123, 0.1)",
      messageBorder: "rgba(67, 233, 123, 0.2)",
      previewBg: "linear-gradient(135deg, #43e97b15, #38f9d720)",
      eyeColor: "white",
      mouthColor: "white",
    },
    almacenes: {
      name: "Asistente Logístico",
      message:
        "¡Hola! Te ayudo con seguimiento de pedidos y consultas de inventario. ¿Qué buscas?",
      avatarBg: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      messageBg: "rgba(250, 112, 154, 0.1)",
      messageBorder: "rgba(250, 112, 154, 0.2)",
      previewBg: "linear-gradient(135deg, #fa709a15, #fee14020)",
      eyeColor: "white",
      mouthColor: "white",
    },
    hotel: {
      name: "Asistente Hotelero",
      message:
        "¡Bienvenido! Estoy aquí para hacer tu estancia perfecta. ¿En qué puedo asistirte?",
      avatarBg: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      messageBg: "rgba(168, 237, 234, 0.15)",
      messageBorder: "rgba(168, 237, 234, 0.25)",
      previewBg: "linear-gradient(135deg, #a8edea20, #fed6e325)",
      eyeColor: "#333",
      mouthColor: "#333",
    },
  };

  // Elementos del DOM
  const exampleButtons = document.querySelectorAll(
    ".velvz-customizer__example"
  );
  const chatbotAvatar = document.getElementById("chatbotAvatar");
  const chatbotName = document.getElementById("chatbotName");
  const chatbotMessage = document.getElementById("chatbotMessage");
  const customizerPreview = document.getElementById("customizerPreview");

  // Función para aplicar tema
  function applyTheme(themeName) {
    const theme = themes[themeName];
    if (!theme) return;

    // Actualizar avatar
    if (chatbotAvatar) {
      chatbotAvatar.style.background = theme.avatarBg;

      // Actualizar colores de ojos y boca
      const eyes = chatbotAvatar.querySelectorAll(".velvz-customizer__bot-eye");
      const mouth = chatbotAvatar.querySelector(".velvz-customizer__bot-mouth");

      eyes.forEach((eye) => {
        eye.style.background = theme.eyeColor;
      });

      if (mouth) {
        mouth.style.background = theme.mouthColor;
      }
    }

    // Actualizar nombre
    if (chatbotName) {
      chatbotName.textContent = theme.name;
    }

    // Actualizar mensaje
    if (chatbotMessage) {
      chatbotMessage.textContent = theme.message;
      chatbotMessage.style.background = theme.messageBg;
      chatbotMessage.style.borderColor = theme.messageBorder;
    }

    // Actualizar fondo del preview
    if (customizerPreview) {
      customizerPreview.style.background = theme.previewBg;
    }
  }

  // Event listeners para los botones de ejemplo
  exampleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remover clase activa de todos los botones
      exampleButtons.forEach((btn) =>
        btn.classList.remove("velvz-customizer__example--active")
      );

      // Agregar clase activa al botón clickeado
      button.classList.add("velvz-customizer__example--active");

      // Obtener tema y aplicarlo
      const theme = button.getAttribute("data-theme");
      applyTheme(theme);
    });
  });

  // Aplicar tema inicial (oficinas)
  applyTheme("oficinas");

  // COUNTER ANIMATION PARA ESCALABILIDAD
  function animateScalabilityCounter(
    element,
    target,
    duration = 2000,
    suffix = ""
  ) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }

      if (suffix === "%") {
        element.textContent = Math.floor(current) + "%";
      } else if (suffix === "h") {
        element.textContent = Math.floor(current);
      } else {
        element.textContent = Math.floor(current).toLocaleString();
      }
    }, 16);
  }

  // INTERSECTION OBSERVER PARA COUNTERS DE ESCALABILIDAD
  const scalabilityObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = parseInt(
            entry.target.getAttribute("data-scale-target")
          );
          const text = entry.target.textContent;

          if (text.includes("%")) {
            animateScalabilityCounter(entry.target, target, 2000, "%");
          } else if (entry.target.textContent === "0") {
            animateScalabilityCounter(entry.target, target, 2000, "h");
          } else {
            animateScalabilityCounter(entry.target, target, 2000);
          }

          scalabilityObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll("[data-scale-target]").forEach((el) => {
    scalabilityObserver.observe(el);
  });

  // TARJETA 4: SEGURIDAD - Toggle switches
  const securityToggles = document.querySelectorAll(
    ".velvz-security__toggle input"
  );

  securityToggles.forEach((toggle) => {
    toggle.addEventListener("change", (e) => {
      const toggleContainer = e.target.closest(".velvz-security__toggle");
      if (e.target.checked) {
        toggleContainer.style.transform = "translateX(2px)";
        setTimeout(() => {
          toggleContainer.style.transform = "";
        }, 200);
      }
    });
  });

  // Efecto de hover en las tarjetas de características
  const featureCards = document.querySelectorAll(".velvz-features__card");

  featureCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      // Pausar la animación de breathing
      card.style.animationPlayState = "paused";
    });

    card.addEventListener("mouseleave", () => {
      // Reanudar la animación de breathing
      card.style.animationPlayState = "running";
    });
  });

  // Animación de entrada para las insights de análisis
  const insights = document.querySelectorAll(".velvz-analytics__insight");

  insights.forEach((insight, index) => {
    insight.style.opacity = "0";
    insight.style.transform = "translateX(-10px)";

    setTimeout(() => {
      insight.style.transition = "all 0.5s ease";
      insight.style.opacity = "1";
      insight.style.transform = "translateX(0)";
    }, 1000 + index * 200);
  });

  // Animación de las características de seguridad
  const securityFeatures = document.querySelectorAll(
    ".velvz-security__feature"
  );

  // Intersection Observer para animar características de seguridad
  const securityObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const features = entry.target.querySelectorAll(
            ".velvz-security__feature"
          );
          features.forEach((feature, index) => {
            setTimeout(() => {
              feature.style.animationPlayState = "running";
            }, index * 100);
          });
          securityObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  const securityCard = document.querySelector(
    ".velvz-features__card--security"
  );
  if (securityCard) {
    securityObserver.observe(securityCard);
  }

  // Animación hover para barras de escalabilidad
  const scalabilityBars = document.querySelectorAll(".velvz-scalability__bar");

  scalabilityBars.forEach((bar) => {
    bar.addEventListener("mouseenter", () => {
      bar.style.filter = "brightness(1.2)";
      bar.style.transform = bar.style.transform + " scale(1.05)";
    });

    bar.addEventListener("mouseleave", () => {
      bar.style.filter = "";
      bar.style.transform = bar.style.transform.replace(" scale(1.05)", "");
    });
  });

  // Intersection Observer para animaciones de la sección características
  const featuresObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = "running";
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }
  );

  // Observar elementos animados de "Características"
  const featuresAnimatedElements = document.querySelectorAll(
    ".velvz-features__badge, .velvz-features__title, .velvz-features__subtitle, .velvz-features__grid"
  );

  featuresAnimatedElements.forEach((el) => {
    if (el) {
      el.style.animationPlayState = "paused";
      featuresObserver.observe(el);
    }
  });
});

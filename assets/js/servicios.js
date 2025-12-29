// =====================================================
// PÁGINA DE SERVICIOS - FUNCIONALIDAD COMPLETA
// =====================================================

document.addEventListener("DOMContentLoaded", function () {
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
    if (href && href.startsWith("#")) {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      });
    }
  });

  // Logo click to home
  const headerLogo = document.querySelector(".velvz-header__logo");
  if (headerLogo) {
    headerLogo.addEventListener("click", () => {
      window.location.href = "/";
    });
  }

  // =====================================================
  // BOTÓN CONFIGURAR CHATBOT - PRINCIPAL
  // =====================================================

  const configureChatbotBtn = document.getElementById("configureChatbot");
  if (configureChatbotBtn) {
    configureChatbotBtn.addEventListener("click", function (e) {
      e.preventDefault();

      // Efecto visual inmediato
      this.style.transform = "scale(0.98)";

      setTimeout(() => {
        this.style.transform = "";
      }, 150);

      // Navegar al configurador
      setTimeout(() => {
        window.location.href = "/app/";
      }, 300);
    });
  }

  // =====================================================
  // OTROS BOTONES DE CTA
  // =====================================================

  // Botones "Ver Ejemplos"
  const verEjemplosButtons = document.querySelectorAll(
    ".velvz-services__cta--secondary:not([href])"
  );
  verEjemplosButtons.forEach((button) => {
    if (button.textContent.includes("Ver Ejemplos")) {
      button.addEventListener("click", () => {
        // Scroll hasta la sección de características si existe
        const featuresSection = document.getElementById("features");
        if (featuresSection) {
          featuresSection.scrollIntoView({ behavior: "smooth" });
        } else {
          // O navegar a la página principal donde están los ejemplos
          window.location.href = "/#features";
        }
      });
    }
  });

  // Botones "Más Info" para servicios próximamente
  const masInfoButtons = document.querySelectorAll(
    ".velvz-services__cta--secondary:not([href])"
  );
  masInfoButtons.forEach((button) => {
    if (button.textContent.includes("Más Info")) {
      button.addEventListener("click", () => {
        // Navegar a contacto con parámetro
        window.location.href = "/contacto/?servicio=proximamente";
      });
    }
  });

  // Botón "Empezar Ahora" del CTA final
  const empezarAhoraButtons = document.querySelectorAll(
    ".velvz-services__final-cta-actions .velvz-services__cta--primary"
  );
  empezarAhoraButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Navegar directamente al configurador
      window.location.href = "/app/";
    });
  });

  // =====================================================
  // EFECTOS VISUALES Y ANIMACIONES
  // =====================================================

  // Animación de las características al hacer hover
  const features = document.querySelectorAll(".velvz-services__feature");
  features.forEach((feature) => {
    if (!feature.classList.contains("velvz-services__feature--disabled")) {
      feature.addEventListener("mouseenter", () => {
        feature.style.transform = "translateX(8px)";
        feature.style.background = "rgba(102, 126, 234, 0.08)";
      });

      feature.addEventListener("mouseleave", () => {
        feature.style.transform = "";
        feature.style.background = "";
      });
    }
  });

  // Efecto ripple en botones
  const buttons = document.querySelectorAll(".velvz-services__cta");
  buttons.forEach((button) => {
    button.addEventListener("click", function (e) {
      if (this.disabled) return;

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
  // INTERSECTION OBSERVER PARA ANIMACIONES
  // =====================================================

  const observerOptions = {
    threshold: 0.05,
    rootMargin: "0px 0px -20px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = "running";

        // Animaciones especiales para ciertos elementos
        if (entry.target.classList.contains("velvz-services__process")) {
          // Animar pasos secuencialmente
          const steps = entry.target.querySelectorAll(".velvz-services__step");
          steps.forEach((step, index) => {
            setTimeout(() => {
              step.style.animationPlayState = "running";
              step.style.opacity = "1";
              step.style.transform = "translateY(0)";
            }, index * 100);
          });
        }
      }
    });
  }, observerOptions);

  // Observar elementos animados
  const animatedElements = document.querySelectorAll(
    ".velvz-services__badge, .velvz-services__title, .velvz-services__subtitle, .velvz-services__grid, .velvz-services__process, .velvz-services__final-cta"
  );

  animatedElements.forEach((el) => {
    if (el) {
      el.style.animationPlayState = "paused";
      observer.observe(el);
    }
  });

  // =====================================================
  // COUNTER ANIMATIONS PARA MÉTRICAS
  // =====================================================

  function animateNumber(
    element,
    target,
    duration = 2000,
    prefix = "",
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

      element.textContent =
        prefix + Math.floor(current).toLocaleString() + suffix;
    }, 16);
  }

  // Si hay métricas en la página, animarlas
  const metrics = document.querySelectorAll("[data-metric]");
  if (metrics.length > 0) {
    const metricsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = parseInt(entry.target.getAttribute("data-metric"));
            const prefix = entry.target.getAttribute("data-prefix") || "";
            const suffix = entry.target.getAttribute("data-suffix") || "";

            animateNumber(entry.target, target, 2000, prefix, suffix);
            metricsObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    metrics.forEach((metric) => {
      metricsObserver.observe(metric);
    });
  }

  // =====================================================
  // SCROLL EFFECTS PARA AMBIENT PULSES
  // =====================================================

  if (window.innerWidth > 768) {
    window.addEventListener("scroll", () => {
      const scrolled = window.pageYOffset;

      // Ambient pulses para servicios
      document
        .querySelectorAll(".velvz-services__ambient-pulse")
        .forEach((pulse, index) => {
          const speed = 0.015 + index * 0.005;
          pulse.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
  }

  // =====================================================
  // NAVEGACIÓN INTELIGENTE
  // =====================================================

  // Detectar desde qué página viene el usuario
  const urlParams = new URLSearchParams(window.location.search);
  const fromPage = urlParams.get("from");

  if (fromPage === "home") {
    // Si viene desde home, mostrar una pequeña notificación
    showWelcomeNotification();
  }

  function showWelcomeNotification() {
    const notification = document.createElement("div");
    notification.className = "velvz-welcome-notification";
    notification.innerHTML = `
      <div class="velvz-welcome-notification__content">
        <span class="velvz-welcome-notification__icon">👋</span>
        <span class="velvz-welcome-notification__text">¡Bienvenido a nuestros servicios!</span>
      </div>
    `;

    // Estilos de la notificación
    const notificationStyles = document.createElement("style");
    notificationStyles.textContent = `
      .velvz-welcome-notification {
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(102, 126, 234, 0.2);
        border-radius: 16px;
        padding: 1rem 1.5rem;
        box-shadow: 0 8px 32px rgba(102, 126, 234, 0.15);
        z-index: 1000;
        animation: velvzNotificationSlideIn 0.5s ease-out;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .velvz-welcome-notification:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 40px rgba(102, 126, 234, 0.2);
      }

      .velvz-welcome-notification__content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: #333;
        font-weight: 500;
        font-size: 0.9rem;
      }

      .velvz-welcome-notification__icon {
        font-size: 1.2rem;
      }

      @keyframes velvzNotificationSlideIn {
        from {
          opacity: 0;
          transform: translateX(100%);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @media (max-width: 768px) {
        .velvz-welcome-notification {
          top: 1rem;
          right: 1rem;
          left: 1rem;
          padding: 0.75rem 1rem;
        }

        .velvz-welcome-notification__content {
          font-size: 0.85rem;
          gap: 0.5rem;
        }
      }
    `;

    document.head.appendChild(notificationStyles);
    document.body.appendChild(notification);

    // Auto-remove después de 5 segundos
    setTimeout(() => {
      notification.style.animation =
        "velvzNotificationSlideIn 0.5s ease-out reverse";
      setTimeout(() => {
        notification.remove();
        notificationStyles.remove();
      }, 500);
    }, 5000);

    // Click para cerrar
    notification.addEventListener("click", () => {
      notification.remove();
      notificationStyles.remove();
    });
  }

  // =====================================================
  // ANALYTICS Y TRACKING (SIMULADO)
  // =====================================================

  // Tracking de interacciones importantes
  function trackEvent(action, category = "servicios") {
    console.log(`Analytics Event: ${category} - ${action}`);
  }

  // Track clicks en CTAs principales
  if (configureChatbotBtn) {
    configureChatbotBtn.addEventListener("click", () => {
      trackEvent("configurar_chatbot_click", "engagement");
    });
  }

  // Track tiempo en página
  const startTime = Date.now();
  window.addEventListener("beforeunload", () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    trackEvent(`time_on_page_${timeSpent}s`, "engagement");
  });

  // Track scroll profundidad
  let maxScroll = 0;
  window.addEventListener("scroll", () => {
    const scrollPercent = Math.round(
      (window.pageYOffset / (document.body.scrollHeight - window.innerHeight)) *
        100
    );

    if (scrollPercent > maxScroll) {
      maxScroll = scrollPercent;

      // Track hitos importantes
      if (maxScroll >= 25 && maxScroll < 50) {
        trackEvent("scroll_25_percent", "engagement");
      } else if (maxScroll >= 50 && maxScroll < 75) {
        trackEvent("scroll_50_percent", "engagement");
      } else if (maxScroll >= 75 && maxScroll < 90) {
        trackEvent("scroll_75_percent", "engagement");
      } else if (maxScroll >= 90) {
        trackEvent("scroll_90_percent", "engagement");
      }
    }
  });

  // =====================================================
  // INICIALIZACIÓN FINAL
  // =====================================================

  // Precargar recursos importantes
  const criticalImages = ["/svg/logo.svg", "/svg/logo.png"];

  criticalImages.forEach((src) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = src;
    document.head.appendChild(link);
  });

  // Lazy loading para elementos no críticos
  if ("IntersectionObserver" in window) {
    const lazyElements = document.querySelectorAll("[data-lazy]");
    const lazyObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target;
          element.src = element.dataset.lazy;
          element.classList.add("loaded");
          lazyObserver.unobserve(element);
        }
      });
    });

    lazyElements.forEach((element) => {
      lazyObserver.observe(element);
    });
  }

  // Performance monitoring
  if ("PerformanceObserver" in window) {
    const perfObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === "navigation") {
          console.log(
            `Página cargada en: ${entry.loadEventEnd - entry.loadEventStart}ms`
          );
        }
      });
    });

    try {
      perfObserver.observe({ entryTypes: ["navigation"] });
    } catch (e) {
      // Fallback para navegadores que no soportan el API
      window.addEventListener("load", () => {
        setTimeout(() => {
          console.log("Página completamente cargada");
        }, 0);
      });
    }
  }

  console.log("Página de servicios inicializada correctamente");
});

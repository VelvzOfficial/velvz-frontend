// =====================================================
// PÁGINA DE PRECIOS - FUNCIONALIDAD COMPLETA
// =====================================================

document.addEventListener("DOMContentLoaded", function () {
  console.log("📄 Inicializando página de precios");

  // =====================================================
  // NAVEGACIÓN DEL HEADER
  // =====================================================

  // Logo click to home
  const headerLogo = document.querySelector(".velvz-header__logo");
  if (headerLogo) {
    headerLogo.addEventListener("click", () => {
      window.location.href = "/";
    });
  }

  // Botón "Entrar"
  const empezarButtons = document.querySelectorAll(
    ".velvz-header__cta, .velvz-header__mobile-cta"
  );

  empezarButtons.forEach((button) => {
    // Asegurar que el texto sea "Entrar"
    const desktopText = button.querySelector(".velvz-header__cta-text");
    if (desktopText) {
      desktopText.textContent = "Entrar";
    }

    const mobileText = button.querySelector("span");
    if (mobileText && !button.closest(".velvz-header__mobile-cta-section")) {
      mobileText.textContent = "Entrar";
    }

    button.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("📝 Botón Entrar clickeado, redirigiendo a /cuenta/");
      window.location.href = "/cuenta/";
    });
  });

  // =====================================================
  // MENÚ MÓVIL
  // =====================================================

  const mobileToggle = document.querySelector(".velvz-header__mobile-toggle");
  const mobileMenu = document.querySelector(".velvz-header__mobile-menu");
  const mobileBackdrop = document.querySelector(
    ".velvz-header__mobile-backdrop"
  );
  const mobileClose = document.querySelector(".velvz-header__mobile-close");
  const hamburger = document.querySelector(".velvz-header__hamburger");

  function openMobileMenu() {
    if (mobileMenu && mobileBackdrop && hamburger) {
      mobileMenu.classList.add("velvz-header__mobile-menu--active");
      mobileBackdrop.classList.add("velvz-header__mobile-backdrop--active");
      hamburger.classList.add("velvz-header__hamburger--active");
      document.body.style.overflow = "hidden";
    }
  }

  function closeMobileMenu() {
    if (mobileMenu && mobileBackdrop && hamburger) {
      mobileMenu.classList.remove("velvz-header__mobile-menu--active");
      mobileBackdrop.classList.remove("velvz-header__mobile-backdrop--active");
      hamburger.classList.remove("velvz-header__hamburger--active");
      document.body.style.overflow = "";
    }
  }

  if (mobileToggle) {
    mobileToggle.addEventListener("click", openMobileMenu);
  }

  if (mobileClose) {
    mobileClose.addEventListener("click", closeMobileMenu);
  }

  if (mobileBackdrop) {
    mobileBackdrop.addEventListener("click", closeMobileMenu);
  }

  // =====================================================
  // ANIMACIONES DE LOGO
  // =====================================================

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
        if (logo.classList.contains("velvz-footer__logo")) {
          mouth.style.width = "7px";
          mouth.style.height = "7px";
        } else {
          mouth.style.width = "8px";
          mouth.style.height = "8px";
        }
        mouth.style.borderRadius = "50%";
      }
    });

    logo.addEventListener("mouseleave", () => {
      const mouth = logo.querySelector(
        ".velvz-header__logo-mouth, .velvz-footer__logo-mouth"
      );

      // Restaurar boca normal
      if (mouth) {
        if (logo.classList.contains("velvz-footer__logo")) {
          mouth.style.width = "10px";
          mouth.style.height = "5px";
          mouth.style.borderRadius = "5px";
        } else {
          mouth.style.width = "12px";
          mouth.style.height = "6px";
          mouth.style.borderRadius = "6px";
        }
      }
    });
  });

  // =====================================================
  // TOGGLE DE FACTURACIÓN (ESTILO CONTACTO)
  // =====================================================

  const billingToggle = document.getElementById("billingToggle");
  const monthlyOption = document.querySelector('[data-mode="monthly"]');
  const annualOption = document.querySelector('[data-mode="annual"]');
  const priceAmounts = document.querySelectorAll(".velvz-precios__plan-amount");

  let isAnnual = false;

  function updatePricing() {
    // Agregar animación a las tarjetas
    const plans = document.querySelectorAll(".velvz-precios__plan");

    // PASO 1: Ocultar todas las tarjetas inmediatamente
    plans.forEach((plan) => {
      plan.classList.add("velvz-precios__plan--animating");
    });

    // PASO 2: Actualizar precios y mostrar con delay escalonado
    plans.forEach((plan, index) => {
      setTimeout(() => {
        // Actualizar precios
        const amount = plan.querySelector(".velvz-precios__plan-amount");
        if (amount) {
          const monthlyPrice = amount.getAttribute("data-monthly");
          const annualPrice = amount.getAttribute("data-annual");
          amount.textContent = isAnnual ? annualPrice : monthlyPrice;
        }

        // Mostrar tarjeta con animación
        plan.classList.add("velvz-precios__plan--show");
      }, (index + 1) * 150); // +1 para que la primera tarjeta tenga 150ms, no 0ms
    });

    // PASO 3: Limpiar clases después de que termine la animación más larga
    setTimeout(() => {
      plans.forEach((plan) => {
        plan.classList.remove(
          "velvz-precios__plan--animating",
          "velvz-precios__plan--show"
        );
      });
    }, plans.length * 150 + 400); // Ajustado para el nuevo cálculo

    // Actualizar estado visual del toggle
    billingToggle.classList.toggle(
      "velvz-precios__billing-toggle--annual",
      isAnnual
    );

    // Actualizar clases activas
    monthlyOption.classList.toggle(
      "velvz-precios__billing-option--active",
      !isAnnual
    );
    annualOption.classList.toggle(
      "velvz-precios__billing-option--active",
      isAnnual
    );
  }

  function switchToBilling(mode) {
    if ((mode === "annual" && isAnnual) || (mode === "monthly" && !isAnnual)) {
      return; // Ya está en el modo correcto
    }

    isAnnual = mode === "annual";
    updatePricing();
  }

  // Event listeners para los botones del toggle
  if (monthlyOption) {
    monthlyOption.addEventListener("click", () => switchToBilling("monthly"));
  }

  if (annualOption) {
    annualOption.addEventListener("click", () => switchToBilling("annual"));
  }

  // También permitir click en el contenedor general
  if (billingToggle) {
    billingToggle.addEventListener("click", (e) => {
      // Solo si se hace click en el fondo, no en los botones
      if (e.target === billingToggle) {
        isAnnual = !isAnnual;
        updatePricing();
      }
    });
  }

  // =====================================================
  // FAQ ACCORDION
  // =====================================================

  const faqItems = document.querySelectorAll(".velvz-precios__faq-item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".velvz-precios__faq-question");

    if (question) {
      question.addEventListener("click", () => {
        const isActive = item.classList.contains(
          "velvz-precios__faq-item--active"
        );

        // Cerrar todos los items
        faqItems.forEach((otherItem) => {
          otherItem.classList.remove("velvz-precios__faq-item--active");
        });

        // Abrir este item si no estaba activo
        if (!isActive) {
          item.classList.add("velvz-precios__faq-item--active");
        }
      });
    }
  });

  // =====================================================
  // BOTONES DE PLANES (CON EFECTOS VISUALES)
  // =====================================================

  const planButtons = document.querySelectorAll(".velvz-precios__plan-cta");

  planButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();

      // Efecto visual inmediato
      button.style.transform = "scale(0.98)";
      setTimeout(() => {
        button.style.transform = "";
      }, 150);

      // Determinar acción según el texto del botón
      const buttonText = button.textContent.trim();

      if (buttonText === "Contactar ventas") {
        // Redirigir a contacto para Enterprise
        setTimeout(() => {
          window.location.href = "/contacto/";
        }, 300);
      } else {
        // Redirigir a registro para otros planes
        setTimeout(() => {
          window.location.href = "/cuenta/";
        }, 300);
      }
    });
  });

  // =====================================================
  // EFECTOS DE SCROLL PARA ELEMENTOS AMBIENTALES Y HEADER
  // =====================================================

  // Header con fondo al hacer scroll
  const header = document.querySelector(".velvz-header");

  function updateHeaderOnScroll() {
    const scrolled = window.pageYOffset;

    if (scrolled > 50) {
      header.classList.add("velvz-header--scrolled");
    } else {
      header.classList.remove("velvz-header--scrolled");
    }
  }

  if (window.innerWidth > 768) {
    window.addEventListener("scroll", () => {
      const scrolled = window.pageYOffset;

      // Header con fondo
      updateHeaderOnScroll();

      // Ambient pulses
      document
        .querySelectorAll(".velvz-precios__ambient-pulse")
        .forEach((pulse, index) => {
          const speed = 0.02 + index * 0.008;
          pulse.style.transform += ` translateY(${scrolled * speed}px)`;
        });
    });

    // Llamar una vez al cargar
    updateHeaderOnScroll();
  }

  // =====================================================
  // ANIMACIONES DE ENTRADA (INTERSECTION OBSERVER)
  // =====================================================

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

  // Observar elementos animados
  const animatedElements = document.querySelectorAll(
    ".velvz-precios__badge, .velvz-precios__title, .velvz-precios__subtitle, .velvz-precios__billing-toggle-container"
  );

  animatedElements.forEach((el) => {
    if (el) {
      el.style.animationPlayState = "paused";
      observer.observe(el);
    }
  });

  // =====================================================
  // INICIALIZACIÓN COMPLETA
  // =====================================================

  // Inicializar precios en modo mensual
  updatePricing();

  console.log("✅ Página de precios inicializada correctamente");
  console.log("💡 Toggle de facturación:", isAnnual ? "Anual" : "Mensual");
  console.log("📊 FAQ items encontrados:", faqItems.length);
  console.log("🎯 Botones de planes encontrados:", planButtons.length);
});

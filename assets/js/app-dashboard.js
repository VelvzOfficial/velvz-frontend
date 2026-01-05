// =====================================================
// DASHBOARD DE LA APLICACIÓN - CON PROTECCIÓN DE ACCESO ACTUALIZADA
// =====================================================
console.log('🔵 APP-DASHBOARD.JS CARGADO - VERSION 2025-12-31-v7');

// =====================================================
// VERIFICACIÓN INMEDIATA DE SESIÓN (antes de DOM ready)
// Si no hay token, redirigir inmediatamente sin mostrar nada
// =====================================================
(function() {
  const token = localStorage.getItem("velvz_token") ||
                localStorage.getItem("token") ||
                localStorage.getItem("authToken");

  if (!token) {
    console.log("🚫 Sin token - redirigiendo inmediatamente a login");
    window.location.replace("/cuenta/");
    return;
  }

  // Si hay token, ocultar contenido hasta verificar que es válido
  document.documentElement.style.visibility = "hidden";
})();

// =====================================================
// MENÚ MÓVIL - CONFIGURAR INMEDIATAMENTE CUANDO DOM ESTÉ LISTO
// (Antes de cualquier verificación de auth)
// =====================================================
document.addEventListener("DOMContentLoaded", function() {
  // Configurar menú móvil PRIMERO
  const mobileToggle = document.querySelector(".velvz-header__mobile-toggle");
  const mobileMenu = document.querySelector(".velvz-header__mobile-menu");
  const mobileBackdrop = document.querySelector(".velvz-header__mobile-backdrop");
  const mobileClose = document.querySelector(".velvz-header__mobile-close");
  const hamburger = document.querySelector(".velvz-header__hamburger");

  console.log("🍔 Configurando menú móvil - Toggle:", !!mobileToggle, "Menu:", !!mobileMenu);

  if (mobileToggle && mobileMenu) {
    function openMenu() {
      console.log("📱 Abriendo menú móvil");
      mobileMenu.classList.add("velvz-header__mobile-menu--active");
      if (mobileBackdrop) mobileBackdrop.classList.add("velvz-header__mobile-backdrop--active");
      if (hamburger) hamburger.classList.add("velvz-header__hamburger--active");
      document.body.style.overflow = "hidden";
    }

    function closeMenu() {
      console.log("📱 Cerrando menú móvil");
      mobileMenu.classList.remove("velvz-header__mobile-menu--active");
      if (mobileBackdrop) mobileBackdrop.classList.remove("velvz-header__mobile-backdrop--active");
      if (hamburger) hamburger.classList.remove("velvz-header__hamburger--active");
      document.body.style.overflow = "";
    }

    mobileToggle.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      openMenu();
    });

    if (mobileClose) mobileClose.addEventListener("click", closeMenu);
    if (mobileBackdrop) mobileBackdrop.addEventListener("click", closeMenu);

    console.log("✅ Menú móvil configurado");
  }

  // Configurar selector de servicios
  const svcBtn = document.getElementById('svcSelector');
  if (svcBtn) {
    svcBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      svcBtn.classList.toggle('open');
    });

    document.addEventListener('click', function(e) {
      if (!svcBtn.contains(e.target)) {
        svcBtn.classList.remove('open');
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        svcBtn.classList.remove('open');
      }
    });
    console.log("✅ Selector de servicios configurado");
  }
});

document.addEventListener("DOMContentLoaded", function () {
  console.log("🔒 Inicializando dashboard privado...");

  // =====================================================
  // PROTECCIÓN DE ACCESO - VERIFICAR SESIÓN
  // =====================================================

  async function checkAuthAndSetupDashboard() {
    try {
      // Verificar si hay sistema de auth
      if (!window.velvzAuth) {
        console.log("❌ Sistema de auth no disponible, redirigiendo...");
        redirectToLogin();
        return;
      }

      // Verificar si hay token
      if (!window.velvzAuth.isLoggedIn()) {
        console.log("❌ Sin token, redirigiendo a login...");
        redirectToLogin();
        return;
      }

      // Verificar que la sesión sea válida
      const profile = await window.velvzAuth.getProfile();

      if (profile && profile.success) {
        console.log("✅ Acceso autorizado para:", profile.user.name);
        // Mostrar contenido ahora que sabemos que la sesión es válida
        document.documentElement.style.visibility = "visible";
        setupUserInterface(profile.user);
      } else {
        console.log("❌ Sesión inválida, limpiando y redirigiendo...");
        redirectToLoginWithExpired();
      }
    } catch (error) {
      console.error("❌ Error verificando acceso:", error);
      redirectToLoginWithExpired();
    }
  }

  function redirectToLoginWithExpired() {
    // Guardar nombre del usuario antes de limpiar
    const userData = localStorage.getItem("velvz_user");
    let userName = null;
    if (userData) {
      try {
        const user = JSON.parse(userData);
        userName = user.name || user.email;
      } catch (e) {}
    }

    // Limpiar sesión
    if (window.velvzAuth && window.velvzAuth.logout) {
      window.velvzAuth.logout();
    }

    // Redirigir con parámetros
    const params = new URLSearchParams();
    params.set("expired", "true");
    if (userName) {
      params.set("user", userName);
    }
    console.log("🔄 Redirigiendo a /cuenta/ - sesión expirada");
    window.location.href = `/cuenta/?${params.toString()}`;
  }

  function redirectToLogin() {
    console.log("🔄 Redirigiendo a /cuenta/ por falta de autorización");
    window.location.href = "/cuenta/";
  }

  // =====================================================
  // CONFIGURACIÓN DE LA INTERFAZ CON DATOS REALES
  // =====================================================

  function setupUserInterface(user) {
    // Actualizar avatar del usuario
    setupUserAvatar(user);

    // Actualizar título de bienvenida
    updateWelcomeMessage(user);

    // Actualizar datos del menú móvil
    updateMobileUserCard(user);

    // Configurar navegación
    setupNavigation();

    // Configurar funcionalidad de las tarjetas
    setupDashboardCards();

    // Configurar animaciones de logos
    setupLogoAnimations();

    // Configurar menú móvil
    setupMobileMenu();

  }

  function setupUserAvatar(user) {
    const desktopAvatar = document.getElementById("userAvatar");
    const mobileAvatar = document.getElementById("mobileUserAvatar");

    if (user && user.name) {
      const userInitial = user.name.charAt(0).toUpperCase();

      // Avatar desktop
      if (desktopAvatar) {
        const avatarCircle = desktopAvatar.querySelector(
          ".velvz-header__avatar-circle"
        );
        if (avatarCircle) {
          avatarCircle.textContent = userInitial;
          avatarCircle.title = user.name;
        }

        // Agregar funcionalidad de menú
        console.log("🔍 DEBUG APP-DASHBOARD: Agregando listener al avatar");
        desktopAvatar.addEventListener("click", function (e) {
          console.log("🔍 DEBUG APP-DASHBOARD: Click detectado en avatar (desde app-dashboard.js)");
          e.stopPropagation();
          showUserMenu(user);
        });
      }

      // Avatar móvil en el menú
      if (mobileAvatar) {
        mobileAvatar.textContent = userInitial;
        mobileAvatar.title = user.name;
      }
    }
  }

  function updateWelcomeMessage(user) {
    const welcomeTitle = document.getElementById("welcomeTitle");
    if (welcomeTitle && user && user.name) {
      // Extraer el primer nombre
      const firstName = user.name.split(" ")[0];
      welcomeTitle.textContent = `Bienvenido de vuelta, ${firstName}`;
    }
  }

  // =====================================================
  // NUEVA FUNCIÓN: ACTUALIZAR TARJETA DE USUARIO MÓVIL
  // =====================================================

  function updateMobileUserCard(user) {
    const mobileUserName = document.getElementById("mobileUserName");
    const mobileUserEmail = document.getElementById("mobileUserEmail");
    const mobileUserAvatar = document.getElementById("mobileUserAvatar");

    if (user) {
      // Actualizar nombre
      if (mobileUserName && user.name) {
        mobileUserName.textContent = user.name;
      }

      // Actualizar email
      if (mobileUserEmail && user.email) {
        mobileUserEmail.textContent = user.email;
      }

      // Actualizar avatar
      if (mobileUserAvatar && user.name) {
        const userInitial = user.name.charAt(0).toUpperCase();
        mobileUserAvatar.textContent = userInitial;
      }

      console.log("✅ Tarjeta de usuario móvil actualizada para:", user.name);
    }
  }

  // =====================================================
  // MENÚ DEL USUARIO
  // =====================================================

  function showUserMenu(user) {
    // Eliminar menú existente si lo hay
    const existingMenu = document.getElementById("userDropdownMenu");
    if (existingMenu) {
      existingMenu.remove();
    }

    // Crear nuevo menú
    const userMenu = document.createElement("div");
    userMenu.id = "userDropdownMenu";
    userMenu.className = "velvz-user-menu";

    const userInitial = user.name ? user.name.charAt(0).toUpperCase() : "U";

    userMenu.innerHTML = `
      <div class="velvz-user-menu__header">
        <div class="velvz-user-menu__avatar">${userInitial}</div>
        <div class="velvz-user-menu__info">
          <div class="velvz-user-menu__name">${user.name || "Usuario"}</div>
          <div class="velvz-user-menu__email">${user.email || ""}</div>
        </div>
      </div>

      <div class="velvz-user-menu__divider"></div>

      <nav class="velvz-user-menu__nav">
        <a href="/app/profile/" class="velvz-user-menu__link">
          <i class="fas fa-user"></i>
          Mi Perfil
        </a>
        <a href="/app/billing/" class="velvz-user-menu__link">
          <i class="fas fa-credit-card"></i>
          Facturación
        </a>
      </nav>

      <div class="velvz-user-menu__divider"></div>

      <button onclick="handleLogout()" class="velvz-user-menu__link velvz-user-menu__link--logout">
        <i class="fas fa-sign-out-alt"></i>
        Cerrar Sesión
      </button>
    `;

    // Posicionar menú
    const avatar = document.getElementById("userAvatar");
    if (avatar) {
      const rect = avatar.getBoundingClientRect();
      userMenu.style.position = "fixed";
      userMenu.style.top = rect.bottom + 10 + "px";
      userMenu.style.right = window.innerWidth - rect.right + "px";
      userMenu.style.zIndex = "10000";
    }

    document.body.appendChild(userMenu);

    // Inyectar estilos del menú si no existen
    injectUserMenuStyles();

    // Mostrar menú con animación
    setTimeout(() => {
      userMenu.classList.add("velvz-user-menu--active");
    }, 10);

    // Cerrar menú al hacer click fuera
    setTimeout(() => {
      document.addEventListener("click", function closeMenu(e) {
        if (!userMenu.contains(e.target)) {
          userMenu.classList.remove("velvz-user-menu--active");
          setTimeout(() => {
            if (userMenu.parentNode) {
              userMenu.remove();
            }
          }, 300);
          document.removeEventListener("click", closeMenu);
        }
      });
    }, 100);
  }

  function injectUserMenuStyles() {
    if (document.getElementById("userMenuStyles")) return;

    const styles = `
      .velvz-user-menu {
        background: var(--dark-bg-secondary);
        border: 1px solid var(--dark-border);
        border-radius: 16px;
        box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
        min-width: 280px;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.3s ease;
        pointer-events: none;
        padding: 1rem;
        color: var(--dark-text);
      }
      
      .velvz-user-menu--active {
        opacity: 1;
        transform: translateY(0);
        pointer-events: all;
      }
      
      .velvz-user-menu__header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }
      
      .velvz-user-menu__avatar {
        width: 40px;
        height: 40px;
        background: var(--primary-gradient);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        font-size: 1.1rem;
      }
      
      .velvz-user-menu__info {
        flex: 1;
      }
      
      .velvz-user-menu__name {
        font-weight: 600;
        color: var(--dark-text);
        margin-bottom: 0.25rem;
      }
      
      .velvz-user-menu__email {
        font-size: 0.85rem;
        color: var(--dark-text-secondary);
      }
      
      .velvz-user-menu__divider {
        height: 1px;
        background: var(--dark-border);
        margin: 0.75rem 0;
      }
      
      .velvz-user-menu__nav {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      
      .velvz-user-menu__link {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        border-radius: 8px;
        text-decoration: none;
        color: var(--dark-text-secondary);
        font-weight: 500;
        font-size: 0.9rem;
        transition: all 0.3s ease;
        border: none;
        background: none;
        cursor: pointer;
        width: 100%;
        text-align: left;
      }
      
      .velvz-user-menu__link:hover {
        background: rgba(255, 255, 255, 0.05);
        color: var(--dark-text);
      }
      
      .velvz-user-menu__link--logout {
        color: #ef4444;
      }
      
      .velvz-user-menu__link--logout:hover {
        background: rgba(239, 68, 68, 0.1);
        color: #dc2626;
      }
      
      .velvz-user-menu__link i {
        width: 16px;
        text-align: center;
      }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.id = "userMenuStyles";
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  // =====================================================
  // FUNCIÓN GLOBAL DE LOGOUT
  // =====================================================

  window.handleLogout = function () {
    console.log("🚪 Iniciando cierre de sesión...");

    // Limpiar token y datos
    if (window.velvzAuth && window.velvzAuth.logout) {
      window.velvzAuth.logout();
    }

    // Limpiar localStorage como respaldo
    localStorage.removeItem("velvz_token");

    // Mostrar feedback visual
    showNotification("Sesión cerrada correctamente", "success");

    // Redirigir después de un breve delay
    setTimeout(() => {
      console.log("🔄 Redirigiendo a /cuenta/");
      window.location.href = "/cuenta/";
    }, 1000);
  };

  // =====================================================
  // NAVEGACIÓN Y FUNCIONALIDAD
  // =====================================================

  function setupNavigation() {
    // Logo click to home
    const headerLogo = document.querySelector(".velvz-header__logo");
    if (headerLogo) {
      headerLogo.addEventListener("click", function () {
        window.location.href = "/";
      });
    }

    // Navegación activa
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll(".velvz-header__link");

    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (href === currentPath) {
        link.classList.add("velvz-header__link--active");
      }
    });

    // Sidebar navegación activa
    const sidebarLinks = document.querySelectorAll(".velvz-sidebar__link");
    sidebarLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (href === currentPath) {
        link.classList.add("velvz-sidebar__link--active");
      }
    });
  }

  function setupDashboardCards() {
    const cardActions = document.querySelectorAll(".velvz-card__action");

    cardActions.forEach((button) => {
      button.addEventListener("click", function () {
        const card = this.closest(".velvz-card");
        const cardTitle = card.querySelector(".velvz-card__title").textContent;

        // Efecto visual inmediato
        this.style.transform = "scale(0.98)";

        setTimeout(() => {
          this.style.transform = "";
        }, 150);

        // Manejar acciones según el tipo de tarjeta
        switch (cardTitle) {
          case "Chatbots Activos":
            setTimeout(() => {
              window.location.href = "/app/chatbots/";
            }, 300);
            break;

          case "Conversaciones":
            setTimeout(() => {
              window.location.href = "/app/analytics/";
            }, 300);
            break;

          case "Satisfacción":
            setTimeout(() => {
              window.location.href = "/app/analytics/#satisfaction";
            }, 300);
            break;

          case "Nuevo Chatbot":
            setTimeout(() => {
              window.location.href = "/configurador/chatbot/";
            }, 300);
            break;

          default:
            console.log("Acción para:", cardTitle);
        }
      });
    });
  }

  function setupLogoAnimations() {
    // Header logo animation
    const headerLogo = document.querySelector(".velvz-header__logo");
    if (headerLogo) {
      headerLogo.addEventListener("mouseenter", function () {
        const eyes = headerLogo.querySelectorAll(".velvz-header__logo-eye");
        const mouth = headerLogo.querySelector(".velvz-header__logo-mouth");

        // Parpadeo de ojos
        eyes.forEach((eye) => {
          eye.style.transform = "scaleY(0.2)";
          setTimeout(() => {
            eye.style.transform = "scaleY(1)";
          }, 150);
        });

        // Boca sorprendida
        if (mouth) {
          mouth.style.width = "8px";
          mouth.style.height = "8px";
          mouth.style.borderRadius = "50%";
        }
      });

      headerLogo.addEventListener("mouseleave", function () {
        const mouth = headerLogo.querySelector(".velvz-header__logo-mouth");
        if (mouth) {
          mouth.style.width = "12px";
          mouth.style.height = "6px";
          mouth.style.borderRadius = "6px";
        }
      });
    }

    // Footer logo animation
    const footerLogo = document.querySelector(".velvz-footer__logo");
    if (footerLogo) {
      footerLogo.addEventListener("mouseenter", function () {
        const eyes = footerLogo.querySelectorAll(".velvz-footer__logo-eye");
        const mouth = footerLogo.querySelector(".velvz-footer__logo-mouth");

        eyes.forEach((eye) => {
          eye.style.transform = "scaleY(0.2)";
          setTimeout(() => {
            eye.style.transform = "scaleY(1)";
          }, 150);
        });

        if (mouth) {
          mouth.style.width = "7px";
          mouth.style.height = "7px";
          mouth.style.borderRadius = "50%";
        }
      });

      footerLogo.addEventListener("mouseleave", function () {
        const mouth = footerLogo.querySelector(".velvz-footer__logo-mouth");
        if (mouth) {
          mouth.style.width = "10px";
          mouth.style.height = "5px";
          mouth.style.borderRadius = "5px";
        }
      });
    }
  }

  function setupMobileMenu() {
    const mobileToggle = document.querySelector(".velvz-header__mobile-toggle");
    const mobileMenu = document.querySelector(".velvz-header__mobile-menu");
    const mobileBackdrop = document.querySelector(
      ".velvz-header__mobile-backdrop"
    );
    const mobileClose = document.querySelector(".velvz-header__mobile-close");
    const hamburger = document.querySelector(".velvz-header__hamburger");

    console.log("🔧 setupMobileMenu - Toggle encontrado:", !!mobileToggle);
    console.log("🔧 setupMobileMenu - Menu encontrado:", !!mobileMenu);

    function openMobileMenu() {
      console.log("📱 Abriendo menú móvil...");
      if (mobileMenu && mobileBackdrop && hamburger) {
        mobileMenu.classList.add("velvz-header__mobile-menu--active");
        mobileBackdrop.classList.add("velvz-header__mobile-backdrop--active");
        hamburger.classList.add("velvz-header__hamburger--active");
        document.body.style.overflow = "hidden";
      }
    }

    function closeMobileMenu() {
      console.log("📱 Cerrando menú móvil...");
      if (mobileMenu && mobileBackdrop && hamburger) {
        mobileMenu.classList.remove("velvz-header__mobile-menu--active");
        mobileBackdrop.classList.remove(
          "velvz-header__mobile-backdrop--active"
        );
        hamburger.classList.remove("velvz-header__hamburger--active");
        document.body.style.overflow = "";
      }
    }

    if (mobileToggle) {
      // Remover listeners previos para evitar duplicados
      mobileToggle.replaceWith(mobileToggle.cloneNode(true));
      const newToggle = document.querySelector(".velvz-header__mobile-toggle");
      newToggle.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        openMobileMenu();
      });
      console.log("✅ Event listener añadido al toggle móvil");
    }

    if (mobileClose) {
      mobileClose.addEventListener("click", closeMobileMenu);
    }

    if (mobileBackdrop) {
      mobileBackdrop.addEventListener("click", closeMobileMenu);
    }
  }

  // =====================================================
  // SISTEMA DE NOTIFICACIONES
  // =====================================================

  function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `velvz-notification velvz-notification--${type}`;

    const iconMap = {
      success: "✅",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️",
    };

    const colorMap = {
      success: "#10b981",
      error: "#ef4444",
      warning: "#f59e0b",
      info: "#667eea",
    };

    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="font-size: 1.2rem;">${iconMap[type] || iconMap.info}</span>
        <span>${message}</span>
      </div>
    `;

    // Estilos
    notification.style.cssText = `
      position: fixed;
      top: 120px;
      right: 20px;
      background: var(--dark-bg-secondary);
      border: 1px solid var(--dark-border);
      border-left: 4px solid ${colorMap[type] || colorMap.info};
      border-radius: 8px;
      padding: 1rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      z-index: 10001;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
      color: var(--dark-text);
      font-weight: 500;
      max-width: 350px;
    `;

    document.body.appendChild(notification);

    // Mostrar con animación
    setTimeout(() => {
      notification.style.opacity = "1";
      notification.style.transform = "translateX(0)";
    }, 100);

    // Ocultar después de 3 segundos
    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  // =====================================================
  // RESPONSIVE BEHAVIOR
  // =====================================================

  function handleResize() {
    const userMenu = document.getElementById("userDropdownMenu");
    if (userMenu && userMenu.classList.contains("velvz-user-menu--active")) {
      // Reposicionar menú en resize
      const avatar = document.getElementById("userAvatar");
      if (avatar) {
        const rect = avatar.getBoundingClientRect();
        userMenu.style.top = rect.bottom + 10 + "px";
        userMenu.style.right = window.innerWidth - rect.right + "px";
      }
    }
  }

  // =====================================================
  // ANIMACIÓN DE CONTADORES
  // =====================================================

  function animateCounters() {
    const counters = document.querySelectorAll('.velvz-metric__value[data-count]');

    counters.forEach(counter => {
      const target = parseFloat(counter.getAttribute('data-count'));
      const decimals = parseInt(counter.getAttribute('data-decimals')) || 0;
      const duration = 1500;
      const startTime = performance.now();

      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);

        const current = target * easeOut;
        counter.textContent = current.toFixed(decimals);

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        }
      }

      requestAnimationFrame(updateCounter);
    });
  }

  // =====================================================
  // GRÁFICA DE CONVERSACIONES
  // =====================================================

  function initConversationsChart() {
    const canvas = document.getElementById('conversationsChart');
    if (!canvas || typeof Chart === 'undefined') {
      console.log('Chart.js no disponible o canvas no encontrado');
      return;
    }

    const ctx = canvas.getContext('2d');

    // Datos de ejemplo para los últimos 7 días
    const labels = getLast7DaysLabels();
    const data = [89, 112, 98, 156, 134, 178, 80]; // Datos de ejemplo

    // Gradiente para el área
    const gradient = ctx.createLinearGradient(0, 0, 0, 250);
    gradient.addColorStop(0, 'rgba(102, 126, 234, 0.3)');
    gradient.addColorStop(1, 'rgba(102, 126, 234, 0)');

    window.conversationsChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Conversaciones',
          data: data,
          fill: true,
          backgroundColor: gradient,
          borderColor: '#667eea',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#667eea',
          pointBorderColor: '#1a1a2e',
          pointBorderWidth: 2,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#764ba2',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#1a1a2e',
            titleColor: '#eee6ff',
            bodyColor: '#a5a5c9',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              title: function(context) {
                return context[0].label;
              },
              label: function(context) {
                return `${context.parsed.y} conversaciones`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#a5a5c9',
              font: {
                size: 11
              }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
              color: '#a5a5c9',
              font: {
                size: 11
              },
              stepSize: 50
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  }

  function getLast7DaysLabels() {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const labels = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(days[date.getDay()]);
    }

    return labels;
  }

  // =====================================================
  // BOTONES DE PERÍODO DE LA GRÁFICA
  // =====================================================

  function setupChartPeriodButtons() {
    const buttons = document.querySelectorAll('.velvz-chart-card__btn');

    buttons.forEach(btn => {
      btn.addEventListener('click', function() {
        // Remover clase activa de todos
        buttons.forEach(b => b.classList.remove('velvz-chart-card__btn--active'));
        // Añadir clase activa al clickeado
        this.classList.add('velvz-chart-card__btn--active');

        const period = this.getAttribute('data-period');
        updateChartData(period);
      });
    });
  }

  function updateChartData(period) {
    if (!window.conversationsChart) return;

    let newData, labels;

    switch(period) {
      case '7d':
        labels = getLast7DaysLabels();
        newData = [89, 112, 98, 156, 134, 178, 80];
        break;
      case '30d':
        labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
        newData = [423, 512, 489, 567];
        break;
      case '90d':
        labels = ['Mes 1', 'Mes 2', 'Mes 3'];
        newData = [1856, 2134, 2456];
        break;
      default:
        return;
    }

    window.conversationsChart.data.labels = labels;
    window.conversationsChart.data.datasets[0].data = newData;
    window.conversationsChart.update('active');
  }

  // =====================================================
  // DATOS SIMULADOS DEL DASHBOARD
  // =====================================================

  function updateDashboardStats() {
    // Simular actualización de estadísticas en tiempo real
    const stats = {
      chatbots: Math.floor(Math.random() * 2) + 3, // 3-4
      conversations: Math.floor(Math.random() * 100) + 800, // 800-899
      satisfaction: (4.6 + Math.random() * 0.4).toFixed(1), // 4.6-5.0
    };

    console.log("📊 Stats actualizadas:", stats);
  }

  // =====================================================
  // INICIALIZAR COMPONENTES DEL DASHBOARD
  // =====================================================

  function initDashboardComponents() {
    // Animar contadores después de un pequeño delay
    setTimeout(animateCounters, 300);

    // Inicializar gráfica
    setTimeout(initConversationsChart, 500);

    // Configurar botones de período
    setupChartPeriodButtons();
  }

  // Llamar después de que se configure la interfaz
  setTimeout(initDashboardComponents, 100);

  // =====================================================
  // EVENT LISTENERS
  // =====================================================

  window.addEventListener("resize", handleResize);

  // Actualizar stats cada 30 segundos
  setInterval(updateDashboardStats, 30000);

  // =====================================================
  // INICIALIZACIÓN PRINCIPAL
  // =====================================================

  // Verificar acceso y configurar dashboard
  checkAuthAndSetupDashboard();

  // Actualizar stats inicial
  updateDashboardStats();

  console.log("🚀 Dashboard inicializado con protección de acceso");

  // =====================================================
  // MANEJO DE ERRORES GLOBALES
  // =====================================================

  window.addEventListener("error", function (e) {
    console.error("❌ Error en dashboard:", e.error);
    // En caso de error crítico, redirigir a cuenta
    if (e.error && e.error.message && e.error.message.includes("auth")) {
      console.log("🔄 Error de autenticación detectado, redirigiendo...");
      redirectToLogin();
    }
  });

  // =====================================================
  // FUNCIONES DE UTILIDAD GLOBALES
  // =====================================================

  // Función para verificar estado de conexión
  window.checkConnectionStatus = function () {
    if (!navigator.onLine) {
      showNotification("Sin conexión a internet", "warning");
      return false;
    }
    return true;
  };

  // Función para refrescar datos del usuario
  window.refreshUserData = async function () {
    try {
      if (window.velvzAuth && window.velvzAuth.isLoggedIn()) {
        const profile = await window.velvzAuth.getProfile();
        if (profile && profile.success) {
          setupUserInterface(profile.user);
          showNotification("Datos actualizados", "success");
        }
      }
    } catch (error) {
      console.error("Error refrescando datos:", error);
      showNotification("Error actualizando datos", "error");
    }
  };

  // Función para obtener estadísticas del dashboard
  window.getDashboardStats = function () {
    return {
      chatbots: 3,
      conversations: 847,
      satisfaction: 4.8,
      lastUpdated: new Date().toISOString(),
    };
  };

  // Función para debug (solo en desarrollo)
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    window.velvzDebug = {
      forceLogout: () => {
        window.handleLogout();
      },
      checkAuth: () => {
        checkAuthAndSetupDashboard();
      },
      showTestNotification: (type = "info") => {
        showNotification(`Notificación de prueba (${type})`, type);
      },
      getUserData: async () => {
        try {
          const profile = await window.velvzAuth.getProfile();
          console.log("Datos del usuario:", profile);
          return profile;
        } catch (error) {
          console.error("Error obteniendo datos:", error);
          return null;
        }
      },
    };
    console.log("🔧 Funciones de debug disponibles en: window.velvzDebug");
  }

});

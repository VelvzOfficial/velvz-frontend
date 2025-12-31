// =====================================================
// PÁGINAS PRIVADAS DE LA APLICACIÓN - CON PROTECCIÓN
// =====================================================
// Para: /app/ y subpáginas de la aplicación

// =====================================================
// VERIFICACIÓN INMEDIATA DE SESIÓN (antes de DOM ready)
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
})();

document.addEventListener("DOMContentLoaded", function () {
  console.log("🔒 Inicializando página privada de la aplicación");
  console.log("🔍 DEBUG: Scripts cargados:", {
    authConfig: !!window.velvzAuth,
    appDashboard: !!window.setupDashboard,
    privateApp: true
  });

  // =====================================================
  // PROTECCIÓN DE ACCESO
  // =====================================================

  async function checkAuthAndSetupHeader() {
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
        setupUserHeader(profile.user);
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
  // CONFIGURACIÓN DEL HEADER CON AVATAR
  // =====================================================

  function setupUserHeader(user) {
    console.log("🔍 DEBUG: setupUserHeader llamado con usuario:", user.name);
    
    // Primero intentar actualizar avatares existentes (como en chatbots)
    const existingUserInitials = document.getElementById("userInitials");
    const existingMobileInitials = document.getElementById("mobileUserInitials");
    const existingUserName = document.getElementById("mobileUserName");
    const existingUserEmail = document.getElementById("mobileUserEmail");
    
    console.log("🔍 DEBUG: Elementos encontrados:", {
      userInitials: !!existingUserInitials,
      mobileInitials: !!existingMobileInitials,
      userAvatar: !!document.getElementById("userAvatar")
    });
    
    // Obtener inicial del nombre
    const initial = user.name ? user.name.charAt(0).toUpperCase() : user.email ? user.email.charAt(0).toUpperCase() : "U";
    
    if (existingUserInitials) {
      existingUserInitials.textContent = initial;
      console.log("✅ Avatar actualizado (existente):", initial);
      
      // Actualizar también información móvil si existe
      if (existingMobileInitials) existingMobileInitials.textContent = initial;
      if (existingUserName) existingUserName.textContent = user.name || "Usuario";
      if (existingUserEmail) existingUserEmail.textContent = user.email || "";
      
      // Agregar event listener al avatar si existe
      const avatarElement = document.getElementById("userAvatar");
      if (avatarElement) {
        console.log("🔍 DEBUG: Avatar encontrado, configurando listener");
        avatarElement.style.cursor = "pointer";
        
        // Obtener todos los event listeners actuales (para debug)
        const listeners = getEventListeners ? getEventListeners(avatarElement) : null;
        console.log("🔍 DEBUG: Listeners existentes antes de limpiar:", listeners);
        
        // IMPORTANTE: Clonar el elemento para remover TODOS los event listeners existentes
        const parent = avatarElement.parentNode;
        const newAvatarElement = avatarElement.cloneNode(true);
        parent.replaceChild(newAvatarElement, avatarElement);
        
        console.log("🔍 DEBUG: Elemento clonado y reemplazado");
        
        // Variable para trackear clicks
        let clickCount = 0;
        
        // Agregar SOLO nuestro event listener
        newAvatarElement.addEventListener("click", (e) => {
          clickCount++;
          console.log(`🔍 DEBUG: Click #${clickCount} en avatar detectado`);
          console.log("🔍 DEBUG: Event phase:", e.eventPhase); // 1=capture, 2=target, 3=bubble
          console.log("🔍 DEBUG: Target:", e.target);
          console.log("🔍 DEBUG: CurrentTarget:", e.currentTarget);
          
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation(); // Detener TODOS los otros handlers
          
          console.log("🔍 DEBUG: Llamando toggleUserMenu");
          toggleUserMenu(user);
          console.log("🔍 DEBUG: toggleUserMenu completado");
        }, true); // Usar capture phase para tener prioridad
        
        console.log("🔍 DEBUG: Event listener agregado exitosamente");
      } else {
        console.log("⚠️ DEBUG: No se encontró elemento userAvatar");
      }
      return;
    }
    
    // Si no hay avatares existentes, buscar el contenedor del avatar
    const desktopIsland = document.querySelector(".velvz-header__island--cta");
    const existingAvatar = document.querySelector("#userAvatar");

    // En /app/index.html el avatar ya existe, solo necesitamos configurarlo
    if (existingAvatar) {
      console.log("🔍 DEBUG: Avatar existente encontrado en app, configurando...");
      const avatarCircle = existingAvatar.querySelector(".velvz-header__avatar-circle");
      if (avatarCircle) {
        avatarCircle.textContent = initial;
        console.log("🔍 DEBUG: Inicial actualizada a:", initial);
      }
      
      // Remover listeners antiguos y agregar el nuestro
      const parent = existingAvatar.parentNode;
      const newAvatar = existingAvatar.cloneNode(true);
      parent.replaceChild(newAvatar, existingAvatar);
      
      let clickCount = 0;
      newAvatar.addEventListener("click", (e) => {
        clickCount++;
        console.log(`🔍 DEBUG PRIVATE-APP: Click #${clickCount} en avatar`);
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        toggleUserMenu(user);
      }, true);
      
      console.log("✅ Avatar configurado con toggle menu");
      return;
    }

    // Fallback para páginas que no tienen avatar
    if (!desktopIsland) {
      console.log("⚠️ No se encontró contenedor para avatar");
      return;
    }

    // Inyectar estilos del avatar
    injectAvatarStyles();

    // Mostrar avatar del usuario
    showUserAvatar(user, desktopIsland, mobileCTA);

    console.log("✅ Header configurado con avatar para:", user.name);
  }

  function showUserAvatar(user, desktopIsland, mobileCTA) {
    // Crear avatar para desktop
    const avatarElement = createAvatarElement(user);

    // Reemplazar el contenido del island desktop
    desktopIsland.innerHTML = "";
    desktopIsland.appendChild(avatarElement);

    // Crear avatar para móvil y reemplazar el botón
    const mobileAvatarElement = createAvatarElement(user, true);
    const mobileMenu = mobileCTA.closest(".velvz-header__mobile-menu");

    if (mobileMenu) {
      // Buscar el botón móvil y reemplazarlo
      const mobileNav = mobileMenu.querySelector(".velvz-header__mobile-nav");
      if (mobileNav) {
        // Agregar avatar después del nav
        mobileNav.insertAdjacentElement("afterend", mobileAvatarElement);
        // Ocultar el botón CTA original
        mobileCTA.style.display = "none";
      }
    }
  }

  function createAvatarElement(user, isMobile = false) {
    // Crear contenedor del avatar
    const avatarContainer = document.createElement("div");
    avatarContainer.className = isMobile
      ? "velvz-header__mobile-avatar"
      : "velvz-header__avatar";

    // Obtener inicial del nombre
    const initial = user.name ? user.name.charAt(0).toUpperCase() : "U";

    // Crear avatar con menú dropdown
    const avatar = document.createElement("div");
    avatar.className = isMobile
      ? "velvz-header__mobile-avatar-circle"
      : "velvz-header__avatar-circle";
    avatar.textContent = initial;
    avatar.title = `${user.name} - Ver opciones`;

    // Agregar event listener para mostrar menú
    avatar.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleUserMenu(user);
    });

    avatarContainer.appendChild(avatar);

    return avatarContainer;
  }

  // Función simple de toggle para el menú
  function toggleUserMenu(user) {
    const existingMenu = document.getElementById("userDropdownMenu");
    
    // Si el menú existe, lo cerramos y salimos
    if (existingMenu) {
      closeUserMenu();
      return;
    }
    
    // Si no existe, lo creamos
    openUserMenu(user);
  }
  
  function closeUserMenu() {
    const menu = document.getElementById("userDropdownMenu");
    if (menu) {
      menu.remove();
    }
    // Remover el event listener de cierre si existe
    if (window.menuCloseHandler) {
      document.removeEventListener("click", window.menuCloseHandler);
      window.menuCloseHandler = null;
    }
  }
  
  function openUserMenu(user) {
    // Asegurarnos de que no hay menú abierto
    closeUserMenu();
    
    // Crear nuevo menú con el diseño bonito de app-dashboard
    const menu = document.createElement("div");
    menu.id = "userDropdownMenu";
    menu.className = "velvz-user-menu";
    
    const userInitial = user.name ? user.name.charAt(0).toUpperCase() : "U";

    menu.innerHTML = `
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

    // Posicionar menú justo debajo del avatar
    const avatar = document.getElementById("userAvatar");
    if (avatar) {
      const rect = avatar.getBoundingClientRect();
      menu.style.position = "fixed";
      menu.style.top = rect.bottom + 10 + "px";
      menu.style.right = window.innerWidth - rect.right + "px";
      menu.style.zIndex = "10000";
    }

    document.body.appendChild(menu);
    
    // Inyectar estilos del menú si no existen
    injectUserMenuStyles();
    
    // Mostrar menú con animación
    setTimeout(() => {
      menu.classList.add("velvz-user-menu--active");
    }, 10);

    // Handler para cerrar al hacer clic fuera
    window.menuCloseHandler = (e) => {
      // No cerrar si el clic fue en el menú o en el avatar
      if (menu.contains(e.target) || 
          e.target.closest("#userAvatar") || 
          e.target.closest(".velvz-header__avatar-circle")) {
        return;
      }
      closeUserMenu();
    };
    
    // Agregar listener con un pequeño delay para evitar cierre inmediato
    setTimeout(() => {
      document.addEventListener("click", window.menuCloseHandler);
    }, 100);
  }

  // Función global para logout
  window.handleLogout = function () {
    if (window.velvzAuth && window.velvzAuth.logout) {
      window.velvzAuth.logout();
    }
    // Limpiar todo el localStorage relacionado con la sesión
    localStorage.removeItem("velvz_token");
    localStorage.removeItem("velvz_user");
    console.log("🚪 Sesión cerrada, redirigiendo a /cuenta/");
    window.location.href = "/cuenta/";
  };

  // =====================================================
  // ESTILOS CSS PARA AVATAR Y MENÚ
  // =====================================================
  
  function injectUserMenuStyles() {
    if (document.getElementById("userMenuStyles")) return;

    const styles = `
      .velvz-user-menu {
        background: #1e1f2e;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5);
        min-width: 280px;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.3s ease;
        pointer-events: none;
        padding: 1rem;
        color: #e5e7eb;
        backdrop-filter: blur(10px);
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
        background: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);
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
        color: #f3f4f6;
        margin-bottom: 0.25rem;
      }
      
      .velvz-user-menu__email {
        font-size: 0.85rem;
        color: #9ca3af;
      }
      
      .velvz-user-menu__divider {
        height: 1px;
        background: rgba(255, 255, 255, 0.1);
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
        color: #9ca3af;
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
        color: #f3f4f6;
      }
      
      .velvz-user-menu__link--logout {
        color: #ef4444;
      }
      
      .velvz-user-menu__link--logout:hover {
        background: rgba(239, 68, 68, 0.1);
        color: #dc2626;
      }
      
      .velvz-user-menu__link i {
        width: 20px;
        text-align: center;
      }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.id = "userMenuStyles";
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  function injectAvatarStyles() {
    // Verificar si ya se inyectaron los estilos
    if (document.getElementById("velvz-avatar-styles")) {
      return;
    }

    const avatarStyles = `
/* AVATAR DESKTOP */
.velvz-header__avatar {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 18px;
  padding: 0.4rem;
  position: relative;
  transition: all 0.4s ease;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.velvz-header__avatar-circle {
  width: 40px;
  height: 40px;
  background: transparent;
  border: 2px solid rgba(51, 51, 51, 0.8);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  color: rgba(51, 51, 51, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.velvz-header__avatar-circle:hover {
  border-color: #1a1a1a;
  color: #1a1a1a;
  transform: scale(1.05);
}

/* AVATAR MÓVIL */
.velvz-header__mobile-avatar {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  opacity: 0;
  transform: translateY(20px);
  animation: velvzMobileCTAAppear 0.5s ease-out 0.5s forwards;
}

.velvz-header__mobile-avatar-circle {
  width: 64px;
  height: 64px;
  background: transparent;
  border: 2px solid rgba(51, 51, 51, 0.8);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
  color: rgba(51, 51, 51, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
}

.velvz-header__mobile-avatar-circle:hover {
  border-color: #1a1a1a;
  color: #1a1a1a;
  background: rgba(51, 51, 51, 0.05);
}

@keyframes velvzMobileCTAAppear {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

    // Inyectar estilos en el documento
    const styleSheet = document.createElement("style");
    styleSheet.id = "velvz-avatar-styles";
    styleSheet.textContent = avatarStyles;
    document.head.appendChild(styleSheet);
  }

  // =====================================================
  // INICIALIZACIÓN
  // =====================================================

  // Dar tiempo a que se cargue el sistema de auth
  // Y ASEGURAR que se ejecute DESPUÉS de app-dashboard.js
  setTimeout(() => {
    console.log("🔍 DEBUG: Ejecutando checkAuthAndSetupHeader con delay de 500ms");
    console.log("🔍 DEBUG: Esto debería ejecutarse DESPUÉS de app-dashboard.js");
    checkAuthAndSetupHeader();
  }, 500); // Aumentado a 500ms para asegurar que sea después

  console.log("🔒 Página privada inicializada - verificando acceso...");
  
  // DEBUG: Detector global de clicks para entender qué está pasando
  document.addEventListener('click', (e) => {
    if (e.target.id === 'userAvatar' || e.target.closest('#userAvatar')) {
      console.log('🔴 DEBUG GLOBAL: Click detectado en avatar');
      console.log('🔴 Target:', e.target);
      console.log('🔴 Phase:', e.eventPhase);
      console.log('🔴 Propagación detenida?:', e.defaultPrevented);
    }
  }, true); // Capture phase para capturar ANTES que otros
});

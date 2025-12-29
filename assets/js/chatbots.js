// =====================================================
// PÁGINA DE CHATBOTS - FUNCIONALIDAD PRINCIPAL
// =====================================================

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

document.addEventListener("DOMContentLoaded", async () => {
  console.log("🤖 Inicializando página de chatbots...");

  // Esperar a que dashboard-api.js se cargue completamente
  await waitForDashboardAPI();

  // Debug: verificar estado de autenticación
  debugAuthenticationState();

  // Verificar autenticación
  if (!window.dashboardAPI.token) {
    console.warn("⚠️ No hay token de autenticación");
    window.location.href = "/cuenta/";
    return;
  }

  // =====================================================
  // FUNCIÓN DE DEBUG PARA AUTENTICACIÓN
  // =====================================================

  function debugAuthenticationState() {
    console.log("🔍 Debug - Estado de autenticación:");
    console.log("   ├─ window.dashboardAPI existe:", !!window.dashboardAPI);
    console.log(
      "   ├─ Token en localStorage:",
      !!localStorage.getItem("velvz_token")
    );
    console.log("   ├─ Token en dashboardAPI:", !!window.dashboardAPI?.token);
    console.log("   ├─ URL actual:", window.location.href);
    console.log("   └─ Hostname:", window.location.hostname);

    // Verificar si los tokens coinciden
    const localToken = localStorage.getItem("velvz_token");
    const apiToken = window.dashboardAPI?.token;

    if (localToken && apiToken && localToken !== apiToken) {
      console.warn("⚠️ Los tokens no coinciden - actualizando API token");
      window.dashboardAPI.token = localToken;
    }

    // Debug adicional de la configuración de la API
    if (window.dashboardAPI) {
      console.log("🔍 Debug - Configuración API:");
      console.log("   ├─ Base URL:", window.dashboardAPI.baseURL);
      console.log("   ├─ Es producción:", window.dashboardAPI.isProduction);
      console.log("   └─ Headers ready:", !!window.dashboardAPI.getHeaders);
    }
  }

  // Inicializar la página
  await initializeChatbotsPage();
});

// =====================================================
// FUNCIÓN PARA ESPERAR A QUE SE CARGUE DASHBOARD API
// =====================================================

function waitForDashboardAPI() {
  return new Promise((resolve) => {
    // Si ya existe, resolver inmediatamente
    if (window.dashboardAPI) {
      console.log("✅ Dashboard API ya disponible");
      resolve();
      return;
    }

    // Esperar hasta que esté disponible
    const checkInterval = setInterval(() => {
      if (window.dashboardAPI) {
        console.log("✅ Dashboard API cargado");
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);

    // Timeout de seguridad (10 segundos)
    setTimeout(() => {
      clearInterval(checkInterval);
      console.error("❌ Timeout esperando Dashboard API");
      resolve(); // Resolver de todos modos para continuar
    }, 10000);
  });
}

// =====================================================
// ESTADO GLOBAL DE LA PÁGINA
// =====================================================

let chatbotsState = {
  allChatbots: [],
  filteredChatbots: [],
  currentFilter: "all",
  searchQuery: "",
  isLoading: true,
  initialized: false,
  isUpdating: false, // Nuevo flag para evitar updates múltiples
};

// =====================================================
// INICIALIZACIÓN PRINCIPAL
// =====================================================

async function initializeChatbotsPage() {
  console.log("🚀 Inicializando página de chatbots...");
  checkDeleteSuccess();
  try {
    // Verificación adicional de la API
    if (!window.dashboardAPI) {
      throw new Error("Dashboard API no disponible");
    }

    // Configurar event listeners
    setupEventListeners();

    // Cargar chatbots del usuario
    await loadUserChatbots();

    // Configurar header móvil (del dashboard)
    setupMobileHeader();

    console.log("✅ Página de chatbots inicializada correctamente");
  } catch (error) {
    console.error("❌ Error inicializando página de chatbots:", error);

    // Si es error de API, redirigir al login
    if (error.message.includes("API no disponible")) {
      console.warn("🔄 Redirigiendo al login por falta de API");
      window.location.href = "/cuenta/";
      return;
    }

    showErrorState();
  }
}

// =====================================================
// CONFIGURACIÓN DE EVENT LISTENERS
// =====================================================

// =====================================================
// CONFIGURACIÓN DE EVENT LISTENERS
// =====================================================

let searchTimeout;

function setupEventListeners() {
  // Botones de crear chatbot
  document
    .getElementById("createChatbotBtn")
    ?.addEventListener("click", showCreateChatbotModal);
  document
    .getElementById("createFirstChatbotBtn")
    ?.addEventListener("click", showCreateChatbotModal);

  // Modal de crear chatbot
  document
    .getElementById("closeCreateModal")
    ?.addEventListener("click", hideCreateChatbotModal);
  document
    .getElementById("cancelCreateModal")
    ?.addEventListener("click", hideCreateChatbotModal);
  document
    .getElementById("createChatbotForm")
    ?.addEventListener("submit", handleCreateChatbotSubmit);

  // Cerrar modal con Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      hideCreateChatbotModal();
    }
  });

  // Cerrar modal clickeando fuera
  document
    .getElementById("createChatbotModal")
    ?.addEventListener("click", (e) => {
      if (e.target.id === "createChatbotModal") {
        hideCreateChatbotModal();
      }
    });

  // Búsqueda con debouncing
  document.getElementById("chatbotSearch")?.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      handleSearch(e);
    }, 300); // 300ms de delay
  });

  // Filtros (nuevo diseño usa .velvz-filter-pill)
  document.querySelectorAll(".velvz-filter-pill").forEach((pill) => {
    pill.addEventListener("click", handleFilterChange);
  });

  // Toggle de vista grid/list
  setupViewToggle();

  // Logout
  document
    .getElementById("logoutLink")
    ?.addEventListener("click", handleLogout);
  document
    .getElementById("mobileLogout")
    ?.addEventListener("click", handleLogout);

  console.log("🔗 Event listeners configurados");
}

// =====================================================
// CARGA DE CHATBOTS
// =====================================================

async function loadUserChatbots() {
  try {
    chatbotsState.isLoading = true;
    showLoadingState();

    console.log("📡 Cargando chatbots del usuario...");

    // Obtener chatbots desde la API
    const response = await window.dashboardAPI.getChatbots();

    console.log("📊 Respuesta completa de la API:", response);
    console.log("📊 Tipo de respuesta:", typeof response);
    console.log("📊 Keys de la respuesta:", Object.keys(response || {}));

    if (response && response.success) {
      // Asegurar que siempre tengamos un array
      let chatbots = response.data || [];

      console.log("🔍 response.data:", response.data);
      console.log("🔍 Tipo de data:", typeof response.data);

      // Si la respuesta tiene una estructura diferente, adaptarla
      if (response.chatbots) {
        chatbots = response.chatbots;
        console.log("📋 Usando response.chatbots:", chatbots);
      } else if (Array.isArray(response)) {
        chatbots = response;
        console.log("📋 La respuesta es un array directo:", chatbots);
      } else if (response.data && response.data.chatbots) {
        chatbots = response.data.chatbots;
        console.log("📋 Usando response.data.chatbots:", chatbots);
      }

      // Validar que sea un array
      if (!Array.isArray(chatbots)) {
        console.warn("⚠️ La respuesta no contiene un array válido:", chatbots);
        console.warn("⚠️ Convirtiendo a array vacío");
        chatbots = [];
      }

      chatbotsState.allChatbots = chatbots;
      console.log(`✅ Cargados ${chatbotsState.allChatbots.length} chatbots`);

      if (chatbotsState.allChatbots.length > 0) {
        console.log("📋 Ejemplo de chatbot completo:", JSON.stringify(chatbotsState.allChatbots[0], null, 2));
        console.log("📋 Keys del chatbot:", Object.keys(chatbotsState.allChatbots[0]));
      }
    } else {
      console.error("❌ Respuesta no exitosa:", response);
      throw new Error(response?.message || "Error cargando chatbots");
    }
  } catch (error) {
    console.error("❌ Error cargando chatbots:", error);
    console.error("❌ Stack del error:", error.stack);

    chatbotsState.allChatbots = [];

    // No mostrar error si es solo falta de chatbots
    if (
      !error.message.includes("401") &&
      !error.message.includes("Unauthorized")
    ) {
      console.log(
        "ℹ️ Probablemente no hay chatbots aún - mostrando estado vacío"
      );
    } else {
      window.handleAPIError(error);
    }
  } finally {
    chatbotsState.isLoading = false;
    applyFiltersAndRender();
  }
}

// =====================================================
// FILTROS Y BÚSQUEDA
// =====================================================

function applyFiltersAndRender() {
  // Prevenir múltiples renderizados simultáneos
  if (chatbotsState.isLoading) {
    console.log("🔄 Aún cargando, aplazando filtros");
    return;
  }

  // Asegurar que allChatbots es un array válido
  const allBots = Array.isArray(chatbotsState.allChatbots)
    ? chatbotsState.allChatbots
    : [];
  let filtered = [...allBots];

  console.log(
    "🔍 Aplicando filtros - Total bots:",
    allBots.length,
    "Filtro actual:",
    chatbotsState.currentFilter
  );

  // Función helper para determinar status (igual que en updateFilterCounts)
  // 🔧 FIX: Función helper para determinar status correctamente
  const isActive = (bot) => {
    if (bot.status === "active" || bot.status === "Active") return true;
    if (bot.status === "inactive" || bot.status === "Inactive") return false;
    if (bot.status === "draft" || bot.status === "Draft") return false; // ← NUEVO
    if (typeof bot.active === "boolean") return bot.active;
    if (typeof bot.is_active === "boolean") return bot.is_active;
    if (bot.status === true || bot.status === 1) return true;
    if (bot.status === false || bot.status === 0) return false;
    return true; // Por defecto activo
  };

  // Aplicar filtro de estado
  if (chatbotsState.currentFilter === "active") {
    filtered = filtered.filter(isActive);
    console.log("🔍 Filtrando activos, resultado:", filtered.length);
  } else if (chatbotsState.currentFilter === "inactive") {
    filtered = filtered.filter((bot) => !isActive(bot));
    console.log("🔍 Filtrando inactivos, resultado:", filtered.length);
  }

  // Aplicar búsqueda
  if (chatbotsState.searchQuery) {
    const query = chatbotsState.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (bot) =>
        bot.name.toLowerCase().includes(query) ||
        (bot.description && bot.description.toLowerCase().includes(query))
    );
    console.log(
      "🔍 Filtrando por búsqueda:",
      query,
      "resultado:",
      filtered.length
    );
  }

  chatbotsState.filteredChatbots = filtered;

  // Actualizar contadores
  updateFilterCounts();

  // Renderizar lista con un pequeño delay para suavizar la transición
  setTimeout(() => {
    renderChatbotsList();
  }, 50);
}

function updateFilterCounts() {
  // Asegurar que allChatbots es un array válido
  const allBots = Array.isArray(chatbotsState.allChatbots)
    ? chatbotsState.allChatbots
    : [];

  console.log("🔢 Calculando contadores de filtros...");
  console.log("🔢 Total chatbots:", allBots.length);

  // Función para determinar si un chatbot está activo
  const isActive = (bot) => {
    if (bot.status === "active" || bot.status === "Active") return true;
    if (bot.status === "inactive" || bot.status === "Inactive") return false;
    if (bot.status === "draft" || bot.status === "Draft") return false;
    if (typeof bot.active === "boolean") return bot.active;
    if (typeof bot.is_active === "boolean") return bot.is_active;
    if (bot.status === true || bot.status === 1) return true;
    if (bot.status === false || bot.status === 0) return false;
    return true;
  };

  const activeBots = allBots.filter(isActive).length;
  const inactiveBots = allBots.filter((bot) => !isActive(bot)).length;

  console.log("🔢 Activos calculados:", activeBots);
  console.log("🔢 Inactivos calculados:", inactiveBots);

  // Actualizar contadores de filtros
  const allCountEl = document.getElementById("allCount");
  const activeCountEl = document.getElementById("activeCount");
  const inactiveCountEl = document.getElementById("inactiveCount");

  if (allCountEl) allCountEl.textContent = allBots.length;
  if (activeCountEl) activeCountEl.textContent = activeBots;
  if (inactiveCountEl) inactiveCountEl.textContent = inactiveBots;

  // Actualizar estadísticas del hero
  updateHeroStats(allBots.length, activeBots);
}

// =====================================================
// ESTADÍSTICAS DEL HERO
// =====================================================

function updateHeroStats(totalChatbots, activeChatbots) {
  // Total chatbots
  const statTotal = document.getElementById("statTotalChatbots");
  if (statTotal) statTotal.textContent = totalChatbots;

  // Chatbots activos
  const statActive = document.getElementById("statActiveChatbots");
  if (statActive) statActive.textContent = activeChatbots;

  // Conversaciones (por ahora simulado - en producción vendrá de la API)
  const statConversations = document.getElementById("statConversations");
  if (statConversations) {
    // Simular conversaciones basadas en chatbots activos
    const conversations = activeChatbots * Math.floor(Math.random() * 50 + 20);
    statConversations.textContent = conversations.toLocaleString();
  }
}

// =====================================================
// TOGGLE DE VISTA GRID/LIST
// =====================================================

function setupViewToggle() {
  const gridViewBtn = document.getElementById("gridViewBtn");
  const listViewBtn = document.getElementById("listViewBtn");
  const chatbotsGrid = document.getElementById("chatbotsGrid");

  if (gridViewBtn && listViewBtn && chatbotsGrid) {
    gridViewBtn.addEventListener("click", () => {
      gridViewBtn.classList.add("velvz-view-toggle__btn--active");
      listViewBtn.classList.remove("velvz-view-toggle__btn--active");
      chatbotsGrid.classList.remove("velvz-chatbots-grid--list");
      localStorage.setItem("chatbotsViewMode", "grid");
    });

    listViewBtn.addEventListener("click", () => {
      listViewBtn.classList.add("velvz-view-toggle__btn--active");
      gridViewBtn.classList.remove("velvz-view-toggle__btn--active");
      chatbotsGrid.classList.add("velvz-chatbots-grid--list");
      localStorage.setItem("chatbotsViewMode", "list");
    });

    // Restaurar preferencia guardada
    const savedViewMode = localStorage.getItem("chatbotsViewMode");
    if (savedViewMode === "list") {
      listViewBtn.click();
    }
  }
}

function handleSearch(event) {
  const newQuery = event.target.value.trim();

  // Si es la misma query, no hacer nada
  if (newQuery === chatbotsState.searchQuery) {
    return;
  }

  chatbotsState.searchQuery = newQuery;
  console.log("🔍 Búsqueda actualizada:", newQuery);

  // Usar requestAnimationFrame para mejor rendimiento
  requestAnimationFrame(() => {
    applyFiltersAndRender();
  });
}

function handleFilterChange(event) {
  const newFilter = event.target.dataset.filter;

  // Prevenir cambios si ya está procesando
  if (chatbotsState.isUpdating) {
    console.log("🔄 Filtro ya actualizando, ignorando click");
    return;
  }

  if (newFilter === chatbotsState.currentFilter) {
    console.log("🔄 Mismo filtro seleccionado, ignorando");
    return;
  }

  // Marcar como actualizando
  chatbotsState.isUpdating = true;

  console.log(
    "🏷️ Cambiando filtro de",
    chatbotsState.currentFilter,
    "a",
    newFilter
  );

  // Limpiar TODOS los estados de filtros primero
  document.querySelectorAll(".velvz-filter-pill").forEach((pill) => {
    pill.classList.remove("velvz-filter-pill--active");
    // Forzar reflow y limpiar estilos inline que puedan quedar
    pill.style.background = "";
    pill.style.color = "";
    pill.offsetHeight; // Forzar reflow
  });

  // Pequeño delay para asegurar que se limpien los estilos
  setTimeout(() => {
    // Aplicar el nuevo estado activo
    event.target.classList.add("velvz-filter-pill--active");

    // Aplicar filtro
    chatbotsState.currentFilter = newFilter;

    // Usar requestAnimationFrame para mejor rendimiento
    requestAnimationFrame(() => {
      applyFiltersAndRender();

      // Liberar el flag después de que termine el renderizado
      setTimeout(() => {
        chatbotsState.isUpdating = false;
      }, 200);
    });
  }, 10);
}

// =====================================================
// RENDERIZADO
// =====================================================

function renderChatbotsList() {
  const container = document.getElementById("chatbotsGrid");
  const loading = document.getElementById("chatbotsLoading");
  const emptyState = document.getElementById("emptyChatbots");

  // Ocultar loading
  if (loading) loading.style.display = "none";

  // Asegurar que tenemos arrays válidos
  const allBots = Array.isArray(chatbotsState.allChatbots)
    ? chatbotsState.allChatbots
    : [];
  const filteredBots = Array.isArray(chatbotsState.filteredChatbots)
    ? chatbotsState.filteredChatbots
    : [];

  // Mostrar estado vacío si no hay chatbots
  if (allBots.length === 0) {
    if (emptyState) emptyState.style.display = "flex";
    if (container) container.style.display = "none";
    return;
  }

  // Ocultar estado vacío
  if (emptyState) emptyState.style.display = "none";
  if (container) container.style.display = "grid";

  // Renderizar chatbots
  if (container) {
    container.innerHTML = "";

    if (filteredBots.length === 0) {
      // No hay resultados con los filtros actuales
      container.innerHTML = `
                <div class="velvz-empty-state" style="grid-column: 1 / -1;">
                    <div class="velvz-empty-state__icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3 class="velvz-empty-state__title">No se encontraron chatbots</h3>
                    <p class="velvz-empty-state__description">
                        Intenta cambiar los filtros o términos de búsqueda
                    </p>
                </div>
            `;
    } else {
      // Renderizar cada chatbot
      filteredBots.forEach((chatbot, index) => {
        const chatbotCard = createChatbotCard(chatbot, index);
        container.appendChild(chatbotCard);
      });
    }
  }
}

function createChatbotCard(chatbot, index) {
  const card = document.createElement("div");
  card.className = "velvz-chatbot-card";
  card.style.animationDelay = `${0.6 + index * 0.1}s`;

  // 🔧 FIX: Función para determinar status con 3 estados
  const getStatusInfo = (bot) => {
    if (bot.status === "active" || bot.status === "Active") {
      return { text: "Activo", class: "active", active: true };
    }
    if (bot.status === "inactive" || bot.status === "Inactive") {
      return { text: "Inactivo", class: "inactive", active: false };
    }
    if (bot.status === "draft" || bot.status === "Draft") {
      return { text: "Borrador", class: "draft", active: false };
    }

    // Compatibilidad con formatos antiguos
    if (typeof bot.active === "boolean") {
      return bot.active
        ? { text: "Activo", class: "active", active: true }
        : { text: "Inactivo", class: "inactive", active: false };
    }

    // Por defecto activo
    return { text: "Activo", class: "active", active: true };
  };

  const statusInfo = getStatusInfo(chatbot);
  const statusText = statusInfo.text;
  const statusClass = statusInfo.class;

  // Usar datos reales del chatbot (excepto satisfacción que es simulada)
  const conversations = chatbot.total_conversations || chatbot.conversations_count || 0;
  const documents = chatbot.documents_count || chatbot.total_documents || 0;
  const satisfaction = (Math.random() * 2 + 3).toFixed(1); // 3.0 - 5.0 (simulado)

  // Fecha de última actualización
  const lastUpdate = new Date(chatbot.updated_at || chatbot.created_at);
  const timeAgo = getTimeAgo(lastUpdate);

  // Obtener color de fondo y icono del widget
  // Los datos pueden venir del chatbot directamente o de widget_config
  const widgetConfig = chatbot.widget_config || chatbot.widgetConfig || {};
  const bubbleColor = chatbot.main_color || widgetConfig.main_color || chatbot.widget_color || "#667eea";
  const iconType = chatbot.icon_type || widgetConfig.icon_type || chatbot.icon || widgetConfig.icon || "robot";
  const customIcon = chatbot.custom_icon || widgetConfig.custom_icon || null;

  // Debug: ver qué datos tiene el chatbot
  console.log(`🎨 Chatbot "${chatbot.name}" - icon_type: ${iconType}, main_color: ${bubbleColor}, custom_icon: ${customIcon ? 'sí' : 'no'}`);

  // Generar el contenido del avatar
  let avatarContent = "";
  let avatarStyle = `background: ${bubbleColor};`;

  if (customIcon && (customIcon.startsWith("data:image") || customIcon.startsWith("http"))) {
    // Icono personalizado (imagen subida o URL)
    avatarContent = `<img src="${customIcon}" alt="${escapeHtml(chatbot.name)}" class="velvz-chatbot-card__avatar-img">`;
  } else if (iconType === "custom" && customIcon) {
    // Icono personalizado (imagen subida)
    avatarContent = `<img src="${customIcon}" alt="${escapeHtml(chatbot.name)}" class="velvz-chatbot-card__avatar-img">`;
  } else {
    // Icono de Font Awesome según el tipo
    const iconMap = {
      robot: "fa-robot",
      comments: "fa-comments",
      headset: "fa-headset",
      "user-tie": "fa-user-tie",
      "comment-dots": "fa-comment-dots",
      brain: "fa-brain",
      magic: "fa-magic",
      star: "fa-star",
      heart: "fa-heart",
      bolt: "fa-bolt",
      message: "fa-comment-dots",
      support: "fa-headset",
      assistant: "fa-user-tie",
    };
    const faIcon = iconMap[iconType] || "fa-robot";
    avatarContent = `<i class="fas ${faIcon}"></i>`;
  }

  card.innerHTML = `
        <div class="velvz-chatbot-card__header">
            <div class="velvz-chatbot-card__main">
                <div class="velvz-chatbot-card__avatar" style="${avatarStyle}">
                    ${avatarContent}
                </div>
                <div class="velvz-chatbot-card__info">
                    <h3 class="velvz-chatbot-card__name">${escapeHtml(
                      chatbot.name
                    )}</h3>
                    <p class="velvz-chatbot-card__description">
                        ${escapeHtml(
                          chatbot.description || "Sin descripción disponible"
                        )}
                    </p>
                </div>
            </div>
            <div class="velvz-chatbot-card__status velvz-chatbot-card__status--${statusClass}">
                <div class="velvz-chatbot-card__status-dot"></div>
                ${statusText}
            </div>
        </div>

        <div class="velvz-chatbot-card__metrics">
            <div class="velvz-chatbot-card__metric">
                <div class="velvz-chatbot-card__metric-value">${conversations}</div>
                <div class="velvz-chatbot-card__metric-label">Conversaciones</div>
            </div>
            <div class="velvz-chatbot-card__metric">
                <div class="velvz-chatbot-card__metric-value">${documents}</div>
                <div class="velvz-chatbot-card__metric-label">Documentos</div>
            </div>
            <div class="velvz-chatbot-card__metric">
                <div class="velvz-chatbot-card__metric-value">${satisfaction}</div>
                <div class="velvz-chatbot-card__metric-label">Satisfacción</div>
            </div>
        </div>

        <div class="velvz-chatbot-card__footer">
            <div class="velvz-chatbot-card__updated">
                Actualizado ${timeAgo}
            </div>
            <div class="velvz-chatbot-card__actions">
                <button
                    class="velvz-chatbot-card__action velvz-chatbot-card__action--primary"
                    title="Configurar chatbot"
                    onclick="navigateToChatbot('${chatbot.id}')"
                >
                    <i class="fas fa-cog"></i>
                </button>
                <button
                    class="velvz-chatbot-card__action"
                    title="Ver estadísticas"
                    onclick="viewChatbotStats('${chatbot.id}')"
                >
                    <i class="fas fa-chart-line"></i>
                </button>
            </div>
        </div>
    `;

  // Event listener para click en la tarjeta
  card.addEventListener("click", (e) => {
    // No navegar si se clickeó en un botón
    if (e.target.closest("button")) return;
    navigateToChatbot(chatbot.id);
  });

  return card;
}

// =====================================================
// ACCIONES DE CHATBOTS
// =====================================================

function navigateToChatbot(chatbotId) {
  console.log("🔗 Navegando a chatbot:", chatbotId);
  window.location.href = `/app/chatbots/config.html?id=${chatbotId}`;
}

function viewChatbotStats(chatbotId) {
  console.log("📊 Ver estadísticas de chatbot:", chatbotId);
  // Navegar a la sección de estadísticas del chatbot
  window.location.href = `/app/chatbots/config.html?id=${chatbotId}&section=statistics`;
}

// =====================================================
// MODAL DE CREAR CHATBOT
// =====================================================

function showCreateChatbotModal() {
  console.log("📝 Mostrando modal crear chatbot");

  const modal = document.getElementById("createChatbotModal");
  if (modal) {
    modal.classList.add("velvz-modal--open");
    document.body.style.overflow = "hidden";

    // Focus en el primer input
    setTimeout(() => {
      document.getElementById("chatbotName")?.focus();
    }, 100);
  }
}

function hideCreateChatbotModal() {
  console.log("❌ Ocultando modal crear chatbot");

  const modal = document.getElementById("createChatbotModal");
  if (modal) {
    modal.classList.remove("velvz-modal--open");
    document.body.style.overflow = "";

    // Limpiar formulario
    const form = document.getElementById("createChatbotForm");
    if (form) form.reset();
  }
}

async function handleCreateChatbotSubmit(event) {
  event.preventDefault();

  const nameInput = document.getElementById("chatbotName");
  const descriptionInput = document.getElementById("chatbotDescription");

  const name = nameInput?.value.trim();
  const description = descriptionInput?.value.trim();

  if (!name) {
    nameInput?.focus();
    return;
  }

  console.log("➕ Creando chatbot:", { name, description });

  try {
    // Ocultar modal y mostrar loading
    hideCreateChatbotModal();
    showGlobalLoading(
      "Creando tu chatbot...",
      "Configurando tu asistente de IA con OpenAI. Esto puede tardar unos segundos."
    );

    const chatbotData = {
      name: name,
      description: description || "Chatbot creado desde el dashboard",
      instructions:
        "Eres un asistente útil y amigable. Responde de manera clara y profesional.",
      status: "active",
    };

    console.log("📡 Enviando datos a la API:", chatbotData);

    const response = await window.dashboardAPI.createChatbot(chatbotData);

    console.log("📊 Respuesta de crear chatbot:", response);

    if (response.success) {
      console.log("✅ Chatbot creado exitosamente");

      // Actualizar loading
      updateGlobalLoading(
        "¡Chatbot creado!",
        "Redirigiendo a la configuración..."
      );

      // Navegar directamente al nuevo chatbot sin recargar la lista
      if (response.data && response.data.chatbot) {
        setTimeout(() => {
          window.location.href = `/app/chatbots/config.html?id=${response.data.chatbot.id}`;
        }, 500);
      } else {
        // Si por alguna razón no hay ID, recargar la lista
        await loadUserChatbots();
        hideGlobalLoading();
      }
    } else {
      throw new Error(response.message || "Error creando chatbot");
    }
  } catch (error) {
    console.error("❌ Error creando chatbot:", error);
    hideGlobalLoading();
    window.handleAPIError(error);
  }
}

// =====================================================
// INDICADOR DE CARGA GLOBAL
// =====================================================

function showGlobalLoading(text = "Cargando...", subtitle = "") {
  const overlay = document.getElementById("globalLoadingOverlay");
  const textEl = document.getElementById("loadingText");
  const subtitleEl = document.getElementById("loadingSubtitle");

  if (overlay) {
    if (textEl) textEl.textContent = text;
    if (subtitleEl) subtitleEl.textContent = subtitle;

    overlay.classList.add("velvz-loading-overlay--show");
    document.body.style.overflow = "hidden";
  }
}

function updateGlobalLoading(text, subtitle = "") {
  const textEl = document.getElementById("loadingText");
  const subtitleEl = document.getElementById("loadingSubtitle");

  if (textEl) textEl.textContent = text;
  if (subtitleEl) subtitleEl.textContent = subtitle;
}

function hideGlobalLoading() {
  const overlay = document.getElementById("globalLoadingOverlay");

  if (overlay) {
    overlay.classList.remove("velvz-loading-overlay--show");
    document.body.style.overflow = "";
  }
}

// =====================================================
// ESTADOS DE CARGA Y ERROR
// =====================================================

function showLoadingState() {
  const loading = document.getElementById("chatbotsLoading");
  const emptyState = document.getElementById("emptyChatbots");
  const container = document.getElementById("chatbotsGrid");

  if (loading) loading.style.display = "flex";
  if (emptyState) emptyState.style.display = "none";
  if (container) container.style.display = "none";
}

function showErrorState() {
  const loading = document.getElementById("chatbotsLoading");
  const container = document.getElementById("chatbotsGrid");

  if (loading) loading.style.display = "none";
  if (container) {
    container.innerHTML = `
            <div class="velvz-empty-state" style="grid-column: 1 / -1;">
                <div class="velvz-empty-state__icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3 class="velvz-empty-state__title">Error cargando chatbots</h3>
                <p class="velvz-empty-state__description">
                    Hubo un problema al cargar tus chatbots. Intenta recargar la página.
                </p>
                <button class="velvz-btn velvz-btn--primary" onclick="window.location.reload()">
                    <i class="fas fa-redo"></i>
                    <span>Recargar página</span>
                </button>
            </div>
        `;
    container.style.display = "grid";
  }
}

// =====================================================
// FUNCIONES DE UTILIDAD
// =====================================================

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 7) {
    return date.toLocaleDateString("es-ES");
  } else if (diffDays > 0) {
    return `hace ${diffDays} día${diffDays > 1 ? "s" : ""}`;
  } else if (diffHours > 0) {
    return `hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
  } else if (diffMinutes > 0) {
    return `hace ${diffMinutes} minuto${diffMinutes > 1 ? "s" : ""}`;
  } else {
    return "hace un momento";
  }
}

function handleLogout() {
  console.log("👋 Cerrando sesión...");

  // Limpiar token
  localStorage.removeItem("velvz_token");

  // Redirigir al login
  window.location.href = "/cuenta/";
}

// =====================================================
// HEADER MÓVIL (REUTILIZADO DEL DASHBOARD)
// =====================================================

function setupMobileHeader() {
  const mobileToggle = document.getElementById("mobileMenuToggle");
  const mobileMenu = document.getElementById("mobileMenu");

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.contains(
        "velvz-header__mobile-menu--open"
      );

      if (isOpen) {
        mobileMenu.classList.remove("velvz-header__mobile-menu--open");
        mobileToggle.classList.remove("velvz-header__mobile-toggle--open");
        document.body.style.overflow = "";
      } else {
        mobileMenu.classList.add("velvz-header__mobile-menu--open");
        mobileToggle.classList.add("velvz-header__mobile-toggle--open");
        document.body.style.overflow = "hidden";
      }
    });

    // Cerrar menú al hacer click fuera
    mobileMenu.addEventListener("click", (e) => {
      if (e.target === mobileMenu) {
        mobileMenu.classList.remove("velvz-header__mobile-menu--open");
        mobileToggle.classList.remove("velvz-header__mobile-toggle--open");
        document.body.style.overflow = "";
      }
    });
  }

  // Actualizar información del usuario en móvil
  updateMobileUserInfo();
}

function updateMobileUserInfo() {
  // Obtener info del usuario del token o localStorage
  const userInfo = getUserInfoFromToken();

  if (userInfo) {
    const mobileUserName = document.getElementById("mobileUserName");
    const mobileUserEmail = document.getElementById("mobileUserEmail");
    const mobileUserInitials = document.getElementById("mobileUserInitials");
    const userInitials = document.getElementById("userInitials");

    if (mobileUserName) mobileUserName.textContent = userInfo.name;
    if (mobileUserEmail) mobileUserEmail.textContent = userInfo.email;
    if (mobileUserInitials) mobileUserInitials.textContent = userInfo.initials;
    if (userInitials) userInitials.textContent = userInfo.initials;
  }
}

function getUserInfoFromToken() {
  // Función simple para extraer info básica
  // En un caso real, esto vendría del backend o del token decodificado
  return {
    name: "Alejandro de la Peña",
    email: "alejandro@velvz.com",
    initials: "A",
  };
}

// =====================================================
// NOTIFICACIONES DE ÉXITO (ELIMINACIÓN)
// =====================================================

function checkDeleteSuccess() {
  // Verificar si hay un mensaje de éxito de eliminación
  const deleteSuccess = sessionStorage.getItem("delete_success");

  if (deleteSuccess) {
    try {
      const data = JSON.parse(deleteSuccess);

      // Verificar que el mensaje no sea muy antiguo (máximo 10 segundos)
      if (Date.now() - data.timestamp < 10000) {
        // Mostrar el mensaje de éxito
        showSuccessNotification(data.message);
      }
    } catch (e) {
      console.error("Error parseando mensaje de éxito:", e);
    }

    // Limpiar el mensaje de sessionStorage
    sessionStorage.removeItem("delete_success");
  }
}

function showSuccessNotification(message) {
  // Usar sistema de notificaciones VelvzNotify
  if (window.VelvzNotify) {
    VelvzNotify.success(message);
  } else {
    console.log("Success:", message);
  }
}

// =====================================================
// EXPORTAR FUNCIONES PARA USO GLOBAL
// =====================================================

window.navigateToChatbot = navigateToChatbot;
window.viewChatbotStats = viewChatbotStats;

// =====================================================
// SECCIÓN DE ESTADÍSTICAS DEL CHATBOT - DATOS REALES
// =====================================================

console.log('📊 statistics-section.js CARGADO');

let currentPeriod = 1; // Por defecto: Hoy
let statisticsData = null;
let previousStatisticsData = null; // Para comparar y detectar cambios
let isLoadingStats = false;
let statsAutoRefreshInterval = null;

// =====================================================
// INICIALIZACIÓN
// =====================================================

function initializeStatisticsSection() {
  console.log('📊 initializeStatisticsSection() LLAMADA');
  injectChartStyles();
  setupPeriodSelectors();

  // Cargar datos reales al inicializar
  console.log('📊 Llamando a loadRealStatistics()...');
  loadRealStatistics();
}

// =====================================================
// SELECTOR DE PERÍODO
// =====================================================

function setupPeriodSelectors() {
  const periodButtons = document.querySelectorAll('.stats-period-btn');

  periodButtons.forEach(button => {
    button.addEventListener('click', function() {
      periodButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      currentPeriod = parseInt(this.dataset.period);
      loadRealStatistics();
    });
  });
}

// =====================================================
// CARGAR ESTADÍSTICAS REALES DESDE LA API
// =====================================================

async function loadRealStatistics(forceReload = false, silentRefresh = false) {
  console.log('📊 loadRealStatistics() INICIADA');
  console.log('📊 isLoadingStats:', isLoadingStats);
  console.log('📊 forceReload:', forceReload);
  console.log('📊 silentRefresh:', silentRefresh);

  // Si forceReload es true, resetear el flag
  if (forceReload) {
    isLoadingStats = false;
  }

  if (isLoadingStats) {
    console.log('📊 Ya está cargando, saliendo...');
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const chatbotId = urlParams.get('id');
  console.log('📊 Chatbot ID:', chatbotId);

  if (!chatbotId) {
    console.log('📊 No hay chatbot ID, mostrando error');
    showNoDataMessage('No se encontró el ID del chatbot');
    return;
  }

  isLoadingStats = true;

  // Solo mostrar loading state si no es un refresh silencioso
  if (!silentRefresh) {
    showLoadingState();
  }

  try {
    const baseURL = window.dashboardAPI?.baseURL || 'https://velvz-unified-backend-production.up.railway.app';
    const token = localStorage.getItem('velvz_token');

    console.log('📊 Token disponible:', !!token);
    console.log('📊 URL de fetch:', `${baseURL}/api/chatbots/${chatbotId}/analytics?period=${currentPeriod}`);

    const response = await fetch(
      `${baseURL}/api/chatbots/${chatbotId}/analytics?period=${currentPeriod}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log('📈 Respuesta API analytics:', {
        period: result.data?.period,
        dailyDataLength: result.data?.charts?.daily?.length,
        changes: result.data?.changes,
        previousPeriod: result.data?.previousPeriod
      });

      if (result.success && result.data) {
        // Guardar datos anteriores para comparar
        previousStatisticsData = statisticsData ? JSON.parse(JSON.stringify(statisticsData)) : null;
        statisticsData = result.data;

        // Actualizar tarjetas (con animación suave si hay cambios)
        updateStatCards(silentRefresh);

        // Para "Hoy", cargar datos de 7 días solo para el gráfico
        if (currentPeriod === 1) {
          await loadChartDataForToday(baseURL, chatbotId, token);
        }

        // Solo re-renderizar gráficos si no es refresh silencioso o si hay cambios en los datos
        if (!silentRefresh || hasChartDataChanged()) {
          renderCharts();
        }

        // Solo animar entrada de tarjetas en carga inicial
        if (!silentRefresh) {
          animateStatistics();
        }
      } else {
        showNoDataMessage('No hay datos disponibles');
      }
    } else {
      showNoDataMessage('Error al cargar estadísticas');
    }
  } catch (error) {
    console.error('Error cargando estadísticas:', error);
    showNoDataMessage('Error de conexión');
  } finally {
    isLoadingStats = false;
    hideLoadingState();
  }
}

// =====================================================
// CARGAR DATOS DE 7 DÍAS SOLO PARA EL GRÁFICO (MODO "HOY")
// =====================================================

async function loadChartDataForToday(baseURL, chatbotId, token) {
  try {
    const response = await fetch(
      `${baseURL}/api/chatbots/${chatbotId}/analytics?period=7`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data && result.data.charts) {
        // Solo actualizar los datos del gráfico, no las tarjetas
        statisticsData.charts = result.data.charts;
        console.log('📊 Datos de 7 días cargados para el gráfico');
      }
    }
  } catch (error) {
    console.error('Error cargando datos del gráfico:', error);
  }
}

// =====================================================
// ACTUALIZACIÓN DE TARJETAS
// =====================================================

function updateStatCards(silentRefresh = false) {
  if (!statisticsData) return;

  const { summary, changes } = statisticsData;
  const prevSummary = previousStatisticsData?.summary || {};

  // Sesiones (Conversaciones)
  const sessionsValue = document.querySelector('.stats-card:nth-child(1) .stats-card__value');
  const sessionsChange = document.querySelector('.stats-card:nth-child(1) .stats-card__change');
  if (sessionsValue) {
    // Solo animar si el valor cambió o es carga inicial
    if (!silentRefresh || prevSummary.totalSessions !== summary.totalSessions) {
      animateNumber(sessionsValue, summary.totalSessions);
      if (silentRefresh && prevSummary.totalSessions !== summary.totalSessions) {
        pulseCard(sessionsValue.closest('.stats-card'));
      }
    }
    updateChangeIndicator(sessionsChange, changes.sessions);
  }

  // Mensajes de usuario (como "usuarios únicos")
  const usersValue = document.querySelector('.stats-card:nth-child(2) .stats-card__value');
  const usersChange = document.querySelector('.stats-card:nth-child(2) .stats-card__change');
  if (usersValue) {
    if (!silentRefresh || prevSummary.userMessages !== summary.userMessages) {
      animateNumber(usersValue, summary.userMessages);
      if (silentRefresh && prevSummary.userMessages !== summary.userMessages) {
        pulseCard(usersValue.closest('.stats-card'));
      }
    }
    updateChangeIndicator(usersChange, changes.sessions);
  }

  // Mensajes totales
  const messagesValue = document.querySelector('.stats-card:nth-child(3) .stats-card__value');
  const messagesChange = document.querySelector('.stats-card:nth-child(3) .stats-card__change');
  if (messagesValue) {
    if (!silentRefresh || prevSummary.totalMessages !== summary.totalMessages) {
      animateNumber(messagesValue, summary.totalMessages);
      if (silentRefresh && prevSummary.totalMessages !== summary.totalMessages) {
        pulseCard(messagesValue.closest('.stats-card'));
      }
    }
    updateChangeIndicator(messagesChange, changes.messages);
  }

  // Promedio de mensajes por sesión
  const avgValue = document.querySelector('.stats-card:nth-child(4) .stats-card__value');
  const avgChange = document.querySelector('.stats-card:nth-child(4) .stats-card__change');
  if (avgValue) {
    if (!silentRefresh || prevSummary.avgMessagesPerSession !== summary.avgMessagesPerSession) {
      avgValue.textContent = `${summary.avgMessagesPerSession} msg`;
      if (silentRefresh && prevSummary.avgMessagesPerSession !== summary.avgMessagesPerSession) {
        pulseCard(avgValue.closest('.stats-card'));
      }
    }
    updateChangeIndicator(avgChange, changes.avgMessagesPerSession);
  }

  // Actualizar labels para reflejar los datos reales
  const labels = document.querySelectorAll('.stats-card__label');
  if (labels[0]) labels[0].textContent = 'Sesiones de chat';
  if (labels[1]) labels[1].textContent = 'Mensajes de usuarios';
  if (labels[2]) labels[2].textContent = 'Mensajes totales';
  if (labels[3]) labels[3].textContent = 'Mensajes por sesión';
}

// Función para dar un efecto "pulse" sutil a una tarjeta cuando cambia
function pulseCard(card) {
  if (!card) return;
  card.classList.add('pulse');
  setTimeout(() => card.classList.remove('pulse'), 500);
}

// Función para detectar si los datos del gráfico han cambiado
function hasChartDataChanged() {
  if (!previousStatisticsData || !previousStatisticsData.charts) return true;
  if (!statisticsData || !statisticsData.charts) return true;

  const prevDaily = previousStatisticsData.charts.daily || [];
  const currDaily = statisticsData.charts.daily || [];

  if (prevDaily.length !== currDaily.length) return true;

  for (let i = 0; i < currDaily.length; i++) {
    if (prevDaily[i]?.value !== currDaily[i]?.value) return true;
  }

  return false;
}

function updateChangeIndicator(element, change) {
  if (!element) return;

  element.className = 'stats-card__change';

  // Si change es null, significa que no hay datos previos para comparar
  if (change === null || change === undefined) {
    element.classList.add('stats-card__change--neutral');
    element.innerHTML = `<i class="fas fa-clock"></i> Sin historial`;
    return;
  }

  const value = parseFloat(change);

  if (isNaN(value)) {
    element.classList.add('stats-card__change--neutral');
    element.innerHTML = `<i class="fas fa-minus"></i> --`;
    return;
  }

  if (value > 0) {
    element.classList.add('stats-card__change--up');
    element.innerHTML = `<i class="fas fa-arrow-up"></i> ${Math.abs(value).toFixed(1)}%`;
  } else if (value < 0) {
    element.classList.add('stats-card__change--down');
    element.innerHTML = `<i class="fas fa-arrow-down"></i> ${Math.abs(value).toFixed(1)}%`;
  } else {
    element.classList.add('stats-card__change--neutral');
    element.innerHTML = `<i class="fas fa-equals"></i> 0%`;
  }
}

// =====================================================
// RENDERIZADO DE GRÁFICOS
// =====================================================

function renderCharts() {
  console.log('📊 renderCharts() llamada - período:', currentPeriod);
  if (!statisticsData || !statisticsData.charts) {
    console.log('📊 No hay datos de charts, saliendo');
    return;
  }

  renderConversationsChart();
  renderHoursChart();
}

function renderConversationsChart() {
  // Buscar el contenedor de forma más robusta
  // Primero intentar por ID del canvas, luego por la estructura del DOM
  let container = null;
  const canvas = document.getElementById('conversationsChart');

  if (canvas) {
    container = canvas.parentElement;
  } else {
    // Si el canvas fue reemplazado, buscar el primer .stats-chart-card__body en la sección de estadísticas
    const chartCards = document.querySelectorAll('[data-tab="statistics"] .stats-chart-card__body');
    container = chartCards[0]; // El primero es el de conversaciones
  }

  console.log('📊 renderConversationsChart - container encontrado:', !!container);
  if (!container) return;

  const dailyData = statisticsData.charts.daily || [];

  console.log('📊 dailyData length:', dailyData.length);
  console.log('📊 Todos son 0?:', dailyData.every(d => d.value === 0));

  // Siempre mostrar el gráfico, incluso si todos son 0
  // Esto permite ver el período seleccionado
  if (dailyData.length === 0) {
    container.innerHTML = createEmptyChartMessage('No hay datos para este período');
    return;
  }

  // Mostrar gráfico aunque los valores sean 0 (para ver el período)
  container.innerHTML = createSimpleLineChart(dailyData);
}

function renderHoursChart() {
  // Buscar el contenedor de forma más robusta
  let container = null;
  const canvas = document.getElementById('hoursChart');

  if (canvas) {
    container = canvas.parentElement;
  } else {
    // Si el canvas fue reemplazado, buscar el segundo .stats-chart-card__body
    const chartCards = document.querySelectorAll('[data-tab="statistics"] .stats-chart-card__body');
    container = chartCards[1]; // El segundo es el de horas
  }

  if (!container) return;

  const hourlyData = statisticsData.charts.hourly || [];

  if (hourlyData.length === 0 || hourlyData.every(d => d.value === 0)) {
    container.innerHTML = createEmptyChartMessage('No hay actividad por hora');
    return;
  }

  container.innerHTML = createSimpleBarChart(hourlyData);
}

function createEmptyChartMessage(message) {
  return `
    <div class="stats-empty-chart">
      <i class="fas fa-chart-area"></i>
      <p>${message}</p>
      <small>Los datos aparecerán cuando tu chatbot reciba interacciones</small>
    </div>
  `;
}

function createSimpleLineChart(data) {
  if (!data || data.length === 0) return createEmptyChartMessage('Sin datos');

  console.log('📊 createSimpleLineChart - datos recibidos:', data.length, 'días');
  console.log('📊 Período actual (variable global):', currentPeriod);

  // Adaptar visualización según el período
  let displayData = data;
  let groupingMode = 'días';
  let useScrollable = false;

  if (data.length > 180) {
    // Para 365 días: agrupar por mes
    displayData = groupDataByMonth(data);
    groupingMode = 'meses';
  } else if (data.length > 60) {
    // Para 90 días: agrupar por semana
    displayData = groupDataByWeek(data);
    groupingMode = 'semanas';
  } else if (data.length > 14) {
    // Para 30 días: mostrar todos con scroll horizontal
    useScrollable = true;
    groupingMode = 'días con scroll';
  }

  console.log('📊 Modo de agrupación:', groupingMode, '- elementos a mostrar:', displayData.length);

  const maxValue = Math.max(...displayData.map(d => d.value), 1);

  // Generar ID único para el wrapper del scroll
  const wrapperId = 'chartScrollWrapper_' + Date.now();

  // Contenedor con scroll horizontal para 30 días
  let html = useScrollable
    ? `<div class="simple-chart-scroll-wrapper" id="${wrapperId}"><div class="simple-chart simple-chart--line simple-chart--scrollable">`
    : '<div class="simple-chart simple-chart--line">';

  displayData.forEach((point) => {
    const height = (point.value / maxValue) * 100;
    const isTodayClass = point.isToday ? ' chart-point--today' : '';
    const label = point.isToday ? 'Hoy' : point.date;

    html += `
      <div class="chart-point${isTodayClass}" style="--height: ${height}%">
        <div class="chart-bar"></div>
        <div class="chart-label">${label}</div>
        <div class="chart-value">${point.value}</div>
      </div>
    `;
  });

  html += useScrollable ? '</div></div>' : '</div>';

  // Si es scrollable, hacer scroll a la derecha después de renderizar (para mostrar datos más recientes)
  if (useScrollable) {
    setTimeout(() => {
      const wrapper = document.getElementById(wrapperId);
      if (wrapper) {
        wrapper.scrollLeft = wrapper.scrollWidth;
      }
    }, 100);
  }

  return html;
}

function groupDataByMonth(data) {
  const months = [];
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  let currentMonth = null;
  let currentSum = 0;
  let currentHasToday = false;

  data.forEach((d, i) => {
    // Extraer mes de fullDate (YYYY-MM-DD) o de date (ej: "15 dic")
    let month;
    if (d.fullDate) {
      month = d.fullDate.substring(0, 7); // YYYY-MM
    } else {
      // Fallback: usar el índice para aproximar
      month = Math.floor(i / 30);
    }

    if (currentMonth === null) {
      currentMonth = month;
    }

    if (month !== currentMonth) {
      // Guardar mes anterior
      const monthIndex = d.fullDate ? parseInt(d.fullDate.substring(5, 7)) - 2 : currentMonth;
      const monthName = monthNames[monthIndex >= 0 ? monthIndex : 11];
      months.push({
        date: monthName,
        value: currentSum,
        isToday: currentHasToday
      });
      currentMonth = month;
      currentSum = 0;
      currentHasToday = false;
    }

    currentSum += d.value;
    if (d.isToday) currentHasToday = true;
  });

  // Añadir último mes
  if (currentSum > 0 || months.length === 0) {
    const lastItem = data[data.length - 1];
    let monthName = 'Dic';
    if (lastItem?.fullDate) {
      const monthIndex = parseInt(lastItem.fullDate.substring(5, 7)) - 1;
      monthName = monthNames[monthIndex];
    }
    months.push({
      date: currentHasToday ? 'Hoy' : monthName,
      value: currentSum,
      isToday: currentHasToday
    });
  }

  return months;
}

function groupDataByWeek(data) {
  const weeks = [];
  for (let i = 0; i < data.length; i += 7) {
    const chunk = data.slice(i, Math.min(i + 7, data.length));
    const sum = chunk.reduce((acc, d) => acc + d.value, 0);
    const hasToday = chunk.some(d => d.isToday);

    // Formato más corto para semanas
    const startDay = chunk[0].date.split(' ')[0];
    const endDay = chunk[chunk.length - 1].date.split(' ')[0];
    const label = chunk.length > 1 ? `${startDay}-${endDay}` : chunk[0].date;

    weeks.push({
      date: hasToday ? 'Hoy' : label,
      value: sum,
      isToday: hasToday
    });
  }
  return weeks;
}

function createSimpleBarChart(data) {
  if (!data || data.length === 0) return createEmptyChartMessage('Sin datos');

  // Mostrar solo cada 3 horas
  const filteredData = data.filter((_, index) => index % 3 === 0);
  const maxValue = Math.max(...filteredData.map(d => d.value), 1);

  let html = '<div class="simple-chart simple-chart--bars">';
  filteredData.forEach(point => {
    const height = (point.value / maxValue) * 100;
    html += `
      <div class="chart-bar-wrapper" style="--height: ${height}%">
        <div class="chart-bar-fill"></div>
        <div class="chart-bar-label">${point.hour}</div>
      </div>
    `;
  });
  html += '</div>';

  return html;
}

// =====================================================
// ESTADOS DE CARGA Y ERROR
// =====================================================

function showLoadingState() {
  const cards = document.querySelectorAll('.stats-card__value');
  cards.forEach(card => {
    card.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  });
}

function hideLoadingState() {
  // El contenido se actualiza con los datos reales
}

function showNoDataMessage(message) {
  const cards = document.querySelectorAll('.stats-card__value');
  cards.forEach(card => {
    card.textContent = '0';
  });

  const changes = document.querySelectorAll('.stats-card__change');
  changes.forEach(change => {
    change.className = 'stats-card__change stats-card__change--neutral';
    change.innerHTML = '<i class="fas fa-minus"></i> 0%';
  });

  // Mostrar mensaje en los gráficos
  const chartContainers = document.querySelectorAll('.stats-chart-card__body');
  chartContainers.forEach(container => {
    container.innerHTML = createEmptyChartMessage(message);
  });
}

// =====================================================
// ANIMACIONES
// =====================================================

function animateStatistics() {
  const cards = document.querySelectorAll('.stats-card');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';

    setTimeout(() => {
      card.style.transition = 'all 0.5s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 100);
  });
}

function animateNumber(element, target) {
  if (!element) return;

  const start = parseInt(element.textContent.replace(/\D/g, '')) || 0;
  const duration = 1000;
  const increment = (target - start) / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;

    if ((increment > 0 && current >= target) || (increment < 0 && current <= target) || increment === 0) {
      element.textContent = target.toLocaleString('es-ES');
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current).toLocaleString('es-ES');
    }
  }, 16);
}

// =====================================================
// ESTILOS PARA GRÁFICOS
// =====================================================

function injectChartStyles() {
  if (document.getElementById('statistics-dynamic-styles')) return;

  const styleElement = document.createElement('style');
  styleElement.id = 'statistics-dynamic-styles';
  styleElement.textContent = `
    /* Wrapper para scroll horizontal */
    .simple-chart-scroll-wrapper {
      overflow-x: auto;
      overflow-y: hidden;
      padding-bottom: 8px;
      margin: 0 -0.5rem;
      padding: 0 0.5rem 12px 0.5rem;
    }

    .simple-chart-scroll-wrapper::-webkit-scrollbar {
      height: 6px;
    }

    .simple-chart-scroll-wrapper::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 3px;
    }

    .simple-chart-scroll-wrapper::-webkit-scrollbar-thumb {
      background: rgba(102, 126, 234, 0.4);
      border-radius: 3px;
    }

    .simple-chart-scroll-wrapper::-webkit-scrollbar-thumb:hover {
      background: rgba(102, 126, 234, 0.6);
    }

    .simple-chart {
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      height: 200px;
      padding: 1rem;
      gap: 0.5rem;
    }

    /* Versión scrollable para 30 días */
    .simple-chart--scrollable {
      justify-content: flex-start;
      min-width: max-content;
      gap: 0.25rem;
    }

    .simple-chart--scrollable .chart-point {
      flex: 0 0 auto;
      min-width: 28px;
      max-width: 35px;
    }

    .simple-chart--line .chart-point {
      flex: 1;
      position: relative;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
    }

    .simple-chart--line .chart-bar {
      width: 100%;
      background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
      border-radius: 4px 4px 0 0;
      height: var(--height);
      transition: height 0.5s ease;
      min-height: 2px;
    }

    .simple-chart--line .chart-label {
      font-size: 0.65rem;
      color: var(--dark-text-secondary);
      margin-top: 0.5rem;
      white-space: nowrap;
    }

    .simple-chart--line .chart-value {
      position: absolute;
      bottom: calc(var(--height) + 10px);
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--dark-text);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .simple-chart--line .chart-point:hover .chart-value {
      opacity: 1;
    }

    /* Resaltar el día de hoy */
    .simple-chart--line .chart-point--today .chart-bar {
      background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
      box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
    }

    .simple-chart--line .chart-point--today .chart-label {
      color: #f59e0b;
      font-weight: 600;
    }

    .simple-chart--bars {
      display: flex;
      align-items: flex-end;
      gap: 0.75rem;
      height: 200px;
      padding: 1rem;
    }

    .simple-chart--bars .chart-bar-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      height: 100%;
    }

    .simple-chart--bars .chart-bar-fill {
      width: 100%;
      background: linear-gradient(180deg, #10b981 0%, #059669 100%);
      border-radius: 4px 4px 0 0;
      height: var(--height);
      transition: height 0.5s ease;
      min-height: 2px;
    }

    .simple-chart--bars .chart-bar-label {
      font-size: 0.7rem;
      color: var(--dark-text-secondary);
      margin-top: 0.5rem;
    }

    .stats-empty-chart {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: var(--dark-text-secondary);
      text-align: center;
      padding: 2rem;
    }

    .stats-empty-chart i {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.3;
    }

    .stats-empty-chart p {
      font-size: 1rem;
      margin-bottom: 0.5rem;
    }

    .stats-empty-chart small {
      font-size: 0.8rem;
      opacity: 0.7;
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.02); }
      100% { transform: scale(1); }
    }

    .stats-card.pulse {
      animation: pulse 0.5s ease;
    }

    /* Responsive: Móvil */
    @media (max-width: 768px) {
      /* Contenedor padre debe contener el scroll */
      .velvz-chart-container,
      .stats-chart-container {
        overflow: hidden;
        width: 100%;
        max-width: 100%;
      }

      .simple-chart-scroll-wrapper {
        margin: 0;
        padding: 0 0 12px 0;
        max-width: 100%;
        width: 100%;
        box-sizing: border-box;
      }

      .simple-chart {
        height: 150px;
        padding: 0.75rem 0.5rem;
        gap: 0.25rem;
      }

      .simple-chart--scrollable .chart-point {
        min-width: 24px;
        max-width: 28px;
      }

      .simple-chart--line .chart-label {
        font-size: 0.55rem;
      }

      .simple-chart--line .chart-value {
        font-size: 0.65rem;
      }

      .simple-chart--bars {
        height: 150px;
        padding: 0.75rem 0.5rem;
        gap: 0.5rem;
      }

      .simple-chart--bars .chart-bar-label {
        font-size: 0.6rem;
      }

      .stats-empty-chart {
        height: 150px;
        padding: 1rem;
      }

      .stats-empty-chart i {
        font-size: 2rem;
      }

      .stats-empty-chart p {
        font-size: 0.9rem;
      }
    }

    /* Responsive: Móviles pequeños */
    @media (max-width: 480px) {
      .simple-chart-scroll-wrapper {
        margin: 0;
        padding: 0 0 10px 0;
        max-width: 100%;
      }

      .simple-chart {
        height: 120px;
        padding: 0.5rem 0.25rem;
      }

      .simple-chart--scrollable .chart-point {
        min-width: 20px;
        max-width: 24px;
      }

      .simple-chart--line .chart-label {
        font-size: 0.5rem;
        margin-top: 0.25rem;
      }

      .simple-chart--bars {
        height: 120px;
      }
    }
  `;
  document.head.appendChild(styleElement);
}

// =====================================================
// AUTO-REFRESH DE ESTADÍSTICAS
// =====================================================

function startStatsAutoRefresh() {
  // Limpiar intervalo anterior si existe
  stopStatsAutoRefresh();

  // Iniciar auto-refresh cada 10 segundos (silencioso - sin spinner)
  statsAutoRefreshInterval = setInterval(() => {
    console.log('🔄 Auto-refresh silencioso de estadísticas...');
    loadRealStatistics(true, true); // forceReload=true, silentRefresh=true
  }, 10000);

  console.log('✅ Auto-refresh de estadísticas iniciado (cada 10s, silencioso)');
}

function stopStatsAutoRefresh() {
  if (statsAutoRefreshInterval) {
    clearInterval(statsAutoRefreshInterval);
    statsAutoRefreshInterval = null;
    console.log('⏹️ Auto-refresh de estadísticas detenido');
  }
}

// =====================================================
// EXPORTAR
// =====================================================

window.initializeStatisticsSection = initializeStatisticsSection;
window.loadRealStatistics = loadRealStatistics;
window.startStatsAutoRefresh = startStatsAutoRefresh;
window.stopStatsAutoRefresh = stopStatsAutoRefresh;

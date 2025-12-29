/**
 * =====================================================
 * COSMOS DASHBOARD - Velvz
 * Sistema de partículas, nebulosa y planetas orbitales
 * =====================================================
 */

// Configuración global
const CONFIG = {
    API_BASE: 'https://velvz-unified-backend-production.up.railway.app/api',
    PARTICLE_COUNT: 150,
    NEBULA_LAYERS: 3,
    ORBIT_BASE_RADIUS: 150,
    ORBIT_INCREMENT: 80,
    ANIMATION_DURATION: 3000,
    ENTRY_DURATION: 10000, // Duración total
    ENTRY_PARTICLE_COUNT: 1200, // Más partículas pero más pequeñas
    FORM_DURATION: 3000, // Tiempo para formar las letras (más lento)
    HOLD_DURATION: 3000, // Tiempo que se mantienen formadas (más tiempo)
    DISPERSE_DURATION: 2500 // Tiempo para dispersarse (más suave)
};

// Estado global
let canvas, ctx;
let particles = [];
let nebulaParticles = [];
let planets = [];
let connections = [];
let animationId;
let showOrbits = true;
let showConnections = true;
let userData = null;
let chatbotsData = [];

// Colores de la paleta
const COLORS = {
    primary: { r: 102, g: 126, b: 234 },
    secondary: { r: 118, g: 75, b: 162 },
    accent: { r: 167, g: 139, b: 250 },
    nebula1: { r: 102, g: 126, b: 234, a: 0.1 },
    nebula2: { r: 118, g: 75, b: 162, a: 0.08 },
    nebula3: { r: 167, g: 139, b: 250, a: 0.06 }
};

// =====================================================
// INICIALIZACIÓN
// =====================================================
document.addEventListener('DOMContentLoaded', init);

async function init() {
    console.log('🌌 Iniciando Cosmos Dashboard...');

    // Configurar canvas
    setupCanvas();

    // Iniciar animación de entrada
    startEntryAnimation();

    // Cargar datos
    await loadData();

    // Configurar eventos
    setupEventListeners();

    // Iniciar loop de animación
    startAnimationLoop();
}

// =====================================================
// CANVAS Y PARTÍCULAS
// =====================================================
function setupCanvas() {
    canvas = document.getElementById('cosmosCanvas');
    ctx = canvas.getContext('2d');

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Crear partículas de fondo
    createBackgroundParticles();

    // Crear capas de nebulosa
    createNebulaLayers();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function createBackgroundParticles() {
    particles = [];

    for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: (Math.random() - 0.5) * 0.3,
            opacity: Math.random() * 0.8 + 0.2,
            twinkleSpeed: Math.random() * 0.02 + 0.01,
            twinkleOffset: Math.random() * Math.PI * 2,
            color: getRandomColor()
        });
    }
}

function createNebulaLayers() {
    nebulaParticles = [];

    for (let layer = 0; layer < CONFIG.NEBULA_LAYERS; layer++) {
        const layerParticles = [];
        const count = 20 + layer * 10;

        for (let i = 0; i < count; i++) {
            layerParticles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 200 + 100,
                opacity: (0.03 - layer * 0.008) * Math.random(),
                speedX: (Math.random() - 0.5) * 0.1,
                speedY: (Math.random() - 0.5) * 0.1,
                color: layer === 0 ? COLORS.nebula1 : layer === 1 ? COLORS.nebula2 : COLORS.nebula3
            });
        }

        nebulaParticles.push(layerParticles);
    }
}

function getRandomColor() {
    const colors = [COLORS.primary, COLORS.secondary, COLORS.accent];
    return colors[Math.floor(Math.random() * colors.length)];
}

// =====================================================
// ANIMACIÓN DE ENTRADA - PARTÍCULAS FORMANDO "VELVZ"
// =====================================================

// Canvas y contexto para la animación de entrada
let entryCanvas, entryCtx;
let entryParticles = [];
let entryAnimationId;
let entryPhase = 'scatter'; // 'scatter', 'forming', 'holding', 'dispersing', 'done'

// Definición de las letras VELVZ con puntos
const LETTER_PATHS = {
    V: [
        [0, 0], [0.15, 0], [0.5, 0.85], [0.85, 0], [1, 0], [0.6, 1], [0.4, 1]
    ],
    E: [
        [0, 0], [1, 0], [1, 0.15], [0.2, 0.15], [0.2, 0.42], [0.8, 0.42], [0.8, 0.58],
        [0.2, 0.58], [0.2, 0.85], [1, 0.85], [1, 1], [0, 1]
    ],
    L: [
        [0, 0], [0.2, 0], [0.2, 0.85], [1, 0.85], [1, 1], [0, 1]
    ],
    Z: [
        [0, 0], [1, 0], [1, 0.15], [0.25, 0.85], [1, 0.85], [1, 1], [0, 1], [0, 0.85], [0.75, 0.15], [0, 0.15]
    ]
};

function startEntryAnimation() {
    const overlay = document.getElementById('entryOverlay');
    const container = document.getElementById('cosmosContainer');

    // Ocultar el texto original
    const entryText = document.getElementById('entryText');
    if (entryText) entryText.style.display = 'none';

    // Crear canvas para la animación de entrada
    entryCanvas = document.createElement('canvas');
    entryCanvas.id = 'entryCanvas';
    entryCanvas.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%;';
    overlay.appendChild(entryCanvas);

    entryCtx = entryCanvas.getContext('2d');
    entryCanvas.width = window.innerWidth;
    entryCanvas.height = window.innerHeight;

    // Crear partículas
    createEntryParticles();

    // Iniciar animación
    entryPhase = 'scatter';
    lastTime = 0;
    requestAnimationFrame(animateEntry);

    // Timeline de fases - ajustado para mejor experiencia
    setTimeout(() => {
        entryPhase = 'forming';
        calculateTargetPositions();
    }, 800); // Un poco más de tiempo de scatter inicial

    setTimeout(() => {
        entryPhase = 'holding';
    }, 800 + CONFIG.FORM_DURATION);

    setTimeout(() => {
        entryPhase = 'dispersing';
        setDisperseTargets();
    }, 800 + CONFIG.FORM_DURATION + CONFIG.HOLD_DURATION);

    setTimeout(() => {
        entryPhase = 'done';
        cancelAnimationFrame(entryAnimationId);
        // Limpiar canvas antes de ocultar
        entryCtx.fillStyle = 'rgba(5, 5, 16, 1)';
        entryCtx.fillRect(0, 0, entryCanvas.width, entryCanvas.height);
        overlay.classList.add('hidden');
        container.classList.add('visible');
        animateUIElements();
    }, CONFIG.ENTRY_DURATION);
}

function createEntryParticles() {
    entryParticles = [];
    const colors = [
        { r: 102, g: 126, b: 234 }, // primary
        { r: 118, g: 75, b: 162 },  // secondary
        { r: 167, g: 139, b: 250 }, // accent
        { r: 200, g: 200, b: 255 }, // light blue-white
        { r: 255, g: 255, b: 255 }  // white
    ];

    for (let i = 0; i < CONFIG.ENTRY_PARTICLE_COUNT; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        // Partículas más pequeñas, tipo estrellas
        const size = Math.random() < 0.9
            ? Math.random() * 1.2 + 0.3  // 90% muy pequeñas (0.3 - 1.5)
            : Math.random() * 1.5 + 1.5; // 10% un poco más grandes (1.5 - 3)

        entryParticles.push({
            // Posición actual
            x: Math.random() * entryCanvas.width,
            y: Math.random() * entryCanvas.height,
            // Posición objetivo (se calculará después)
            targetX: 0,
            targetY: 0,
            // Velocidad inicial más suave
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            // Propiedades visuales - estrellas pequeñas
            size: size,
            color: color,
            opacity: Math.random() * 0.6 + 0.4,
            twinkle: Math.random() * Math.PI * 2, // Para efecto de parpadeo
            twinkleSpeed: Math.random() * 0.03 + 0.01,
            // Para el efecto de dispersión
            disperseAngle: Math.random() * Math.PI * 2,
            disperseSpeed: Math.random() * 3 + 1
        });
    }
}

function calculateTargetPositions() {
    const text = 'VELVZ';
    const letterWidth = 120;
    const letterHeight = 150;
    const spacing = 30;
    const totalWidth = text.length * letterWidth + (text.length - 1) * spacing;
    const startX = (entryCanvas.width - totalWidth) / 2;
    const startY = (entryCanvas.height - letterHeight) / 2;

    // Generar puntos para cada letra
    let allPoints = [];

    for (let i = 0; i < text.length; i++) {
        const letter = text[i];
        const letterX = startX + i * (letterWidth + spacing);
        const points = generateLetterPoints(letter, letterX, startY, letterWidth, letterHeight);
        allPoints = allPoints.concat(points);
    }

    // Asignar puntos a partículas
    // Si hay más partículas que puntos, algunas partículas van a puntos aleatorios cercanos
    // Si hay más puntos que partículas, algunos puntos no se usan

    const shuffledParticles = [...entryParticles].sort(() => Math.random() - 0.5);

    for (let i = 0; i < shuffledParticles.length; i++) {
        if (i < allPoints.length) {
            shuffledParticles[i].targetX = allPoints[i].x;
            shuffledParticles[i].targetY = allPoints[i].y;
        } else {
            // Partículas extra van a posiciones aleatorias cerca del texto
            const randomPoint = allPoints[Math.floor(Math.random() * allPoints.length)];
            shuffledParticles[i].targetX = randomPoint.x + (Math.random() - 0.5) * 50;
            shuffledParticles[i].targetY = randomPoint.y + (Math.random() - 0.5) * 50;
        }
    }
}

function generateLetterPoints(letter, x, y, width, height) {
    const points = [];
    const density = 25; // Puntos por letra aproximadamente

    // Generar puntos dentro del contorno de la letra
    switch (letter) {
        case 'V':
            // V - diagonal izquierda y derecha
            for (let i = 0; i < density; i++) {
                const t = i / density;
                // Lado izquierdo
                points.push({
                    x: x + width * 0.1 + t * width * 0.4,
                    y: y + t * height
                });
                // Lado derecho
                points.push({
                    x: x + width * 0.9 - t * width * 0.4,
                    y: y + t * height
                });
            }
            break;

        case 'E':
            // E - tres líneas horizontales y una vertical
            for (let i = 0; i < density; i++) {
                const t = i / density;
                // Vertical izquierda
                points.push({ x: x + width * 0.15, y: y + t * height });
                // Horizontal superior
                points.push({ x: x + width * 0.15 + t * width * 0.7, y: y + height * 0.05 });
                // Horizontal media
                points.push({ x: x + width * 0.15 + t * width * 0.5, y: y + height * 0.5 });
                // Horizontal inferior
                points.push({ x: x + width * 0.15 + t * width * 0.7, y: y + height * 0.95 });
            }
            break;

        case 'L':
            // L - vertical y horizontal inferior
            for (let i = 0; i < density; i++) {
                const t = i / density;
                // Vertical
                points.push({ x: x + width * 0.2, y: y + t * height });
                // Horizontal inferior
                points.push({ x: x + width * 0.2 + t * width * 0.65, y: y + height * 0.95 });
            }
            break;

        case 'Z':
            // Z - horizontal superior, diagonal, horizontal inferior
            for (let i = 0; i < density; i++) {
                const t = i / density;
                // Horizontal superior
                points.push({ x: x + width * 0.1 + t * width * 0.8, y: y + height * 0.05 });
                // Diagonal
                points.push({
                    x: x + width * 0.85 - t * width * 0.7,
                    y: y + height * 0.1 + t * height * 0.8
                });
                // Horizontal inferior
                points.push({ x: x + width * 0.1 + t * width * 0.8, y: y + height * 0.95 });
            }
            break;
    }

    // Añadir algo de ruido a los puntos
    return points.map(p => ({
        x: p.x + (Math.random() - 0.5) * 8,
        y: p.y + (Math.random() - 0.5) * 8
    }));
}

function setDisperseTargets() {
    const centerX = entryCanvas.width / 2;
    const centerY = entryCanvas.height / 2;

    entryParticles.forEach(p => {
        // Calcular ángulo desde el centro hacia la partícula
        const angleFromCenter = Math.atan2(p.y - centerY, p.x - centerX);
        // Añadir algo de variación al ángulo
        const angle = angleFromCenter + (Math.random() - 0.5) * 0.5;
        const distance = Math.max(entryCanvas.width, entryCanvas.height) * 1.5;

        p.disperseTargetX = p.x + Math.cos(angle) * distance;
        p.disperseTargetY = p.y + Math.sin(angle) * distance;
    });
}

// Variables para optimización de rendimiento
let lastTime = 0;
const targetFPS = 60;
const frameInterval = 1000 / targetFPS;

function animateEntry(currentTime) {
    if (entryPhase === 'done') return;

    // Control de frame rate para suavidad
    if (!lastTime) lastTime = currentTime;
    const deltaTime = currentTime - lastTime;

    if (deltaTime < frameInterval) {
        entryAnimationId = requestAnimationFrame(animateEntry);
        return;
    }
    lastTime = currentTime - (deltaTime % frameInterval);

    // Limpiar canvas con un trail sutil para efecto de estela
    entryCtx.fillStyle = 'rgba(5, 5, 16, 0.15)';
    entryCtx.fillRect(0, 0, entryCanvas.width, entryCanvas.height);

    const time = currentTime * 0.001;

    // Actualizar y dibujar partículas
    for (let i = 0; i < entryParticles.length; i++) {
        const p = entryParticles[i];

        // Actualizar twinkle
        p.twinkle += p.twinkleSpeed;
        const twinkleFactor = 0.7 + Math.sin(p.twinkle) * 0.3;

        switch (entryPhase) {
            case 'scatter':
                // Movimiento suave tipo galaxia
                p.x += p.vx;
                p.y += p.vy;
                // Bounce suave en los bordes
                if (p.x < 0 || p.x > entryCanvas.width) p.vx *= -0.8;
                if (p.y < 0 || p.y > entryCanvas.height) p.vy *= -0.8;
                break;

            case 'forming':
                // Moverse hacia el objetivo con easing suave
                const dx = p.targetX - p.x;
                const dy = p.targetY - p.y;
                // Easing más suave (0.025 en vez de 0.04)
                p.x += dx * 0.025;
                p.y += dy * 0.025;
                break;

            case 'holding':
                // Pequeña oscilación muy sutil, como estrellas
                const oscillation = Math.sin(time * 2 + i * 0.1) * 0.3;
                p.x += oscillation * 0.5;
                p.y += Math.cos(time * 2 + i * 0.1) * 0.3;
                // Tender a volver al target suavemente
                p.x += (p.targetX - p.x) * 0.05;
                p.y += (p.targetY - p.y) * 0.05;
                break;

            case 'dispersing':
                // Dispersión suave y gradual
                const ddx = p.disperseTargetX - p.x;
                const ddy = p.disperseTargetY - p.y;
                p.x += ddx * 0.015; // Más lento y suave
                p.y += ddy * 0.015;
                // Fade out gradual
                p.opacity *= 0.995;
                break;
        }

        // Dibujar partícula - OPTIMIZADO
        const currentOpacity = p.opacity * twinkleFactor;

        // Solo dibujar glow para partículas más grandes
        if (p.size > 1.2) {
            const glowSize = p.size * 2;
            entryCtx.beginPath();
            entryCtx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
            entryCtx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${currentOpacity * 0.2})`;
            entryCtx.fill();
        }

        // Núcleo de la estrella
        entryCtx.beginPath();
        entryCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        entryCtx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${currentOpacity})`;
        entryCtx.fill();

        // Centro brillante solo para estrellas más grandes
        if (p.size > 1) {
            entryCtx.beginPath();
            entryCtx.arc(p.x, p.y, p.size * 0.3, 0, Math.PI * 2);
            entryCtx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 0.8})`;
            entryCtx.fill();
        }
    }

    entryAnimationId = requestAnimationFrame(animateEntry);
}

function animateUIElements() {
    const elements = [
        { el: document.querySelector('.cosmos-header'), delay: 0 },
        { el: document.getElementById('centralSun'), delay: 200 },
        { el: document.getElementById('statsPanel'), delay: 400 },
        { el: document.querySelector('.cosmos-legend'), delay: 500 },
        { el: document.querySelector('.cosmos-controls'), delay: 600 }
    ];

    elements.forEach(({ el, delay }) => {
        if (el) {
            el.style.opacity = '0';
            el.style.transform = el.id === 'centralSun' ? 'translate(-50%, -50%) scale(0)' : 'translateY(20px)';

            setTimeout(() => {
                el.style.transition = 'all 0.6s ease-out';
                el.style.opacity = '1';
                el.style.transform = el.id === 'centralSun' ? 'translate(-50%, -50%) scale(1)' : 'translateY(0)';
            }, delay);
        }
    });
}

// =====================================================
// CARGA DE DATOS
// =====================================================
async function loadData() {
    const token = localStorage.getItem('token');

    if (!token) {
        console.warn('No hay token, redirigiendo al login...');
        // window.location.href = '../login/';
        return;
    }

    try {
        // Cargar datos del usuario
        const userResponse = await fetch(`${CONFIG.API_BASE}/users/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (userResponse.ok) {
            userData = await userResponse.json();
            updateUserUI();
        }

        // Cargar chatbots
        const chatbotsResponse = await fetch(`${CONFIG.API_BASE}/chatbots`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (chatbotsResponse.ok) {
            chatbotsData = await chatbotsResponse.json();
            createPlanets();
            updateStats();
        }

    } catch (error) {
        console.error('Error cargando datos:', error);
        // Usar datos de demo si falla
        useDemoData();
    }
}

function useDemoData() {
    console.log('📊 Usando datos de demostración...');

    userData = {
        name: 'Usuario Demo',
        email: 'demo@velvz.com'
    };

    chatbotsData = [
        { id: 1, name: 'Asistente Web', conversations: 156, active: true, createdAt: '2024-01-15' },
        { id: 2, name: 'Soporte Cliente', conversations: 89, active: true, createdAt: '2024-02-20' },
        { id: 3, name: 'Bot Ventas', conversations: 234, active: false, createdAt: '2024-03-10' },
        { id: 4, name: 'FAQ Bot', conversations: 45, active: true, createdAt: '2024-04-05' },
        { id: 5, name: 'Lead Generator', conversations: 312, active: true, createdAt: '2024-05-01' }
    ];

    updateUserUI();
    createPlanets();
    updateStats();
}

function updateUserUI() {
    if (!userData) return;

    const userName = document.getElementById('userName');
    const sunUserName = document.getElementById('sunUserName');

    if (userName) userName.textContent = userData.name || 'Usuario';
    if (sunUserName) sunUserName.textContent = `Universo de ${userData.name?.split(' ')[0] || 'Usuario'}`;
}

function updateStats() {
    const totalChatbots = document.getElementById('totalChatbots');
    const totalConversations = document.getElementById('totalConversations');
    const activeNow = document.getElementById('activeNow');

    const total = chatbotsData.length;
    const convs = chatbotsData.reduce((sum, bot) => sum + (bot.conversations || bot.conversationCount || 0), 0);
    const active = chatbotsData.filter(bot => bot.active !== false).length;

    // Animar números
    animateNumber(totalChatbots, 0, total, 1000);
    animateNumber(totalConversations, 0, convs, 1500);
    animateNumber(activeNow, 0, active, 800);
}

function animateNumber(element, start, end, duration) {
    if (!element) return;

    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (end - start) * easeOut);

        element.textContent = current.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// =====================================================
// CREACIÓN DE PLANETAS
// =====================================================
function createPlanets() {
    const container = document.getElementById('planetsContainer');
    const solarSystem = document.getElementById('solarSystem');

    if (!container || !solarSystem) return;

    container.innerHTML = '';
    planets = [];

    // Eliminar órbitas existentes
    solarSystem.querySelectorAll('.orbit').forEach(o => o.remove());

    const centerX = solarSystem.offsetWidth / 2;
    const centerY = solarSystem.offsetHeight / 2;

    chatbotsData.forEach((chatbot, index) => {
        // Calcular órbita
        const orbitRadius = CONFIG.ORBIT_BASE_RADIUS + (index * CONFIG.ORBIT_INCREMENT);

        // Crear línea de órbita
        const orbit = document.createElement('div');
        orbit.className = 'orbit';
        orbit.style.width = orbitRadius * 2 + 'px';
        orbit.style.height = orbitRadius * 2 + 'px';
        if (!showOrbits) orbit.classList.add('hidden');
        solarSystem.appendChild(orbit);

        // Calcular tamaño del planeta basado en conversaciones
        const convs = chatbot.conversations || chatbot.conversationCount || 0;
        const baseSize = 40;
        const maxSize = 70;
        const size = Math.min(baseSize + Math.sqrt(convs) * 2, maxSize);

        // Ángulo inicial aleatorio pero distribuido
        const initialAngle = (index * (360 / chatbotsData.length)) + Math.random() * 30;

        // Crear planeta
        const planet = document.createElement('div');
        planet.className = `planet planet-color-${(index % 6) + 1} ${chatbot.active !== false ? 'active' : ''}`;
        planet.dataset.id = chatbot.id;
        planet.dataset.index = index;
        planet.style.width = size + 'px';
        planet.style.height = size + 'px';
        planet.style.setProperty('--orbit-radius', orbitRadius + 'px');

        // Posición inicial
        const angleRad = (initialAngle * Math.PI) / 180;
        const x = centerX + Math.cos(angleRad) * orbitRadius - size / 2;
        const y = centerY + Math.sin(angleRad) * orbitRadius - size / 2;
        planet.style.left = x + 'px';
        planet.style.top = y + 'px';

        planet.innerHTML = `
            <div class="planet-core"></div>
            <div class="planet-glow"></div>
            <i class="planet-icon fas fa-robot"></i>
            <span class="planet-name">${chatbot.name}</span>
        `;

        // Animación de órbita
        const orbitDuration = 30 + index * 10; // Diferentes velocidades
        planet.style.animation = `orbit ${orbitDuration}s linear infinite`;
        planet.style.animationDelay = `-${Math.random() * orbitDuration}s`;

        // Eventos
        planet.addEventListener('mouseenter', (e) => showTooltip(e, chatbot));
        planet.addEventListener('mouseleave', hideTooltip);
        planet.addEventListener('click', () => navigateToChatbot(chatbot));

        container.appendChild(planet);

        // Guardar referencia
        planets.push({
            element: planet,
            data: chatbot,
            orbitRadius,
            angle: initialAngle,
            speed: 360 / (orbitDuration * 60), // grados por frame
            size
        });
    });

    // Crear conexiones después de los planetas
    setTimeout(createConnections, 500);
}

// =====================================================
// CONEXIONES DE ENERGÍA
// =====================================================
function createConnections() {
    const svg = document.getElementById('connectionsLayer');
    if (!svg) return;

    // Limpiar conexiones existentes (excepto defs)
    svg.querySelectorAll('path, circle').forEach(el => el.remove());

    connections = [];

    // Solo crear conexiones entre bots activos
    const activePlanets = planets.filter(p => p.data.active !== false);

    if (activePlanets.length < 2) return;

    // Crear algunas conexiones aleatorias
    const maxConnections = Math.min(activePlanets.length - 1, 4);

    for (let i = 0; i < maxConnections; i++) {
        const planet1 = activePlanets[i];
        const planet2 = activePlanets[(i + 1) % activePlanets.length];

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.classList.add('connection-line', 'active');
        path.id = `connection-${i}`;

        svg.appendChild(path);

        // Partícula que viaja por la conexión
        const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        particle.classList.add('connection-particle');
        particle.setAttribute('r', '4');
        svg.appendChild(particle);

        connections.push({
            path,
            particle,
            planet1,
            planet2,
            progress: Math.random()
        });
    }

    if (!showConnections) {
        svg.style.opacity = '0';
    }
}

function updateConnections() {
    const solarSystem = document.getElementById('solarSystem');
    if (!solarSystem) return;

    const rect = solarSystem.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    connections.forEach(conn => {
        const el1 = conn.planet1.element;
        const el2 = conn.planet2.element;

        // Obtener posiciones actuales de los planetas
        const rect1 = el1.getBoundingClientRect();
        const rect2 = el2.getBoundingClientRect();

        const x1 = rect1.left - rect.left + rect1.width / 2;
        const y1 = rect1.top - rect.top + rect1.height / 2;
        const x2 = rect2.left - rect.left + rect2.width / 2;
        const y2 = rect2.top - rect.top + rect2.height / 2;

        // Crear curva bezier que pasa por el centro (sol)
        const midX = centerX;
        const midY = centerY;

        // Control points para una curva suave
        const cp1x = (x1 + midX) / 2;
        const cp1y = (y1 + midY) / 2;
        const cp2x = (x2 + midX) / 2;
        const cp2y = (y2 + midY) / 2;

        const d = `M ${x1} ${y1} Q ${cp1x} ${cp1y} ${midX} ${midY} Q ${cp2x} ${cp2y} ${x2} ${y2}`;
        conn.path.setAttribute('d', d);

        // Animar partícula a lo largo del path
        conn.progress += 0.003;
        if (conn.progress > 1) conn.progress = 0;

        const pathLength = conn.path.getTotalLength();
        const point = conn.path.getPointAtLength(pathLength * conn.progress);

        conn.particle.setAttribute('cx', point.x);
        conn.particle.setAttribute('cy', point.y);
    });
}

// =====================================================
// TOOLTIP
// =====================================================
function showTooltip(e, chatbot) {
    const tooltip = document.getElementById('planetTooltip');
    if (!tooltip) return;

    const convs = chatbot.conversations || chatbot.conversationCount || 0;
    const created = chatbot.createdAt ? new Date(chatbot.createdAt) : new Date();
    const daysAgo = Math.floor((new Date() - created) / (1000 * 60 * 60 * 24));

    tooltip.querySelector('.tooltip-name').textContent = chatbot.name;
    tooltip.querySelector('.tooltip-conversations').textContent = `${convs} conversaciones`;
    tooltip.querySelector('.tooltip-created').textContent = daysAgo === 0 ? 'Creado hoy' : `Creado hace ${daysAgo} días`;

    // Posicionar tooltip
    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = rect.right + 15 + 'px';
    tooltip.style.top = rect.top + 'px';

    // Ajustar si sale de la pantalla
    const tooltipRect = tooltip.getBoundingClientRect();
    if (rect.right + tooltipRect.width + 15 > window.innerWidth) {
        tooltip.style.left = rect.left - tooltipRect.width - 15 + 'px';
    }

    tooltip.classList.add('visible');
}

function hideTooltip() {
    const tooltip = document.getElementById('planetTooltip');
    if (tooltip) {
        tooltip.classList.remove('visible');
    }
}

// =====================================================
// NAVEGACIÓN CON EFECTO WARP
// =====================================================
function navigateToChatbot(chatbot) {
    const warp = document.getElementById('warpEffect');

    // Activar efecto warp
    warp.classList.add('active');

    // Navegar después de la animación
    setTimeout(() => {
        window.location.href = `../chatbots/config.html?id=${chatbot.id}`;
    }, 800);
}

// =====================================================
// LOOP DE ANIMACIÓN PRINCIPAL
// =====================================================
function startAnimationLoop() {
    function animate() {
        // Limpiar canvas
        ctx.fillStyle = 'rgba(5, 5, 16, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Dibujar nebulosa
        drawNebula();

        // Dibujar partículas de fondo
        drawParticles();

        // Actualizar conexiones
        if (showConnections) {
            updateConnections();
        }

        animationId = requestAnimationFrame(animate);
    }

    animate();
}

function drawNebula() {
    nebulaParticles.forEach(layer => {
        layer.forEach(particle => {
            // Mover partícula
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            // Wrap around
            if (particle.x < -particle.size) particle.x = canvas.width + particle.size;
            if (particle.x > canvas.width + particle.size) particle.x = -particle.size;
            if (particle.y < -particle.size) particle.y = canvas.height + particle.size;
            if (particle.y > canvas.height + particle.size) particle.y = -particle.size;

            // Dibujar
            const gradient = ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size
            );

            gradient.addColorStop(0, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.opacity})`);
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
    });
}

function drawParticles() {
    const time = Date.now() * 0.001;

    particles.forEach(particle => {
        // Mover partícula
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Calcular twinkle
        const twinkle = Math.sin(time * particle.twinkleSpeed * 10 + particle.twinkleOffset) * 0.5 + 0.5;
        const currentOpacity = particle.opacity * (0.5 + twinkle * 0.5);

        // Dibujar estrella
        ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${currentOpacity})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // Glow para estrellas más grandes
        if (particle.size > 1.5) {
            ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${currentOpacity * 0.3})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

// =====================================================
// EVENT LISTENERS
// =====================================================
function setupEventListeners() {
    // Toggle órbitas
    const toggleOrbitsBtn = document.getElementById('toggleOrbits');
    if (toggleOrbitsBtn) {
        toggleOrbitsBtn.addEventListener('click', () => {
            showOrbits = !showOrbits;
            toggleOrbitsBtn.classList.toggle('active', showOrbits);
            document.querySelectorAll('.orbit').forEach(o => {
                o.classList.toggle('hidden', !showOrbits);
            });
        });
    }

    // Toggle conexiones
    const toggleConnectionsBtn = document.getElementById('toggleConnections');
    if (toggleConnectionsBtn) {
        toggleConnectionsBtn.addEventListener('click', () => {
            showConnections = !showConnections;
            toggleConnectionsBtn.classList.toggle('active', showConnections);
            const svg = document.getElementById('connectionsLayer');
            if (svg) {
                svg.style.opacity = showConnections ? '1' : '0';
            }
        });
    }

    // Reset view
    const resetViewBtn = document.getElementById('resetView');
    if (resetViewBtn) {
        resetViewBtn.addEventListener('click', () => {
            // Reiniciar posiciones de planetas
            createPlanets();
        });
    }

    // Click en el sol
    const sun = document.getElementById('centralSun');
    if (sun) {
        sun.addEventListener('click', () => {
            // Efecto de pulse
            sun.style.transform = 'translate(-50%, -50%) scale(1.2)';
            setTimeout(() => {
                sun.style.transform = 'translate(-50%, -50%) scale(1)';
            }, 200);
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'o':
            case 'O':
                toggleOrbitsBtn?.click();
                break;
            case 'c':
            case 'C':
                toggleConnectionsBtn?.click();
                break;
            case 'r':
            case 'R':
                resetViewBtn?.click();
                break;
            case 'Escape':
                window.location.href = '../dashboard/';
                break;
        }
    });
}

// =====================================================
// UTILIDADES
// =====================================================
function lerp(start, end, t) {
    return start + (end - start) * t;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Cleanup al salir
window.addEventListener('beforeunload', () => {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
});

console.log('🚀 Cosmos Dashboard cargado correctamente');

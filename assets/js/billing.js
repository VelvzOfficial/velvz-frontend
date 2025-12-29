// =====================================================
// BILLING - GESTIÓN DE FACTURACIÓN CON STRIPE
// =====================================================

console.log("💳 billing.js cargando...");

// URL del backend
const API_URL = 'https://velvz-unified-backend-production.up.railway.app';

// Configuración de planes (frontend)
const PLANS = {
    starter: {
        id: 'starter',
        name: 'Starter',
        displayName: 'Plan Gratuito',
        price: 0,
        badge: 'STARTER',
        badgeClass: '',
        limits: {
            chatbots: 1,
            messages: 500,
            documents: 5,
            domains: 1
        }
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        displayName: 'Plan Pro',
        price: 29,
        badge: 'PRO',
        badgeClass: 'billing__plan-badge--pro',
        limits: {
            chatbots: 20,
            messages: 10000,
            documents: 50,
            domains: -1
        }
    },
    business: {
        id: 'business',
        name: 'Business',
        displayName: 'Plan Business',
        price: 99,
        badge: 'BUSINESS',
        badgeClass: 'billing__plan-badge--business',
        limits: {
            chatbots: -1,
            messages: 50000,
            documents: 200,
            domains: -1
        }
    }
};

// Estado actual
let currentUserPlan = 'starter';
let currentUsage = {
    chatbots: 0,
    messages: 0,
    documents: 0
};
let currentLimits = PLANS.starter.limits;
let trialDaysLeft = null;
let selectedUpgradePlan = 'pro';

// =====================================================
// INICIALIZACIÓN
// =====================================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log("🔧 Inicializando página de facturación...");

    // Esperar a que dashboard API esté disponible
    await waitForDashboardAPI();

    // Verificar autenticación
    if (!window.dashboardAPI || !window.dashboardAPI.token) {
        console.warn("❌ No hay autenticación, redirigiendo...");
        window.location.href = "/cuenta/";
        return;
    }

    // Verificar si viene de un checkout exitoso
    checkCheckoutStatus();

    // Cargar datos de billing desde el backend
    await loadBillingStatus();

    // Configurar event listeners
    setupEventListeners();

    // Calcular fecha de reinicio de uso
    updateUsageResetDate();

    console.log("✅ Página de facturación inicializada");
});

// =====================================================
// ESPERAR DASHBOARD API
// =====================================================

function waitForDashboardAPI() {
    return new Promise((resolve) => {
        if (window.dashboardAPI) {
            resolve();
            return;
        }

        const checkInterval = setInterval(() => {
            if (window.dashboardAPI) {
                clearInterval(checkInterval);
                resolve();
            }
        }, 100);

        setTimeout(() => {
            clearInterval(checkInterval);
            resolve();
        }, 5000);
    });
}

// =====================================================
// VERIFICAR ESTADO DEL CHECKOUT
// =====================================================

function checkCheckoutStatus() {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get('success') === 'true') {
        if (window.VelvzNotify) {
            VelvzNotify.success('¡Bienvenido a tu nuevo plan! Tu período de prueba de 14 días ha comenzado.');
        }
        // Limpiar URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (urlParams.get('canceled') === 'true') {
        if (window.VelvzNotify) {
            VelvzNotify.info('Proceso de upgrade cancelado. Puedes intentarlo cuando quieras.');
        }
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// =====================================================
// CARGAR ESTADO DE BILLING DESDE BACKEND
// =====================================================

async function loadBillingStatus() {
    try {
        const response = await fetch(`${API_URL}/api/billing/status`, {
            headers: {
                'Authorization': `Bearer ${window.dashboardAPI.token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (result.success) {
            const data = result.data;

            // Actualizar estado
            currentUserPlan = data.plan || 'starter';
            currentUsage = data.usage || { chatbots: 0, messages: 0, documents: 0 };
            currentLimits = data.limits || PLANS[currentUserPlan].limits;
            trialDaysLeft = data.subscription?.trialDaysLeft;

            console.log(`📊 Plan actual: ${currentUserPlan}`, data);

            // Actualizar UI
            updatePlanDisplay();
            updateUsageDisplay();
            updatePlansGrid();
            updateTrialBanner();

            // Mostrar/ocultar secciones según el plan
            togglePaidSections(currentUserPlan !== 'starter');
        } else {
            console.warn("Error obteniendo billing status:", result.error);
            // Usar valores por defecto
            currentUserPlan = 'starter';
            updatePlanDisplay();
            updateUsageDisplay();
            updatePlansGrid();
        }

    } catch (error) {
        console.error("Error cargando billing status:", error);
        // Fallback: usar datos locales
        currentUserPlan = window.dashboardAPI?.user?.plan || 'starter';
        await loadUsageDataFallback();
        updatePlanDisplay();
        updateUsageDisplay();
        updatePlansGrid();
    }
}

// =====================================================
// FALLBACK: CARGAR DATOS DE USO LOCALMENTE
// =====================================================

async function loadUsageDataFallback() {
    try {
        const response = await window.dashboardAPI.getChatbots();

        if (response.success) {
            const chatbots = response.data.chatbots || [];
            currentUsage.chatbots = chatbots.length;
            currentUsage.messages = 0;

            let totalDocs = 0;
            chatbots.forEach(c => {
                const docCount = parseInt(c.documents_count, 10);
                if (!isNaN(docCount)) {
                    totalDocs += docCount;
                }
            });
            currentUsage.documents = totalDocs;
        }
    } catch (error) {
        console.error("Error cargando datos de uso:", error);
    }
}

// =====================================================
// ACTUALIZAR DISPLAY DEL PLAN
// =====================================================

function updatePlanDisplay() {
    const plan = PLANS[currentUserPlan];
    if (!plan) return;

    // Badge
    const badge = document.getElementById('planBadge');
    if (badge) {
        badge.textContent = plan.badge;
        badge.className = 'billing__plan-badge ' + (plan.badgeClass || '');
    }

    // Nombre del plan
    const planName = document.getElementById('planName');
    if (planName) {
        planName.textContent = plan.displayName;
    }

    // Precio
    const planAmount = document.getElementById('planAmount');
    if (planAmount) {
        planAmount.textContent = plan.price + '€';
    }
}

// =====================================================
// ACTUALIZAR TRIAL BANNER
// =====================================================

function updateTrialBanner() {
    const trialBanner = document.getElementById('trialBanner');
    const trialDaysEl = document.getElementById('trialDays');

    if (trialDaysLeft && trialDaysLeft > 0) {
        if (trialBanner) trialBanner.style.display = 'flex';
        if (trialDaysEl) trialDaysEl.textContent = trialDaysLeft;
    } else {
        if (trialBanner) trialBanner.style.display = 'none';
    }
}

// =====================================================
// ACTUALIZAR DISPLAY DE USO
// =====================================================

function updateUsageDisplay() {
    const limits = currentLimits;

    // Chatbots
    updateUsageBar('chatbots', currentUsage.chatbots, limits.chatbots);

    // Mensajes
    updateUsageBar('messages', currentUsage.messages, limits.messages);

    // Documentos
    updateUsageBar('docs', currentUsage.documents, limits.documents);
}

function updateUsageBar(type, used, limit) {
    const usedEl = document.getElementById(`${type}Used`);
    const limitEl = document.getElementById(`${type}Limit`);
    const progressEl = document.getElementById(`${type}Progress`);

    if (usedEl) usedEl.textContent = used;
    if (limitEl) limitEl.textContent = limit === -1 ? '∞' : limit;

    if (progressEl) {
        const percentage = limit === -1 ? 10 : Math.min((used / limit) * 100, 100);
        progressEl.style.width = `${percentage}%`;

        if (limit !== -1 && used >= limit) {
            progressEl.classList.add('billing__usage-progress--exceeded');
        } else {
            progressEl.classList.remove('billing__usage-progress--exceeded');
        }
    }
}

function updateUsageResetDate() {
    const resetEl = document.getElementById('usageResetDate');
    if (!resetEl) return;

    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const options = { day: 'numeric', month: 'long' };
    resetEl.textContent = nextMonth.toLocaleDateString('es-ES', options);
}

// =====================================================
// ACTUALIZAR GRID DE PLANES
// =====================================================

function updatePlansGrid() {
    const planOptions = document.querySelectorAll('.billing__plan-option');

    planOptions.forEach(option => {
        const planId = option.dataset.plan;
        const badge = option.querySelector('.billing__plan-option-badge');
        const btn = option.querySelector('.billing__plan-option-btn');
        const infoContainer = option.querySelector('.billing__plan-option-info');

        // Quitar clases de current
        option.classList.remove('billing__plan-option--current');

        if (planId === currentUserPlan) {
            option.classList.add('billing__plan-option--current');

            if (badge) {
                badge.textContent = 'Tu plan actual';
                badge.className = 'billing__plan-option-badge billing__plan-option-badge--current';
            } else if (infoContainer && !infoContainer.querySelector('.billing__plan-option-badge')) {
                const newBadge = document.createElement('span');
                newBadge.className = 'billing__plan-option-badge billing__plan-option-badge--current';
                newBadge.textContent = 'Tu plan actual';
                infoContainer.appendChild(newBadge);
            }

            if (btn) btn.style.display = 'none';
        } else {
            if (badge && badge.classList.contains('billing__plan-option-badge--current')) {
                badge.remove();
            }
            if (btn) btn.style.display = 'block';
        }
    });
}

// =====================================================
// TOGGLE SECCIONES DE PAGO
// =====================================================

function togglePaidSections(show) {
    const paymentCard = document.getElementById('paymentMethodCard');
    const invoicesCard = document.getElementById('invoicesCard');
    const dangerZone = document.getElementById('dangerZone');

    if (paymentCard) paymentCard.style.display = show ? 'block' : 'none';
    if (invoicesCard) invoicesCard.style.display = show ? 'block' : 'none';
    if (dangerZone) dangerZone.style.display = show ? 'block' : 'none';
}

// =====================================================
// EVENT LISTENERS
// =====================================================

function setupEventListeners() {
    // Botones de upgrade en los planes
    const planUpgradeBtns = document.querySelectorAll('.billing__plan-option-btn');
    planUpgradeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const plan = btn.dataset.plan || btn.closest('.billing__plan-option')?.dataset.plan;
            if (plan) handleUpgrade(plan);
        });
    });

    // Modal de upgrade (por si se quiere usar el modal en vez de redirect)
    setupUpgradeModal();

    // Botón cancelar suscripción
    const cancelSubBtn = document.getElementById('cancelSubscriptionBtn');
    if (cancelSubBtn) {
        cancelSubBtn.addEventListener('click', handleCancelSubscription);
    }

    // Logout
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }

    const mobileLogout = document.getElementById('mobileLogout');
    if (mobileLogout) {
        mobileLogout.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
}

// =====================================================
// UPGRADE A STRIPE CHECKOUT
// =====================================================

async function handleUpgrade(planId) {
    if (planId === 'starter' || planId === currentUserPlan) return;

    const btn = document.querySelector(`.billing__plan-option[data-plan="${planId}"] .billing__plan-option-btn`);
    const originalText = btn?.innerHTML;

    try {
        if (btn) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redirigiendo...';
            btn.disabled = true;
        }

        console.log(`🚀 Iniciando checkout para plan: ${planId}`);

        const response = await fetch(`${API_URL}/api/billing/create-checkout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${window.dashboardAPI.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ planId })
        });

        const result = await response.json();

        if (result.success && result.data.url) {
            // Redirigir a Stripe Checkout
            window.location.href = result.data.url;
        } else {
            throw new Error(result.error || 'Error al crear sesión de pago');
        }

    } catch (error) {
        console.error("Error en upgrade:", error);
        if (window.VelvzNotify) {
            VelvzNotify.error(error.message || 'Error al procesar. Inténtalo de nuevo.');
        } else {
            alert('Error al procesar. Inténtalo de nuevo.');
        }

        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
}

// =====================================================
// MODAL DE UPGRADE (alternativo)
// =====================================================

function setupUpgradeModal() {
    const modal = document.getElementById('upgradeModal');
    const backdrop = modal?.querySelector('.billing__modal-backdrop');
    const closeBtn = document.getElementById('closeUpgradeModal');
    const cancelBtn = document.getElementById('cancelUpgradeBtn');
    const confirmBtn = document.getElementById('confirmUpgradeBtn');

    const closeModal = () => {
        modal?.classList.remove('billing__modal--active');
        document.body.style.overflow = '';
    };

    if (backdrop) backdrop.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.classList.contains('billing__modal--active')) {
            closeModal();
        }
    });

    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            closeModal();
            handleUpgrade(selectedUpgradePlan);
        });
    }
}

function openUpgradeModal(plan = 'pro') {
    const modal = document.getElementById('upgradeModal');
    if (!modal) return;

    selectedUpgradePlan = plan;
    const planData = PLANS[plan];

    const titleEl = document.getElementById('modalPlanTitle');
    const priceEl = document.getElementById('modalPlanPrice');

    if (titleEl) titleEl.textContent = `Upgrade a ${planData.name}`;
    if (priceEl) priceEl.textContent = `${planData.price}€/mes`;

    const featuresEl = document.getElementById('modalFeatures');
    if (featuresEl) {
        const features = [];
        if (plan === 'pro') {
            features.push('20 chatbots', '10,000 mensajes', 'Crawling automático', 'Estadísticas completas', 'Dominios ilimitados', 'Soporte prioritario');
        } else if (plan === 'business') {
            features.push('Chatbots ilimitados', '50,000 mensajes', 'Icono personalizado', 'Fuente personalizada', 'White label', 'Soporte dedicado');
        }

        featuresEl.innerHTML = `
            <ul>
                ${features.map(f => `<li><i class="fas fa-check"></i> ${f}</li>`).join('')}
            </ul>
        `;
    }

    modal.classList.add('billing__modal--active');
    document.body.style.overflow = 'hidden';
}

// =====================================================
// CANCELAR SUSCRIPCIÓN
// =====================================================

async function handleCancelSubscription() {
    const confirmed = confirm(
        '¿Estás seguro de que quieres cancelar tu suscripción?\n\n' +
        'Tu cuenta volverá al plan Starter al final del período de facturación actual.'
    );

    if (!confirmed) return;

    try {
        const response = await fetch(`${API_URL}/api/billing/cancel`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${window.dashboardAPI.token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (result.success) {
            if (window.VelvzNotify) {
                VelvzNotify.info('Tu suscripción se cancelará al final del período actual.');
            } else {
                alert('Tu suscripción se cancelará al final del período actual.');
            }
            // Recargar datos
            await loadBillingStatus();
        } else {
            throw new Error(result.error);
        }

    } catch (error) {
        console.error("Error cancelando suscripción:", error);
        if (window.VelvzNotify) {
            VelvzNotify.error(error.message || 'Error al cancelar. Inténtalo de nuevo.');
        }
    }
}

// =====================================================
// LOGOUT
// =====================================================

function handleLogout() {
    if (window.dashboardAPI) {
        window.dashboardAPI.logout();
    }
    window.location.href = '/cuenta/';
}

console.log("✅ billing.js cargado");

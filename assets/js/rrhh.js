// =====================================================
// RRHH IA - GESTIÓN DE PROCESOS DE SELECCIÓN
// =====================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🧑‍💼 Inicializando RRHH IA...');

    // Inicializar la página
    initRRHHPage();
});

// =====================================================
// INICIALIZACIÓN
// =====================================================

function initRRHHPage() {
    // Setup modal
    setupCreateProcessModal();

    // Setup filtros
    setupFilters();

    // Setup búsqueda
    setupSearch();

    // Cargar procesos (por ahora mostrar estado vacío)
    loadProcesses();
}

// =====================================================
// MODAL CREAR PROCESO
// =====================================================

function setupCreateProcessModal() {
    const modal = document.getElementById('createProcessModal');
    const createBtn = document.getElementById('createProcessBtn');
    const createFirstBtn = document.getElementById('createFirstProcessBtn');
    const closeBtn = document.getElementById('closeCreateModal');
    const cancelBtn = document.getElementById('cancelCreateModal');
    const backdrop = modal?.querySelector('.velvz-modal__backdrop');
    const form = document.getElementById('createProcessForm');

    // Abrir modal
    const openModal = () => {
        if (modal) {
            modal.classList.add('velvz-modal--active');
            document.body.style.overflow = 'hidden';
        }
    };

    // Cerrar modal
    const closeModal = () => {
        if (modal) {
            modal.classList.remove('velvz-modal--active');
            document.body.style.overflow = '';
            if (form) form.reset();
        }
    };

    // Event listeners
    createBtn?.addEventListener('click', openModal);
    createFirstBtn?.addEventListener('click', openModal);
    closeBtn?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);
    backdrop?.addEventListener('click', closeModal);

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.classList.contains('velvz-modal--active')) {
            closeModal();
        }
    });

    // Submit del formulario
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await createProcess();
    });
}

// =====================================================
// CREAR PROCESO
// =====================================================

async function createProcess() {
    const name = document.getElementById('processName')?.value?.trim();
    const department = document.getElementById('processDepartment')?.value;
    const location = document.getElementById('processLocation')?.value?.trim();
    const description = document.getElementById('processDescription')?.value?.trim();
    const requirements = document.getElementById('processRequirements')?.value?.trim();
    const niceToHave = document.getElementById('processNiceToHave')?.value?.trim();
    const experience = document.getElementById('processExperience')?.value;
    const salary = document.getElementById('processSalary')?.value?.trim();

    if (!name) {
        showNotification('Por favor, introduce el nombre del puesto', 'error');
        return;
    }

    // Mostrar loading
    showGlobalLoading('Creando proceso de selección...', 'Configurando análisis de IA');

    try {
        const token = localStorage.getItem('velvz_token');
        if (!token) {
            throw new Error('No hay sesión activa');
        }

        // Por ahora simular la creación (cuando haya backend se conectará)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Crear objeto del proceso
        const process = {
            id: 'proc_' + Date.now(),
            name,
            department,
            location,
            description,
            requirements,
            niceToHave,
            experience,
            salary,
            status: 'active',
            candidates: 0,
            shortlisted: 0,
            createdAt: new Date().toISOString()
        };

        // Guardar en localStorage temporalmente
        const processes = JSON.parse(localStorage.getItem('velvz_rrhh_processes') || '[]');
        processes.push(process);
        localStorage.setItem('velvz_rrhh_processes', JSON.stringify(processes));

        // Cerrar modal
        const modal = document.getElementById('createProcessModal');
        modal?.classList.remove('velvz-modal--active');
        document.body.style.overflow = '';
        document.getElementById('createProcessForm')?.reset();

        // Ocultar loading
        hideGlobalLoading();

        // Mostrar notificación
        showNotification('Proceso creado correctamente', 'success');

        // Recargar lista
        loadProcesses();

    } catch (error) {
        console.error('Error creando proceso:', error);
        hideGlobalLoading();
        showNotification('Error al crear el proceso: ' + error.message, 'error');
    }
}

// =====================================================
// CARGAR PROCESOS
// =====================================================

function loadProcesses() {
    const loadingEl = document.getElementById('processesLoading');
    const emptyEl = document.getElementById('emptyProcesses');
    const gridEl = document.getElementById('processesGrid');

    // Obtener procesos del localStorage
    const processes = JSON.parse(localStorage.getItem('velvz_rrhh_processes') || '[]');

    // Actualizar estadísticas
    updateStats(processes);

    // Actualizar contadores de filtros
    updateFilterCounts(processes);

    if (processes.length === 0) {
        // Mostrar estado vacío
        loadingEl && (loadingEl.style.display = 'none');
        emptyEl && (emptyEl.style.display = 'flex');
        gridEl && (gridEl.style.display = 'none');
    } else {
        // Mostrar grid con procesos
        loadingEl && (loadingEl.style.display = 'none');
        emptyEl && (emptyEl.style.display = 'none');
        gridEl && (gridEl.style.display = 'grid');

        renderProcesses(processes);
    }
}

// =====================================================
// RENDERIZAR PROCESOS
// =====================================================

function renderProcesses(processes) {
    const grid = document.getElementById('processesGrid');
    if (!grid) return;

    grid.innerHTML = processes.map(process => `
        <div class="velvz-process-card" data-id="${process.id}">
            <div class="velvz-process-card__header">
                <div class="velvz-process-card__icon">
                    <i class="fas fa-briefcase"></i>
                </div>
                <span class="velvz-process-card__status velvz-process-card__status--${process.status}">
                    ${getStatusText(process.status)}
                </span>
            </div>
            <h3 class="velvz-process-card__title">${escapeHtml(process.name)}</h3>
            <p class="velvz-process-card__department">
                ${getDepartmentText(process.department)}${process.location ? ' · ' + escapeHtml(process.location) : ''}
            </p>
            <div class="velvz-process-card__stats">
                <div class="velvz-process-card__stat">
                    <span class="velvz-process-card__stat-value">${process.candidates || 0}</span>
                    <span class="velvz-process-card__stat-label">Candidatos</span>
                </div>
                <div class="velvz-process-card__stat">
                    <span class="velvz-process-card__stat-value">${process.shortlisted || 0}</span>
                    <span class="velvz-process-card__stat-label">Preseleccionados</span>
                </div>
            </div>
        </div>
    `).join('');

    // Añadir event listeners a las tarjetas
    grid.querySelectorAll('.velvz-process-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            // Por ahora mostrar alerta, luego navegar a detalle
            showNotification('Próximamente: Detalle del proceso', 'info');
        });
    });
}

// =====================================================
// ACTUALIZAR ESTADÍSTICAS
// =====================================================

function updateStats(processes) {
    const activeProcesses = processes.filter(p => p.status === 'active').length;
    const totalCandidates = processes.reduce((sum, p) => sum + (p.candidates || 0), 0);
    const shortlisted = processes.reduce((sum, p) => sum + (p.shortlisted || 0), 0);

    const statProcesses = document.getElementById('statTotalProcesses');
    const statCandidates = document.getElementById('statTotalCandidates');
    const statShortlisted = document.getElementById('statShortlisted');

    if (statProcesses) statProcesses.textContent = activeProcesses;
    if (statCandidates) statCandidates.textContent = totalCandidates;
    if (statShortlisted) statShortlisted.textContent = shortlisted;
}

// =====================================================
// FILTROS
// =====================================================

function setupFilters() {
    const filterPills = document.querySelectorAll('.velvz-filter-pill');

    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            // Quitar activo de todos
            filterPills.forEach(p => p.classList.remove('velvz-filter-pill--active'));
            // Añadir activo al clickeado
            pill.classList.add('velvz-filter-pill--active');

            // Filtrar procesos
            const filter = pill.dataset.filter;
            filterProcesses(filter);
        });
    });
}

function filterProcesses(filter) {
    let processes = JSON.parse(localStorage.getItem('velvz_rrhh_processes') || '[]');

    if (filter === 'active') {
        processes = processes.filter(p => p.status === 'active');
    } else if (filter === 'closed') {
        processes = processes.filter(p => p.status === 'closed');
    }

    const gridEl = document.getElementById('processesGrid');
    const emptyEl = document.getElementById('emptyProcesses');

    if (processes.length === 0) {
        gridEl && (gridEl.style.display = 'none');
        emptyEl && (emptyEl.style.display = 'flex');
    } else {
        gridEl && (gridEl.style.display = 'grid');
        emptyEl && (emptyEl.style.display = 'none');
        renderProcesses(processes);
    }
}

function updateFilterCounts(processes) {
    const allCount = document.getElementById('allCount');
    const activeCount = document.getElementById('activeCount');
    const closedCount = document.getElementById('closedCount');

    const active = processes.filter(p => p.status === 'active').length;
    const closed = processes.filter(p => p.status === 'closed').length;

    if (allCount) allCount.textContent = processes.length;
    if (activeCount) activeCount.textContent = active;
    if (closedCount) closedCount.textContent = closed;
}

// =====================================================
// BÚSQUEDA
// =====================================================

function setupSearch() {
    const searchInput = document.getElementById('processSearch');

    searchInput?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        let processes = JSON.parse(localStorage.getItem('velvz_rrhh_processes') || '[]');

        if (query) {
            processes = processes.filter(p =>
                p.name.toLowerCase().includes(query) ||
                (p.department && p.department.toLowerCase().includes(query)) ||
                (p.location && p.location.toLowerCase().includes(query))
            );
        }

        const gridEl = document.getElementById('processesGrid');
        const emptyEl = document.getElementById('emptyProcesses');

        if (processes.length === 0 && query) {
            gridEl && (gridEl.style.display = 'none');
            // Mostrar mensaje de no resultados
        } else if (processes.length === 0) {
            gridEl && (gridEl.style.display = 'none');
            emptyEl && (emptyEl.style.display = 'flex');
        } else {
            gridEl && (gridEl.style.display = 'grid');
            emptyEl && (emptyEl.style.display = 'none');
            renderProcesses(processes);
        }
    });
}

// =====================================================
// HELPERS
// =====================================================

function getStatusText(status) {
    const statusMap = {
        'active': 'Activo',
        'closed': 'Cerrado',
        'paused': 'Pausado'
    };
    return statusMap[status] || status;
}

function getDepartmentText(dept) {
    const deptMap = {
        'tech': 'Tecnología',
        'marketing': 'Marketing',
        'sales': 'Ventas',
        'hr': 'Recursos Humanos',
        'finance': 'Finanzas',
        'operations': 'Operaciones',
        'other': 'Otro'
    };
    return deptMap[dept] || dept || 'Sin departamento';
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// =====================================================
// LOADING Y NOTIFICACIONES
// =====================================================

function showGlobalLoading(text, subtitle) {
    const overlay = document.getElementById('globalLoadingOverlay');
    const textEl = document.getElementById('loadingText');
    const subtitleEl = document.getElementById('loadingSubtitle');

    if (textEl) textEl.textContent = text || 'Cargando...';
    if (subtitleEl) subtitleEl.textContent = subtitle || '';
    if (overlay) overlay.classList.add('velvz-loading-overlay--active');
}

function hideGlobalLoading() {
    const overlay = document.getElementById('globalLoadingOverlay');
    if (overlay) overlay.classList.remove('velvz-loading-overlay--active');
}

function showNotification(message, type = 'info') {
    // Usar el sistema de notificaciones si existe
    if (typeof window.velvzNotifications !== 'undefined') {
        window.velvzNotifications.show(message, type);
    } else {
        // Fallback simple
        console.log(`[${type.toUpperCase()}] ${message}`);

        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = `velvz-notification velvz-notification--${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: var(--dark-bg-secondary);
            border: 1px solid var(--dark-border);
            border-radius: 12px;
            color: var(--dark-text);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            z-index: 10000;
            animation: slideInUp 0.3s ease;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(10px)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

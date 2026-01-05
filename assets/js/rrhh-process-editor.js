// =====================================================
// EDITOR DE PROCESOS RRHH - FUNCIONALIDAD JS
// =====================================================

console.log("🚀 rrhh-process-editor.js cargando...");

// Variables globales
let currentProcess = null;
let originalData = null;
let hasUnsavedChanges = false;
let isLoading = false;
let currentSection = 1;
const totalSections = 5;

// =====================================================
// INICIALIZACIÓN PRINCIPAL
// =====================================================

document.addEventListener("DOMContentLoaded", function () {
    console.log("🔧 DOM cargado, inicializando editor de procesos...");

    // Configurar navegación inmediatamente (no depende de la API)
    setupTabNavigation();
    setupEventListeners();
    setupDynamicElements();

    // Obtener ID del proceso (si es edición)
    const processId = getProcessIdFromUrl();

    // Las funciones que dependen de la API las ejecutamos después
    waitForDashboardAPI().then(() => {
        try {
            setupWeightSliders();
            setupFileUploads();

            // Si hay ID, cargar proceso existente
            if (processId) {
                loadProcessData(processId);
            } else {
                // Nuevo proceso - inicializar valores por defecto
                initializeNewProcess();
            }

            hideLoading();
            console.log("✅ Editor inicializado correctamente");
        } catch (error) {
            console.error("❌ Error inicializando aplicación:", error);
            hideLoading();
        }
    });
});

// =====================================================
// ESPERAR DASHBOARD API
// =====================================================

function waitForDashboardAPI() {
    return new Promise((resolve) => {
        if (window.dashboardAPI) {
            console.log("✅ Dashboard API ya disponible");
            resolve();
            return;
        }

        const checkInterval = setInterval(() => {
            if (window.dashboardAPI) {
                console.log("✅ Dashboard API cargado");
                clearInterval(checkInterval);
                resolve();
            }
        }, 50); // Más rápido

        // Timeout de seguridad más corto
        setTimeout(() => {
            clearInterval(checkInterval);
            console.warn("⚠️ Timeout esperando Dashboard API");
            resolve();
        }, 2000);
    });
}

// =====================================================
// OBTENER ID DEL PROCESO
// =====================================================

function getProcessIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

// =====================================================
// INICIALIZAR APLICACIÓN
// =====================================================

async function initializeApp(processId) {
    try {
        showLoading("Inicializando editor...");

        // Configurar interfaz
        setupTabNavigation();
        setupEventListeners();
        setupDynamicElements();
        setupWeightSliders();
        setupFileUploads();

        // Si hay ID, cargar proceso existente
        if (processId) {
            await loadProcessData(processId);
        } else {
            // Nuevo proceso - inicializar valores por defecto
            initializeNewProcess();
        }

        hideLoading();
        console.log("✅ Editor inicializado correctamente");
    } catch (error) {
        console.error("❌ Error en inicialización:", error);
        hideLoading();
        throw error;
    }
}

// =====================================================
// NAVEGACIÓN POR PESTAÑAS/SECCIONES
// =====================================================

function setupTabNavigation() {
    console.log("🔧 Configurando navegación por secciones...");

    // Usar las clases de tabs estilo chatbots
    const tabs = document.querySelectorAll(".velvz-config__tab");
    const sections = document.querySelectorAll(".process-section");

    // Mapeo de tabs por nombre
    const tabOrder = ["position", "filtering", "interview", "documents", "summary"];

    tabs.forEach((tab) => {
        tab.addEventListener("click", function () {
            const targetTabName = this.dataset.tab;
            const targetSection = tabOrder.indexOf(targetTabName) + 1;

            // Validar sección anterior antes de avanzar
            if (targetSection > currentSection) {
                if (!validateCurrentSection()) {
                    showWarning("Por favor, completa los campos requeridos antes de continuar");
                    return;
                }
            }

            navigateToSection(targetSection);
        });
    });

    // Botones de navegación (siguiente/anterior) dentro de cada sección
    document.querySelectorAll(".btn--next").forEach((btn) => {
        btn.addEventListener("click", () => {
            if (currentSection < totalSections) {
                if (validateCurrentSection()) {
                    navigateToSection(currentSection + 1);
                } else {
                    showWarning("Por favor, completa los campos requeridos");
                }
            }
        });
    });

    document.querySelectorAll(".btn--prev").forEach((btn) => {
        btn.addEventListener("click", () => {
            if (currentSection > 1) {
                navigateToSection(currentSection - 1);
            }
        });
    });

    // Mostrar primera sección
    navigateToSection(1);

    console.log("✅ Navegación configurada");
}

function navigateToSection(sectionNumber) {
    currentSection = sectionNumber;

    // Mapeo de tabs por nombre
    const tabOrder = ["position", "filtering", "interview", "documents", "summary"];
    const currentTabName = tabOrder[currentSection - 1];

    // Actualizar tabs (estilo chatbots)
    const tabs = document.querySelectorAll(".velvz-config__tab");
    tabs.forEach((tab) => {
        const tabName = tab.dataset.tab;
        const tabIndex = tabOrder.indexOf(tabName) + 1;

        tab.classList.remove("velvz-config__tab--active");

        if (tabIndex === currentSection) {
            tab.classList.add("velvz-config__tab--active");
        }
    });

    // Mostrar/ocultar secciones
    const sections = document.querySelectorAll(".process-section");
    sections.forEach((section) => {
        const sectionTabName = section.dataset.tab;
        if (sectionTabName === currentTabName) {
            section.classList.add("process-section--active");
            section.style.display = "block";
        } else {
            section.classList.remove("process-section--active");
            section.style.display = "none";
        }
    });

    // Actualizar botones de navegación
    updateNavigationButtons();

    // Si es la sección de resumen, actualizar datos
    if (currentSection === 5) {
        updateSummary();
    }

    console.log(`📍 Sección actual: ${currentSection}/${totalSections} (${currentTabName})`);
}

// updateProgressBar eliminado - ya no usamos barra de progreso con el nuevo estilo de tabs

function updateNavigationButtons() {
    // Los botones de navegación están dentro de cada sección (section-nav)
    // No necesitamos ocultarlos/mostrarlos globalmente
    // pero sí podemos actualizar el estado de los botones de publicar
    const publishBtn = document.getElementById("publishBtn");

    if (publishBtn) {
        if (currentSection === totalSections) {
            publishBtn.classList.add("btn--highlight");
        } else {
            publishBtn.classList.remove("btn--highlight");
        }
    }
}

// =====================================================
// VALIDACIÓN DE SECCIONES
// =====================================================

function validateCurrentSection() {
    switch (currentSection) {
        case 1:
            return validatePositionSection();
        case 2:
            return validateFilteringSection();
        case 3:
            return validateInterviewSection();
        case 4:
            return true; // Documentos es opcional
        case 5:
            return true; // Resumen no necesita validación
        default:
            return true;
    }
}

function validatePositionSection() {
    // Validación desactivada durante desarrollo - siempre permitir navegación
    // TODO: Reactivar validación cuando el editor esté completo
    return true;
}

function validateFilteringSection() {
    // Validación desactivada durante desarrollo
    return true;
}

function validateInterviewSection() {
    // Validación desactivada durante desarrollo
    return true;
}

// =====================================================
// EVENT LISTENERS GENERALES
// =====================================================

function setupEventListeners() {
    console.log("🔗 Configurando event listeners...");

    // Marcar cambios en formularios
    const formInputs = document.querySelectorAll("input, textarea, select");
    formInputs.forEach((input) => {
        input.addEventListener("change", markAsChanged);
        input.addEventListener("input", markAsChanged);
    });

    // Contador de caracteres para la descripción
    const jobDescription = document.getElementById("jobDescription");
    const descriptionCount = document.getElementById("descriptionCount");
    if (jobDescription && descriptionCount) {
        jobDescription.addEventListener("input", () => {
            descriptionCount.textContent = jobDescription.value.length;
        });
    }

    // Botón de guardar (header)
    const saveBtn = document.getElementById("saveBtn");
    if (saveBtn) {
        saveBtn.addEventListener("click", handleSaveDraft);
    }

    // Botón de publicar (en sección resumen)
    const publishBtn = document.getElementById("publishBtn");
    if (publishBtn) {
        publishBtn.addEventListener("click", handlePublish);
    }

    // Navegación con cambios sin guardar
    window.addEventListener("beforeunload", (e) => {
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = "¿Estás seguro de que quieres salir? Los cambios no guardados se perderán.";
        }
    });

    console.log("✅ Event listeners configurados");
}

// =====================================================
// ELEMENTOS DINÁMICOS (Añadir requisitos, idiomas, etc.)
// =====================================================

function setupDynamicElements() {
    console.log("🔧 Configurando elementos dinámicos...");

    // Botones para añadir requisitos
    setupAddRequirementButtons();

    // Botones para añadir idiomas
    setupAddLanguageButton();

    // Botones para añadir preguntas personalizadas
    setupAddQuestionButton();

    // Selector de tipo de entrevista
    setupInterviewTypeSelector();

    console.log("✅ Elementos dinámicos configurados");
}

function setupAddRequirementButtons() {
    // Requisitos esenciales
    const addEssentialBtn = document.getElementById("addEssentialBtn");
    if (addEssentialBtn) {
        addEssentialBtn.addEventListener("click", () => {
            addRequirementItem("essential");
        });
    }

    // Requisitos deseados
    const addDesiredBtn = document.getElementById("addDesiredBtn");
    if (addDesiredBtn) {
        addDesiredBtn.addEventListener("click", () => {
            addRequirementItem("desired");
        });
    }

    // Requisitos valorables
    const addNiceBtn = document.getElementById("addNiceBtn");
    if (addNiceBtn) {
        addNiceBtn.addEventListener("click", () => {
            addRequirementItem("nice");
        });
    }

    // Event delegation para eliminar requisitos
    document.addEventListener("click", (e) => {
        if (e.target.closest(".remove-requirement-btn")) {
            const item = e.target.closest(".requirement-item");
            if (item) {
                item.remove();
                markAsChanged();
            }
        }
    });
}

function addRequirementItem(type) {
    const container = document.getElementById(`${type}Requirements`);
    if (!container) return;

    const item = document.createElement("div");
    item.className = "requirement-item";
    item.innerHTML = `
        <input type="text" class="requirement-input" placeholder="Escribe el requisito...">
        <button type="button" class="remove-requirement-btn">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(item);

    // Focus en el nuevo input
    const input = item.querySelector("input");
    if (input) input.focus();

    markAsChanged();
}

function setupAddLanguageButton() {
    const addLanguageBtn = document.getElementById("addLanguageBtn");
    if (addLanguageBtn) {
        addLanguageBtn.addEventListener("click", addLanguageItem);
    }

    // Event delegation para eliminar idiomas
    document.addEventListener("click", (e) => {
        if (e.target.closest(".remove-language-btn")) {
            const item = e.target.closest(".language-item");
            if (item) {
                item.remove();
                markAsChanged();
            }
        }
    });
}

function addLanguageItem() {
    const container = document.getElementById("languagesList");
    if (!container) return;

    const item = document.createElement("div");
    item.className = "language-item";
    item.innerHTML = `
        <select class="language-select">
            <option value="">Seleccionar idioma</option>
            <option value="es">Español</option>
            <option value="en">Inglés</option>
            <option value="fr">Francés</option>
            <option value="de">Alemán</option>
            <option value="pt">Portugués</option>
            <option value="it">Italiano</option>
            <option value="zh">Chino</option>
            <option value="ja">Japonés</option>
            <option value="other">Otro</option>
        </select>
        <select class="level-select">
            <option value="">Nivel</option>
            <option value="basic">Básico</option>
            <option value="intermediate">Intermedio</option>
            <option value="advanced">Avanzado</option>
            <option value="native">Nativo</option>
        </select>
        <button type="button" class="remove-language-btn">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(item);
    markAsChanged();
}

function setupAddQuestionButton() {
    const addQuestionBtn = document.getElementById("addCustomQuestionBtn");
    if (addQuestionBtn) {
        addQuestionBtn.addEventListener("click", addCustomQuestion);
    }

    // Event delegation para eliminar preguntas
    document.addEventListener("click", (e) => {
        if (e.target.closest(".remove-question-btn")) {
            const item = e.target.closest(".custom-question-item");
            if (item) {
                item.remove();
                markAsChanged();
            }
        }
    });
}

function addCustomQuestion() {
    const container = document.getElementById("customQuestionsContainer");
    if (!container) return;

    const questionCount = container.querySelectorAll(".custom-question-item").length + 1;

    const item = document.createElement("div");
    item.className = "custom-question-item";
    item.innerHTML = `
        <div class="question-header">
            <span class="question-number">Pregunta ${questionCount}</span>
            <button type="button" class="remove-question-btn">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <textarea class="question-input" placeholder="Escribe tu pregunta personalizada..." rows="2"></textarea>
    `;

    container.appendChild(item);

    // Focus en el textarea
    const textarea = item.querySelector("textarea");
    if (textarea) textarea.focus();

    markAsChanged();
}

function setupInterviewTypeSelector() {
    const typeCards = document.querySelectorAll(".interview-type-card");

    typeCards.forEach((card) => {
        card.addEventListener("click", function () {
            // Remover selección anterior
            typeCards.forEach((c) => c.classList.remove("selected"));

            // Añadir selección
            this.classList.add("selected");

            markAsChanged();
            console.log(`📋 Tipo de entrevista seleccionado: ${this.dataset.type}`);
        });
    });
}

// =====================================================
// SLIDERS DE PESOS
// =====================================================

function setupWeightSliders() {
    console.log("🔧 Configurando sliders de pesos...");

    const sliders = document.querySelectorAll(".weight-slider");

    sliders.forEach((slider) => {
        const valueDisplay = slider.parentElement.querySelector(".weight-value");

        slider.addEventListener("input", function () {
            if (valueDisplay) {
                valueDisplay.textContent = `${this.value}%`;
            }
            updateTotalWeight();
            markAsChanged();
        });
    });

    // Calcular peso total inicial
    updateTotalWeight();

    console.log("✅ Sliders configurados");
}

function updateTotalWeight() {
    const sliders = document.querySelectorAll(".weight-slider");
    let total = 0;

    sliders.forEach((slider) => {
        total += parseInt(slider.value) || 0;
    });

    const totalDisplay = document.getElementById("totalWeight");
    if (totalDisplay) {
        totalDisplay.textContent = `${total}%`;

        // Advertencia si no suma 100%
        if (total !== 100) {
            totalDisplay.classList.add("warning");
        } else {
            totalDisplay.classList.remove("warning");
        }
    }
}

// =====================================================
// SUBIDA DE ARCHIVOS
// =====================================================

function setupFileUploads() {
    console.log("🔧 Configurando zonas de subida de archivos...");

    // Zona de documentos
    setupUploadZone("documentsUploadZone", "documentsInput", handleDocumentUpload);

    // Zona de CVs
    setupUploadZone("cvsUploadZone", "cvsInput", handleCVUpload);

    console.log("✅ Zonas de subida configuradas");
}

function setupUploadZone(zoneId, inputId, handler) {
    const zone = document.getElementById(zoneId);
    const input = document.getElementById(inputId);

    if (!zone || !input) return;

    // Click para abrir selector de archivos
    zone.addEventListener("click", () => input.click());

    // Drag & drop
    zone.addEventListener("dragover", (e) => {
        e.preventDefault();
        zone.classList.add("dragover");
    });

    zone.addEventListener("dragleave", () => {
        zone.classList.remove("dragover");
    });

    zone.addEventListener("drop", (e) => {
        e.preventDefault();
        zone.classList.remove("dragover");
        const files = e.dataTransfer.files;
        handler(files);
    });

    // Input change
    input.addEventListener("change", (e) => {
        handler(e.target.files);
    });
}

function handleDocumentUpload(files) {
    console.log("📄 Subiendo documentos:", files.length);

    const container = document.getElementById("uploadedDocuments");
    if (!container) return;

    Array.from(files).forEach((file) => {
        const item = createUploadedFileItem(file, "document");
        container.appendChild(item);
    });

    markAsChanged();
}

function handleCVUpload(files) {
    console.log("📋 Subiendo CVs:", files.length);

    const container = document.getElementById("uploadedCVs");
    if (!container) return;

    Array.from(files).forEach((file) => {
        const item = createUploadedFileItem(file, "cv");
        container.appendChild(item);
    });

    // Actualizar contador
    updateCVCount();
    markAsChanged();
}

function createUploadedFileItem(file, type) {
    const item = document.createElement("div");
    item.className = "uploaded-file-item";
    item.dataset.filename = file.name;

    const icon = getFileIcon(file.name);
    const size = formatFileSize(file.size);

    item.innerHTML = `
        <div class="file-icon">
            <i class="${icon}"></i>
        </div>
        <div class="file-info">
            <span class="file-name">${file.name}</span>
            <span class="file-size">${size}</span>
        </div>
        ${type === "document" ? `
            <div class="file-instructions">
                <input type="text" class="instruction-input" placeholder="Instrucciones para la IA sobre este documento...">
            </div>
        ` : ""}
        <button type="button" class="remove-file-btn">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Event listener para eliminar
    const removeBtn = item.querySelector(".remove-file-btn");
    removeBtn.addEventListener("click", () => {
        item.remove();
        if (type === "cv") updateCVCount();
        markAsChanged();
    });

    return item;
}

function getFileIcon(filename) {
    const ext = filename.split(".").pop().toLowerCase();

    const icons = {
        pdf: "fas fa-file-pdf",
        doc: "fas fa-file-word",
        docx: "fas fa-file-word",
        xls: "fas fa-file-excel",
        xlsx: "fas fa-file-excel",
        ppt: "fas fa-file-powerpoint",
        pptx: "fas fa-file-powerpoint",
        txt: "fas fa-file-alt",
        jpg: "fas fa-file-image",
        jpeg: "fas fa-file-image",
        png: "fas fa-file-image",
        gif: "fas fa-file-image"
    };

    return icons[ext] || "fas fa-file";
}

function formatFileSize(bytes) {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function updateCVCount() {
    const container = document.getElementById("uploadedCVs");
    const countDisplay = document.getElementById("cvCount");

    if (container && countDisplay) {
        const count = container.querySelectorAll(".uploaded-file-item").length;
        countDisplay.textContent = count;
    }
}

// =====================================================
// RESUMEN
// =====================================================

function updateSummary() {
    console.log("📊 Actualizando resumen...");

    // Información del puesto
    const processName = document.getElementById("processName")?.value || "Sin especificar";
    const profileSelect = document.getElementById("profileSelect");
    const profileName = profileSelect?.options[profileSelect.selectedIndex]?.text || "Sin especificar";
    const location = document.getElementById("locationInput")?.value || "Sin especificar";
    const modalitySelect = document.getElementById("modalitySelect");
    const modality = modalitySelect?.options[modalitySelect.selectedIndex]?.text || "Sin especificar";

    // Salario
    const salaryMin = document.getElementById("salaryMin")?.value;
    const salaryMax = document.getElementById("salaryMax")?.value;
    const salaryRange = salaryMin && salaryMax ? `${salaryMin}€ - ${salaryMax}€` : "No especificado";

    // Actualizar tarjeta de puesto - buscar por clase en lugar de ID
    const summaryCards = document.querySelectorAll(".summary-card");

    // Requisitos
    const essentialCount = document.querySelectorAll("#essentialRequirements .requirement-item").length;
    const desiredCount = document.querySelectorAll("#desiredRequirements .requirement-item").length;
    const niceCount = document.querySelectorAll("#niceRequirements .requirement-item").length;
    const languagesCount = document.querySelectorAll("#languagesList .language-item").length;

    // Entrevista
    const selectedType = document.querySelector(".interview-type-card.selected");
    const interviewType = selectedType?.querySelector("h4")?.textContent || "Sin seleccionar";

    // Documentos
    const docCount = document.querySelectorAll("#uploadedDocuments .uploaded-file-item").length;
    const cvCount = document.querySelectorAll("#uploadedCVs .uploaded-file-item").length;

    // Actualizar elementos del resumen si existen
    const summaryContent = document.querySelector('.process-section[data-tab="summary"]');
    if (summaryContent) {
        // Actualizar valores en el resumen
        const summaryItems = {
            'summaryProcessName': processName,
            'summaryProfile': profileName,
            'summaryLocation': location,
            'summaryModality': modality,
            'summarySalary': salaryRange,
            'summaryEssentialCount': essentialCount,
            'summaryDesiredCount': desiredCount,
            'summaryNiceCount': niceCount,
            'summaryLanguagesCount': languagesCount,
            'summaryInterviewType': interviewType,
            'summaryDocsCount': docCount,
            'summaryCvsCount': cvCount
        };

        for (const [id, value] of Object.entries(summaryItems)) {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        }
    }

    console.log("✅ Resumen actualizado");
}

function updateSummaryCard(cardId, data) {
    const card = document.getElementById(cardId);
    if (!card) return;

    const content = card.querySelector(".summary-card-content");
    if (!content) return;

    let html = "";
    for (const [key, value] of Object.entries(data)) {
        html += `
            <div class="summary-item">
                <span class="summary-label">${key}:</span>
                <span class="summary-value">${value}</span>
            </div>
        `;
    }

    content.innerHTML = html;
}

// =====================================================
// GUARDAR Y PUBLICAR
// =====================================================

async function handleSaveDraft() {
    console.log("💾 Guardando borrador...");
    await saveProcess("draft");
}

async function handlePublish() {
    console.log("🚀 Publicando proceso...");

    // Validar todo antes de publicar
    for (let i = 1; i <= totalSections - 1; i++) {
        currentSection = i;
        if (!validateCurrentSection()) {
            navigateToSection(i);
            showWarning("Por favor, completa todos los campos requeridos antes de publicar");
            return;
        }
    }
    currentSection = totalSections;

    await saveProcess("active");
}

async function saveProcess(status) {
    try {
        showLoading("Guardando proceso...");

        const processData = collectFormData();
        processData.status = status;

        console.log("📦 Datos del proceso:", processData);

        // TODO: Enviar al backend cuando esté disponible
        // const response = await window.dashboardAPI.saveProcess(processData);

        // Simulación temporal
        await new Promise(resolve => setTimeout(resolve, 1000));

        hideLoading();
        hasUnsavedChanges = false;

        if (status === "active") {
            showSuccess("Proceso publicado correctamente");
            // Redirigir a la lista de procesos
            setTimeout(() => {
                window.location.href = "/app/rrhh/processes/";
            }, 1500);
        } else {
            showSuccess("Borrador guardado");
        }

    } catch (error) {
        console.error("❌ Error guardando proceso:", error);
        hideLoading();
        showError("Error al guardar: " + error.message);
    }
}

function collectFormData() {
    // Obtener valores de salario
    const salaryMin = document.getElementById("salaryMin")?.value;
    const salaryMax = document.getElementById("salaryMax")?.value;
    const salaryPeriod = document.getElementById("salaryPeriod")?.value;
    const salaryRange = salaryMin && salaryMax ? `${salaryMin}-${salaryMax} €/${salaryPeriod === 'year' ? 'año' : 'mes'}` : null;

    const data = {
        // Información del puesto
        profile_id: document.getElementById("profileSelect")?.value,
        process_name: document.getElementById("processName")?.value,
        department: document.getElementById("departmentSelect")?.value,
        modality: document.getElementById("modalitySelect")?.value,
        location: document.getElementById("locationInput")?.value,
        contract_type: document.getElementById("contractSelect")?.value,
        min_experience: document.getElementById("minExperience")?.value,
        job_description: document.getElementById("jobDescription")?.value,
        salary_min: salaryMin,
        salary_max: salaryMax,
        salary_period: salaryPeriod,
        salary_range: salaryRange,

        // Requisitos
        requirements: {
            essential: collectRequirements("essential"),
            desired: collectRequirements("desired"),
            nice: collectRequirements("nice")
        },

        // Idiomas
        languages: collectLanguages(),

        // Filtrado
        filtering: {
            candidate_limit: document.getElementById("candidateLimit")?.value,
            initial_discard: document.getElementById("initialDiscard")?.value,
            weights: collectWeights(),
            auto_discard: document.getElementById("autoDiscardToggle")?.checked,
            notify_candidates: document.getElementById("notifyCandidatesToggle")?.checked
        },

        // Entrevista
        interview: {
            type: document.querySelector(".interview-type-card.selected")?.dataset.type,
            instructions: document.getElementById("interviewInstructions")?.value,
            aspects: document.getElementById("evaluationAspects")?.value,
            custom_questions: collectCustomQuestions()
        },

        // Documentos
        documents: collectDocuments(),
        cv_instructions: document.getElementById("cvInstructions")?.value
    };

    return data;
}

function collectRequirements(type) {
    const container = document.getElementById(`${type}Requirements`);
    if (!container) return [];

    const items = container.querySelectorAll(".requirement-item input");
    return Array.from(items)
        .map(input => input.value.trim())
        .filter(value => value);
}

function collectLanguages() {
    const container = document.getElementById("languagesList");
    if (!container) return [];

    const items = container.querySelectorAll(".language-item");
    return Array.from(items).map(item => ({
        language: item.querySelector(".language-select")?.value,
        level: item.querySelector(".level-select")?.value
    })).filter(lang => lang.language && lang.level);
}

function collectWeights() {
    const weights = {};
    const sliders = document.querySelectorAll(".weight-slider");

    sliders.forEach(slider => {
        if (slider.id) {
            weights[slider.id] = parseInt(slider.value) || 0;
        }
    });

    return weights;
}

function collectCustomQuestions() {
    const container = document.getElementById("customQuestionsContainer");
    if (!container) return [];

    const items = container.querySelectorAll(".custom-question-item textarea");
    return Array.from(items)
        .map(textarea => textarea.value.trim())
        .filter(value => value);
}

function collectDocuments() {
    const container = document.getElementById("uploadedDocuments");
    if (!container) return [];

    const items = container.querySelectorAll(".uploaded-file-item");
    return Array.from(items).map(item => ({
        filename: item.dataset.filename,
        instructions: item.querySelector(".instruction-input")?.value || ""
    }));
}

// =====================================================
// CARGAR PROCESO EXISTENTE
// =====================================================

async function loadProcessData(processId) {
    try {
        console.log(`📡 Cargando proceso ${processId}...`);

        // TODO: Cargar desde el backend
        // const response = await window.dashboardAPI.getProcess(processId);

        // Simulación temporal
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log("✅ Proceso cargado");

    } catch (error) {
        console.error("❌ Error cargando proceso:", error);
        throw error;
    }
}

function initializeNewProcess() {
    console.log("🆕 Inicializando nuevo proceso");

    // Establecer valores por defecto
    const candidateLimit = document.getElementById("candidateLimit");
    if (candidateLimit) candidateLimit.value = "50";

    const initialDiscard = document.getElementById("initialDiscard");
    if (initialDiscard) initialDiscard.value = "20";

    // Seleccionar tipo de entrevista por defecto
    const conversationalCard = document.querySelector('.interview-type-card[data-type="conversational"]');
    if (conversationalCard) {
        conversationalCard.classList.add("selected");
    }
}

// =====================================================
// UTILIDADES
// =====================================================

function markAsChanged() {
    hasUnsavedChanges = true;
    updateSaveIndicator();
}

function updateSaveIndicator() {
    const indicator = document.getElementById("unsavedIndicator");
    if (indicator) {
        indicator.style.display = hasUnsavedChanges ? "flex" : "none";
    }
}

// =====================================================
// ESTADOS DE UI
// =====================================================

function showLoading(message = "Cargando...") {
    console.log(`⏳ ${message}`);

    let overlay = document.querySelector(".process-loading-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "process-loading-overlay";
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">${message}</div>
            </div>
        `;
        document.body.appendChild(overlay);
    } else {
        overlay.style.display = "flex";
        const text = overlay.querySelector(".loading-text");
        if (text) text.textContent = message;
    }
}

function hideLoading() {
    const overlay = document.querySelector(".process-loading-overlay");
    if (overlay) {
        overlay.style.display = "none";
    }
}

function showError(message) {
    console.error(`Error: ${message}`);
    if (window.VelvzNotify) {
        VelvzNotify.error(message);
    } else {
        alert(message);
    }
}

function showSuccess(message) {
    console.log(`Success: ${message}`);
    if (window.VelvzNotify) {
        VelvzNotify.success(message);
    }
}

function showWarning(message) {
    console.warn(`Warning: ${message}`);
    if (window.VelvzNotify) {
        VelvzNotify.warning(message);
    }
}

function showInfo(message) {
    console.log(`Info: ${message}`);
    if (window.VelvzNotify) {
        VelvzNotify.info(message);
    }
}

// =====================================================
// EXPONER FUNCIONES GLOBALES
// =====================================================

window.processEditor = {
    navigateToSection,
    validateCurrentSection,
    collectFormData,
    updateSummary
};

// =====================================================
// LOG FINAL
// =====================================================

console.log("✅ rrhh-process-editor.js cargado - Esperando DOM...");

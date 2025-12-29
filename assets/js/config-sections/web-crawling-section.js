/**
 * Web Crawling Section JavaScript
 * Maneja toda la funcionalidad de crawling web en la configuración del chatbot
 */

console.log('🚨 [WEB CRAWLING] ============================================');
console.log('🚨 [WEB CRAWLING] SCRIPT FILE LOADED - web-crawling-section.js');
console.log('🚨 [WEB CRAWLING] ============================================');

class WebCrawlingSection {
    constructor() {
        console.log('🚀 [WEB CRAWLING] Constructor called');

        this.currentCrawlingJob = null;
        this.discoveredUrls = [];
        this.crawlingConfig = {
            url: '',
            depth: 2,
            limit: 50,
            contentTypes: ['text', 'pdf'],
            excludePatterns: []
        };

        console.log('🚀 [WEB CRAWLING] Config initialized:', this.crawlingConfig);
        this.init();
    }

    init() {
        console.log('🚀 [WEB CRAWLING] Init called');
        this.bindEvents();
        this.initCustomSelects();
        console.log('🚀 [WEB CRAWLING] Init completed');
    }

    /**
     * Inicializa los custom selects para las opciones avanzadas
     */
    initCustomSelects() {
        const customSelects = document.querySelectorAll('.velvz-custom-select');

        customSelects.forEach(select => {
            const trigger = select.querySelector('.velvz-custom-select__trigger');
            const dropdown = select.querySelector('.velvz-custom-select__dropdown');
            const options = select.querySelectorAll('.velvz-custom-select__option');
            const hiddenInput = document.getElementById(select.dataset.select);
            const textDisplay = select.querySelector('.velvz-custom-select__text');

            if (!trigger || !dropdown) return;

            // Toggle dropdown on trigger click
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                // Cerrar otros selects abiertos
                document.querySelectorAll('.velvz-custom-select--open').forEach(s => {
                    if (s !== select) s.classList.remove('velvz-custom-select--open');
                });

                select.classList.toggle('velvz-custom-select--open');
            });

            // Handle option selection
            options.forEach(option => {
                option.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const value = option.dataset.value;
                    const text = option.querySelector('.velvz-custom-select__option-text').childNodes[0].textContent.trim();

                    // Actualizar el input hidden
                    if (hiddenInput) {
                        hiddenInput.value = value;
                        // Disparar evento change para que el crawlingConfig se actualice
                        hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
                    }

                    // Actualizar el texto mostrado
                    if (textDisplay) {
                        textDisplay.textContent = text;
                    }

                    // Actualizar estados visuales
                    options.forEach(opt => opt.classList.remove('velvz-custom-select__option--selected'));
                    option.classList.add('velvz-custom-select__option--selected');

                    // Cerrar dropdown
                    select.classList.remove('velvz-custom-select--open');

                    // Actualizar config
                    if (select.dataset.select === 'crawlingDepth') {
                        this.crawlingConfig.depth = parseInt(value);
                    } else if (select.dataset.select === 'crawlingLimit') {
                        this.crawlingConfig.limit = parseInt(value);
                    }

                    console.log('🔧 [WEB CRAWLING] Custom select changed:', select.dataset.select, '=', value);
                });
            });
        });

        // Cerrar dropdown al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.velvz-custom-select')) {
                document.querySelectorAll('.velvz-custom-select--open').forEach(s => {
                    s.classList.remove('velvz-custom-select--open');
                });
            }
        });

        // Cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.velvz-custom-select--open').forEach(s => {
                    s.classList.remove('velvz-custom-select--open');
                });
            }
        });

        console.log('🎨 [WEB CRAWLING] Custom selects initialized');
    }

    bindEvents() {
        console.log('🔧 [WEB CRAWLING] Binding events...');

        // Advanced options toggle
        const advancedToggle = document.getElementById('advancedOptionsToggle');
        console.log('🔧 [WEB CRAWLING] advancedToggle element:', advancedToggle);
        if (advancedToggle) {
            advancedToggle.addEventListener('click', () => {
                console.log('🔧 [WEB CRAWLING] Advanced options toggle clicked');
                this.toggleAdvancedOptions();
            });
        } else {
            console.error('❌ [WEB CRAWLING] advancedOptionsToggle element not found!');
        }

        // Analyze domain button
        const analyzeBtn = document.getElementById('analyzeDomainBtn');
        console.log('🔧 [WEB CRAWLING] analyzeBtn element:', analyzeBtn);
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => {
                console.log('🔧 [WEB CRAWLING] Analyze button clicked');
                this.analyzeDomain();
            });
        } else {
            console.error('❌ [WEB CRAWLING] analyzeDomainBtn element not found!');
        }

        // Crawling URL input (Enter key)
        const urlInput = document.getElementById('crawlingUrl');
        if (urlInput) {
            urlInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.analyzeDomain();
                }
            });

            urlInput.addEventListener('input', () => {
                this.validateUrl();
            });
        }

        // Start crawling button
        const startBtn = document.getElementById('startCrawlingBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.startCrawling();
            });
        }

        // Cancel/Stop buttons
        const cancelBtn = document.getElementById('cancelCrawlingBtn');
        const stopBtn = document.getElementById('stopCrawlingBtn');
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.cancelCrawling();
            });
        }

        if (stopBtn) {
            stopBtn.addEventListener('click', () => {
                this.stopCrawling();
            });
        }

        // Form elements change handlers
        this.bindFormChanges();
    }

    bindFormChanges() {
        const depth = document.getElementById('crawlingDepth');
        const limit = document.getElementById('crawlingLimit');
        const excludePatterns = document.getElementById('excludePatterns');

        // Los custom selects actualizan directamente via initCustomSelects()
        // Pero mantenemos listeners en los hidden inputs por si acaso
        if (depth) {
            depth.addEventListener('change', (e) => {
                this.crawlingConfig.depth = parseInt(e.target.value);
                console.log('🔧 [WEB CRAWLING] Depth changed to:', this.crawlingConfig.depth);
            });
        }

        if (limit) {
            limit.addEventListener('change', (e) => {
                this.crawlingConfig.limit = parseInt(e.target.value);
                console.log('🔧 [WEB CRAWLING] Limit changed to:', this.crawlingConfig.limit);
            });
        }

        if (excludePatterns) {
            excludePatterns.addEventListener('input', (e) => {
                this.crawlingConfig.excludePatterns = e.target.value
                    .split('\n')
                    .map(pattern => pattern.trim())
                    .filter(pattern => pattern.length > 0);
            });
        }

        // Content types checkboxes
        document.querySelectorAll('input[name="contentTypes"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateContentTypes();
            });
        });
    }

    toggleAdvancedOptions() {
        console.log('🎯 [WEB CRAWLING] toggleAdvancedOptions called');

        const toggle = document.getElementById('advancedOptionsToggle');
        console.log('🎯 [WEB CRAWLING] toggle element:', toggle);

        if (!toggle) {
            console.error('❌ [WEB CRAWLING] Toggle element not found in DOM!');
            return;
        }

        const content = toggle.parentElement.querySelector('.velvz-crawling-advanced__content');
        console.log('🎯 [WEB CRAWLING] content element:', content);

        if (!content) {
            console.error('❌ [WEB CRAWLING] Content element not found in DOM!');
            return;
        }

        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        console.log('🎯 [WEB CRAWLING] isExpanded:', isExpanded);

        if (isExpanded) {
            console.log('🎯 [WEB CRAWLING] Collapsing advanced options');
            content.style.display = 'none';
            toggle.setAttribute('aria-expanded', 'false');
        } else {
            console.log('🎯 [WEB CRAWLING] Expanding advanced options');
            content.style.display = 'block';
            toggle.setAttribute('aria-expanded', 'true');
        }

        console.log('🎯 [WEB CRAWLING] Toggle completed. New aria-expanded:', toggle.getAttribute('aria-expanded'));
    }

    validateUrl() {
        const input = document.getElementById('crawlingUrl');
        const url = input.value.trim();
        
        if (!url) {
            input.classList.remove('velvz-crawling-input--success', 'velvz-crawling-input--error');
            return false;
        }

        try {
            new URL(url);
            input.classList.remove('velvz-crawling-input--error');
            input.classList.add('velvz-crawling-input--success');
            this.crawlingConfig.url = url;
            return true;
        } catch {
            input.classList.remove('velvz-crawling-input--success');
            input.classList.add('velvz-crawling-input--error');
            return false;
        }
    }

    updateContentTypes() {
        const checkboxes = document.querySelectorAll('input[name="contentTypes"]:checked');
        this.crawlingConfig.contentTypes = Array.from(checkboxes).map(cb => cb.value);
    }

    async analyzeDomain() {
        console.log('🌐 [WEB CRAWLING] analyzeDomain called');

        const isValid = this.validateUrl();
        console.log('🌐 [WEB CRAWLING] URL validation result:', isValid);

        if (!isValid) {
            console.warn('⚠️ [WEB CRAWLING] Invalid URL, showing notification');
            this.showNotification('Por favor, ingresa una URL válida', 'error');
            return;
        }

        const analyzeBtn = document.getElementById('analyzeDomainBtn');
        console.log('🌐 [WEB CRAWLING] analyzeBtn element:', analyzeBtn);

        if (!analyzeBtn) {
            console.error('❌ [WEB CRAWLING] Analyze button not found!');
            return;
        }

        const originalText = analyzeBtn.innerHTML;
        console.log('🌐 [WEB CRAWLING] Starting analysis for:', this.crawlingConfig.url);

        try {
            // UI Loading state
            analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Analizando...</span>';
            analyzeBtn.disabled = true;

            // Prepare config
            this.updateContentTypes();
            console.log('🌐 [WEB CRAWLING] Final config before API call:', this.crawlingConfig);

            // Call API to discover URLs
            console.log('🌐 [WEB CRAWLING] Calling API with action: analyze');
            const response = await this.callCrawlingAPI('analyze', this.crawlingConfig);
            console.log('🌐 [WEB CRAWLING] API response:', response);

            if (response.success) {
                console.log('✅ [WEB CRAWLING] Analysis successful, found', response.urls.length, 'URLs');
                this.discoveredUrls = response.urls;
                this.showPreview(response.urls);
                this.showNotification(`Se encontraron ${response.urls.length} páginas para procesar`, 'success');
            } else {
                console.error('❌ [WEB CRAWLING] API returned error:', response.error);
                throw new Error(response.error || 'Error al analizar el sitio web');
            }

        } catch (error) {
            console.error('❌ [WEB CRAWLING] Error analyzing domain:', error);
            this.showNotification('Error al analizar el sitio web: ' + error.message, 'error');
            this.hidePreview();
        } finally {
            // Restore button
            analyzeBtn.innerHTML = originalText;
            analyzeBtn.disabled = false;
            console.log('🌐 [WEB CRAWLING] analyzeDomain completed');
        }
    }

    showPreview(urls) {
        const preview = document.getElementById('crawlingPreview');
        const content = document.getElementById('previewContent');

        // Update count
        this.updatePreviewCount();

        // Render URLs with remove button
        content.innerHTML = urls.map((url, index) => `
            <div class="velvz-crawling-preview__url" data-url-index="${index}">
                <i class="fas fa-link velvz-crawling-preview__url-icon"></i>
                <span class="velvz-crawling-preview__url-text">${url}</span>
                <button type="button" class="velvz-crawling-preview__url-remove" data-url="${url}" title="Quitar esta URL">
                    <i class="fas fa-minus"></i>
                </button>
            </div>
        `).join('');

        // Add event listeners for remove buttons
        content.querySelectorAll('.velvz-crawling-preview__url-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const urlToRemove = btn.dataset.url;
                this.removeUrl(urlToRemove);
            });
        });

        // Show preview
        preview.style.display = 'block';

        // Auto-scroll to the preview section
        setTimeout(() => {
            preview.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }

    updatePreviewCount() {
        const count = document.getElementById('previewCount');
        if (count) {
            count.textContent = `${this.discoveredUrls.length} páginas`;
        }
    }

    removeUrl(url) {
        const index = this.discoveredUrls.indexOf(url);
        if (index > -1) {
            this.discoveredUrls.splice(index, 1);

            // Re-render the preview
            if (this.discoveredUrls.length > 0) {
                this.showPreview(this.discoveredUrls);
            } else {
                this.hidePreview();
                this.showNotification('Todas las URLs han sido eliminadas', 'info');
            }
        }
    }

    hidePreview() {
        const preview = document.getElementById('crawlingPreview');
        preview.style.display = 'none';
    }

    async startCrawling() {
        if (!this.discoveredUrls.length) {
            this.showNotification('Primero debes analizar el sitio web', 'error');
            return;
        }

        try {
            this.hidePreview();
            this.showProgress();
            
            // Call API to start crawling
            const response = await this.callCrawlingAPI('start', {
                ...this.crawlingConfig,
                urls: this.discoveredUrls
            });

            if (response.success) {
                this.currentCrawlingJob = response.jobId;
                this.monitorCrawlingProgress();
                this.showNotification('Extracción iniciada. Te avisaremos cuando termine.', 'success');
            } else {
                throw new Error(response.error || 'Error al iniciar el crawling');
            }

        } catch (error) {
            console.error('Error starting crawling:', error);
            this.showNotification('Error al iniciar el crawling: ' + error.message, 'error');
            this.hideProgress();
        }
    }

    showProgress() {
        const progress = document.getElementById('crawlingProgress');
        progress.style.display = 'block';
        this.resetProgress();
    }

    hideProgress() {
        const progress = document.getElementById('crawlingProgress');
        progress.style.display = 'none';
        this.currentCrawlingJob = null;
    }

    resetProgress() {
        document.getElementById('crawlingProgressFill').style.width = '0%';
        document.getElementById('crawlingProcessed').textContent = '0';
        document.getElementById('crawlingTotal').textContent = this.discoveredUrls.length;
        document.getElementById('crawlingSuccess').textContent = '0';
        document.getElementById('crawlingErrors').textContent = '0';
        document.getElementById('crawlingCurrentUrl').textContent = '-';
    }

    async monitorCrawlingProgress() {
        if (!this.currentCrawlingJob) return;

        const interval = setInterval(async () => {
            try {
                const status = await this.getCrawlingStatus(this.currentCrawlingJob);
                
                this.updateProgress(status);
                
                if (status.completed) {
                    clearInterval(interval);
                    this.onCrawlingComplete(status);
                } else if (status.error) {
                    clearInterval(interval);
                    this.onCrawlingError(status.error);
                }
                
            } catch (error) {
                console.error('Error monitoring progress:', error);
                clearInterval(interval);
                this.onCrawlingError(error.message);
            }
        }, 2000);
    }

    updateProgress(status) {
        const progress = (status.processed / status.total) * 100;
        
        document.getElementById('crawlingProgressFill').style.width = `${progress}%`;
        document.getElementById('crawlingProcessed').textContent = status.processed;
        document.getElementById('crawlingTotal').textContent = status.total;
        document.getElementById('crawlingSuccess').textContent = status.success;
        document.getElementById('crawlingErrors').textContent = status.errors;
        
        if (status.currentUrl) {
            document.getElementById('crawlingCurrentUrl').textContent = status.currentUrl;
        }
    }

    onCrawlingComplete(status) {
        this.hideProgress();
        this.showNotification(`¡Crawling completado! ${status.success} páginas procesadas exitosamente`, 'success');

        // Refresh file list to show new crawled content
        const chatbotId = this.getChatbotId();
        if (chatbotId && typeof loadDocuments === 'function') {
            loadDocuments(chatbotId);
        }

        this.currentCrawlingJob = null;
    }

    onCrawlingError(error) {
        this.hideProgress();
        this.showNotification('Error durante el crawling: ' + error, 'error');
        this.currentCrawlingJob = null;
    }

    cancelCrawling() {
        this.hidePreview();
        this.discoveredUrls = [];
        this.showNotification('Análisis cancelado', 'info');
    }

    async stopCrawling() {
        if (!this.currentCrawlingJob) return;

        try {
            await this.callCrawlingAPI('stop', { jobId: this.currentCrawlingJob });
            this.hideProgress();
            this.showNotification('Crawling detenido', 'info');
            this.currentCrawlingJob = null;
        } catch (error) {
            console.error('Error stopping crawling:', error);
            this.showNotification('Error al detener el crawling', 'error');
        }
    }

    async callCrawlingAPI(action, data) {
        console.log(`🌐 [API] Calling crawling API - Action: ${action}`);

        const chatbotId = this.getChatbotId();
        const apiBase = window.CHATBOT_API_BASE || window.CHATBOT_API || 'https://velvz-unified-backend-production.up.railway.app';
        const fullUrl = `${apiBase}/api/chatbots/${chatbotId}/crawl/${action}`;

        console.log(`🌐 [API] URL: ${fullUrl}`);
        console.log(`🌐 [API] Data:`, data);

        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.velvzAuth.getToken()}`
            },
            body: JSON.stringify(data)
        });

        console.log(`🌐 [API] Response status: ${response.status} (${response.ok ? 'OK' : 'ERROR'})`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ [API] Error response:', errorData);
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const result = await response.json();
        console.log(`✅ [API] Success:`, result);
        return result;
    }

    async getCrawlingStatus(jobId) {
        const chatbotId = this.getChatbotId();
        const apiBase = window.CHATBOT_API_BASE || window.CHATBOT_API;

        const response = await fetch(`${apiBase}/api/chatbots/${chatbotId}/crawl/status/${jobId}`, {
            headers: {
                'Authorization': `Bearer ${window.velvzAuth.getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return await response.json();
    }

    getChatbotId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    showNotification(message, type = 'info') {
        // Try multiple notification methods
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else if (typeof window.showSuccess === 'function' && type === 'success') {
            window.showSuccess(message);
        } else if (typeof window.showError === 'function' && type === 'error') {
            window.showError(message);
        } else {
            // Create a simple toast notification as fallback
            this.createToast(message, type);
        }
    }

    createToast(message, type = 'info') {
        // Remove existing toast if any
        const existingToast = document.querySelector('.velvz-toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `velvz-toast velvz-toast--${type}`;

        const iconMap = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        const colorMap = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        toast.innerHTML = `
            <i class="fas ${iconMap[type] || iconMap.info}"></i>
            <span>${message}</span>
        `;

        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: #1f2937;
            color: white;
            padding: 14px 20px;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 10000;
            animation: toastSlideIn 0.3s ease;
            border-left: 4px solid ${colorMap[type] || colorMap.info};
            font-size: 14px;
            max-width: 400px;
        `;

        // Add animation keyframes if not exists
        if (!document.querySelector('#velvz-toast-styles')) {
            const style = document.createElement('style');
            style.id = 'velvz-toast-styles';
            style.textContent = `
                @keyframes toastSlideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes toastSlideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            toast.style.animation = 'toastSlideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }
}

// Initialize when DOM is loaded
function initWebCrawlingSection() {
    console.log('📄 [WEB CRAWLING] initWebCrawlingSection called');

    const crawlingArea = document.querySelector('.velvz-crawling-area');
    console.log('📄 [WEB CRAWLING] .velvz-crawling-area found:', !!crawlingArea);

    if (crawlingArea) {
        console.log('📄 [WEB CRAWLING] Initializing WebCrawlingSection...');
        window.webCrawlingSection = new WebCrawlingSection();
        console.log('✅ [WEB CRAWLING] WebCrawlingSection initialized and assigned to window.webCrawlingSection');
    } else {
        console.warn('⚠️ [WEB CRAWLING] .velvz-crawling-area not found in DOM, skipping initialization');
    }
}

// Si el DOM ya está listo, ejecutar inmediatamente; si no, esperar a DOMContentLoaded
if (document.readyState === 'loading') {
    console.log('📄 [WEB CRAWLING] DOM still loading, waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', initWebCrawlingSection);
} else {
    console.log('📄 [WEB CRAWLING] DOM already ready, initializing immediately...');
    initWebCrawlingSection();
}
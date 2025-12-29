// VERSIÓN ULTRA SIMPLE PARA TESTING
console.log('🟢 SIMPLE VERSION - INICIO DEL ARCHIVO');

try {
    console.log('🟢 Intentando definir la clase...');

    class WebCrawlingSection {
        constructor() {
            console.log('🟢 Constructor ejecutado!');
        }
    }

    console.log('🟢 Clase definida correctamente');

    // Initialize - Funciona tanto si DOM está listo como si no
    function initWebCrawling() {
        console.log('🟢 initWebCrawling called');
        const crawlingArea = document.querySelector('.velvz-crawling-area');
        console.log('🟢 Crawling area found:', !!crawlingArea);

        if (crawlingArea) {
            window.webCrawlingSection = new WebCrawlingSection();
            console.log('🟢 Instancia creada en window.webCrawlingSection');
        } else {
            console.warn('🟡 Crawling area not found yet');
        }
    }

    // Si el DOM ya está listo, ejecutar inmediatamente
    if (document.readyState === 'loading') {
        console.log('🟢 DOM still loading, waiting for DOMContentLoaded...');
        document.addEventListener('DOMContentLoaded', initWebCrawling);
    } else {
        console.log('🟢 DOM already loaded, initializing immediately...');
        initWebCrawling();
    }

    console.log('🟢 Script completado sin errores');

} catch (error) {
    console.error('🔴 ERROR EN EL SCRIPT:', error);
    console.error('🔴 Stack:', error.stack);
}

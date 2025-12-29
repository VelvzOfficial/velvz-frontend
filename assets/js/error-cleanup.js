// error-cleanup.js
// Script para limpiar errores 404 y mejorar el sistema de Velvz - VERSIÓN CORREGIDA

(function () {
  "use strict";

  // =====================================================
  // CONFIGURACIÓN
  // =====================================================

  const CONFIG = {
    // Bloquear URLs problemáticas conocidas
    BLOCKED_PATTERNS: [
      /doubleclick\.net/,
      /googleadservices\.com/,
      /googlesyndication\.com/,
      /facebook\.com\/tr/,
      /analytics\.google\.com/,
      /gtag\/js/,
      /gtm\.js/,
    ],

    // URLs de recursos que pueden fallar silenciosamente
    OPTIONAL_RESOURCES: [
      /\/ads\//,
      /\/tracking\//,
      /\/analytics\//,
      /favicon\.ico$/,
    ],

    // Debug mode
    DEBUG: window.location.hostname === "localhost",
  };

  // =====================================================
  // LOGGER CON NAMESPACE ÚNICO
  // =====================================================

  const CleanupLogger = {
    log: function (message, ...args) {
      if (CONFIG.DEBUG) {
        console.log(`🧹 Cleanup: ${message}`, ...args);
      }
    },

    warn: function (message, ...args) {
      if (CONFIG.DEBUG) {
        console.warn(`⚠️ Cleanup Warning: ${message}`, ...args);
      }
    },

    error: function (message, ...args) {
      console.error(`❌ Cleanup Error: ${message}`, ...args);
    },
  };

  // =====================================================
  // INTERCEPTOR DE FETCH PARA BLOQUEAR REQUESTS PROBLEMÁTICAS
  // =====================================================

  const originalFetch = window.fetch;
  window.fetch = function (...args) {
    const url = args[0];
    const urlString = typeof url === "string" ? url : url.toString();

    // Verificar si la URL debe ser bloqueada
    const shouldBlock = CONFIG.BLOCKED_PATTERNS.some((pattern) =>
      pattern.test(urlString)
    );

    if (shouldBlock) {
      CleanupLogger.log(`Bloqueando request a: ${urlString}`);
      return Promise.reject(new Error(`Blocked request to ${urlString}`));
    }

    // Proceder con el fetch normal
    return originalFetch.apply(this, args).catch((error) => {
      // Si es un recurso opcional, fallar silenciosamente
      const isOptional = CONFIG.OPTIONAL_RESOURCES.some((pattern) =>
        pattern.test(urlString)
      );

      if (isOptional) {
        CleanupLogger.log(`Recurso opcional falló (ignorado): ${urlString}`);
        return Promise.resolve(new Response("", { status: 204 }));
      }

      // Para otros errores, propagar el error
      throw error;
    });
  };

  // =====================================================
  // INTERCEPTOR DE CREACIÓN DE ELEMENTOS
  // =====================================================

  const originalCreateElement = document.createElement;
  document.createElement = function (tagName) {
    const element = originalCreateElement.call(this, tagName);

    // Interceptar scripts que pueden causar problemas
    if (tagName.toLowerCase() === "script") {
      const originalSetSrc = Object.getOwnPropertyDescriptor(
        HTMLScriptElement.prototype,
        "src"
      ).set;

      Object.defineProperty(element, "src", {
        set: function (value) {
          const shouldBlock = CONFIG.BLOCKED_PATTERNS.some((pattern) =>
            pattern.test(value)
          );

          if (shouldBlock) {
            CleanupLogger.log(`Bloqueando script: ${value}`);
            return;
          }

          originalSetSrc.call(this, value);
        },
        get: function () {
          return this.getAttribute("src");
        },
      });
    }

    return element;
  };

  // =====================================================
  // CLEANUP DE ELEMENTOS PROBLEMÁTICOS
  // =====================================================

  function cleanupProblematicElements() {
    // Remover scripts problemáticos existentes
    const scripts = document.querySelectorAll("script[src]");
    scripts.forEach((script) => {
      const src = script.src;
      const shouldRemove = CONFIG.BLOCKED_PATTERNS.some((pattern) =>
        pattern.test(src)
      );

      if (shouldRemove) {
        CleanupLogger.log(`Removiendo script problemático: ${src}`);
        script.remove();
      }
    });

    // Remover elementos de tracking conocidos
    const trackingSelectors = [
      'script[src*="gtag"]',
      'script[src*="analytics"]',
      'script[src*="doubleclick"]',
      'noscript img[src*="facebook.com/tr"]',
      'img[src*="google-analytics.com"]',
    ];

    trackingSelectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        CleanupLogger.log(`Removiendo elemento de tracking: ${selector}`);
        element.remove();
      });
    });
  }

  // =====================================================
  // INICIALIZACIÓN
  // =====================================================

  function init() {
    CleanupLogger.log("Inicializando sistema de limpieza de errores");

    // Limpiar elementos problemáticos existentes
    cleanupProblematicElements();

    // Limpiar periódicamente elementos que se añadan dinámicamente
    setInterval(cleanupProblematicElements, 5000);

    CleanupLogger.log("Sistema de limpieza inicializado correctamente");
  }

  // Ejecutar cuando el DOM esté listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // =====================================================
  // EXPORTAR PARA DEBUG (OPCIONAL)
  // =====================================================

  if (CONFIG.DEBUG) {
    window.velvzCleanup = {
      config: CONFIG,
      cleanup: cleanupProblematicElements,
      logger: CleanupLogger,
    };
    console.log("🔧 Debug cleanup tools disponibles en: window.velvzCleanup");
  }
})();

// =====================================================
// PÁGINAS PÚBLICAS - SIN SISTEMA DE AUTENTICACIÓN
// =====================================================
// Para: inicio, servicios, contacto (páginas de marketing)

document.addEventListener("DOMContentLoaded", function () {
  console.log("📄 Inicializando página pública de marketing");

  // =====================================================
  // BOTONES "ENTRAR" ESTÁTICOS
  // =====================================================

  function setupStaticEnterButtons() {
    const empezarButtons = document.querySelectorAll(
      ".velvz-header__cta, .velvz-header__mobile-cta"
    );

    empezarButtons.forEach((button) => {
      // Asegurar que el texto sea "Entrar"
      const desktopText = button.querySelector(".velvz-header__cta-text");
      if (desktopText) {
        desktopText.textContent = "Entrar";
      }

      const mobileText = button.querySelector("span");
      if (mobileText) {
        mobileText.textContent = "Entrar";
      }

      // Configurar click para ir a cuenta
      button.addEventListener("click", handleEnterClick);
    });
  }

  function handleEnterClick(e) {
    e.preventDefault();
    console.log("📝 Botón Entrar clickeado, redirigiendo a /cuenta/");
    window.location.href = "/cuenta/";
  }

  // =====================================================
  // NAVEGACIÓN DEL HEADER
  // =====================================================

  // Agregar funcionalidad a los enlaces del header
  const headerLinks = document.querySelectorAll(
    ".velvz-header__link, .velvz-header__mobile-link"
  );
  headerLinks.forEach((link) => {
    const href = link.getAttribute("href");

    // Solo interceptamos desplazamientos "in-page"
    if (href && href.startsWith("#")) {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      });
    }
  });

  // Logo click to home
  const headerLogo = document.querySelector(".velvz-header__logo");
  if (headerLogo) {
    headerLogo.addEventListener("click", () => {
      window.location.href = "/";
    });
  }

  // =====================================================
  // INICIALIZACIÓN
  // =====================================================

  setupStaticEnterButtons();

  console.log("✅ Página pública inicializada - botón 'Entrar' configurado");
});

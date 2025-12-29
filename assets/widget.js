/**
 * Velvz Widget v2.0.0 - REDIRECTOR
 * Este archivo ahora redirige al widget personalizado del backend
 * Copyright (c) 2025 Velvz
 */

(function () {
  "use strict";

  console.log("⚠️ Velvz Widget v1 está obsoleto. Redirigiendo al widget personalizado v2...");

  // Obtener el chatbot ID del script tag
  function getChatbotId() {
    const script = document.currentScript || document.querySelector("script[data-chatbot-id]");
    if (!script) {
      console.error("Velvz Widget: No se encontró el script con data-chatbot-id");
      return null;
    }
    const chatbotId = script.getAttribute("data-chatbot-id");
    if (!chatbotId) {
      console.error("Velvz Widget: data-chatbot-id no está definido");
      return null;
    }
    return chatbotId;
  }

  // Obtener ID del chatbot
  const CHATBOT_ID = getChatbotId();
  if (!CHATBOT_ID) {
    console.error("❌ No se puede cargar el widget sin chatbot ID");
    return;
  }

  // Cargar el nuevo widget personalizado desde el backend
  const newScript = document.createElement('script');
  newScript.src = `https://velvz-unified-backend-production.up.railway.app/api/widget/script/${CHATBOT_ID}`;
  newScript.async = true;
  
  // Agregar eventos para debug
  newScript.onload = function() {
    console.log("✅ Widget personalizado v2 cargado exitosamente para chatbot " + CHATBOT_ID);
  };
  
  newScript.onerror = function() {
    console.error("❌ Error cargando widget personalizado v2");
  };
  
  // Insertar el script en el documento
  document.head.appendChild(newScript);
  
  console.log("🔄 Cargando widget personalizado desde el backend para chatbot " + CHATBOT_ID);
})();
// VELVZ/assets/js/dashboard-api.js
// Conexión del dashboard con el backend de chatbots - VERSIÓN CORREGIDA

// Usar el backend unificado si está configurado
if (window.API_CONFIG) {
  window.CHATBOT_API = window.API_CONFIG.CHATBOT_API_URL;
  window.AUTH_API = window.API_CONFIG.AUTH_API_URL;
} else {
  // Fallback al backend unificado
  window.CHATBOT_API =
    "https://velvz-unified-backend-production.up.railway.app";
  window.AUTH_API = "https://velvz-unified-backend-production.up.railway.app";
}

class DashboardAPI {
  constructor() {
    // 🔧 FIX: Configuración para producción vs desarrollo
    this.baseURL = window.CHATBOT_API || this.detectBackendURL();
    this.token = localStorage.getItem("velvz_token"); // Usar mismo nombre que auth
    this.isProduction = !window.location.hostname.includes("localhost");

    console.log("🚀 Dashboard API inicializado:", {
      backend: this.baseURL,
      environment: this.isProduction ? "production" : "development",
      hasToken: !!this.token,
    });
  }

  // 🔧 FIX: Detectar URL del backend según entorno
  detectBackendURL() {
    // Si está en localhost (desarrollo)
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      return "http://localhost:3001";
    }
    // Si está en producción (Hostinger) - Backend unificado
    return "https://velvz-unified-backend-production.up.railway.app";
  }

  // Headers con autenticación - Mejorado
  getHeaders(includeContentType = true) {
    const headers = {
      Authorization: `Bearer ${this.token}`,
    };

    if (includeContentType) {
      headers["Content-Type"] = "application/json";
    }

    return headers;
  }

  // 🔧 FIX: GET request con mejor manejo de errores
  async get(endpoint) {
    try {
      console.log(`📡 GET ${this.baseURL}${endpoint}`);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log(`✅ GET ${endpoint} exitoso`);
      return data;
    } catch (error) {
      console.error(`❌ Error GET ${endpoint}:`, error);
      throw error;
    }
  }

  // 🔧 FIX: POST request con mejor manejo de errores
  async post(endpoint, data) {
    try {
      console.log(`📡 POST ${this.baseURL}${endpoint}`, data);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log(`✅ POST ${endpoint} exitoso`);
      return result;
    } catch (error) {
      console.error(`❌ Error POST ${endpoint}:`, error);
      throw error;
    }
  }

  // 🔧 FIX: DELETE request con mejor manejo de errores
  async delete(endpoint) {
    try {
      console.log(`📡 DELETE ${this.baseURL}${endpoint}`);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log(`✅ DELETE ${endpoint} exitoso`);
      return result;
    } catch (error) {
      console.error(`❌ Error DELETE ${endpoint}:`, error);
      throw error;
    }
  }

  async put(endpoint, data) {
    try {
      console.log(`📡 PUT ${this.baseURL}${endpoint}`, data);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log(`✅ PUT ${endpoint} exitoso`);
      return result;
    } catch (error) {
      console.error(`❌ Error PUT ${endpoint}:`, error);
      throw error;
    }
  }

  // === MÉTODOS ESPECÍFICOS CHATBOTS ===

  // Obtener todos los chatbots del usuario
  async getChatbots() {
    return await this.get("/api/chatbots");
  }

  // Obtener chatbot específico
  async getChatbot(id) {
    return await this.get(`/api/chatbots/${id}`);
  }

  // Crear nuevo chatbot
  async createChatbot(data) {
    return await this.post("/api/chatbots", data);
  }

  // Eliminar chatbot
  async deleteChatbot(chatbotId, permanent = false) {
    try {
      console.log(
        `🗑️ [API] Eliminando chatbot: ${chatbotId}, permanent: ${permanent}`
      );

      // Obtener token del localStorage o de la instancia
      const token = this.token || localStorage.getItem("velvz_token");

      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      // Construir URL correctamente usando this.baseURL
      const url = `${this.baseURL}/api/chatbots/${chatbotId}${
        permanent ? "?permanent=true" : ""
      }`;

      console.log(`🌐 [API] URL de eliminación: ${url}`);
      console.log(
        `🔑 [API] Usando token:`,
        token ? "Token presente" : "Sin token"
      );

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Intentar parsear la respuesta
      let data;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        // Si no es JSON, obtener el texto
        const text = await response.text();
        data = { message: text };
      }

      // Si la respuesta no es OK, lanzar error con detalles
      if (!response.ok) {
        console.error(`❌ [API] Error del servidor:`, {
          status: response.status,
          statusText: response.statusText,
          data: data,
        });

        // Construir mensaje de error más descriptivo
        const errorMessage =
          data.message ||
          data.error ||
          `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      console.log("✅ [API] Chatbot eliminado exitosamente:", data);

      // Devolver respuesta exitosa
      return {
        success: true,
        message: "Chatbot eliminado exitosamente",
        data: data.data || data,
      };
    } catch (error) {
      console.error("❌ [API] Error eliminando chatbot:", error);

      // IMPORTANTE: Lanzar el error en lugar de devolver un objeto
      // Esto permite que configuration-section.js maneje el error correctamente
      throw error;
    }
  }

  // ✅ NUEVA FUNCIÓN - Actualizar chatbot existente
  async updateChatbot(id, data) {
    return await this.put(`/api/chatbots/${id}`, data);
  }

  // Obtener estadísticas generales
  async getStats() {
    return await this.get("/api/chatbots/stats/summary");
  }

  // === MÉTODOS ESPECÍFICOS DOCUMENTOS ===

  // Obtener documentos de un chatbot
  async getDocuments(chatbotId) {
    return await this.get(`/api/chatbots/${chatbotId}/documents`);
  }

  // 🔧 FIX: Upload documentos con mejor manejo
  async uploadDocuments(chatbotId, files) {
    try {
      console.log(
        `📡 Subiendo ${files.length} documentos al chatbot ${chatbotId}`
      );

      const formData = new FormData();

      // Añadir archivos al FormData
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      const response = await fetch(
        `${this.baseURL}/api/chatbots/${chatbotId}/documents`,
        {
          method: "POST",
          headers: this.getHeaders(false), // No incluir Content-Type para FormData
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log(`✅ Upload documentos exitoso`);
      return result;
    } catch (error) {
      console.error(`❌ Error uploading documents:`, error);
      throw error;
    }
  }

  // Eliminar documento
  async deleteDocument(documentId) {
    // CAMBIO: Usar la ruta correcta con /chatbots/ en el medio
    return await this.delete(`/api/chatbots/documents/${documentId}`);
  }

  // Obtener estadísticas de documentos
  async getDocumentStats(chatbotId) {
    return await this.get(`/api/chatbots/${chatbotId}/documents/stats`);
  }

  // === MÉTODOS DE VERIFICACIÓN ===

  // 🔧 FIX: Test de conexión mejorado
  async testConnection() {
    try {
      console.log(`🔍 Testeando conexión a ${this.baseURL}/health`);

      // Para el backend unificado, la ruta es diferente
      const healthUrl = this.baseURL.includes("unified")
        ? `${this.baseURL}/health`
        : `${this.baseURL}/health`;

      const response = await fetch(`${this.baseURL}/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ Test de conexión exitoso:", data);
      return data;
    } catch (error) {
      console.error("❌ Error conectando con backend:", error);
      return {
        status: "error",
        message: error.message,
        backend: this.baseURL,
      };
    }
  }

  // Verificar autenticación
  async testAuth() {
    try {
      if (!this.token) {
        throw new Error("No hay token de autenticación");
      }
      // El backend unificado usa /api/auth/verify-token
      const response = await fetch(`${this.baseURL}/api/auth/verify-token`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Token inválido");
      }
      return data;
    } catch (error) {
      console.error("❌ Error verificando autenticación:", error);
      throw error;
    }
  }
  // === MÉTODOS DE GESTIÓN DE DOMINIOS ===

  // Obtener dominios del chatbot (usa el chatbot completo)
  async getChatbotDomains(chatbotId) {
    try {
      console.log(`📡 Obteniendo dominios para chatbot: ${chatbotId}`);

      // Como no hay endpoint específico, usar el chatbot completo
      const response = await this.getChatbot(chatbotId);

      if (response.success && response.data) {
        return {
          success: true,
          domains: response.data.allowed_domains || [],
        };
      }

      return { success: false, domains: [] };
    } catch (error) {
      console.error(`❌ Error obteniendo dominios:`, error);

      // Intentar obtener del chatbot completo como fallback
      try {
        const chatbot = await this.getChatbot(chatbotId);
        if (chatbot.success && chatbot.data) {
          return {
            success: true,
            domains: chatbot.data.allowed_domains || [],
          };
        }
      } catch (e) {
        console.error("❌ Fallback también falló:", e);
      }

      return { success: false, domains: [] };
    }
  }

  // Actualizar dominios (actualiza todo el chatbot)
  async updateChatbotDomains(chatbotId, domainsData) {
    try {
      console.log(`💾 Actualizando dominios para chatbot ${chatbotId}`);

      // Primero obtener el chatbot actual para mantener sus datos
      const currentChatbot = await this.getChatbot(chatbotId);

      if (!currentChatbot.success || !currentChatbot.data) {
        throw new Error("No se pudo obtener el chatbot actual");
      }

      // Combinar datos actuales con los nuevos dominios
      const updateData = {
        name: currentChatbot.data.name, // REQUERIDO
        allowed_domains: domainsData.allowed_domains,
        // Mantener otros campos actuales
        description: currentChatbot.data.description,
        instructions: currentChatbot.data.instructions,
        model: currentChatbot.data.model,
        temperature: currentChatbot.data.temperature,
        status: currentChatbot.data.status,
      };

      console.log("📤 Enviando actualización completa:", updateData);

      return await this.updateChatbot(chatbotId, updateData);
    } catch (error) {
      console.error(`❌ Error actualizando dominios:`, error);
      throw error;
    }
  }
}

// Instancia global para usar en todo el dashboard
window.dashboardAPI = new DashboardAPI();

// 🔧 FIX: Función de utilidad mejorada para manejar errores de API
window.handleAPIError = function (error) {
  console.error("❌ API Error:", error);

  // Si es error de autenticación, redirigir al login
  if (error.message.includes("401") || error.message.includes("Unauthorized")) {
    // Guardar nombre del usuario antes de limpiar para mostrar mensaje personalizado
    const userData = localStorage.getItem("velvz_user");
    let userName = null;
    if (userData) {
      try {
        const user = JSON.parse(userData);
        userName = user.name || user.email;
      } catch (e) {}
    }

    // Limpiar tokens
    localStorage.removeItem("velvz_token");
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("velvz_user");
    sessionStorage.clear();

    // Redirigir al login con parámetros para mensaje personalizado
    const params = new URLSearchParams();
    params.set("expired", "true");
    if (userName) {
      params.set("user", userName);
    }
    window.location.href = `/cuenta/?${params.toString()}`;
    return;
  }

  // Si es error de conexión
  if (
    error.message.includes("Failed to fetch") ||
    error.message.includes("NetworkError")
  ) {
    alert("Error de conexión. Verifica tu conexión a internet.");
    return;
  }

  // Otros errores
  alert(`Error: ${error.message}`);
};

// 🔧 FIX: Test de conexión mejorado al cargar la página
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🔗 Probando conexión con backend de chatbots...");

  try {
    const health = await window.dashboardAPI.testConnection();

    if (health.status === "OK" || health.status === "healthy") {
      console.log("✅ Conexión con backend exitosa");
      console.log("📊 Estado backend:", health);

      // Si hay token, probar autenticación también
      if (window.dashboardAPI.token) {
        try {
          await window.dashboardAPI.testAuth();
          console.log("✅ Token de autenticación válido");
        } catch (authError) {
          console.warn("⚠️ Token inválido o expirado");
          window.handleAPIError(authError);
        }
      } else {
        console.warn("⚠️ No hay token de autenticación");
      }
    } else {
      console.warn("⚠️ Backend respondió pero con estado no OK:", health);
    }
  } catch (error) {
    console.error("❌ Backend no disponible:", error.message);
    console.error(
      "🔧 Verificar que el backend esté corriendo en:",
      window.dashboardAPI.baseURL
    );
  }
});

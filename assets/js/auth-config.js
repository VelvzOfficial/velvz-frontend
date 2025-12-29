// Configuración de APIs - Sistema Unificado
window.API_CONFIG = {
  // Backend unificado - TODO en uno
  API_URL: "https://velvz-unified-backend-production.up.railway.app",

  // Por compatibilidad con código antiguo
  AUTH_API_URL: "https://velvz-unified-backend-production.up.railway.app",
  CHATBOT_API_URL: "https://velvz-unified-backend-production.up.railway.app",
  WIDGET_API_URL: "https://velvz-unified-backend-production.up.railway.app",
};

// Para debugging
console.log("🚀 Backend unificado configurado:", window.API_CONFIG.API_URL);

// Sistema de autenticación completo
window.velvzAuth = {
  // Verificar salud del servidor
  checkHealth: async function () {
    try {
      const response = await fetch(`${window.API_CONFIG.AUTH_API_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error("Error checking health:", error);
      return false;
    }
  },

  // Iniciar sesión
  login: async function (email, password) {
    const response = await fetch(
      `${window.API_CONFIG.AUTH_API_URL}/api/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );
    return response.json();
  },

  // Registrar usuario
  register: async function (data) {
    const response = await fetch(
      `${window.API_CONFIG.AUTH_API_URL}/api/auth/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );
    return response.json();
  },

  // Verificar token JWT
  verifyToken: async function (token) {
    const response = await fetch(
      `${window.API_CONFIG.AUTH_API_URL}/api/auth/verify-token`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.json();
  },

  // Verificar email con token
  verifyEmail: async function (token) {
    const response = await fetch(
      `${window.API_CONFIG.AUTH_API_URL}/api/auth/verify-email?token=${token}`,
      {
        method: "GET",
      }
    );
    return response.json();
  },

  // Cerrar sesión
  logout: async function (token) {
    // Si no se proporciona token, intentar obtenerlo
    if (!token) {
      token = this.getToken();
    }
    
    // Limpiar localStorage inmediatamente
    this.removeToken();
    
    // Si hay token, notificar al servidor
    if (token) {
      try {
        const response = await fetch(
          `${window.API_CONFIG.AUTH_API_URL}/api/auth/logout`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        return response.json();
      } catch (error) {
        console.error("Error al cerrar sesión en el servidor:", error);
      }
    }
    
    return { success: true, message: "Sesión cerrada localmente" };
  },

  // Obtener información del usuario actual
  getMe: async function (token) {
    const response = await fetch(
      `${window.API_CONFIG.AUTH_API_URL}/api/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.json();
  },

  // Solicitar restablecimiento de contraseña
  forgotPassword: async function (email) {
    const response = await fetch(
      `${window.API_CONFIG.AUTH_API_URL}/api/auth/forgot-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );
    return response.json();
  },

  // Validar token de reset
  validateResetToken: async function (token) {
    const response = await fetch(
      `${window.API_CONFIG.AUTH_API_URL}/api/auth/validate-reset-token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      }
    );
    return response.json();
  },

  // Restablecer contraseña con token
  resetPassword: async function (token, newPassword) {
    const response = await fetch(
      `${window.API_CONFIG.AUTH_API_URL}/api/auth/reset-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: newPassword,
        }),
      }
    );
    return response.json();
  },

  // Actualizar perfil del usuario
  updateProfile: async function (token, data) {
    const response = await fetch(
      `${window.API_CONFIG.AUTH_API_URL}/api/auth/me`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    return response.json();
  },

  // Función auxiliar para guardar token (MÚLTIPLES NOMBRES)
  saveToken: function (token) {
    localStorage.setItem("velvz_token", token);
    localStorage.setItem("token", token);
    localStorage.setItem("authToken", token);
    localStorage.setItem("auth_token", token);
    sessionStorage.setItem("token", token);
  },

  // Función auxiliar para obtener token (BUSCA EN MÚLTIPLES LUGARES)
  getToken: function () {
    return (
      localStorage.getItem("velvz_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("token")
    );
  },

  // Función auxiliar para eliminar token (LIMPIA TODO)
  removeToken: function () {
    localStorage.removeItem("velvz_token");
    localStorage.removeItem("velvz_user");
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("auth_token");
    sessionStorage.removeItem("token");
  },

  // Función auxiliar para verificar si hay sesión
  isAuthenticated: async function () {
    const token = this.getToken();
    if (!token) return false;

    const result = await this.verifyToken(token);
    return result.success === true;
  },

  // FUNCIONES QUE FALTAN PARA COMPATIBILIDAD
  isLoggedIn: function () {
    const token = this.getToken();
    return !!token;
  },

  // Obtener perfil del usuario (mock para compatibilidad)
  getProfile: async function () {
    const token = this.getToken();
    if (!token) {
      return { success: false, message: "No token" };
    }

    // Primero intentar obtener de localStorage
    const cachedUser = localStorage.getItem("velvz_user");
    if (cachedUser) {
      try {
        const user = JSON.parse(cachedUser);
        console.log("✅ Usuario obtenido de caché:", user.name || user.email);
        return {
          success: true,
          user: user
        };
      } catch (e) {
        console.error("Error parseando usuario de caché:", e);
      }
    }

    // Si no hay caché, obtener del servidor
    try {
      const result = await this.getMe(token);
      if (result.success) {
        // Guardar en caché para próximas veces
        if (result.user) {
          localStorage.setItem("velvz_user", JSON.stringify(result.user));
        }
        return {
          success: true,
          user: result.user || result.data,
        };
      }
      return result;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
};

// Verificar salud del servidor al cargar
window.velvzAuth.checkHealth().then((healthy) => {
  if (!healthy) {
    console.warn("⚠️ El servidor podría no estar disponible");
  } else {
    console.log("✅ Servidor funcionando correctamente");
  }
});

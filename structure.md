# 📁 Estructura Completa del Proyecto VELVZ

## 🏗️ Arquitectura General - 3 Sistemas Integrados

```
VELVZ-ECOSYSTEM/
├── 🌐 VELVZ/                           # Frontend principal (Hostinger)
├── 🔐 VELVZ-AUTH-BACKEND/              # Sistema de autenticación (Railway)
├── 🤖 VELVZ-CHATBOT-SYSTEM/            # Backend de chatbots (Railway)
└── 🔧 VELVZ-WIDGET-SYSTEM/             # Sistema de widgets embebibles (Railway)
```

## 1. 🌐 VELVZ - Frontend Principal (Hostinger)

```
VELVZ/
├── 📁 app/                              # Dashboard principal de la aplicación
│   ├── 📁 chatbots/                     # Sección de gestión de chatbots
│   │   ├── 📄 config.html               # Página de configuración individual de chatbot
│   │   └── 📄 index.html                # Lista de chatbots del usuario
│   └── 📄 index.html                    # Dashboard principal (página de inicio después del login)
│
├── 📁 assets/                           # Recursos estáticos globales
│   ├── 📁 css/                          # Hojas de estilo
│   └── 📁 js/                           # Scripts JavaScript
│
├── 📁 contacto/                         # Sección de contacto
│   └── 📄 index.html                    # Página de contacto
│
├── 📁 cuenta/                           # Gestión de cuenta de usuario
│   ├── 📄 index.html                    # Página principal de cuenta
│   ├── 📄 reset-password.html           # Recuperación de contraseña
│   └── 📄 verify.html                   # Verificación de email
│
├── 📁 precios/                          # Sección de precios y planes
│   └── 📄 index.html                    # Página de precios
│
├── 📁 servicios/                        # Descripción de servicios
│   └── 📄 index.html                    # Página de servicios
│
├── 📁 svg/                              # Gráficos vectoriales
│
├── 📄 404.html                          # Página de error 404
├── 📄 index.html                        # Landing page principal
├── 🖼️ logo.png                          # Logo en formato PNG
├── 🖼️ logo.svg                          # Logo en formato SVG
├── 🖼️ logoR.png                         # Logo alternativo PNG
├── 🖼️ logoR.svg                         # Logo alternativo SVG
└── 📄 readme.md                         # Documentación del frontend
```

## 2. 🤖 VELVZ-CHATBOT-SYSTEM - Backend de Chatbots (Railway)

```
VELVZ-CHATBOT-SYSTEM/
├── 📁 backend/                          # Directorio principal del backend
│   ├── 📁 node_modules/                 # Dependencias de Node.js
│   ├── 📁 scripts/                      # Scripts de utilidad y mantenimiento
│   └── 📁 src/                          # Código fuente principal
│       ├── 📁 config/                   # Configuraciones del sistema
│       │   ├── 📄 database.js           # Configuración de conexión a BD PostgreSQL
│       │   └── 📄 update-schema.js      # Scripts de actualización de esquema BD
│       │
│       ├── 📁 middleware/               # Middlewares Express
│       │   └── 📄 auth.js               # Middleware de autenticación JWT
│       │
│       ├── 📁 routes/                   # Rutas API REST
│       │   ├── 📄 chatbots.js           # CRUD de chatbots (GET, POST, PUT, DELETE)
│       │   └── 📄 documents.js          # Gestión de documentos
│       │
│       ├── 📁 services/                 # Lógica de negocio
│       │   ├── 📄 documents.js          # Procesamiento de documentos
│       │   └── 📄 openai.js             # Integración con OpenAI Assistant API
│       │
│       ├── 📁 utils/                    # Utilidades generales
│       │   └── 📄 user-sync.js          # Sincronización de usuarios
│       │
│       └── 📄 server.js                 # Archivo principal del servidor Express
│
├── 📁 node_modules/                     # Dependencias raíz (si las hay)
├── 📄 .env                              # Variables de entorno (no versionado)
├── 📄 .gitignore                        # Archivos ignorados por Git
├── 📄 migrate-temperature.js           # Script de migración de datos
├── 📄 package-lock.json                # Lock file de dependencias
└── 📄 package.json                     # Configuración del proyecto Node.js
```

## 3. 🔧 VELVZ-WIDGET-SYSTEM - Sistema de Widgets (Railway)

```
VELVZ-WIDGET-SYSTEM/
├── 📁 .vscode/                          # Configuración de Visual Studio Code
├── 📁 node_modules/                     # Dependencias de Node.js
│
├── 📁 public/                           # Archivos públicos servidos
│   ├── 📄 test.html                     # Página de pruebas del widget
│   └── 📄 widget.js                     # Script del widget embebible
│
├── 📁 src/                              # Código fuente
│   ├── 📁 config/                       # Configuraciones
│   │   └── 📄 database.js               # Conexión a BD (compartida con chatbot system)
│   │
│   ├── 📁 middleware/                   # Middlewares
│   │   └── 📄 domain-auth.js            # Validación de dominios permitidos
│   │
│   ├── 📁 routes/                       # Rutas de la API
│   │   ├── 📄 chat.js                   # API de chat público
│   │   ├── 📄 sync.js                   # Sincronización con sistema principal
│   │   └── 📄 widget.js                 # Servir archivos del widget
│   │
│   ├── 📁 services/                     # Servicios
│   │   ├── 📄 chat-handler.js           # Manejador de conversaciones
│   │   └── 📄 domain-validator.js       # Validador de dominios
│   │
│   └── 📄 server.js                     # Servidor principal Express
│
├── 📄 .env                              # Variables de entorno
├── 📄 .env.example                      # Ejemplo de variables de entorno
├── 📄 .gitignore                        # Archivos ignorados por Git
├── 📄 package-lock.json                # Lock file de dependencias
├── 📄 package.json                     # Configuración del proyecto
├── 📄 progress.md                       # Documento de progreso del desarrollo
├── 📄 readme.md                         # Documentación principal
└── 📄 setup-widget-database.js         # Script de configuración inicial de BD
```

## 4. 🔐 VELVZ-AUTH-BACKEND - Sistema de Autenticación (Railway)

```
VELVZ-AUTH-BACKEND/
├── 📁 src/
│   ├── 📁 config/
│   │   └── 📄 database.js               # Configuración PostgreSQL para usuarios
│   │
│   ├── 📁 middleware/
│   │   └── 📄 auth.js                   # Validación de tokens JWT
│   │
│   ├── 📁 routes/
│   │   ├── 📄 auth.js                   # Login, registro, logout
│   │   └── 📄 users.js                  # Gestión de usuarios
│   │
│   ├── 📁 services/
│   │   ├── 📄 email.js                  # Servicio de envío de emails
│   │   └── 📄 jwt.js                    # Generación y validación de tokens
│   │
│   └── 📄 server.js                     # Servidor Express principal
│
├── 📄 package.json                     # Configuración del proyecto
└── 📄 .env                             # Variables de entorno
```

## 📊 Base de Datos PostgreSQL (Railway)

### Tablas principales:

```sql
-- Sistema de usuarios (VELVZ-AUTH-BACKEND)
users
├── id (SERIAL PRIMARY KEY)
├── email (VARCHAR UNIQUE)
├── password_hash (VARCHAR)
├── verified (BOOLEAN)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

-- Sistema de chatbots (VELVZ-CHATBOT-SYSTEM)
projects (chatbots)
├── id (SERIAL PRIMARY KEY)
├── user_id (INTEGER REFERENCES users)
├── name (VARCHAR)
├── description (TEXT)
├── model (VARCHAR)
├── temperature (DECIMAL)
├── instructions (TEXT)
├── assistant_id (VARCHAR)
├── vector_store_id (VARCHAR)
├── status (VARCHAR)
├── allowed_domains (TEXT[])
├── widget_settings (JSONB)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

documents
├── id (SERIAL PRIMARY KEY)
├── project_id (INTEGER REFERENCES projects)
├── filename (VARCHAR)
├── original_name (VARCHAR)
├── file_size (INTEGER)
├── mime_type (VARCHAR)
├── openai_file_id (VARCHAR)
├── vector_store_file_id (VARCHAR)
├── uploaded_at (TIMESTAMP)
└── status (VARCHAR)

-- Sistema de widgets (VELVZ-WIDGET-SYSTEM)
widget_sessions
├── id (SERIAL PRIMARY KEY)
├── chatbot_id (INTEGER REFERENCES projects)
├── session_token (VARCHAR UNIQUE)
├── domain (VARCHAR)
├── ip_address (INET)
├── created_at (TIMESTAMP)
└── last_activity (TIMESTAMP)

conversations
├── id (SERIAL PRIMARY KEY)
├── session_id (INTEGER REFERENCES widget_sessions)
├── thread_id (VARCHAR)
├── messages (JSONB)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## 🔗 Flujo de Integración entre Sistemas

```mermaid
graph LR
    A[Usuario] --> B[VELVZ Frontend]
    B --> C[VELVZ-AUTH-BACKEND]
    C --> D[JWT Token]
    D --> E[VELVZ-CHATBOT-SYSTEM]
    E --> F[OpenAI API]
    B --> G[VELVZ-WIDGET-SYSTEM]
    G --> E
```

### Flujo detallado:

1. **Autenticación**: Usuario → Frontend → Auth Backend → JWT
2. **Gestión Chatbots**: Frontend + JWT → Chatbot System → CRUD Operations
3. **Widget Público**: Website → Widget System → Chatbot System → OpenAI
4. **Documentos**: Frontend → Chatbot System → OpenAI Vector Store

## 🛠️ Tecnologías Utilizadas

### Frontend (VELVZ)

- HTML5, CSS3, JavaScript Vanilla
- Sin frameworks (código limpio y optimizado)
- Diseño responsive y moderno
- Animaciones CSS sutiles

### Backend (Todos los sistemas)

- Node.js + Express.js
- PostgreSQL (base de datos)
- JWT para autenticación
- OpenAI Assistant API
- Multer para carga de archivos
- CORS configurado
- Helmet para seguridad

### Infraestructura

- **Frontend**: Hostinger (hosting estático)
- **Backends**: Railway (PaaS)
- **Base de datos**: PostgreSQL en Railway
- **CDN**: Assets servidos desde Hostinger

## 📝 Variables de Entorno (PLANTILLA)

> ⚠️ **IMPORTANTE**: Nunca commitear valores reales. Usar variables de entorno en Railway.

### VELVZ-CHATBOT-SYSTEM (.env.example)

```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-jwt-secret-min-64-characters
OPENAI_API_KEY=sk-proj-your-openai-api-key
WIDGET_SYSTEM_URL=https://your-widget-system.railway.app
INTERNAL_API_SECRET=your-internal-api-secret
```

### VELVZ-WIDGET-SYSTEM (.env.example)

```env
# Puerto
PORT=3001

# Bases de datos
WIDGET_DATABASE_URL=postgresql://user:password@host:port/database
MAIN_DATABASE_URL=postgresql://user:password@host:port/database
DATABASE_URL=postgresql://user:password@host:port/database

# Configuración de widgets
WIDGET_BASE_URL=https://your-widget-system.railway.app
MAIN_SYSTEM_URL=https://your-chatbot-backend.railway.app
WIDGET_SECRET_KEY=your-widget-secret-key-min-32-chars

# Seguridad
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com,http://localhost:3001
DEFAULT_RATE_LIMIT_REQUESTS=100
DEFAULT_RATE_LIMIT_WINDOW=3600

# OpenAI
OPENAI_API_KEY=sk-proj-your-openai-api-key
INTERNAL_API_SECRET=your-internal-api-secret
```

## 🚀 VARIABLES DE ENTORNO EN RAILWAY

### 📌 **IMPORTANTE**
Las variables en Railway se configuran en el dashboard, NO en archivos .env. Los archivos .env son solo para desarrollo local.

---

### 🎯 **velvz-chatbot-backend** (Servicio Principal)

```env
# Base de datos (referencia a Postgres del mismo proyecto)
DATABASE_URL="${{Postgres.DATABASE_URL}}"

# Autenticación JWT
JWT_SECRET="<generar-con-openssl-rand-hex-64>"

# OpenAI API
OPENAI_API_KEY="sk-proj-..."

# Comunicación con sistema de widgets
WIDGET_SYSTEM_URL="https://velvz-widget-system-production.up.railway.app"
INTERNAL_API_SECRET="<generar-con-openssl-rand-hex-32>"

# Configuración del servidor
NODE_ENV="production"
PORT="3001"
```

---

### 🎯 **velvz-widget-system** (Servicio de Widgets)

```env
# Base de datos
DATABASE_URL="${{Postgres.DATABASE_URL}}"
WIDGET_DATABASE_URL="${{Postgres.DATABASE_URL}}"

# Autenticación interna
INTERNAL_API_SECRET="<mismo-valor-que-chatbot-backend>"

# OpenAI API
OPENAI_API_KEY="sk-proj-..."

# Configuración del widget
WIDGET_BASE_URL="https://your-widget-system.railway.app"
WIDGET_SECRET_KEY="<generar-con-openssl-rand-hex-32>"

# Configuración del servidor
NODE_ENV="production"
PORT="3001"
```

---

### 🎯 **velvz-auth-backend** (Servicio de Auth)

```env
# Base de datos
DATABASE_URL="${{Postgres.DATABASE_URL}}"

# JWT para autenticación
JWT_SECRET="<mismo-valor-que-chatbot-backend>"

# Email (configurar según proveedor)
EMAIL_HOST="smtp.example.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@example.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="Velvz <noreply@velvz.com>"

# URLs del frontend
FRONTEND_URL="https://velvz.com"
APP_NAME="Velvz"

# Configuración del servidor
NODE_ENV="production"
PORT="3000"
```

---

### 🗄️ **PostgreSQL (Railway)**

```env
# Variables automáticas de Railway (generadas automáticamente, no modificar)
POSTGRES_DB="railway"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="<generado-por-railway>"

# URLs de conexión (generadas automáticamente)
DATABASE_URL="postgresql://..."
DATABASE_PUBLIC_URL="postgresql://..."
```

---

## 🔐 **Secrets Compartidos Entre Sistemas**

### **INTERNAL_API_SECRET**

- **Generación:** `openssl rand -hex 32`
- **Usado en:** velvz-chatbot-backend, velvz-widget-system
- **Propósito:** Autenticación interna entre servicios

### **JWT_SECRET**

- **Generación:** `openssl rand -hex 64`
- **Usado en:** velvz-auth-backend, velvz-chatbot-backend
- **Propósito:** Firma y verificación de tokens JWT

### **OPENAI_API_KEY**

- **Obtención:** https://platform.openai.com/api-keys
- **Usado en:** velvz-chatbot-backend, velvz-widget-system
- **Propósito:** Acceso a la API de OpenAI

---

## 🔄 **Flujo de Comunicación**

```mermaid
graph LR
    A[velvz.com Frontend] --> B[velvz-auth-backend]
    A --> C[velvz-chatbot-backend]
    C --> D[velvz-widget-system]
    C --> E[OpenAI API]
    D --> F[Widget en sitio cliente]

    B -.JWT Token.-> C
    C -.INTERNAL_API_SECRET.-> D
```

---

## ⚠️ **Notas Importantes de Seguridad**

1. **NUNCA commitear secretos reales** en Git
2. **Los archivos .env** deben estar en .gitignore
3. **Railway redespliega automáticamente** cuando cambias variables
4. **Las referencias como `${{Postgres.DATABASE_URL}}`** se resuelven automáticamente en Railway
5. **WIDGET_SYSTEM_URL** debe apuntar siempre a la URL pública del sistema de widgets
6. **Los secrets compartidos** deben ser idénticos en todos los sistemas que los usen
7. **Rotar secretos periódicamente** y después de cualquier exposición

---

## 🧪 **Verificación de Configuración**

Para verificar que todo está configurado correctamente:

```bash
# 1. Test de health del backend principal
curl https://velvz-unified-backend-production.up.railway.app/health

# 2. Test del sistema de widgets
curl https://velvz-widget-system-production.up.railway.app/health

# 3. Test de sincronización (requiere INTERNAL_API_SECRET)
curl -X DELETE \
  https://velvz-widget-system-production.up.railway.app/api/sync/chatbot/999 \
  -H "X-Internal-Secret: $INTERNAL_API_SECRET"
```

Si todos devuelven respuestas exitosas, el sistema está correctamente configurado.

---

_Esta estructura representa el proyecto VELVZ con todos sus componentes y sistemas integrados._

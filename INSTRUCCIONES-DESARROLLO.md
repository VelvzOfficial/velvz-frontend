# Instrucciones de Desarrollo - Velvz Frontend

## Estructura del Proyecto

Este es el frontend de Velvz, una plataforma SaaS con múltiples servicios:
- **Hub Central** (`/app/`) - Panel principal
- **Chatbots IA** (`/app/chatbots/`) - Gestión de chatbots
- **RRHH IA** (`/app/rrhh/`) - Gestión de recursos humanos

## Arquitectura

```
Velvz/
├── index.html              # Landing page pública
├── .htaccess               # Configuración Apache (Hostinger)
├── assets/
│   ├── css/
│   │   ├── app-dashboard.css   # Estilos globales del dashboard
│   │   ├── rrhh.css            # Estilos específicos de RRHH
│   │   └── ...
│   └── js/
│       ├── auth-config.js      # Configuración de autenticación
│       ├── app-dashboard.js    # Lógica global del dashboard
│       ├── rrhh.js             # Lógica específica de RRHH
│       └── ...
├── app/
│   ├── index.html          # Hub Central
│   ├── chatbots/
│   │   └── index.html      # Panel de Chatbots
│   └── rrhh/
│       └── index.html      # Panel de RRHH
└── cuenta/
    ├── login.html
    ├── register.html
    └── ...
```

## Backend

El backend está en Railway:
- **API URL**: Se configura en `assets/js/auth-config.js`
- **Repositorio**: `VelvzOfficial/velvz-unified-backend`

## Flujo de Trabajo con Git

### ANTES de empezar a trabajar (SIEMPRE):
```bash
cd velvz-frontend
git pull
```

### DESPUÉS de hacer cambios:
```bash
git add .
git commit -m "Descripción clara del cambio"
git push
```

### Deploy Automático
- Hostinger está configurado para hacer deploy automático
- Cada `git push` actualiza automáticamente https://velvz.com
- NO es necesario subir archivos manualmente a Hostinger

## Trabajo en Equipo

### Regla Principal
**Comunicarse ANTES de empezar** qué archivos se van a modificar para evitar conflictos.

### Ejemplo de comunicación:
- "Voy a trabajar en `rrhh.css` y `rrhh/index.html`"
- "Ok, yo trabajo en `chatbots.js`"

### Si hay conflicto:
1. Git avisará al hacer `git pull`
2. Resolver manualmente el conflicto
3. Hacer commit del merge

## Convenciones de Código

### CSS
- Usar variables CSS definidas en `:root`
- Colores principales:
  - Chatbots: `#6366f1` (índigo)
  - RRHH: `#10b981` (verde)
- Metodología BEM para clases: `.velvz-componente__elemento--modificador`

### JavaScript
- Funciones en `app-dashboard.js` son globales
- Lógica específica de cada módulo en su propio archivo
- El selector de servicios se maneja inline en cada HTML

### HTML
- Mantener estructura consistente entre módulos
- El header y sidebar son similares en todos los módulos

## Archivos Importantes

| Archivo | Descripción |
|---------|-------------|
| `assets/js/auth-config.js` | URL del backend y configuración auth |
| `assets/js/app-dashboard.js` | Lógica global, verificación de sesión |
| `assets/css/app-dashboard.css` | Estilos globales del dashboard |
| `.htaccess` | Redirecciones y configuración servidor |

## Comandos Útiles

### Ver estado de cambios:
```bash
git status
```

### Ver historial de commits:
```bash
git log --oneline -10
```

### Descartar cambios locales (CUIDADO):
```bash
git checkout -- archivo.html
```

### Ver diferencias antes de commit:
```bash
git diff
```

## Solución de Problemas

### Error al hacer push
```bash
git pull --rebase
git push
```

### Conflicto de merge
1. Abrir el archivo con conflicto
2. Buscar marcadores `<<<<<<<`, `=======`, `>>>>>>>`
3. Elegir qué código mantener
4. Eliminar los marcadores
5. `git add .` y `git commit`

## URLs Importantes

- **Producción**: https://velvz.com
- **Repositorio**: https://github.com/VelvzOfficial/velvz-frontend
- **Backend API**: (ver auth-config.js)

## Colaboradores

- VelvzOfficial (propietario)
- AIAGAplicaciones (colaborador)

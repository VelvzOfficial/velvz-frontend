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
├── cuenta/
│   ├── login.html
│   ├── register.html
│   └── ...
└── docs/
    ├── ROADMAP.md          # Plan de funcionalidades
    ├── TAREAS-PENDIENTES.md # Gestión de tareas
    └── CHANGELOG.md        # Registro de cambios
```

## Backend

El backend está en Railway:
- **API URL**: Se configura en `assets/js/auth-config.js`
- **Repositorio**: `VelvzOfficial/velvz-unified-backend`

### Deploy del Backend
- **Solo Alejandro** gestiona los deploys de Railway
- Si haces cambios en el backend, haz `git push` y avisa a Alejandro para que haga el deploy
- El frontend (Hostinger) sí tiene deploy automático con cada `git push`

## Flujo de Trabajo con Git

### ANTES de empezar a trabajar (SIEMPRE):
```bash
cd velvz-frontend
git pull
```

### DESPUÉS de hacer cambios:
```bash
# IMPORTANTE: Solo añadir los archivos que modificaste, NO usar "git add ."
git add archivo1.html archivo2.css   # Solo los archivos que tocaste
git commit -m "Descripción clara del cambio"
git push
git pull   # Sincronizar con cambios remotos
```

### Regla de Git: SOLO subir lo que modificaste
- **NO usar `git add .`** - esto añade todos los archivos
- **Usar `git add <archivo>` específico** para cada archivo modificado
- Después de push, hacer `git pull` para sincronizar

### Deploy Automático
- Hostinger está configurado para hacer deploy automático
- Cada `git push` actualiza automáticamente https://velvz.com
- NO es necesario subir archivos manualmente a Hostinger

## Trabajo en Equipo

### Regla Principal: ANUNCIAR ARCHIVOS
**ANTES de empezar cualquier tarea**, listar los archivos que se van a modificar.

Formato obligatorio al inicio de cada tarea:
```
📁 ARCHIVOS A MODIFICAR:
- assets/css/app-dashboard.css
- app/chatbots/index.html
- app/rrhh/index.html
```

Esto aplica tanto a humanos como a IAs trabajando en el proyecto.

### Por qué es importante
- Evita conflictos de merge
- Permite saber si alguien más está trabajando en el mismo archivo
- Facilita la revisión de cambios

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

## Gestión del Roadmap y Tareas

### Archivos de documentación
- `docs/ROADMAP.md` - Plan de funcionalidades futuras
- `docs/TAREAS-PENDIENTES.md` - Tareas activas del equipo
- `docs/CHANGELOG.md` - Registro de cambios realizados

### Reglas para el Roadmap

1. **Al empezar una funcionalidad:**
   - Marcar la tarea como "En progreso" en TAREAS-PENDIENTES.md
   - Indicar quién la está haciendo

2. **Al completar una funcionalidad:**
   - Marcar con `[x]` en el ROADMAP.md
   - Añadir fecha: `- [x] Funcionalidad (2025-01-15)`
   - Mover a sección "Completado Recientemente"
   - Actualizar CHANGELOG.md con los cambios

3. **Formato de tareas:**
   ```markdown
   - [ ] Tarea pendiente
   - [x] Tarea completada (YYYY-MM-DD)
   ```

4. **Al añadir nuevas funcionalidades al roadmap:**
   - Incluir descripción breve
   - Asignar prioridad (Alta/Media/Baja)

### Ejemplo de flujo completo

```
1. Revisar ROADMAP.md y elegir tarea
2. Marcar en TAREAS-PENDIENTES.md como "En progreso"
3. Anunciar archivos a modificar
4. Implementar
5. Commit y push
6. Marcar [x] en ROADMAP.md
7. Actualizar CHANGELOG.md
```

## URLs Importantes

- **Producción**: https://velvz.com
- **Repositorio**: https://github.com/VelvzOfficial/velvz-frontend
- **Backend API**: (ver auth-config.js)

## Colaboradores

- VelvzOfficial (propietario)
- AIAGAplicaciones (colaborador)

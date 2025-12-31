# Changelog

Registro de cambios importantes en el proyecto.

---

## [2025-12-31]

### Añadido
- Selector de servicios en header para navegar entre Chatbots y RRHH
- Carpeta `docs/` con documentación del proyecto
- Archivo ROADMAP.md con plan de funcionalidades
- Archivo TAREAS-PENDIENTES.md para gestión de tareas

### Cambiado
- Hub ya no tiene selector (no lo necesita)
- Instrucciones de desarrollo actualizadas con nuevas reglas:
  - Anunciar archivos antes de modificar
  - Usar `git add <archivo>` específico, no `git add .`
  - Hacer `git pull` después de push

### Arreglado
- Selector de servicios ahora funciona correctamente (quitado `overflow: hidden` del header)
- Consistencia visual del selector con el searchbar

---

## [2025-12-30]

### Añadido
- Sistema de login/registro
- Dashboard de chatbots
- Dashboard de RRHH
- Hub central

### Configurado
- Deploy automático con Hostinger via Git
- Backend en Railway

---

## Formato de Entradas

```
## [YYYY-MM-DD]

### Añadido
- Nuevas funcionalidades

### Cambiado
- Cambios en funcionalidades existentes

### Arreglado
- Bugs corregidos

### Eliminado
- Funcionalidades eliminadas

### Seguridad
- Cambios relacionados con seguridad
```

---

*Actualizar este archivo con cada cambio significativo*

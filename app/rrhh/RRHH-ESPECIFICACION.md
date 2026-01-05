# Velvz RRHH - Documento de Especificación

> **Última actualización:** 5 de enero de 2026
> **Estado:** En desarrollo
> **Versión:** 0.1

---

## 1. Visión General

### 1.1 ¿Qué es Velvz RRHH?

Sistema de reclutamiento potenciado por IA que permite a PYMES gestionar procesos de selección de forma automatizada, desde la publicación de ofertas hasta la evaluación de candidatos mediante entrevistas con IA.

### 1.2 Propuesta de Valor

- **Precio accesible:** <100€/mes (vs 300-500€ de competidores)
- **IA nativa:** No es un ATS con IA añadida, sino IA desde el diseño
- **Cumplimiento EU:** RGPD y AI Act de serie
- **Simplicidad:** Diseñado para empresas sin departamento de RRHH dedicado

### 1.3 Target

- Empresas de 10-100 empleados
- Que contratan 5-50 personas/año
- Sin software de reclutamiento actual (usan Excel, email, LinkedIn)
- España y Europa (por cumplimiento normativo)

---

## 2. Funcionalidades del Producto

### 2.1 Conceptos Clave

#### Perfiles vs Procesos

| Concepto | Qué es | Ejemplo |
|----------|--------|---------|
| **Perfil** | Puesto de trabajo en la empresa (se configura UNA vez) | "Desarrollador Frontend Senior" |
| **Proceso** | Búsqueda activa para cubrir un perfil | "Proceso #3 para Desarrollador Frontend Senior" |

**Ventajas de esta separación:**
- No repetir datos cada vez que abres un proceso
- Consistencia en requisitos del mismo puesto
- Histórico de procesos por perfil
- Reutilización de configuración

### 2.2 Flujo Principal

```
[Crear Perfil] → [Crear Proceso (seleccionar perfil)] → [Recibir CVs] → [Filtrado IA] → [Entrevista IA] → [Ranking Final] → [Decisión Humana]
     ↑                      ↓
     └──── Reutilizar ──────┘
```

### 2.3 Módulos

#### 2.3.1 Gestión de Perfiles (Por desarrollar)

**Página de lista de perfiles:**
- Ver todos los perfiles de la empresa
- Crear nuevo perfil
- Editar perfil existente
- Duplicar perfil
- Eliminar perfil (solo si no tiene procesos activos)

**Editor de perfil - Secciones:**

1. **Información Básica**
   - Nombre del puesto (único en la empresa)
   - Departamento
   - Descripción del puesto
   - Ubicación
   - Modalidad (presencial/remoto/híbrido)
   - Rango salarial

2. **Requisitos**
   - Requisitos esenciales (obligatorios)
   - Requisitos deseables (suman puntos)
   - Requisitos opcionales (nice to have)
   - Idiomas requeridos
   - Años de experiencia mínimos

3. **Configuración de Filtrado**
   - Pesos por criterio (experiencia, skills, educación, idiomas)
   - Filtros automáticos
   - Límite de candidatos a pasar a entrevista

4. **Configuración de Entrevista IA**
   - Tipo de entrevista (técnica/competencias/cultural/mixta)
   - Preguntas personalizadas
   - Duración estimada
   - Aspectos a evaluar

5. **Documentos del Puesto**
   - Descripción del puesto (PDF para candidatos)
   - Documentos adicionales

#### 2.3.2 Editor de Procesos (Simplificado)

**Secciones del editor de proceso:**

1. **Selección de Perfil**
   - Selector de perfil existente
   - Vista resumen del perfil seleccionado (NO editable)
   - Enlace a "Editar perfil" si necesita cambios

2. **Configuración del Proceso**
   - Nombre del proceso (auto-generado o personalizado)
   - Fecha límite de aplicación (opcional)
   - Número máximo de candidatos (override del perfil, opcional)
   - Notas internas del proceso

3. **Resumen y Publicación**
   - Vista previa completa
   - Publicar / Guardar borrador

#### 2.2.2 Portal de Candidatos (Por desarrollar)

- Página pública donde los candidatos aplican
- Subida de CV
- Formulario de datos básicos
- **Firma de consentimiento RGPD/IA** (OBLIGATORIO)

#### 2.2.3 Filtrado Automático (Por desarrollar)

- Análisis de CV con IA
- Matching con requisitos del puesto
- Puntuación 0-100
- Explicación de la puntuación (transparencia AI Act)

#### 2.2.4 Entrevista IA (Por desarrollar)

- Chatbot que realiza entrevista
- Preguntas adaptativas según respuestas
- Grabación de respuestas (con consentimiento)
- Análisis de competencias
- Informe final por candidato

#### 2.2.5 Dashboard de Proceso (Por desarrollar)

- Lista de candidatos con puntuaciones
- Filtros y ordenación
- Vista detallada de cada candidato
- Acciones: avanzar, rechazar, contactar

#### 2.2.6 Integración OSINT (Futuro)

- Verificación de huella digital del candidato
- Solo con consentimiento explícito adicional
- Análisis de redes sociales públicas
- Verificación de información del CV

---

## 3. Requisitos Legales

### 3.1 Marco Normativo Aplicable

| Normativa | Aplica | Fecha límite |
|-----------|--------|--------------|
| RGPD (Reglamento 2016/679) | ✅ Ya en vigor | - |
| AI Act (Reglamento 2024/1689) | ✅ Sistema Alto Riesgo | Agosto 2025-2026 |
| LOPDGDD (España) | ✅ Ya en vigor | - |

### 3.2 Clasificación AI Act

**Velvz RRHH es un SISTEMA DE ALTO RIESGO** según el Anexo III del AI Act porque:
- Se usa para reclutamiento y selección de personal
- Evalúa candidatos mediante IA
- Influye en decisiones de contratación

### 3.3 Obligaciones Legales

#### 3.3.1 Transparencia (OBLIGATORIO)

- [ ] Informar CLARAMENTE que hay IA en el proceso
- [ ] Explicar QUÉ hace la IA y QUÉ criterios usa
- [ ] Mostrar aviso visible antes de cualquier interacción con IA

**Implementación:**
```
"Este proceso de selección utiliza Inteligencia Artificial para:
- Analizar tu CV y compararlo con los requisitos del puesto
- Realizar una entrevista inicial automatizada
- Generar una puntuación de compatibilidad

Un humano revisará siempre los resultados antes de cualquier decisión."
```

#### 3.3.2 Consentimiento (OBLIGATORIO)

- [ ] Checkbox específico para procesamiento por IA (no puede ser genérico)
- [ ] Consentimiento separado para OSINT/huella digital
- [ ] Posibilidad de retirar consentimiento

**Texto de consentimiento propuesto:**
```
□ Consiento que mis datos sean analizados por sistemas de Inteligencia
  Artificial para evaluar mi candidatura. Entiendo que:
  - La IA analizará mi CV y respuestas de entrevista
  - Recibiré una puntuación de compatibilidad
  - Un humano revisará los resultados antes de cualquier decisión
  - Puedo solicitar revisión humana en cualquier momento

□ (Opcional) Consiento que se analice mi huella digital pública
  (perfiles de redes sociales públicos) como parte del proceso.
```

#### 3.3.3 Supervisión Humana (OBLIGATORIO)

- [ ] La IA NO puede rechazar candidatos automáticamente
- [ ] Siempre debe haber revisión humana antes de decisiones
- [ ] El candidato puede solicitar revisión humana de su evaluación

**Implementación:**
- La IA genera ranking y puntuaciones
- El reclutador humano toma la decisión final
- Botón "Solicitar revisión humana" visible para candidatos

#### 3.3.4 No Discriminación (OBLIGATORIO)

- [ ] La IA no puede usar: género, edad, origen étnico, religión, orientación sexual
- [ ] Auditoría de sesgos del modelo
- [ ] Documentación de criterios de evaluación

**Implementación:**
- No pedir datos sensibles en formularios
- No analizar fotos de candidatos
- Criterios de evaluación basados solo en competencias y experiencia

#### 3.3.5 Derecho de Explicación (OBLIGATORIO)

- [ ] El candidato puede pedir explicación de por qué fue rechazado
- [ ] La explicación debe ser comprensible (no técnica)

**Implementación:**
- Guardar logs de evaluación
- Generar explicación automática: "Tu puntuación fue X porque..."
- Sistema de solicitud de explicación

#### 3.3.6 Retención de Datos (OBLIGATORIO)

- [ ] Definir período de retención (propuesta: 2 años)
- [ ] Eliminar datos tras el período
- [ ] Permitir eliminación anticipada si el candidato lo solicita

### 3.4 Documentos Legales Necesarios

| Documento | Prioridad | Estado | Coste estimado |
|-----------|-----------|--------|----------------|
| Textos de consentimiento | CRÍTICA | Por hacer | 500€ o DIY |
| Política de privacidad RRHH | CRÍTICA | Por hacer | 500€ o DIY |
| DPIA (Evaluación de Impacto) | ALTA | Por hacer | 1.500-3.000€ |
| AIA (Evaluación AI Act) | ALTA | Por hacer | 2.000-4.000€ |
| Términos de servicio | MEDIA | Por hacer | 500-1.000€ |

### 3.5 Checklist de Cumplimiento Pre-Lanzamiento

**Antes de beta con usuarios reales:**
- [ ] Textos de consentimiento implementados
- [ ] Aviso de IA visible en todo el flujo
- [ ] Supervisión humana obligatoria implementada
- [ ] Sistema de solicitud de explicación
- [ ] Política de privacidad publicada

**Antes de lanzamiento público:**
- [ ] DPIA completado
- [ ] AIA completado (o en proceso)
- [ ] Auditoría de sesgos realizada
- [ ] Sistema de retención/eliminación de datos

---

## 4. Arquitectura Técnica

### 4.1 Stack Actual

- **Frontend:** HTML/CSS/JS vanilla (en `/app/rrhh/`)
- **Backend:** Node.js en Railway (unificado con chatbots)
- **Base de datos:** PostgreSQL en Railway
- **IA:** OpenAI API (GPT-4)

### 4.2 Estructura de Archivos

```
/app/rrhh/
├── index.html                  # Dashboard principal RRHH
├── profiles/
│   ├── index.html              # Lista de perfiles
│   └── editor.html             # Editor de perfiles (NUEVO)
├── processes/
│   ├── index.html              # Lista de procesos
│   └── editor.html             # Editor de procesos (simplificado)
├── RRHH-ESPECIFICACION.md      # Este documento

/assets/
├── css/
│   ├── rrhh-profiles.css       # Estilos de perfiles (NUEVO)
│   └── rrhh-process-editor.css
└── js/
    ├── rrhh-profiles.js        # JS de perfiles (NUEVO)
    └── rrhh-process-editor.js
```

### 4.3 Estructura de Datos

```javascript
// =====================================================
// PERFIL (Puesto de trabajo - se configura UNA vez)
// =====================================================
{
  id: "profile_xxx",
  company_id: "comp_xxx",
  created_at: "2026-01-05T...",
  updated_at: "2026-01-05T...",

  // Información básica
  name: "Desarrollador Frontend Senior",      // Único en la empresa
  department: "Tecnología",
  description: "Buscamos un desarrollador...",
  location: "Madrid",
  modality: "hybrid",                         // "onsite" | "remote" | "hybrid"
  salary_min: 35000,
  salary_max: 45000,
  salary_period: "year",                      // "year" | "month"
  salary_visible: true,                       // Mostrar en oferta pública

  // Requisitos
  requirements: {
    essential: [
      { text: "3+ años de experiencia con React", category: "experience" },
      { text: "TypeScript avanzado", category: "skills" },
      { text: "Git y metodologías ágiles", category: "skills" }
    ],
    desired: [
      { text: "Experiencia con Next.js", category: "skills" },
      { text: "Testing (Jest, Cypress)", category: "skills" }
    ],
    nice_to_have: [
      { text: "GraphQL", category: "skills" },
      { text: "Diseño UI/UX básico", category: "skills" }
    ]
  },

  languages: [
    { language: "es", level: "native" },
    { language: "en", level: "professional" }
  ],

  min_experience_years: 3,

  // Configuración de filtrado IA
  filtering: {
    weights: {
      experience: 30,      // Total debe sumar 100
      skills: 40,
      education: 15,
      languages: 15
    },
    max_candidates_interview: 20,   // Máximo a pasar a entrevista
    auto_reject_below: 40           // Rechazar automáticamente < 40 puntos
  },

  // Configuración de entrevista IA
  interview: {
    type: "technical",              // "technical" | "competency" | "cultural" | "mixed"
    duration_minutes: 30,
    custom_questions: [
      "¿Cuál ha sido el proyecto más complejo en el que has trabajado?",
      "¿Cómo manejas los conflictos en un equipo?"
    ],
    evaluation_aspects: [
      "problem_solving",
      "communication",
      "technical_knowledge",
      "teamwork"
    ]
  },

  // Documentos
  documents: {
    job_description_url: "https://...",   // PDF público
    internal_docs: []                      // Docs internos
  },

  // Métricas históricas
  stats: {
    total_processes: 3,
    total_hired: 2,
    avg_time_to_hire_days: 25
  }
}

// =====================================================
// PROCESO (Búsqueda activa para un perfil)
// =====================================================
{
  id: "proc_xxx",
  company_id: "comp_xxx",
  profile_id: "profile_xxx",              // Referencia al perfil
  created_at: "2026-01-05T...",

  // Configuración del proceso
  name: "Frontend Senior - Enero 2026",   // Auto o manual
  status: "draft",                         // "draft" | "active" | "paused" | "closed"
  deadline: "2026-02-15T...",             // Fecha límite (opcional)
  max_candidates_override: null,          // Override del perfil (opcional)
  internal_notes: "Urgente, necesitamos cubrir antes de marzo",

  // Datos del perfil (snapshot en el momento de crear)
  // Esto permite que si editas el perfil, los procesos antiguos mantengan su config
  profile_snapshot: {
    name: "Desarrollador Frontend Senior",
    // ... copia de los datos del perfil
  },

  // Métricas del proceso
  metrics: {
    total_applications: 0,
    filtered_candidates: 0,
    interviewed: 0,
    shortlisted: 0,
    rejected: 0,
    hired: 0
  },

  // URLs públicas
  public_url: "https://velvz.com/apply/proc_xxx",

  // Fechas
  published_at: null,
  closed_at: null
}

// Candidato
{
  id: "cand_xxx",
  process_id: "proc_xxx",

  // Datos básicos
  name: "Juan García",
  email: "juan@email.com",
  phone: "+34...",

  // CV
  cv_url: "...",
  cv_parsed: {
    experience: [...],
    education: [...],
    skills: [...]
  },

  // Consentimientos (CRÍTICO)
  consents: {
    ai_processing: true,
    ai_processing_date: "2026-01-05T...",
    osint_check: false,
    data_retention: true
  },

  // Evaluación IA
  ai_evaluation: {
    score: 78,
    breakdown: {
      experience: 85,
      skills: 72,
      education: 80,
      languages: 75
    },
    explanation: "...",
    evaluated_at: "2026-01-05T..."
  },

  // Entrevista IA
  ai_interview: {
    status: "completed",
    started_at: "...",
    completed_at: "...",
    transcript: [...],
    evaluation: {
      score: 82,
      aspects: {...},
      summary: "..."
    }
  },

  // Estado
  status: "new" | "filtered" | "interviewing" | "interviewed" | "shortlisted" | "rejected" | "hired",
  human_notes: "...",
  human_decision: null | "advance" | "reject" | "hire",
  human_decision_by: "user_xxx",
  human_decision_at: "..."
}
```

### 4.4 Endpoints API Necesarios

```
# Perfiles (NUEVO)
POST   /api/rrhh/profiles               # Crear perfil
GET    /api/rrhh/profiles               # Listar perfiles
GET    /api/rrhh/profiles/:id           # Obtener perfil
PUT    /api/rrhh/profiles/:id           # Actualizar perfil
DELETE /api/rrhh/profiles/:id           # Eliminar perfil
POST   /api/rrhh/profiles/:id/duplicate # Duplicar perfil

# Procesos
POST   /api/rrhh/processes              # Crear proceso (requiere profile_id)
GET    /api/rrhh/processes              # Listar procesos
GET    /api/rrhh/processes/:id          # Obtener proceso
PUT    /api/rrhh/processes/:id          # Actualizar proceso
DELETE /api/rrhh/processes/:id          # Eliminar proceso
POST   /api/rrhh/processes/:id/publish  # Publicar proceso
POST   /api/rrhh/processes/:id/pause    # Pausar proceso
POST   /api/rrhh/processes/:id/close    # Cerrar proceso

# Candidatos
GET    /api/rrhh/processes/:id/candidates     # Listar candidatos
POST   /api/rrhh/processes/:id/apply          # Aplicar (público)
GET    /api/rrhh/candidates/:id               # Detalle candidato
PUT    /api/rrhh/candidates/:id/decision      # Decisión humana
POST   /api/rrhh/candidates/:id/request-review # Solicitar revisión

# Entrevista IA
POST   /api/rrhh/interview/start        # Iniciar entrevista
POST   /api/rrhh/interview/message      # Enviar mensaje
POST   /api/rrhh/interview/end          # Finalizar entrevista

# OSINT (futuro)
POST   /api/rrhh/candidates/:id/osint   # Solicitar análisis OSINT
```

---

## 5. Roadmap de Desarrollo

### 5.1 Fase 1: Gestión de Perfiles (ACTUAL - PRIORIDAD)

**Objetivo:** Sistema completo de perfiles de puestos

**1.1 Lista de Perfiles**
- [ ] Página `/app/rrhh/profiles/index.html`
- [ ] Listar perfiles existentes
- [ ] Botón crear nuevo perfil
- [ ] Acciones: editar, duplicar, eliminar
- [ ] Búsqueda y filtros

**1.2 Editor de Perfiles**
- [ ] Página `/app/rrhh/profiles/editor.html`
- [ ] 5 secciones con tabs (estilo chatbots):
  1. Información Básica
  2. Requisitos
  3. Configuración Filtrado
  4. Configuración Entrevista IA
  5. Documentos
- [ ] Guardar borrador
- [ ] Validación de campos

**Archivos nuevos:**
- `profiles/index.html`
- `profiles/editor.html`
- `assets/css/rrhh-profiles.css`
- `assets/js/rrhh-profiles.js`

### 5.2 Fase 2: Editor de Procesos Simplificado

**Objetivo:** Crear procesos seleccionando un perfil

- [ ] Simplificar editor actual a 3 secciones:
  1. Selección de Perfil (+ resumen)
  2. Configuración del Proceso
  3. Resumen y Publicación
- [ ] Selector de perfiles existentes
- [ ] Vista resumen no editable del perfil
- [ ] Enlace a "Editar perfil"

**Archivos a modificar:**
- `processes/editor.html` (simplificar)
- `assets/js/rrhh-process-editor.js` (simplificar)

### 5.3 Fase 3: Portal de Candidatos

**Objetivo:** Candidatos pueden aplicar

- [ ] Página pública de aplicación
- [ ] Formulario con subida de CV
- [ ] Consentimientos RGPD/IA
- [ ] Confirmación de aplicación
- [ ] Email de confirmación

### 5.4 Fase 4: Filtrado IA

**Objetivo:** IA analiza y puntúa CVs

- [ ] Parser de CV (PDF → JSON)
- [ ] Prompt de evaluación vs requisitos
- [ ] Sistema de puntuación
- [ ] Generación de explicación
- [ ] Dashboard con ranking

### 5.5 Fase 5: Entrevista IA

**Objetivo:** Chatbot realiza entrevistas

- [ ] Generación de preguntas según perfil
- [ ] Flujo de conversación adaptativo
- [ ] Grabación de respuestas
- [ ] Evaluación de respuestas
- [ ] Informe final

### 5.6 Fase 6: OSINT (Futuro)

**Objetivo:** Verificación de huella digital

- [ ] Definir alcance legal
- [ ] Integración con fuentes OSINT
- [ ] Consentimiento específico
- [ ] Informe de hallazgos

---

## 6. Pricing Propuesto

### 6.1 Modelo de Precios

| Plan | Precio | Incluido |
|------|--------|----------|
| **Starter** | 49€/mes | 1 proceso activo, 50 candidatos/mes |
| **Pro** | 89€/mes | 5 procesos activos, 200 candidatos/mes |
| **Business** | 149€/mes | Procesos ilimitados, 500 candidatos/mes, OSINT (10 informes) |

### 6.2 Costes Estimados por Cliente

- API OpenAI: ~0.50€ por candidato evaluado
- API OpenAI entrevista: ~1€ por entrevista
- Almacenamiento: despreciable
- **Coste medio por cliente activo:** ~15-30€/mes

### 6.3 Márgenes Estimados

| Plan | Precio | Coste medio | Margen |
|------|--------|-------------|--------|
| Starter | 49€ | 15€ | 34€ (69%) |
| Pro | 89€ | 25€ | 64€ (72%) |
| Business | 149€ | 40€ | 109€ (73%) |

---

## 7. Competencia

### 7.1 Competidores Directos

| Competidor | Precio | Fortaleza | Debilidad |
|------------|--------|-----------|-----------|
| Factorial | 6-8€/empleado/mes | Suite completa RRHH | No es IA nativa |
| Personio | 8-12€/empleado/mes | Enterprise ready | Caro para PYMES |
| Recruitee | 200€+/mes | Buen ATS | Sin IA real |
| SmartRecruiters | 300€+/mes | IA avanzada | Muy caro |

### 7.2 Posicionamiento Velvz

- **Más barato** que todos los anteriores
- **Más IA** que Factorial/Personio
- **Más accesible** que SmartRecruiters
- **Cumplimiento EU** nativo (vs players USA)

---

## 8. Métricas de Éxito

### 8.1 KPIs Producto

- Procesos creados por usuario/mes
- Candidatos procesados por proceso
- Tasa de conversión (candidato → contratado)
- NPS de reclutadores
- Tiempo medio de contratación

### 8.2 KPIs Negocio

- MRR (Monthly Recurring Revenue)
- Churn rate
- CAC (Customer Acquisition Cost)
- LTV (Lifetime Value)
- Break-even: 225 clientes

---

## 9. Preguntas Abiertas

1. **¿Qué idiomas soportamos inicialmente?** (Propuesta: ES, EN)
2. **¿Integraciones con job boards?** (LinkedIn, InfoJobs...)
3. **¿App móvil para candidatos?**
4. **¿Video-entrevistas además de chat?**
5. **¿Quién hace la auditoría de sesgos?**

---

## 10. Changelog

| Fecha | Versión | Cambios |
|-------|---------|---------|
| 2026-01-05 | 0.2 | Reestructuración: separación Perfiles vs Procesos |
| 2026-01-05 | 0.1 | Documento inicial |


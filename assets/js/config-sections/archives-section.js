// =====================================================
// GESTIÓN DE ARCHIVOS Y DOCUMENTOS - VERSIÓN FINAL
// Compatible con ambas estructuras del backend
// =====================================================

console.log("📁 Cargando módulo de archivos v3.0 (eliminación diferida)...");

// Variable global para almacenar documentos y ordenarlos
let currentDocuments = [];
let currentSortOrder = 'date-desc';

// =====================================================
// SISTEMA DE ELIMINACIÓN DIFERIDA
// Los documentos se marcan para eliminar pero NO se borran
// hasta que el usuario presione "Guardar"
// =====================================================
let pendingDeletions = []; // Array de IDs de documentos pendientes de eliminar

// =====================================================
// CARGAR DOCUMENTOS EXISTENTES
// =====================================================

async function loadDocuments(chatbotId) {
  try {
    console.log(`📋 Cargando documentos del chatbot ${chatbotId}...`);

    const response = await window.dashboardAPI.getDocuments(chatbotId);

    console.log("🔍 [DEBUG] Respuesta completa:", response);

    if (response.success) {
      // MANEJO DE AMBAS ESTRUCTURAS DEL BACKEND
      let documents = [];
      let count = 0;

      // Estructura 1: chatbots.routes.js devuelve array directo en data
      if (Array.isArray(response.data)) {
        documents = response.data;
        count = documents.length;
        console.log("📦 Estructura detectada: Array directo en data");
      }
      // Estructura 2: documents.routes.js devuelve objeto con documents, chatbot, count
      else if (response.data && typeof response.data === "object") {
        documents = response.data.documents || [];
        count = response.data.count || documents.length;
        console.log("📦 Estructura detectada: Objeto con documents");
      }

      console.log(`✅ ${count} documentos encontrados`);

      // Guardar documentos globalmente para ordenación
      currentDocuments = documents;

      // Aplicar ordenación actual y mostrar
      const sortedDocs = sortDocuments(documents, currentSortOrder);
      displayDocuments(sortedDocs);
      updateFileCount(count);
    } else {
      console.warn("⚠️ No se pudieron cargar los documentos");
      showEmptyState();
    }
  } catch (error) {
    console.error("❌ Error cargando documentos:", error);
    showEmptyState();
  }
}

// =====================================================
// MOSTRAR DOCUMENTOS EN LA UI
// =====================================================

function displayDocuments(documents) {
  console.log("📄 [DEBUG] displayDocuments llamado con:", documents);

  const fileListContent = document.getElementById("fileListContent");
  const emptyState = document.getElementById("emptyFileState");

  if (!fileListContent) {
    console.error("❌ fileListContent no encontrado");
    return;
  }

  // Asegurarse de que documents es un array
  if (!Array.isArray(documents)) {
    console.warn("⚠️ documents no es un array, convirtiendo...");
    documents = [];
  }

  if (documents.length === 0) {
    console.log("📭 No hay documentos, mostrando estado vacío");
    showEmptyState();
    return;
  }

  // Ocultar estado vacío
  if (emptyState) emptyState.style.display = "none";

  console.log(`📄 Mostrando ${documents.length} documentos`);

  // Generar HTML - COMPATIBLE CON LOS CAMPOS REALES DEL BACKEND
  fileListContent.innerHTML = documents
    .map((doc) => {
      // Mapeo de campos según la estructura del backend
      const docId = doc.id;
      const fileName = doc.original_name || doc.filename || "Sin nombre";
      const fileSize = doc.size_bytes || doc.file_size || 0;
      const uploadDate = doc.created_at || doc.uploaded_at || new Date();
      const mimeType =
        doc.mime_type || doc.mimetype || "application/octet-stream";
      const status = doc.status || "processed";

      // Mapeo de estados según chatbots.routes.js
      const statusClass =
        status === "processed" || status === "active"
          ? "success"
          : status === "processing" || status === "pending"
          ? "warning"
          : status === "error"
          ? "danger"
          : "secondary";

      const statusText =
        status === "processed" || status === "active"
          ? "Activo"
          : status === "processing" || status === "pending"
          ? "Procesando"
          : status === "error"
          ? "Error"
          : status;

      return `
        <div class="velvz-file-item" data-document-id="${docId}">
          <div class="velvz-file-item__icon">
            ${getFileIcon(mimeType)}
          </div>
          <div class="velvz-file-item__info">
            <div class="velvz-file-item__name">${fileName}</div>
            <div class="velvz-file-item__meta">
              <span class="velvz-file-item__size">${formatFileSize(
                fileSize
              )}</span>
              <span class="velvz-file-item__date">${formatDate(
                uploadDate
              )}</span>
            </div>
            ${
              doc.error_message
                ? `<div class="velvz-file-item__error">${doc.error_message}</div>`
                : ""
            }
          </div>
          <div class="velvz-file-item__status">
            <span class="velvz-status velvz-status--${statusClass}">
              ${statusText}
            </span>
          </div>
          <div class="velvz-file-item__actions">
            <button class="velvz-btn-icon velvz-btn-icon--danger" onclick="deleteDocument('${docId}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `;
    })
    .join("");
}

// =====================================================
// CONFIGURAR DRAG & DROP Y FILE INPUT
// =====================================================

function setupFileUpload() {
  console.log("🔧 Iniciando setupFileUpload...");

  const uploadArea = document.getElementById("uploadArea");
  const fileInput = document.getElementById("fileInput");

  if (!uploadArea || !fileInput) {
    console.warn("⚠️ Elementos no encontrados, reintentando en 1s...");
    setTimeout(setupFileUpload, 1000);
    return;
  }

  // Limpiar event listeners anteriores
  const newUploadArea = uploadArea.cloneNode(true);
  const newFileInput = fileInput.cloneNode(true);
  uploadArea.parentNode.replaceChild(newUploadArea, uploadArea);
  fileInput.parentNode.replaceChild(newFileInput, fileInput);

  // Obtener referencias a los nuevos elementos
  const cleanUploadArea = document.getElementById("uploadArea");
  const cleanFileInput = document.getElementById("fileInput");

  // Configurar drag & drop
  ["dragenter", "dragover"].forEach((eventName) => {
    cleanUploadArea.addEventListener(
      eventName,
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        highlight(e);
      },
      false
    );
  });

  ["dragleave", "drop"].forEach((eventName) => {
    cleanUploadArea.addEventListener(
      eventName,
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        unhighlight(e);
      },
      false
    );
  });

  // Manejar drop
  cleanUploadArea.addEventListener(
    "drop",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleDrop(e);
    },
    false
  );

  // Click para abrir selector
  cleanUploadArea.addEventListener("click", (e) => {
    if (!e.target.closest("button") && !e.target.closest("a")) {
      cleanFileInput.click();
    }
  });

  // Cambio en input
  cleanFileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  });

  console.log("✅ setupFileUpload completado");
}

function highlight(e) {
  document
    .getElementById("uploadArea")
    ?.classList.add("velvz-upload-area--dragover");
}

function unhighlight(e) {
  document
    .getElementById("uploadArea")
    ?.classList.remove("velvz-upload-area--dragover");
}

function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  handleFiles(files);
}

// =====================================================
// MANEJAR ARCHIVOS SELECCIONADOS
// =====================================================

async function handleFiles(files) {
  console.log(`📤 Procesando ${files.length} archivo(s)...`);

  if (!files || files.length === 0) {
    showError("No se seleccionaron archivos");
    return;
  }

  const chatbotId = getChatbotIdFromUrl();
  if (!chatbotId) {
    showError("Error: ID de chatbot no encontrado");
    return;
  }

  // Validar archivos
  for (const file of files) {
    const validation = validateFile(file);
    if (validation.errors.length > 0) {
      showError(`Error en ${file.name}: ${validation.errors.join(", ")}`);
      return;
    }
  }

  try {
    showLoading("Subiendo archivos...");

    // Usar el método del API o fetch directo
    let response;

    if (window.dashboardAPI.uploadDocuments) {
      // Método del API
      response = await window.dashboardAPI.uploadDocuments(chatbotId, files);
    } else {
      // Fallback con fetch directo
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const fetchResponse = await fetch(
        `${window.dashboardAPI.baseURL}/api/chatbots/${chatbotId}/documents`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${window.dashboardAPI.token}`,
          },
          body: formData,
        }
      );

      response = await fetchResponse.json();
    }

    console.log("📦 Respuesta del upload:", response);

    hideLoading();

    // Manejar respuesta según la estructura
    if (response.success || response.data?.uploaded?.length > 0) {
      // Contar archivos exitosos
      const successCount =
        response.data?.summary?.successful ||
        response.data?.uploaded?.length ||
        (response.data && Array.isArray(response.data)
          ? response.data.length
          : 0) ||
        files.length;

      const failCount =
        response.data?.summary?.failed || response.data?.failed?.length || 0;

      if (failCount > 0) {
        showError(
          `${successCount} archivo(s) subido(s), ${failCount} con errores`
        );
        // Mostrar errores específicos
        if (response.data?.failed) {
          response.data.failed.forEach((f) => {
            console.error(`❌ ${f.filename}: ${f.error}`);
          });
        }
      } else {
        showSuccess(`${successCount} archivo(s) subido(s) correctamente`);
      }

      // Esperar un poco para que el backend procese
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Recargar documentos
      await loadDocuments(chatbotId);

      // Limpiar input
      const fileInput = document.getElementById("fileInput");
      if (fileInput) fileInput.value = "";
    } else {
      showError(
        response.message || response.error || "Error al subir archivos"
      );
    }
  } catch (error) {
    hideLoading();
    console.error("❌ Error:", error);
    showError(`Error subiendo archivos: ${error.message}`);
  }
}

// =====================================================
// VALIDAR ARCHIVO
// =====================================================

function validateFile(file) {
  const errors = [];

  const allowedTypes = [
    "application/pdf",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/html",
    "text/markdown",
    "application/rtf",
  ];

  if (!allowedTypes.includes(file.type)) {
    errors.push("Tipo de archivo no soportado");
  }

  const maxSize = 20 * 1024 * 1024; // 20MB
  if (file.size > maxSize) {
    errors.push("Archivo demasiado grande (máximo 20MB)");
  }

  if (!file.name || file.name.trim().length === 0) {
    errors.push("Nombre de archivo inválido");
  }

  return { errors };
}

// =====================================================
// MARCAR DOCUMENTO PARA ELIMINAR (DIFERIDO)
// NO elimina de la base de datos, solo marca visualmente
// =====================================================

function markDocumentForDeletion(documentId) {
  if (!documentId) {
    console.error("No hay ID de documento para marcar");
    return;
  }

  const fileItem = document.querySelector(`.velvz-file-item[data-document-id="${documentId}"]`);
  if (!fileItem) return;

  // Si ya está marcado para eliminar, no hacer nada
  if (pendingDeletions.includes(documentId)) {
    return;
  }

  // Añadir a la lista de pendientes
  pendingDeletions.push(documentId);
  console.log(`🗑️ Documento ${documentId} marcado para eliminar. Pendientes:`, pendingDeletions);

  // Marcar visualmente como pendiente de eliminar
  fileItem.classList.add('velvz-file-item--pending-delete');

  // Cambiar el botón de eliminar por uno de restaurar
  const deleteBtn = fileItem.querySelector('.velvz-btn-icon--danger');
  if (deleteBtn) {
    deleteBtn.innerHTML = '<i class="fas fa-undo"></i>';
    deleteBtn.classList.remove('velvz-btn-icon--danger');
    deleteBtn.classList.add('velvz-btn-icon--restore');
    deleteBtn.title = 'Restaurar documento';
    deleteBtn.onclick = () => restoreDocument(documentId);
  }

  // Añadir badge de "Pendiente de eliminar"
  const statusEl = fileItem.querySelector('.velvz-file-item__status');
  if (statusEl) {
    statusEl.innerHTML = `
      <span class="velvz-status velvz-status--danger">
        <i class="fas fa-trash-alt"></i>
        Pendiente de eliminar
      </span>
    `;
  }

  // Marcar como cambios sin guardar
  if (typeof window.markAsChanged === 'function') {
    window.markAsChanged();
  }

  // Actualizar contador visual (excluyendo pendientes)
  updateFileCountExcludingPending();

  showSuccess("Documento marcado para eliminar. Guarda los cambios para confirmar.");
}

// =====================================================
// RESTAURAR DOCUMENTO (quitar de pendientes)
// =====================================================

function restoreDocument(documentId) {
  if (!documentId) return;

  // Quitar de la lista de pendientes
  pendingDeletions = pendingDeletions.filter(id => id !== documentId);
  console.log(`↩️ Documento ${documentId} restaurado. Pendientes:`, pendingDeletions);

  const fileItem = document.querySelector(`.velvz-file-item[data-document-id="${documentId}"]`);
  if (!fileItem) return;

  // Quitar marca visual
  fileItem.classList.remove('velvz-file-item--pending-delete');

  // Restaurar botón de eliminar
  const restoreBtn = fileItem.querySelector('.velvz-btn-icon--restore');
  if (restoreBtn) {
    restoreBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
    restoreBtn.classList.remove('velvz-btn-icon--restore');
    restoreBtn.classList.add('velvz-btn-icon--danger');
    restoreBtn.title = 'Eliminar documento';
    restoreBtn.onclick = () => markDocumentForDeletion(documentId);
  }

  // Restaurar estado original
  const doc = currentDocuments.find(d => d.id === documentId);
  const statusEl = fileItem.querySelector('.velvz-file-item__status');
  if (statusEl && doc) {
    const status = doc.status || 'active';
    const statusConfig = {
      active: { class: 'success', text: 'Activo', icon: 'check-circle' },
      processing: { class: 'warning', text: 'Procesando', icon: 'spinner fa-spin' },
      error: { class: 'danger', text: 'Error', icon: 'exclamation-circle' },
      pending: { class: 'secondary', text: 'Pendiente', icon: 'clock' }
    };
    const config = statusConfig[status] || statusConfig.active;
    statusEl.innerHTML = `
      <span class="velvz-status velvz-status--${config.class}">
        <i class="fas fa-${config.icon}"></i>
        ${config.text}
      </span>
    `;
  }

  // Actualizar contador
  updateFileCountExcludingPending();

  // Si no quedan pendientes, quitar marca de cambios si no hay otros cambios
  if (pendingDeletions.length === 0) {
    // El estado de "cambios sin guardar" se maneja globalmente
  }

  showSuccess("Documento restaurado");
}

// =====================================================
// ACTUALIZAR CONTADOR EXCLUYENDO PENDIENTES
// =====================================================

function updateFileCountExcludingPending() {
  const activeCount = currentDocuments.length - pendingDeletions.length;
  updateFileCount(activeCount);

  // Mostrar/ocultar botón eliminar todos según documentos activos
  const deleteAllBtn = document.getElementById("deleteAllDocumentsBtn");
  if (deleteAllBtn) {
    deleteAllBtn.style.display = activeCount > 0 ? "inline-flex" : "none";
  }
}

// =====================================================
// ELIMINAR TODOS LOS DOCUMENTOS (DIFERIDO)
// =====================================================

async function deleteAllDocuments() {
  // Obtener documentos NO marcados para eliminar
  const activeDocuments = currentDocuments.filter(doc => !pendingDeletions.includes(doc.id));
  const count = activeDocuments.length;

  if (count === 0) {
    showError("No hay documentos para eliminar");
    return;
  }

  // Confirmación con modal personalizado
  const confirmDelete = await window.velvzModal.confirm({
    title: 'Marcar todos para eliminar',
    message: `¿Marcar ${count} documento(s) para eliminar? Los cambios se aplicarán cuando guardes.`,
    confirmText: 'Marcar todos',
    cancelText: 'Cancelar',
    type: 'danger'
  });

  if (!confirmDelete) {
    return;
  }

  // Marcar todos los documentos activos para eliminar
  activeDocuments.forEach(doc => {
    if (!pendingDeletions.includes(doc.id)) {
      markDocumentForDeletion(doc.id);
    }
  });

  showSuccess(`${count} documento(s) marcados para eliminar. Guarda para confirmar.`);
}

// =====================================================
// ELIMINAR DOCUMENTO (WRAPPER PARA COMPATIBILIDAD)
// =====================================================

async function deleteDocument(documentId) {
  // Simplemente marcar para eliminar (diferido)
  markDocumentForDeletion(documentId);
}

// =====================================================
// EJECUTAR ELIMINACIONES PENDIENTES
// Esta función se llama desde el guardado general
// =====================================================

async function executePendingDeletions() {
  if (pendingDeletions.length === 0) {
    console.log("📁 No hay documentos pendientes de eliminar");
    return { success: true, deleted: 0 };
  }

  console.log(`🗑️ Ejecutando eliminación de ${pendingDeletions.length} documentos...`);

  let deletedCount = 0;
  let errors = [];

  for (const documentId of pendingDeletions) {
    try {
      let response;

      try {
        response = await window.dashboardAPI.deleteDocument(documentId);
      } catch (error) {
        // Fallback a fetch directo
        const fetchResponse = await fetch(
          `${window.dashboardAPI.baseURL}/api/chatbots/documents/${documentId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${window.dashboardAPI.token}`,
              "Content-Type": "application/json",
            },
          }
        );
        response = await fetchResponse.json();
      }

      if (response.success) {
        deletedCount++;
        // Quitar del array local
        currentDocuments = currentDocuments.filter(doc => doc.id !== documentId);
        // Quitar elemento del DOM
        const fileItem = document.querySelector(`.velvz-file-item[data-document-id="${documentId}"]`);
        if (fileItem) {
          fileItem.remove();
        }
      } else {
        errors.push(documentId);
      }
    } catch (error) {
      console.error(`❌ Error eliminando documento ${documentId}:`, error);
      errors.push(documentId);
    }
  }

  // Limpiar lista de pendientes (los que se eliminaron)
  pendingDeletions = errors; // Solo quedan los que fallaron

  // Actualizar UI
  updateFileCount(currentDocuments.length);
  if (currentDocuments.length === 0) {
    showEmptyState();
  }

  console.log(`✅ Eliminados: ${deletedCount}, Errores: ${errors.length}`);

  return {
    success: errors.length === 0,
    deleted: deletedCount,
    errors: errors
  };
}

// =====================================================
// OBTENER ESTADO DE ELIMINACIONES PENDIENTES
// =====================================================

function getPendingDeletions() {
  return [...pendingDeletions];
}

function hasPendingDeletions() {
  return pendingDeletions.length > 0;
}

// =====================================================
// LIMPIAR ELIMINACIONES PENDIENTES (para descartar cambios)
// =====================================================

function clearPendingDeletions() {
  // Restaurar todos los documentos marcados
  const toRestore = [...pendingDeletions];
  toRestore.forEach(docId => restoreDocument(docId));
  pendingDeletions = [];
  console.log("🧹 Eliminaciones pendientes descartadas");
}

// =====================================================
// ESTADÍSTICAS DE ARCHIVOS
// =====================================================

async function loadFileStats(chatbotId) {
  try {
    console.log(`📊 Cargando estadísticas para chatbot ${chatbotId}...`);

    let response;

    // Intentar obtener estadísticas
    try {
      response = await window.dashboardAPI.getDocumentStats(chatbotId);
    } catch (error) {
      // Si falla, usar los documentos para calcular estadísticas
      console.log("⚠️ getDocumentStats no disponible, calculando manualmente");
      const docsResponse = await window.dashboardAPI.getDocuments(chatbotId);

      if (docsResponse.success) {
        const documents = Array.isArray(docsResponse.data)
          ? docsResponse.data
          : docsResponse.data?.documents || [];

        const totalSize = documents.reduce(
          (sum, doc) => sum + (doc.size_bytes || doc.file_size || 0),
          0
        );

        response = {
          success: true,
          data: {
            total_documents: documents.length,
            total_size_bytes: totalSize,
            total_size_mb: (totalSize / 1024 / 1024).toFixed(2),
            processed: documents.filter(
              (d) => d.status === "processed" || d.status === "active"
            ).length,
            processing: documents.filter(
              (d) => d.status === "processing" || d.status === "pending"
            ).length,
            errors: documents.filter((d) => d.status === "error").length,
          },
        };
      }
    }

    if (response?.success) {
      updateFileStats(response.data);
      console.log("✅ Estadísticas cargadas");
    }
  } catch (error) {
    console.error("❌ Error cargando estadísticas:", error);
  }
}

function updateFileStats(stats) {
  const totalFilesEl = document.getElementById("totalFiles");
  const totalSizeEl = document.getElementById("totalSize");
  const processedFilesEl = document.getElementById("processedFiles");

  if (totalFilesEl) {
    totalFilesEl.textContent = stats.total_documents || stats.total_files || 0;
  }
  if (totalSizeEl) {
    totalSizeEl.textContent = stats.total_size_mb
      ? `${stats.total_size_mb} MB`
      : formatFileSize(stats.total_size_bytes || stats.total_size || 0);
  }
  if (processedFilesEl) {
    processedFilesEl.textContent =
      stats.processed || stats.processed_files || 0;
  }
}

// =====================================================
// ORDENACIÓN DE DOCUMENTOS
// =====================================================

function sortDocuments(documents, sortOrder) {
  if (!Array.isArray(documents) || documents.length === 0) {
    return documents;
  }

  const sorted = [...documents];

  switch (sortOrder) {
    case 'date-desc':
      sorted.sort((a, b) => {
        const dateA = new Date(a.created_at || a.uploaded_at || 0);
        const dateB = new Date(b.created_at || b.uploaded_at || 0);
        return dateB - dateA;
      });
      break;
    case 'date-asc':
      sorted.sort((a, b) => {
        const dateA = new Date(a.created_at || a.uploaded_at || 0);
        const dateB = new Date(b.created_at || b.uploaded_at || 0);
        return dateA - dateB;
      });
      break;
    case 'name-asc':
      sorted.sort((a, b) => {
        const nameA = (a.original_name || a.filename || '').toLowerCase();
        const nameB = (b.original_name || b.filename || '').toLowerCase();
        return nameA.localeCompare(nameB, 'es');
      });
      break;
    case 'name-desc':
      sorted.sort((a, b) => {
        const nameA = (a.original_name || a.filename || '').toLowerCase();
        const nameB = (b.original_name || b.filename || '').toLowerCase();
        return nameB.localeCompare(nameA, 'es');
      });
      break;
    default:
      break;
  }

  return sorted;
}

function handleSortChange(sortOrder) {
  console.log(`🔄 Cambiando ordenación a: ${sortOrder}`);
  currentSortOrder = sortOrder;

  if (currentDocuments.length > 0) {
    const sortedDocs = sortDocuments(currentDocuments, sortOrder);
    displayDocuments(sortedDocs);
  }
}

// =====================================================
// FUNCIONES AUXILIARES
// =====================================================

function getFileIcon(mimeType) {
  const iconMap = {
    "application/pdf": '<i class="fas fa-file-pdf"></i>',
    "text/plain": '<i class="fas fa-file-alt"></i>',
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      '<i class="fas fa-file-word"></i>',
    "application/msword": '<i class="fas fa-file-word"></i>',
    "text/html": '<i class="fas fa-file-code"></i>',
    "text/markdown": '<i class="fas fa-file-code"></i>',
    "application/rtf": '<i class="fas fa-file-alt"></i>',
  };

  return iconMap[mimeType] || '<i class="fas fa-file"></i>';
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `Hace ${diffMinutes} minuto${diffMinutes !== 1 ? "s" : ""}`;
    }
    return `Hace ${diffHours} hora${diffHours !== 1 ? "s" : ""}`;
  } else if (diffDays === 1) {
    return "Ayer";
  } else if (diffDays < 7) {
    return `Hace ${diffDays} días`;
  } else {
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
}

function showEmptyState() {
  const fileListContent = document.getElementById("fileListContent");
  const emptyState = document.getElementById("emptyFileState");

  if (fileListContent) fileListContent.innerHTML = "";
  if (emptyState) emptyState.style.display = "flex";
  updateFileCount(0);
}

function updateFileCount(count) {
  const fileCountEl = document.getElementById("fileCount");
  if (fileCountEl) fileCountEl.textContent = count;

  // Mostrar/ocultar botón de eliminar todos
  const deleteAllBtn = document.getElementById("deleteAllDocumentsBtn");
  if (deleteAllBtn) {
    deleteAllBtn.style.display = count > 0 ? "inline-flex" : "none";
  }
}

function getChatbotIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

let loadingNotification = null;

function showLoading(message = "Cargando...") {
  console.log(`⏳ ${message}`);
  // Usar VelvzNotify si está disponible
  if (window.VelvzNotify) {
    loadingNotification = window.VelvzNotify.loading(message);
  }
}

function hideLoading() {
  console.log("✅ Loading completado");
  // Cerrar notificación de loading
  if (loadingNotification && window.VelvzNotify) {
    window.VelvzNotify.dismiss(loadingNotification);
    loadingNotification = null;
  }
}

function showSuccess(message) {
  console.log(`✅ ${message}`);
  if (window.VelvzNotify) {
    window.VelvzNotify.success(message, "Éxito");
  }
}

function showError(message) {
  console.error(`❌ ${message}`);
  if (window.VelvzNotify) {
    window.VelvzNotify.error(message, "Error");
  }
}

// =====================================================
// INICIALIZACIÓN
// =====================================================

function initializeArchivesSection() {
  console.log("🔧 Inicializando sección de archivos...");

  // Esperar un momento para asegurar que el DOM esté listo
  setTimeout(() => {
    setupFileUpload();

    // Configurar botón de eliminar todos
    const deleteAllBtn = document.getElementById("deleteAllDocumentsBtn");
    if (deleteAllBtn) {
      deleteAllBtn.addEventListener("click", deleteAllDocuments);
    }

    // Configurar selector de ordenación
    const sortSelect = document.getElementById("fileSortOrder");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        handleSortChange(e.target.value);
      });
      console.log("✅ Selector de ordenación configurado");
    }

    const chatbotId = getChatbotIdFromUrl();
    if (chatbotId) {
      loadDocuments(chatbotId);
      loadFileStats(chatbotId);
    }

    console.log("✅ Sección de archivos inicializada");
  }, 500);
}

// Inicializar cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeArchivesSection);
} else {
  setTimeout(initializeArchivesSection, 500);
}

// =====================================================
// DEBUG HELPERS
// =====================================================

window.debugArchives = async function () {
  console.log("=== DEBUG ARCHIVES ===");

  const chatbotId = getChatbotIdFromUrl();
  if (!chatbotId) {
    console.error("No hay chatbot ID");
    return;
  }

  console.log("Chatbot ID:", chatbotId);

  // Obtener documentos y ver estructura
  try {
    const response = await window.dashboardAPI.getDocuments(chatbotId);
    console.log("Respuesta getDocuments:", response);

    // Verificar estructura
    if (response.success) {
      if (Array.isArray(response.data)) {
        console.log("✅ Estructura: Array directo en data");
        console.log("Documentos:", response.data);
      } else if (response.data?.documents) {
        console.log("✅ Estructura: Objeto con documents");
        console.log("Documentos:", response.data.documents);
      } else {
        console.log("⚠️ Estructura desconocida");
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

console.log("💡 Usa window.debugArchives() para debug");

// Exportar funciones globales
window.loadDocuments = loadDocuments;
window.deleteDocument = deleteDocument;
window.deleteAllDocuments = deleteAllDocuments;
window.initializeArchivesSection = initializeArchivesSection;

// Exportar funciones de eliminación diferida
window.executePendingDeletions = executePendingDeletions;
window.getPendingDeletions = getPendingDeletions;
window.hasPendingDeletions = hasPendingDeletions;
window.clearPendingDeletions = clearPendingDeletions;
window.restoreDocument = restoreDocument;

<template>
  <div class="ticket-detail-view">
    <!-- Encabezado y controles de Admin -->
    <div v-if="!loading && ticket" class="ticket-header">
      <div>
        <h1 class="ticket-title">Ticket #{{ ticket.id }}: {{ ticket.title }}</h1>
        <p class="ticket-meta">
          Creado por <strong>{{ ticket.creator?.name }}</strong> el {{ new Date(ticket.createdAt).toLocaleString() }}
        </p>
      </div>
      <!-- Controles solo para Admin -->
      <div v-if="authStore.isAdmin" class="admin-controls">
        <div class="control-group">
          <label for="status">Cambiar Estado:</label>
          <select id="status" v-model="selectedStatusId" @change="updateTicketStatus">
            <option v-for="s in statuses" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>
        <div class="control-group">
          <label for="assignee">Asignar a:</label>
          <select id="assignee" v-model="selectedAssigneeId" @change="updateTicketAssignee">
            <option :value="null">-- Sin Asignar --</option>
            <option v-for="admin in admins" :key="admin.id" :value="admin.id">{{ admin.name }}</option>
          </select>
        </div>
      </div>
    </div>
    
    <div v-if="loading" class="loading-state">Cargando detalles del ticket...</div>
    <div v-if="error" class="error-state">{{ error }}</div>

    <div v-if="!loading && ticket" class="ticket-body">
      <!-- Columna de Detalles -->
      <div class="details-panel">
        <h3>Detalles</h3>
        <p><strong>Estado:</strong> <span :class="['status-badge', `status-${ticket.status?.name.toLowerCase().replace(' ', '-')}`]">{{ ticket.status?.name }}</span></p>
        <p><strong>Categoría:</strong> {{ ticket.category?.name }}</p>
        <p><strong>Asignado a:</strong> {{ ticket.assignee?.name || 'Nadie' }}</p>
        <hr>
        <h4>Descripción Original:</h4>
        <p class="description">{{ ticket.description }}</p>
      </div>

      <!-- Columna de Comentarios -->
      <div class="comments-panel">
        <h3>Conversación</h3>
        <div class="comment-list">
          <div v-for="comment in ticket.comments" :key="comment.id" :class="['comment', comment.author?.role === 'admin' ? 'admin-comment' : 'user-comment']">
            <div class="comment-author">
              <strong>{{ comment.author?.name }}</strong> ({{ comment.author?.role }})
            </div>
            <div class="comment-content">{{ comment.content }}</div>
            <div class="comment-date">{{ new Date(comment.createdAt).toLocaleString() }}</div>
          </div>
        </div>
        <!-- Formulario para nuevo comentario -->
        <form @submit.prevent="postComment" class="new-comment-form">
          <textarea v-model="newCommentText" placeholder="Escribe tu respuesta aquí..." required></textarea>
          <button type="submit" :disabled="isSubmittingComment" class="btn-primary">
            {{ isSubmittingComment ? 'Enviando...' : 'Añadir Comentario' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useAuthStore } from '../stores/auth.store';
import ticketService from '../services/ticket.service';
import dataService from '../services/data.service';

const props = defineProps({
  id: { type: String, required: true }
});

const authStore = useAuthStore();
const ticket = ref(null);
const loading = ref(true);
const error = ref(null);

// Para los controles de Admin
const statuses = ref([]);
const admins = ref([]);
const selectedStatusId = ref(null);
const selectedAssigneeId = ref(null);

// Para el nuevo comentario
const newCommentText = ref('');
const isSubmittingComment = ref(false);

// Función principal para cargar todos los datos de la vista
const fetchData = async () => {
  try {
    loading.value = true;
    const response = await ticketService.getTicketById(props.id);
    ticket.value = response.data;
    selectedStatusId.value = ticket.value.statusId;
    selectedAssigneeId.value = ticket.value.assigneeId;

    // Si es admin, cargar los datos para los selectores
    if (authStore.isAdmin) {
      const [statusesRes, adminsRes] = await Promise.all([
        dataService.getTicketStatuses(),
        dataService.getAdmins()
      ]);
      statuses.value = statusesRes.data;
      admins.value = adminsRes.data;
    }
  } catch (err) {
    error.value = "No se pudo cargar el ticket o no tienes permiso para verlo.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// --- Acciones del Admin ---
const updateTicketStatus = async () => {
  await ticketService.updateTicket(props.id, { statusId: selectedStatusId.value });
  await fetchData(); // Recargar todo para ver el cambio
};
const updateTicketAssignee = async () => {
  await ticketService.updateTicket(props.id, { assigneeId: selectedAssigneeId.value });
  await fetchData(); // Recargar todo para ver el cambio
};

// --- Acción de Añadir Comentario ---
const postComment = async () => {
  if (!newCommentText.value.trim()) return;
  isSubmittingComment.value = true;
  try {
    const newCommentData = { content: newCommentText.value };
    const response = await ticketService.addComment(props.id, newCommentData);
    ticket.value.comments.push(response.data); // Añadir el nuevo comentario a la lista sin recargar todo
    newCommentText.value = ''; // Limpiar el textarea
  } catch (err) {
    console.error("Error al publicar comentario:", err);
    alert("No se pudo publicar el comentario.");
  } finally {
    isSubmittingComment.value = false;
  }
};

// Cargar los datos cuando el componente se monta
onMounted(fetchData);

// Opcional: Recargar si el ID de la ruta cambia (si se navega de un ticket a otro)
watch(() => props.id, fetchData);

</script>

<style scoped>
.ticket-detail-view { display: flex; flex-direction: column; gap: 2rem; }
.ticket-header { display: flex; justify-content: space-between; align-items: flex-start; }
.ticket-title { margin: 0; }
.ticket-meta { color: #666; font-style: italic; }
.admin-controls { display: flex; gap: 1rem; background-color: #f8f9fa; padding: 1rem; border-radius: 8px; border: 1px solid #dee2e6; }
.control-group { display: flex; flex-direction: column; }
.control-group label { font-weight: bold; margin-bottom: 0.5rem; }
.ticket-body { display: grid; grid-template-columns: 1fr 2fr; gap: 2rem; }
.details-panel, .comments-panel { background: #fff; padding: 1.5rem; border-radius: 8px; }
.description { white-space: pre-wrap; word-wrap: break-word; }
.comment-list { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; max-height: 500px; overflow-y: auto; }
.comment { padding: 1rem; border-radius: 8px; }
.user-comment { background-color: #e9ecef; }
.admin-comment { background-color: #d1ecf1; border-left: 4px solid #0c5460; }
.comment-author { font-weight: bold; margin-bottom: 0.5rem; }
.comment-content { margin-bottom: 0.5rem; }
.comment-date { font-size: 0.8em; color: #666; text-align: right; }
.new-comment-form { display: flex; flex-direction: column; gap: 0.5rem; }
.new-comment-form textarea { width: 100%; min-height: 80px; padding: 0.5rem; border-radius: 4px; border: 1px solid #ccc; }
.btn-primary { align-self: flex-end; /* ... */ }

/* Copia los estilos de status-badge de la vista de lista */
.status-badge { padding: 0.2rem 0.5rem; border-radius: 12px; color: white; font-size: 0.8em; }
.status-abierto { background-color: #007bff; }
.status-en-progreso { background-color: #ffc107; color: #333; }
.status-resuelto { background-color: #28a745; }
.status-cerrado, .status-esperando-respuesta { background-color: #6c757d; }
</style>
<template>
  <div class="ticket-list-view">
    <div class="header">
      <h1>{{ pageTitle }}</h1>
      <router-link v-if="!authStore.isAdmin" to="/tickets/new" class="btn-primary">
        Crear Nuevo Ticket
      </router-link>
    </div>

    <div v-if="loading" class="loading">Cargando tickets...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <table v-if="!loading && tickets.length > 0" class="tickets-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Título</th>
          <th>Categoría</th>
          <th>Estado</th>
          <th v-if="authStore.isAdmin">Creado por</th>
          <th>Última Actualización</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="ticket in tickets" :key="ticket.id">
          <td>#{{ ticket.id }}</td>
          <td>{{ ticket.title }}</td>
          <td>{{ ticket.category?.name || 'N/A' }}</td>
          <td>
            <span :class="['status-badge', `status-${ticket.status?.name.toLowerCase().replace(' ', '-')}`]">
              {{ ticket.status?.name || 'N/A' }}
            </span>
          </td>
          <td v-if="authStore.isAdmin">{{ ticket.creator?.name || 'N/A' }}</td>
          <td>{{ new Date(ticket.updatedAt).toLocaleDateString() }}</td>
          <td>
            <router-link :to="`/tickets/${ticket.id}`" class="btn-secondary">Ver Detalles</router-link>
          </td>
        </tr>
      </tbody>
    </table>
    
    <div v-if="!loading && tickets.length === 0" class="no-tickets">
      <p>No hay tickets para mostrar.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import ticketService from '../services/ticket.service';
import { useAuthStore } from '../stores/auth.store';

const authStore = useAuthStore();
const tickets = ref([]);
const loading = ref(true);
const error = ref(null);

const pageTitle = computed(() => 
  authStore.isAdmin ? 'Todos los Tickets del Sistema' : 'Mis Tickets de Soporte'
);

const fetchTickets = async () => {
  try {
    loading.value = true;
    const response = await ticketService.getTickets();
    tickets.value = response.data;
  } catch (err) {
    error.value = "No se pudieron cargar los tickets.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchTickets);
</script>

<style scoped>
/* Reutiliza estilos de AssetListView y ajústalos si es necesario */
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.tickets-table { width: 100%; border-collapse: collapse; }
th, td { padding: 0.75rem; border: 1px solid #ddd; text-align: left; }
th { background-color: #f2f2f2; }
.btn-primary { background: #007bff; color: white; padding: 0.5rem 1rem; text-decoration: none; border-radius: 4px; }
.btn-secondary { background: #6c757d; color: white; padding: 0.3rem 0.6rem; text-decoration: none; border-radius: 4px; }
.status-badge { padding: 0.2rem 0.5rem; border-radius: 12px; color: white; font-size: 0.8em; }
.status-abierto { background-color: #007bff; }
.status-en-progreso { background-color: #ffc107; color: #333; }
.status-resuelto { background-color: #28a745; }
.status-cerrado, .status-esperando-respuesta { background-color: #6c757d; }
.no-tickets, .loading, .error { text-align: center; margin-top: 2rem; color: #666; }
</style>
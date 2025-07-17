<template>
  <div class="create-ticket-view">
    <h1>Crear Nuevo Ticket de Soporte</h1>
    <p>Por favor, describe tu problema con el mayor detalle posible.</p>
    
    <form @submit.prevent="submitTicket" class="ticket-form">
      <div class="form-group">
        <label for="title">Título del Problema</label>
        <input type="text" id="title" v-model="ticket.title" required placeholder="Ej: No puedo acceder a mi correo">
      </div>
      
      <div class="form-group">
        <label for="category">Categoría</label>
        <select id="category" v-model="ticket.categoryId" required>
          <option disabled value="">Selecciona una categoría</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="description">Descripción Detallada</label>
        <textarea id="description" v-model="ticket.description" rows="10" required placeholder="Describe los pasos para reproducir el error, mensajes que aparecen, etc."></textarea>
      </div>
      
      <p v-if="error" class="error-message">{{ error }}</p>

      <button type="submit" :disabled="loading" class="btn-primary">
        {{ loading ? 'Enviando...' : 'Enviar Ticket' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ticketService from '../services/ticket.service';
import dataService from '../services/data.service';

const router = useRouter();
const ticket = ref({
  title: '',
  description: '',
  categoryId: '',
});
const categories = ref([]);
const loading = ref(false);
const error = ref(null);

// Cargar categorías cuando el componente se monta
onMounted(async () => {
  try {
    const response = await dataService.getTicketCategories();
    categories.value = response.data;
  } catch (err) {
    console.error("Error cargando categorías:", err);
    error.value = "No se pudieron cargar las categorías.";
  }
});

const submitTicket = async () => {
  loading.value = true;
  error.value = null;
  try {
    await ticketService.createTicket(ticket.value);
    // Si tiene éxito, redirigir a la lista de "Mis Tickets"
    router.push('/tickets');
  } catch (err) {
    console.error("Error al crear el ticket:", err);
    error.value = "Ocurrió un error al enviar el ticket. Por favor, inténtelo de nuevo.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Estilos para el formulario */
.ticket-form { max-width: 800px; margin-top: 2rem; }
.form-group { margin-bottom: 1.5rem; }
label { display: block; font-weight: bold; margin-bottom: 0.5rem; }
input[type="text"], select, textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
.btn-primary { background: #007bff; color: white; border:none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; font-size: 1rem; }
.btn-primary:disabled { background: #a0cfff; }
.error-message { color: #dc3545; }
</style>
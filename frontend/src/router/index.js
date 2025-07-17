import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashBoardView.vue'
import TicketListView from '../views/TicketListView.vue'
import CreateTicketView from '../views/CreateTicketView.vue'
import TicketDetailView from '../views/TicketDetailView.vue'

import AppLayout from '../layouts/AppLayout.vue'

// Dentro del array 'children' del AppLayout:
children: [
  { path: 'dashboard', name: 'dashboard', component: DashboardView },
  
  // --- RUTAS DE TICKETS REORDENADAS ---
  // La ruta más específica ('/new') va primero.
  { 
    path: 'tickets/new', 
    name: 'create-ticket', 
    component: CreateTicketView 
  },
  // La ruta con parámetro (/:id) va después.
  { 
    path: 'tickets/:id', 
    name: 'ticket-detail', 
    component: TicketDetailView, 
    props: true 
  },
  // La ruta general ('/tickets') va al final.
  { 
    path: 'tickets', 
    name: 'tickets', 
    component: TicketListView 
  },
  
  { path: '', redirect: '/dashboard' }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: LoginView },
    {
      path: '/',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        { path: 'dashboard', name: 'dashboard', component: DashboardView },
        
        // Rutas de Tickets
        { path: 'tickets', name: 'tickets', component: TicketListView },
        { path: 'tickets/new', name: 'create-ticket', component: CreateTicketView },
        { path: 'tickets/:id', name: 'ticket-detail', component: TicketDetailView, props: true },

        { path: '', redirect: '/dashboard' }
      ]
    }
  ]
})

// GUARDIA DE NAVEGACIÓN GLOBAL (ACTUALIZADO PARA ROLES)
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  // Si la ruta requiere autenticación y el usuario no está logueado
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' });
  } 
  // Si la ruta requiere rol de admin y el usuario no lo es
  else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    // Redirigir a una página de "no autorizado" o al dashboard
    next({ name: 'dashboard' }); 
  }
  // Si el usuario intenta acceder a login pero ya está autenticado
  else if (to.name === 'login' && authStore.isAuthenticated) {
    next({ name: 'dashboard' });
  } 
  else {
    next();
  }
});

export default router
import { createRouter, createWebHistory } from 'vue-router'
import Portada from '../views/Portada.vue'

const routes = [
  { path: '/', name: 'portada', component: Portada },
  { path: '/confederaciones', name: 'confederaciones', component: () => import('../views/ConfederacionesView.vue') },
  { path: '/paises', name: 'paises', component: () => import('../views/PaisesView.vue') },
  { path: '/estadios', name: 'estadios', component: () => import('../views/EstadiosView.vue') },
  { path: '/equipos', name: 'equipos', component: () => import('../views/EquiposView.vue') },
  { path: '/arbitros', name: 'arbitros', component: () => import('../views/ArbitrosView.vue') },
  { path: '/torneos', name: 'torneos', component: () => import('../views/TorneosView.vue') },
  { path: '/torneos/:id/partidos', name: 'TorneoPartidos', component: () => import('../views/TorneoPartidosView.vue'), props: true },
  { path: '/torneos/:id/tabla', name: 'torneo-tabla', component: () => import('../views/TorneoTablaView.vue'), props: true },
  // CAMBIO AQUÍ: Nombre único para el detalle dentro de un torneo
  { path: '/torneo/:torneoId/equipo/:equipoId', name: 'equipo-stats-torneo', component: () => import('../views/EquipoDetalleView.vue') },
  { path: '/reporte-h2h', name: 'reporte-h2h', component: () => import('../views/CaraACaraView.vue') },
  // CAMBIO AQUÍ: Nombre único para el perfil global
  { path: '/equipos/:id', name: 'equipo-perfil', component: () => import('../views/EquipoPerfil.vue') },
  {
    path: '/tecnicos',
    name: 'Tecnicos',
    // Asegúrate de que la ruta al archivo .vue sea la correcta
    component: () => import('../views/TecnicosView.vue') 
  },
  
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
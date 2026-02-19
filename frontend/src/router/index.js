import { createRouter, createWebHistory } from 'vue-router'
import Portada from '../views/Portada.vue'

const routes = [
  { 
    path: '/', 
    name: 'portada',
    component: Portada 
  },
  {
    path: '/confederaciones',
    name: 'confederaciones',
    component: () => import('../views/ConfederacionesView.vue')
  },
  {
    path: '/paises',
    name: 'paises',
    component: () => import('../views/PaisesView.vue')
  },
  {
    path: '/estadios',
    name: 'estadios',
    component: () => import('../views/EstadiosView.vue')
  },
  {
    path: '/equipos',
    name: 'equipos',
    component: () => import('../views/EquiposView.vue')
  },
  {
    path: '/arbitros',
    name: 'arbitros',
    component: () => import('../views/ArbitrosView.vue')
  },
  // 1. ESTA ES TU LISTA (No la toques para que no se pierda)
  {
    path: '/torneos',
    name: 'torneos',
    component: () => import('../views/TorneosView.vue')
  },
  // 2. RUTA PARA PARTIDOS
  {
    path: '/torneos/:id/partidos',
    name: 'TorneoPartidos',
    component: () => import('../views/TorneoPartidosView.vue'),
    props: true 
  },
  // 3. NUEVA RUTA PARA LA TABLA GENERAL (Añade esta)
  {
    path: '/torneos/:id/tabla',
    name: 'torneo-tabla',
    component: () => import('../views/TorneoTablaView.vue'),
    props: true
  },
  {
    path: '/torneo/:torneoId/equipo/:equipoId',
    name: 'equipo-detalle',
    component: () => import('../views/EquipoDetalleView.vue')
  },
  {
    path: '/reporte-h2h',
    name: 'reporte-h2h',
    component: () => import('../views/CaraACaraView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
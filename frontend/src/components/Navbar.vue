<template>
  <nav class="bg-white border-b border-slate-100 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        
        <router-link to="/" class="flex items-center gap-3 cursor-pointer group">
          <div class="bg-indigo-600 p-2 rounded-xl transition-transform group-hover:rotate-12">
             <span class="text-xl">⚽</span>
          </div>
          <span class="text-xl font-black tracking-tighter text-slate-900 uppercase italic">
            SPORT<span class="text-indigo-600">DB</span>
          </span>
        </router-link>

        <div class="hidden md:flex items-center space-x-2">
          
          <router-link to="/" class="nav-link" active-class="active-link">
            Inicio
          </router-link>

          <div class="relative group" @mouseenter="isMenuOpen = true" @mouseleave="isMenuOpen = false">
            <button 
              class="nav-link flex items-center gap-1 outline-none"
              :class="{ 'text-indigo-600 bg-indigo-50': isMenuOpen }"
            >
              Catálogos
              <span class="text-[10px] transition-transform duration-200" :class="{ 'rotate-180': isMenuOpen }">▼</span>
            </button>

            <div 
              v-show="isMenuOpen"
              class="absolute left-0 mt-0 w-56 bg-white border border-slate-100 shadow-2xl rounded-2xl py-2 animate-fade-in"
            >
              <router-link to="/confederaciones" class="dropdown-item"><span>🌍</span> Confederaciones</router-link>
              <router-link to="/paises" class="dropdown-item"><span>🏳️</span> Países</router-link>
              <router-link to="/estadios" class="dropdown-item"><span>🏟️</span> Estadios</router-link>
              <router-link to="/equipos" class="dropdown-item"><span>🛡️</span> Equipos</router-link>
              <router-link to="/arbitros" class="dropdown-item"><span>🏁</span> Árbitros</router-link>
              <router-link to="/torneos" class="dropdown-item"><span>🏆</span> Torneos</router-link>
              
              <router-link to="/tecnicos" class="dropdown-item"><span>👔</span> Técnicos</router-link>
            </div>
          </div>

          <div class="h-4 w-[1px] bg-slate-200 mx-2"></div>

          <router-link 
            to="/reporte-h2h" 
            class="h2h-link"
            active-class="active-h2h"
          >
            <span>📊</span> H2H Analysis
          </router-link>
        </div>

      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'

const isMenuOpen = ref(false)
</script>

<style scoped>
.nav-link {
  display: flex;
  align-items: center;
  padding: 0.5rem 1.25rem;
  border-radius: 0.75rem;
  font-size: 0.8rem;
  font-weight: 800;
  color: #64748b; /* slate-500 */
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.2s ease;
  text-decoration: none;
}

.nav-link:hover {
  color: #4f46e5; /* indigo-600 */
  background-color: #f5f3ff; /* indigo-50 */
}

.active-link {
  color: #4f46e5;
  background-color: #f5f3ff;
}

/* Estilo para los items del dropdown */
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  text-decoration: none;
  transition: all 0.2s;
}

.dropdown-item:hover {
  background-color: #f8fafc;
  color: #4f46e5;
  padding-left: 1.25rem;
}

.dropdown-item span {
  font-size: 1.1rem;
}

/* Link H2H especial */
.h2h-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.5rem 1.25rem;
  background-color: #1e293b; /* slate-800 */
  color: white;
  border-radius: 0.75rem;
  font-size: 0.75rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: all 0.3s;
}

.h2h-link:hover {
  background-color: #4f46e5;
  transform: translateY(-1px);
}

.active-h2h {
  background-color: #4f46e5;
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
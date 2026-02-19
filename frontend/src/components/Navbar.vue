<template>
  <nav class="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        
        <router-link to="/" class="flex items-center gap-4 cursor-pointer">
          <div class="bg-emerald-100 p-2 rounded-lg">
             <span class="text-2xl">⚽</span>
          </div>
          <span class="text-xl font-bold tracking-tight text-slate-900">
            SPORT<span class="text-emerald-600">DB</span>
          </span>
        </router-link>

        <div class="hidden md:flex items-center space-x-1">
          
          <router-link to="/" class="nav-link" active-class="active-link">
            Inicio
          </router-link>

          

          <router-link to="/confederaciones" class="nav-link" active-class="active-link">
            Confederaciones
          </router-link>
          <router-link to="/paises" class="nav-link" active-class="active-link">
            Paises
          </router-link>
          <router-link to="/estadios" class="nav-link" active-class="active-link">
            Estadios
          </router-link>
          <router-link to="/equipos" class="nav-link" active-class="active-link">
            Equipos
          </router-link>
            <router-link to="/arbitros" class="nav-link" active-class="active-link">
            Arbitros
          </router-link>
          <router-link to="/torneos" class="nav-link" active-class="active-link">
            Torneos
          </router-link>
          <router-link 
  to="/reporte-h2h" 
  class="px-4 py-2 rounded-xl hover:bg-indigo-50 transition-colors font-black text-[10px] uppercase tracking-widest text-slate-600 flex items-center gap-2"
  active-class="text-indigo-600 bg-indigo-50"
>
  <span>📊</span> Comparativa H2H
</router-link>
          
          
          
          
          <div class="h-6 w-[1px] bg-slate-200 mx-2"></div>
          
          
          

        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* Usamos CSS puro para evitar que PostCSS/Tailwind v4 lance el error de @reference */
.nav-link {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem; /* Esto equivale a px-4 py-2 */
  border-radius: 0.75rem; /* rounded-xl */
  font-size: 0.875rem; /* text-sm */
  font-weight: 600; /* font-semibold */
  color: #475569; /* slate-600 */
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.nav-link:hover {
  color: #059669; /* emerald-600 */
  background-color: #ecfdf5; /* emerald-50 */
}

/* Estilo para el link activo */
.active-link {
  color: #059669; /* emerald-600 */
  background-color: #ecfdf5; /* emerald-50 */
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
</style>
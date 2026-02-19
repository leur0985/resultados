<template>
  <aside class="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-screen sticky top-0">
    <nav class="flex-1 px-4 space-y-1">
      <router-link to="/" 
        class="flex items-center px-4 py-3 text-slate-400 rounded-xl transition-all duration-200 hover:bg-slate-900 hover:text-white"
        active-class="bg-emerald-500/10 text-emerald-400 font-semibold shadow-sm border-r-4 border-emerald-500"
      >
        <span class="w-8">🏠</span> Inicio
      </router-link>
      
      <router-link to="/resultados" 
        class="flex items-center px-4 py-3 text-slate-400 rounded-xl transition-all duration-200 hover:bg-slate-900 hover:text-white"
        active-class="bg-emerald-500/10 text-emerald-400 font-semibold shadow-sm border-r-4 border-emerald-500"
      >
        <span class="w-8">⏱️</span> Marcadores
      </router-link>
    </nav>
  </aside>
</template>
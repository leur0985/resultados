<template>
  <div class="w-full space-y-10 pb-20 px-[5%]" v-if="tabla.length > 0 || cargando">
    <header class="bg-white p-10 rounded-[3rem] shadow-xl border-l-[16px] border-indigborder-indigo-600o-600 flex justify-between items-center">
      <div>
        <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Estadísticas de Competición</h4>
        <h1 class="text-4xl font-black text-slate-800 uppercase italic tracking-tighter">Tabla General</h1>
      </div>
      <button @click="$router.back()" class="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-emerald-600 transition-all shadow-lg">
        ← Regresar
      </button>
    </header>

    <div class="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 animate-fade-in">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
            <th class="px-10 py-8 text-center w-20">#</th>
            <th class="px-6 py-8">Club</th>
            <th class="px-4 py-8 text-center">JJ</th>
            <th class="px-4 py-8 text-center">JG</th>
            <th class="px-4 py-8 text-center">JE</th>
            <th class="px-4 py-8 text-center">JP</th>
            <th class="px-4 py-8 text-center">GF</th>
            <th class="px-4 py-8 text-center">GC</th>
            <th class="px-4 py-8 text-center">DG</th>
            <th class="px-8 py-8 text-center bg-emerald-50 text-indigo-800">PTS</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-for="(equipo, index) in tabla" :key="equipo.id" class="hover:bg-slate-50/80 transition-all group">
            <td class="px-10 py-6 text-center">
             <span 
  class="text-lg font-black italic" 
  :class="{
    'text-indigo-600': index < 6,
    'text-amber-500': index >= 6 && index < 8,
    'text-red-500': index >= 8
  }"
>
  {{ index + 1 }}
</span>
            </td>

            <td class="px-6 py-6">
              <div class="flex items-center gap-5">
                <div class="w-12 h-12 bg-slate-50 rounded-2xl p-2 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <img :src="getLogoUrl(equipo.logo)" class="max-w-full max-h-full object-contain filter drop-shadow-sm">
                </div>
                <span class="text-sm font-black uppercase text-slate-700 tracking-tighter">{{ equipo.nombre }}</span>
              </div>
            </td>

            <td class="px-4 py-6 text-center text-xs font-bold text-slate-500">{{ equipo.jj }}</td>
            <td class="px-4 py-6 text-center text-xs font-bold text-slate-600">{{ equipo.jg }}</td>
            <td class="px-4 py-6 text-center text-xs font-bold text-slate-400">{{ equipo.je }}</td>
            <td class="px-4 py-6 text-center text-xs font-bold text-slate-400">{{ equipo.jp }}</td>
            <td class="px-4 py-6 text-center text-xs font-bold text-slate-600">{{ equipo.gf }}</td>
            <td class="px-4 py-6 text-center text-xs font-bold text-slate-600">{{ equipo.gc }}</td>

            <td class="px-4 py-6 text-center">
              <span class="text-xs font-black" :class="equipo.dg > 0 ? 'text-indigo-800' : (equipo.dg < 0 ? 'text-red-400' : 'text-slate-300')">
                {{ equipo.dg > 0 ? '+' + equipo.dg : equipo.dg }}
              </span>
            </td>

            <td class="px-8 py-6 text-center bg-indigo-50/30 group-hover:bg-indigo-600 transition-all">
  <span class="text-xl font-black text-indigo-600 group-hover:text-white tabular-nums">
    {{ equipo.pts }}
  </span>
</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="tabla.length === 0 && !cargando" class="bg-white p-20 rounded-[3rem] shadow-xl text-center border-2 border-dashed border-slate-200">
      <span class="text-6xl block mb-6">🏟️</span>
      <h3 class="text-xl font-black text-slate-400 uppercase italic">No hay datos de jornadas numéricas aún</h3>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const torneoId = route.params.id
const tabla = ref([])
const cargando = ref(true)

const cargarTabla = async () => {
  try {
    cargando.value = true
    // Llamamos al endpoint del backend que creamos anteriormente
    const res = await axios.get(`http://localhost:3000/api/torneos/${torneoId}/tabla`)
    tabla.value = res.data
  } catch (error) {
    console.error("Error al cargar la tabla:", error)
  } finally {
    cargando.value = false
  }
}

const getLogoUrl = (n) => n ? new URL(`../assets/equipos/${n}`, import.meta.url).href : ''

onMounted(cargarTabla)
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
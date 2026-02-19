<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import axios from 'axios'

// ESTADOS
const equipos = ref([])
const equipoA = ref(null)
const equipoB = ref(null)
const limitePartidos = ref(10)
const historialCruzado = ref([])
const cargando = ref(false)

// CARGA INICIAL DE EQUIPOS
const cargarEquipos = async () => {
  try {
    const res = await axios.get(`http://localhost:3000/api/equipos`)
    equipos.value = res.data
  } catch (error) {
    console.error("Error cargando equipos:", error)
  }
}

// PETICIÓN DINÁMICA AL SERVIDOR (Solo trae lo necesario)
const buscarHistorial = async () => {
  if (!equipoA.value || !equipoB.value) return;
  
  cargando.value = true
  try {
    const res = await axios.get(`http://localhost:3000/api/partidos/h2h`, {
      params: {
        equipoA: equipoA.value,
        equipoB: equipoB.value,
        limite: limitePartidos.value
      }
    })
    historialCruzado.value = res.data
  } catch (error) {
    console.error("Error en H2H:", error)
  } finally {
    cargando.value = false
  }
}

// WATCHERS: Si algo cambia, el Skynet Neanderthal dispara la búsqueda
watch([equipoA, equipoB, limitePartidos], () => {
  buscarHistorial()
})

// LÓGICA DE ESTADÍSTICAS PARA LA BARRA DE PODER
const stats = computed(() => {
  const h = historialCruzado.value
  const total = h.length
  if (total === 0) return { winA: 0, winB: 0, empates: 0, pA: 0, pE: 0, pB: 0 }

  let winA = 0, winB = 0, empates = 0
  
  h.forEach(p => {
    const gL = Number(p.goleslocal)
    const gV = Number(p.golesvisitante)
    const idA = String(equipoA.value)
    
    if (gL === gV) empates++
    else if (String(p.equipo_local_id) === idA) {
      gL > gV ? winA++ : winB++
    } else {
      gV > gL ? winA++ : winB++
    }
  })

  return {
    winA, winB, empates,
    pA: ((winA / total) * 100).toFixed(0),
    pE: ((empates / total) * 100).toFixed(0),
    pB: ((winB / total) * 100).toFixed(0)
  }
})

const getLogoUrl = (n) => n ? new URL(`../assets/equipos/${n}`, import.meta.url).href : ''
const getNombreEquipo = (id) => equipos.value.find(e => String(e.id) === String(id))?.nombre || 'Equipo'

onMounted(cargarEquipos)
</script>

<template>
  <div class="w-full min-h-screen bg-slate-50 pb-20 px-[5%] space-y-10">
    
<header class="bg-white p-10 rounded-[3.5rem] shadow-xl border-l-[16px] border-indigo-600 flex flex-wrap gap-8 items-center border-none mt-10">
      
      <div class="flex-1 min-w-[300px] flex items-center gap-6 bg-slate-50 p-4 rounded-[2.5rem]">
        <div class="w-20 h-20 bg-white rounded-2xl p-2 shadow-sm flex items-center justify-center border-none">
          <img v-if="equipoA" :src="getLogoUrl(equipos.find(e => e.id === equipoA)?.logo)" class="max-w-full max-h-full object-contain">
          <span v-else class="text-3xl opacity-20 text-slate-400 font-black">?</span>
        </div>
        <div class="flex-1 space-y-1">
          <label class="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Local / Equipo 1</label>
          <select v-model="equipoA" class="w-full bg-transparent border-none font-black text-slate-700 outline-none appearance-none cursor-pointer text-lg">
            <option :value="null" disabled>Selecciona un club...</option>
            <option v-for="e in equipos" :key="e.id" :value="e.id">{{ e.nombre }}</option>
          </select>
        </div>
      </div>

      <div class="text-3xl font-black text-indigo-200 uppercase italic tracking-tighter hidden xl:block">VS</div>

      <div class="flex-1 min-w-[300px] flex items-center gap-6 bg-slate-50 p-4 rounded-[2.5rem]">
        <div class="w-20 h-20 bg-white rounded-2xl p-2 shadow-sm flex items-center justify-center border-none">
          <img v-if="equipoB" :src="getLogoUrl(equipos.find(e => e.id === equipoB)?.logo)" class="max-w-full max-h-full object-contain">
          <span v-else class="text-3xl opacity-20 text-slate-400 font-black">?</span>
        </div>
        <div class="flex-1 space-y-1">
          <label class="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Visitante / Equipo 2</label>
          <select v-model="equipoB" class="w-full bg-transparent border-none font-black text-slate-700 outline-none appearance-none cursor-pointer text-lg">
            <option :value="null" disabled>Selecciona un club...</option>
            <option v-for="e in equipos" :key="e.id" :value="e.id">{{ e.nombre }}</option>
          </select>
        </div>
      </div>

      <div class="w-full lg:w-auto flex items-center gap-4 bg-slate-900 p-4 rounded-[2.5rem]">
        <div class="pl-4">
          <label class="text-[8px] font-black uppercase text-slate-500 tracking-widest block">Historial</label>
          <input type="number" v-model="limitePartidos" min="1" max="100" class="bg-transparent text-white border-none font-black text-xl w-16 outline-none">
        </div>
        <div class="bg-indigo-600 p-3 rounded-2xl text-white text-xs font-black uppercase tracking-tighter">
          PARDOS
        </div>
      </div>
    </header>

    <div v-if="historialCruzado.length > 0" class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      
      <aside class="lg:col-span-5 lg:sticky lg:top-10 space-y-6">
        <div class="bg-white p-10 rounded-[4rem] shadow-2xl border-none space-y-10">
          <h2 class="text-2xl font-black text-slate-800 uppercase italic tracking-tighter text-center">Balance de Dominio</h2>
          
          <div class="space-y-4">
            <div class="flex justify-between font-black text-[11px] uppercase tracking-tighter">
              <span class="text-indigo-600">{{ getNombreEquipo(equipoA) }} {{ stats.pA }}%</span>
              <span class="text-slate-400">E {{ stats.pE }}%</span>
              <span class="text-rose-600">{{ stats.pB }}% {{ getNombreEquipo(equipoB) }}</span>
            </div>
            
            <div class="w-full h-10 flex rounded-full overflow-hidden shadow-inner bg-slate-100 p-1">
              <div :style="{ width: stats.pA + '%' }" class="bg-indigo-600 rounded-l-full transition-all duration-1000 ease-out border-none"></div>
              <div :style="{ width: stats.pE + '%' }" class="bg-slate-300 transition-all duration-1000 ease-out border-none"></div>
              <div :style="{ width: stats.pB + '%' }" class="bg-rose-500 rounded-r-full transition-all duration-1000 ease-out border-none"></div>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div class="bg-indigo-50 p-6 rounded-[2.5rem] text-center">
              <div class="text-[9px] font-black text-indigo-400 uppercase">Ganas A</div>
              <div class="text-4xl font-black text-indigo-700">{{ stats.winA }}</div>
            </div>
            <div class="bg-slate-50 p-6 rounded-[2.5rem] text-center">
              <div class="text-[9px] font-black text-slate-400 uppercase">Empates</div>
              <div class="text-4xl font-black text-slate-800">{{ stats.empates }}</div>
            </div>
            <div class="bg-rose-50 p-6 rounded-[2.5rem] text-center">
              <div class="text-[9px] font-black text-rose-400 uppercase">Ganas B</div>
              <div class="text-4xl font-black text-rose-700">{{ stats.winB }}</div>
            </div>
          </div>

          <div class="pt-8 border-t border-slate-50 text-center">
            <p class="text-[10px] font-black text-slate-300 uppercase tracking-widest">Basado en los últimos {{ historialCruzado.length }} encuentros</p>
          </div>
        </div>
      </aside>

      <section class="lg:col-span-7 space-y-6">
        <div v-for="p in historialCruzado" :key="p.id" 
             class="bg-white rounded-[4rem] border-none shadow-xl flex flex-col relative transition-all duration-300 hover:shadow-2xl overflow-hidden">
          
          <div class="p-8 flex items-center relative">
            <div class="w-32 border-r-2 border-slate-50 pr-6 mr-6 text-center">
              <span class="text-slate-900 text-[14px] font-black italic">
                {{ p.fecha.split('T')[0].split('-').reverse().join('/') }}
              </span>
              <div class="bg-slate-900 text-white px-3 py-1 rounded-md text-[9px] font-black mt-3 uppercase tracking-tighter">
                JOR-{{ p.jornada }}
              </div>
            </div>

            <div class="flex-1">
              <div class="flex items-center justify-between px-4">
                <div class="flex-1 flex flex-col items-center gap-2">
                  <div class="w-16 h-16 flex items-center justify-center">
                    <img :src="getLogoUrl(p.equipos_partidos_equipo_local_idToequipos?.logo)" class="max-w-full max-h-full object-contain">
                  </div>
                  <span class="text-[10px] font-black uppercase text-slate-800 text-center leading-none">{{ p.equipolocal }}</span>
                </div>

                <div class="flex items-center gap-4 bg-white px-8 py-3 rounded-3xl border-2 border-slate-50 shadow-sm mx-4">
                  <span class="text-4xl font-black text-slate-900 tabular-nums">{{ p.goleslocal }}</span>
                  <span class="text-slate-200 font-black text-xl">:</span>
                  <span class="text-4xl font-black text-slate-900 tabular-nums">{{ p.golesvisitante }}</span>
                </div>

                <div class="flex-1 flex flex-col items-center gap-2">
                  <div class="w-16 h-16 flex items-center justify-center">
                    <img :src="getLogoUrl(p.equipos_partidos_equipo_visitante_idToequipos?.logo)" class="max-w-full max-h-full object-contain">
                  </div>
                  <span class="text-[10px] font-black uppercase text-slate-800 text-center leading-none">{{ p.equipovisitante }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-slate-50/50 py-4 px-10 flex justify-between items-center text-[11px] font-black uppercase italic text-slate-400">
            <span>📍 {{ p.nombre_estadio }}</span>
            <span v-if="p.arbitros" class="text-indigo-400">🏁 {{ p.arbitros.nombre }}</span>
          </div>
        </div>
      </section>

    </div>

    <div v-else class="flex flex-col items-center justify-center p-32 bg-white rounded-[4rem] shadow-sm border-none">
      <div v-if="cargando" class="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <div v-else class="text-center space-y-4">
        <span class="text-6xl">🏟️</span>
        <h3 class="text-xl font-black text-slate-300 uppercase italic">Selecciona dos clubes para comparar su historia</h3>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* RESET DE BORDES Y SOMBRAS */
* { border: 0 !important; border-color: transparent !important; outline: none !important; }
.border-none { border: none !important; }

/* RE-ACTIVAR LO NECESARIO */
.border-r-2 { border-right: 2px solid #f1f5f9 !important; }
.border-2 { border: 2px solid #f1f5f9 !important; }
.border-t { border-top: 1px solid #f1f5f9 !important; }
.border-l { border-left: 16px solid #4f46e5 !important; }

.shadow-xl { box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.05) !important; }
.shadow-2xl { box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.1) !important; }

.transition-all { transition: all 0.5s ease; }
.tabular-nums { font-variant-numeric: tabular-nums; }
</style>
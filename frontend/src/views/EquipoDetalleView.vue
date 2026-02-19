<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { Line } from 'vue-chartjs'
import { 
  Chart as ChartJS, Title, Tooltip, Legend, CategoryScale, 
  LinearScale, PointElement, LineElement, Filler 
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler)

const route = useRoute()
const torneoId = route.params.torneoId
const equipoId = route.params.equipoId
const totalEquipos = ref(10)
const partidos = ref([])
const equipoInfo = ref(null)
const posicionesTorneo = ref({}) 
const cargando = ref(true)

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return ''
  const [year, month, day] = fechaStr.split('T')[0].split('-')
  return `${day}/${month}/${year}`
}

const formatearHora = (horaStr) => {
  if (!horaStr) return ''
  const partes = horaStr.split('T')
  const horaLimpia = partes.length > 1 ? partes[1] : partes[0]
  return horaLimpia.substring(0, 5)
}

const cargarTodo = async () => {
  try {
    const res = await axios.get(`http://localhost:3000/api/torneos/${torneoId}/partidos`)
    partidos.value = res.data.partidos || []
    const rel = res.data.equipos_torneo.find(et => String(et.equipos.id) === String(equipoId))
    equipoInfo.value = rel ? rel.equipos : null
    totalEquipos.value = res.data.equipos_torneo.length
    const resPos = await axios.get(`http://localhost:3000/api/partidos/evolucion-completa/${torneoId}`)
    posicionesTorneo.value = resPos.data
  } catch (error) {
    console.error("Error en la carga:", error)
  } finally {
    cargando.value = false
  }
}

const historial = computed(() => {
  return partidos.value.filter(p => 
    String(p.equipo_local_id) === String(equipoId) || 
    String(p.equipo_visitante_id) === String(equipoId)
  ).sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
})

const stats = computed(() => {
  let gf = 0, gc = 0, pts = 0, jugados = 0;
  historial.value.forEach(p => {
    if (isNaN(parseFloat(p.jornada))) return;
    const esLocal = String(p.equipo_local_id) === String(equipoId);
    const gP = esLocal ? Number(p.goleslocal) : Number(p.golesvisitante);
    const gR = esLocal ? Number(p.golesvisitante) : Number(p.goleslocal);
    gf += gP; gc += gR; jugados++;
    if (gP > gR) pts += 3; else if (gP === gR) pts += 1;
  });
  return { gf, gc, dg: gf - gc, pts, ef: jugados > 0 ? ((pts/(jugados*3))*100).toFixed(1) : 0 };
})

const chartDataPosicion = computed(() => {
  const jornadas = Object.keys(posicionesTorneo.value).sort((a, b) => Number(a) - Number(b));
  const valoresPosicion = jornadas.map(jor => posicionesTorneo.value[jor][String(equipoId)]);
  return {
    labels: jornadas.map(j => `J${j}`),
    datasets: [{
      label: 'Posición',
      data: valoresPosicion,
      borderColor: '#4f46e5',
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      borderWidth: 3,
      pointBackgroundColor: '#4f46e5',
      pointRadius: 4,
      tension: 0.3,
      fill: true
    }]
  }
})

const chartOptionsPosicion = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: { 
      reverse: true, 
      min: 0, 
      max: totalEquipos.value + 1,
      ticks: { stepSize: 1, font: { weight: 'bold', size: 10 } }
    },
    x: { grid: { display: false }, ticks: { font: { weight: 'bold', size: 10 } } }
  },
  plugins: { legend: { display: false } }
}))

const getLogoUrl = (n) => n ? new URL(`../assets/equipos/${n}`, import.meta.url).href : ''
const getEstadioUrl = (n) => n ? new URL(`../assets/estadios/${n}`, import.meta.url).href : ''

onMounted(cargarTodo)
</script>

<template>
  <div class="w-full space-y-10 pb-20 px-[5%]" v-if="!cargando && equipoInfo">
    
    <header class="bg-white p-10 rounded-[3rem] shadow-xl border-l-[16px] border-indigo-600 flex justify-between items-center mt-6">
      <div class="space-y-1">
        <h1 class="text-4xl font-black text-slate-800 uppercase italic tracking-tighter">RENDIMIENTO POR JORNADA</h1>
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">{{ equipoInfo.nombre }}</p>
      </div>
      <router-link :to="`/torneos/${torneoId}/partidos`" class="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">← Regresar</router-link>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
      
      <aside class="lg:col-span-4 lg:sticky lg:top-10 space-y-8">
        <div class="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden text-center pb-8">
          <div class="h-44 relative bg-slate-100">
            <img v-if="equipoInfo.estadios?.foto" :src="getEstadioUrl(equipoInfo.estadios.foto)" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-gradient-to-t from-white via-transparent"></div>
            <div class="absolute -bottom-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-white rounded-[2.5rem] p-4 shadow-2xl flex items-center justify-center">
              <img :src="getLogoUrl(equipoInfo.logo)" class="max-w-full max-h-full object-contain">
            </div>
          </div>

          <div class="pt-14 p-8">
            <h1 class="text-3xl font-black text-slate-800 uppercase italic mb-4">{{ equipoInfo.nombre }}</h1>
            
            <div class="bg-slate-50 p-6 rounded-[2.5rem] mb-6">
              <h4 class="text-sm font-black text-indigo-600 uppercase">{{ equipoInfo.estadios?.nombre }}</h4>
              <p class="text-[11px] font-bold text-slate-400 uppercase italic mb-3">{{ equipoInfo.estadios?.ciudad }}</p>
              <div class="inline-block bg-white text-slate-400 px-4 py-1 rounded-full text-[9px] font-black uppercase">
                Capacidad: {{ equipoInfo.estadios?.capacidad?.toLocaleString() }}
              </div>
            </div>

            <div class="grid grid-cols-4 gap-2">
              <div class="bg-emerald-50 p-4 rounded-3xl text-center">
                <div class="text-[8px] font-black text-emerald-400 uppercase">GF</div>
                <div class="text-lg font-black text-emerald-700">{{ stats.gf }}</div>
              </div>
              <div class="bg-red-50 p-4 rounded-3xl text-center">
                <div class="text-[8px] font-black text-red-400 uppercase">GC</div>
                <div class="text-lg font-black text-red-700">{{ stats.gc }}</div>
              </div>
              <div class="bg-slate-50 p-4 rounded-3xl text-center">
                <div class="text-[8px] font-black text-slate-400 uppercase">DG</div>
                <div class="text-lg font-black text-slate-800">{{ stats.dg > 0 ? '+' : '' }}{{ stats.dg }}</div>
              </div>
              <div class="bg-indigo-50 p-4 rounded-3xl text-center">
                <div class="text-[8px] font-black text-indigo-400 uppercase">PTS</div>
                <div class="text-lg font-black text-indigo-700">{{ stats.pts }}</div>
              </div>
            </div>

            <div class="mt-8 pt-8 border-t border-slate-50">
              <div class="flex items-center justify-between mb-4 px-2">
                <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-400">Trayectoria en Tabla</h3>
              </div>
              <div class="h-44 w-full bg-slate-50 rounded-[2rem] p-4 shadow-inner">
                <Line :data="chartDataPosicion" :options="chartOptionsPosicion" />
              </div>
            </div>

            <div class="mt-8 bg-indigo-600 rounded-[2.5rem] p-6 text-white text-left relative overflow-hidden">
              <div class="relative z-10 flex justify-between items-center">
                <div>
                  <div class="text-[9px] font-black text-indigo-200 uppercase mb-1">Efectividad Fase Regular</div>
                  <div class="text-4xl font-black italic">{{ stats.ef }}%</div>
                </div>
                <span class="text-4xl opacity-20">📈</span>
              </div>
              <div class="absolute bottom-0 left-0 h-1 bg-white opacity-30" :style="{ width: stats.ef + '%' }"></div>
            </div>
          </div>
        </div>
      </aside>

      <section class="lg:col-span-8 space-y-6">
        <div v-for="p in historial" :key="p.id" class="bg-white rounded-[4rem] shadow-xl overflow-hidden transition-all hover:shadow-2xl">
          <div class="p-10 flex items-center">
            <div class="w-36 border-r-2 border-slate-50 pr-8 mr-8 text-center">
              <span class="text-indigo-600 text-[18px] font-black leading-none">{{ formatearHora(p.hora) }}</span><br>
              <span class="text-slate-900 text-[12px] font-black italic mt-1 block">{{ formatearFecha(p.fecha) }}</span>
              <div class="bg-slate-900 text-white px-3 py-1 rounded-md text-[9px] font-black mt-3 uppercase tracking-tighter">
                JOR-{{ p.jornada }}
              </div>
            </div>

            <div class="flex-1 flex items-center justify-between">
              <div class="flex-1 flex flex-col items-center gap-2">
                <img :src="getLogoUrl(p.equipos_partidos_equipo_local_idToequipos?.logo)" class="w-16 h-16 object-contain">
                <div class="text-xs font-black uppercase text-slate-800 text-center">{{ p.equipolocal }}</div>
              </div>
              <div class="flex items-center gap-6 bg-white px-8 py-4 rounded-3xl border-2 border-slate-100 mx-4">
                <span class="text-5xl font-black text-slate-900 tabular-nums">{{ p.goleslocal }}</span>
                <span class="text-slate-200 font-black text-2xl">:</span>
                <span class="text-5xl font-black text-slate-900 tabular-nums">{{ p.golesvisitante }}</span>
              </div>
              <div class="flex-1 flex flex-col items-center gap-2">
                <img :src="getLogoUrl(p.equipos_partidos_equipo_visitante_idToequipos?.logo)" class="w-16 h-16 object-contain">
                <div class="text-xs font-black uppercase text-slate-800 text-center">{{ p.equipovisitante }}</div>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap justify-center items-center gap-6 pt-6 border-t border-slate-100 text-[13px] font-bold uppercase italic shadow-inner bg-slate-50/50 rounded-b-[4rem] py-5 px-8">
            <span class="flex items-center gap-2 text-slate-700">
              <span class="text-lg text-indigo-500">📍</span> 
              <span>{{ p.nombre_estadio }}</span>
            </span>
            <span v-if="p.arbitros" class="flex items-center gap-2 border-l-2 pl-4 border-slate-200 text-slate-700">
              <span class="text-slate-400">REF:</span> 
              <span class="text-indigo-600 font-black">{{ p.arbitros.nombre }}</span>
            </span>
            <span v-if="p.asistencia > 0" class="flex items-center gap-2 border-l-2 pl-4 border-slate-200 text-slate-700">
              <span class="text-lg text-indigo-500">👥</span> 
              <span class="font-black">{{ p.asistencia.toLocaleString() }}</span>
              <span class="text-slate-400 text-[10px]">Fans</span>
            </span>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<style scoped>
.tabular-nums { font-variant-numeric: tabular-nums; }
</style>
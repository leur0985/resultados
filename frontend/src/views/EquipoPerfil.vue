<template>
  <div v-if="!cargando && equipo" class="min-h-screen bg-white pb-20 px-[8%] animate-fade-in">
    
    <header class="relative pt-10">
      <div class="h-[400px] w-full rounded-[2.5rem] overflow-hidden relative bg-slate-950">
        <img v-if="equipo.estadios?.imagen" 
             :src="getEstadioUrl(equipo.estadios.imagen)" 
             class="absolute inset-0 w-full h-full object-cover opacity-40 grayscale-[20%]">
        
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>

        <div class="absolute bottom-10 left-10 right-10 flex items-center justify-between">
          <div class="flex items-center gap-6">
            <div class="w-28 h-28 bg-white rounded-3xl p-4 shadow-2xl flex items-center justify-center">
              <img :src="getLogoUrl(equipo.logo)" class="max-w-full max-h-full object-contain">
            </div>
            
            <div>
              <div class="flex items-center gap-4">
                <h1 class="text-5xl font-light text-white tracking-tight">
                  {{ equipo.nombre.split(' ')[0] }}<span class="font-black text-indigo-500">{{ equipo.nombre.split(' ').slice(1).join(' ') }}</span>
                </h1>
                
                <div class="flex gap-1 mt-2">
                  <div v-for="(res, index) in ultimosCincoResultados" :key="index" 
                       :class="getResultadoBg(res)"
                       class="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-sm">
                    {{ res }}
                  </div>
                </div>
              </div>
              
              <div class="flex items-center gap-3 mt-1 text-slate-400">
                <span class="text-indigo-500 text-xs">📍</span>
                <p class="text-[11px] tracking-[0.15em] uppercase font-medium">
                  {{ equipo.estadios?.ciudad }} <span class="mx-2 text-slate-600">|</span> {{ equipo.estadios?.direccion }}
                </p>
              </div>
            </div>
          </div>
          
          <div class="hidden md:block text-right">
            <p class="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em] mb-1">Home Ground</p>
            <p class="text-white font-medium text-lg">{{ equipo.estadios?.nombre }}</p>
          </div>
        </div>
      </div>
    </header>

    <main class="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
      <aside class="lg:col-span-4 space-y-12">
        <section>
          <h3 class="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-4">Venue Capacity</h3>
          <div class="flex items-center gap-4">
            <span class="text-3xl">👥</span>
            <span class="text-4xl font-black text-slate-800 tracking-tighter">
              {{ equipo.estadios?.capacidad?.toLocaleString() }}
            </span>
          </div>
        </section>

        <section>
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Management History</h3>
            <button @click="mostrarModalContratar = true" class="text-[10px] font-black text-indigo-500 hover:text-indigo-700 uppercase tracking-widest transition-colors">
              + Contratar
            </button>
          </div>

          <div class="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100/50">
            <div v-if="tecnicosHistorial.length > 0" class="space-y-8 relative before:absolute before:left-[23px] before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200">
              <div v-for="hist in tecnicosHistorial" :key="hist.id" class="relative flex items-start gap-5 group">
                
                <div :class="[
                  'w-12 h-12 rounded-2xl border-4 border-white shadow-md z-10 flex-shrink-0 flex items-center justify-center overflow-hidden transition-all group-hover:scale-110',
                  hist.fecha_fin ? 'bg-slate-200' : 'ring-2 ring-indigo-500 ring-offset-2 bg-indigo-600'
                ]">
                  <img v-if="hist.tecnicos?.foto" :src="getFotoTecnicoUrl(hist.tecnicos.foto)" class="w-full h-full object-cover">
                  <span v-else class="text-[10px] font-black text-white">DT</span>
                </div>

                <div class="flex-1 pt-1">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <p :class="['text-xs font-black uppercase tracking-tight', hist.fecha_fin ? 'text-slate-500' : 'text-slate-900']">
                        {{ hist.tecnicos?.nombre }}
                      </p>
                      <img v-if="hist.tecnicos?.paises" :src="getBanderaUrl(hist.tecnicos.paises.nombre)" class="w-3 h-2 rounded-[1px] opacity-70">
                    </div>
                    
                    <div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button @click="prepararEdicion(hist)" class="text-[10px] hover:scale-110 transition-transform">✏️</button>
                      <button @click="eliminarDelHistorial(hist.id)" class="text-[10px] hover:scale-110 transition-transform">🗑️</button>
                    </div>
                  </div>
                  <p class="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">
                    {{ formatearFechaHistorial(hist.fecha_inicio) }} — {{ hist.fecha_fin ? formatearFechaHistorial(hist.fecha_fin) : 'Presente' }}
                  </p>
                </div>
              </div>
            </div>
            <div v-else class="py-4 text-center">
              <p class="text-slate-400 text-[11px] italic">Sin historial de técnicos.</p>
            </div>
          </div>
        </section>
      </aside>

      <section class="lg:col-span-8">
        <h3 class="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-10">Recent Results</h3>
        <div class="space-y-2">
          <div v-for="p in ultimosPartidos" :key="p.id" 
               class="flex items-center group py-4 px-6 hover:bg-slate-50 rounded-2xl transition-all border-b border-slate-50 last:border-0">
            <div class="w-24">
              <span class="block text-xs font-bold text-slate-800">{{ p.fecha.split('-')[2].split('T')[0] }} {{ formatearMes(p.fecha) }}</span>
              <span class="text-[9px] text-slate-400 uppercase tracking-widest font-bold">{{ new Date(p.fecha).getFullYear() }}</span>
            </div>
            <div class="flex-1 flex items-center justify-center gap-10">
              <div class="flex items-center gap-4 w-40 justify-end">
                <span class="text-xs font-bold text-slate-700 uppercase tracking-tighter text-right">{{ p.equipolocal }}</span>
                <img :src="getLogoUrl(p.equipos_partidos_equipo_local_idToequipos?.logo)" class="w-8 h-8 object-contain grayscale group-hover:grayscale-0 transition-all">
              </div>
              <div class="text-xl font-black text-slate-900 w-20 text-center tabular-nums">
                {{ p.goleslocal }}<span class="text-indigo-400 mx-1">:</span>{{ p.golesvisitante }}
              </div>
              <div class="flex items-center gap-4 w-40">
                <img :src="getLogoUrl(p.equipos_partidos_equipo_visitante_idToequipos?.logo)" class="w-8 h-8 object-contain grayscale group-hover:grayscale-0 transition-all">
                <span class="text-xs font-bold text-slate-700 uppercase tracking-tighter">{{ p.equipovisitante }}</span>
              </div>
            </div>
            <div class="w-10 flex justify-end">
              <div :class="getResultadoColor(p)" class="w-2 h-2 rounded-full shadow-sm"></div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <div v-if="mostrarModalContratar" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-6">
      <div class="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl animate-fade-in">
        <h2 class="text-2xl font-black text-slate-900 mb-8 uppercase italic tracking-tighter">Hire <span class="text-indigo-600">Manager</span></h2>
        <div class="space-y-6">
          <div>
            <label class="text-[9px] font-black text-slate-400 uppercase block mb-3 tracking-[0.2em]">Select Coach</label>
            <select v-model="nuevoContrato.tecnico_id" class="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none">
              <option v-for="t in todosLosTecnicos" :key="t.id" :value="t.id">{{ t.nombre }}</option>
            </select>
          </div>
          <div>
            <label class="text-[9px] font-black text-slate-400 uppercase block mb-3 tracking-[0.2em]">Start Date</label>
            <input v-model="nuevoContrato.fecha_inicio" type="date" class="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none">
          </div>
        </div>
        <div class="flex flex-col gap-3 mt-10">
          <button @click="contratarTecnico" class="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 transition-all">Sign Contract</button>
          <button @click="mostrarModalContratar = false" class="w-full py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest">Cancel</button>
        </div>
      </div>
    </div>

    <div v-if="mostrarModalEdit" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-6">
      <div class="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl animate-fade-in">
        <h2 class="text-2xl font-black text-slate-900 mb-2 uppercase italic tracking-tighter text-indigo-600">Edit Dates</h2>
        <p class="text-[10px] text-slate-400 font-bold uppercase mb-8">{{ registroAEditar.nombre_tecnico }}</p>
        <div class="space-y-6">
          <div>
            <label class="text-[9px] font-black text-slate-400 uppercase block mb-3 tracking-[0.2em]">Start Date</label>
            <input v-model="registroAEditar.fecha_inicio" type="date" class="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-xs font-bold text-slate-700 outline-none">
          </div>
          <div>
            <label class="text-[9px] font-black text-slate-400 uppercase block mb-3 tracking-[0.2em]">End Date</label>
            <input v-model="registroAEditar.fecha_fin" type="date" class="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-xs font-bold text-slate-700 outline-none">
          </div>
        </div>
        <div class="flex flex-col gap-3 mt-10">
          <button @click="actualizarHistorial" class="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-lg">Update Dates</button>
          <button @click="mostrarModalEdit = false" class="w-full py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const equipoId = route.params.id
const equipo = ref(null)
const partidos = ref([])
const cargando = ref(true)

const tecnicosHistorial = ref([])
const todosLosTecnicos = ref([])
const mostrarModalContratar = ref(false)
const mostrarModalEdit = ref(false)

const nuevoContrato = ref({ tecnico_id: '', fecha_inicio: new Date().toISOString().split('T')[0] })
const registroAEditar = ref({ id: '', fecha_inicio: '', fecha_fin: '', nombre_tecnico: '' })

// URL HELPERS
const getLogoUrl = (n) => n ? new URL(`../assets/equipos/${n}`, import.meta.url).href : ''
const getEstadioUrl = (n) => n ? new URL(`../assets/estadios/${n}`, import.meta.url).href : ''
const getFotoTecnicoUrl = (n) => {
  if (!n || n === 'undefined') return ''
  
  // 1. Limpiamos espacios
  const nombreLimpio = n.toLowerCase().trim().replace(/\s+/g, '_')
  
  // 2. Comprobamos si ya trae una extensión válida
  const tieneExtension = /\.(jpg|jpeg|png|webp|avif|bmp)$/.test(nombreLimpio)
  
  // 3. Si no tiene, le ponemos .jpg por defecto, pero si ya tiene (como .webp), la dejamos tal cual
  const file = tieneExtension ? nombreLimpio : `${nombreLimpio}.jpg`
  
  try {
    return new URL(`../assets/tecnicos/${file}`, import.meta.url).href
  } catch (error) {
    return ''
  }
}
const getBanderaUrl = (n) => {
  if(!n) return ''
  const file = n.toLowerCase().trim().replace(/\s+/g, '_') + '.png'
  return new URL(`../assets/banderas/${file}`, import.meta.url).href
}

const cargarDatos = async () => {
  if (!equipoId) return
  try {
    cargando.value = true
    const [resEq, resPar, resHist, resTodos] = await Promise.all([
      axios.get(`http://localhost:3000/api/equipos/${equipoId}`),
      axios.get(`http://localhost:3000/api/partidos`),
      axios.get(`http://localhost:3000/api/tecnicos/historial/${equipoId}`),
      axios.get(`http://localhost:3000/api/tecnicos`)
    ])
    equipo.value = resEq.data
    partidos.value = resPar.data
    tecnicosHistorial.value = resHist.data
    todosLosTecnicos.value = resTodos.data
  } catch (error) { console.error("Error:", error) }
  finally { cargando.value = false }
}

const contratarTecnico = async () => {
  if (!nuevoContrato.value.tecnico_id) return
  try {
    await axios.post('http://localhost:3000/api/tecnicos/asignar', {
      equipo_id: equipoId,
      tecnico_id: nuevoContrato.value.tecnico_id,
      fecha_inicio: nuevoContrato.value.fecha_inicio
    })
    mostrarModalContratar.value = false
    await cargarDatos()
  } catch (e) { alert("Error asignando técnico") }
}

const prepararEdicion = (hist) => {
  registroAEditar.value = {
    id: hist.id,
    nombre_tecnico: hist.tecnicos?.nombre,
    fecha_inicio: new Date(hist.fecha_inicio).toISOString().split('T')[0],
    fecha_fin: hist.fecha_fin ? new Date(hist.fecha_fin).toISOString().split('T')[0] : ''
  }
  mostrarModalEdit.value = true
}

const actualizarHistorial = async () => {
  try {
    await axios.put(`http://localhost:3000/api/tecnicos/historial/${registroAEditar.value.id}`, {
      fecha_inicio: registroAEditar.value.fecha_inicio,
      fecha_fin: registroAEditar.value.fecha_fin || null
    })
    mostrarModalEdit.value = false
    await cargarDatos()
  } catch (e) { alert("Error al actualizar") }
}

const eliminarDelHistorial = async (id) => {
  if (!confirm("¿Borrar este registro?")) return
  try {
    await axios.delete(`http://localhost:3000/api/tecnicos/historial/${id}`)
    await cargarDatos()
  } catch (e) { alert("Error al eliminar") }
}

// LÓGICA DE PARTIDOS
const partidosDelEquipo = computed(() => {
  return partidos.value
    .filter(p => String(p.equipo_local_id) === String(equipoId) || String(p.equipo_visitante_id) === String(equipoId))
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
})

const ultimosPartidos = computed(() => partidosDelEquipo.value.slice(0, 3))

const ultimosCincoResultados = computed(() => {
  return partidosDelEquipo.value.slice(0, 5).map(p => {
    const isLocal = String(p.equipo_local_id) === String(equipoId)
    const gP = isLocal ? p.goleslocal : p.golesvisitante
    const gR = isLocal ? p.golesvisitante : p.goleslocal
    if (gP > gR) return 'W'; if (gP === gR) return 'D'; return 'L'
  }).reverse()
})

const getResultadoBg = (res) => res === 'W' ? 'bg-emerald-500' : res === 'D' ? 'bg-slate-400' : 'bg-rose-500'
const getResultadoColor = (p) => {
  const isLocal = String(p.equipo_local_id) === String(equipoId)
  const gP = isLocal ? p.goleslocal : p.golesvisitante
  const gR = isLocal ? p.golesvisitante : p.goleslocal
  if (gP > gR) return 'bg-emerald-400'; if (gP === gR) return 'bg-slate-300'; return 'bg-rose-400'
}

const formatearMes = (f) => new Date(f).toLocaleString('es-ES', { month: 'short' }).toUpperCase().replace('.', '')
const formatearFechaHistorial = (f) => new Date(f).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })

onMounted(cargarDatos)
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
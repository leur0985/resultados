<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const torneoId = route.params.id
const torneoInfo = ref(null)
const partidos = ref([])
const equiposTorneo = ref([])
const estadiosList = ref([])
const arbitrosList = ref([])
const posicionesTorneo = ref({}) 
const jornadaAbierta = ref(null)
const editando = ref(false)

const form = ref({
  id: null, num_partido: 1, jornada: '', fecha: new Date().toISOString().substr(0, 10), hora: '17:00',
  equipo_local_id: null, equipo_visitante_id: null, estadio_id: null, arbitro_id: null,
  goleslocal: 0, golesvisitante: 0, tiempoextra: false, goleslocaltiempoextra: 0, golesvisitantetiempoextra: 0,
  penales: false, goleslocalpenales: 0, golesvisitantepenales: 0, asistencia: 0, estuve: false, comentarios: ''
})

const equipoLocalSeleccionado = computed(() => equiposTorneo.value.find(e => String(e.id) === String(form.value.equipo_local_id)))
const equipoVisitanteSeleccionado = computed(() => equiposTorneo.value.find(e => String(e.id) === String(form.value.equipo_visitante_id)))

const formatearFecha = (f) => f ? f.split('T')[0].split('-').reverse().join('/') : ''
const formatearHora = (h) => h ? (h.includes('T') ? h.split('T')[1].substring(0, 5) : h.substring(0, 5)) : ''

const totalGolesTorneo = computed(() => {
  return partidos.value.reduce((acc, p) => acc + (Number(p.goleslocal) || 0) + (Number(p.golesvisitante) || 0), 0)
})

const totalAsistenciaTorneo = computed(() => {
  return partidos.value.reduce((acc, p) => acc + (Number(p.asistencia) || 0), 0)
})

const obtenerPosicion = (jor, equipoId) => {
  if (!posicionesTorneo.value || !posicionesTorneo.value[String(jor)]) return null
  return posicionesTorneo.value[String(jor)][String(equipoId)] || null
}

watch(() => form.value.equipo_local_id, (newId) => {
  if (!newId || editando.value) return; 
  const equipoEncontrado = equiposTorneo.value.find(e => String(e.id) === String(newId));
  if (equipoEncontrado && equipoEncontrado.estadio_id) form.value.estadio_id = equipoEncontrado.estadio_id;
});

const partidosAgrupados = computed(() => {
  const grupos = {}
  partidos.value.forEach(p => {
    if (!grupos[p.jornada]) grupos[p.jornada] = { lista: [], totalGoles: 0, totalAsistencia: 0 }
    grupos[p.jornada].lista.push(p)
    grupos[p.jornada].totalGoles += (Number(p.goleslocal) || 0) + (Number(p.golesvisitante) || 0)
    grupos[p.jornada].totalAsistencia += (Number(p.asistencia) || 0)
  })
  Object.keys(grupos).forEach(j => grupos[j].lista.sort((a, b) => a.num_partido - b.num_partido))
  return grupos
})

const toggleJornada = (j) => jornadaAbierta.value = (jornadaAbierta.value === j) ? null : j

const cargarTodo = async () => {
  try {
    const [resTorneo, resEst, resArb, resPos] = await Promise.all([
      axios.get(`http://localhost:3000/api/torneos/${torneoId}/partidos`),
      axios.get(`http://localhost:3000/api/estadios`),
      axios.get(`http://localhost:3000/api/arbitros`),
      axios.get(`http://localhost:3000/api/partidos/evolucion-completa/${torneoId}`)
    ])
    if (resTorneo.data) {
      torneoInfo.value = resTorneo.data
      partidos.value = resTorneo.data.partidos || []
      equiposTorneo.value = resTorneo.data.equipos_torneo?.map(et => et.equipos) || []
      const jornadas = Object.keys(partidosAgrupados.value)
      if (jornadas.length > 0 && !jornadaAbierta.value) jornadaAbierta.value = jornadas[jornadas.length - 1]
    }
    estadiosList.value = resEst.data || []; arbitrosList.value = resArb.data || []
    posicionesTorneo.value = resPos.data || {}
  } catch (error) { console.error(error) }
}

const prepararEdicion = (p) => {
  editando.value = true
  form.value = {
    ...p, id: p.id, fecha: p.fecha.split('T')[0], hora: formatearHora(p.hora),
    tiempoextra: p.tiempoextra === 1, penales: p.penales === 1, estuve: p.estuve === 1
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const guardar = async () => {
  try {
    const data = { ...form.value, torneo_id: torneoId, estuve: form.value.estuve ? 1 : 0, tiempoextra: form.value.tiempoextra ? 1 : 0, penales: form.value.penales ? 1 : 0 }
    if (editando.value) await axios.put(`http://localhost:3000/api/partidos/${form.value.id}`, data)
    else await axios.post('http://localhost:3000/api/partidos', data)
    await cargarTodo(); cancelar(); alert("¡Guardado! ⚽");
  } catch (e) { alert("Error al guardar") }
}

const cancelar = () => {
  editando.value = false
  form.value = { id: null, num_partido: 1, jornada: '', fecha: new Date().toISOString().substr(0, 10), hora: '17:00', equipo_local_id: null, equipo_visitante_id: null, estadio_id: null, arbitro_id: null, goleslocal: 0, golesvisitante: 0, tiempoextra: false, goleslocaltiempoextra: 0, golesvisitantetiempoextra: 0, penales: false, goleslocalpenales: 0, golesvisitantepenales: 0, asistencia: 0, estuve: false, comentarios: '' }
}

const eliminar = async (id) => {
  if (confirm("¿Eliminar?")) {
    await axios.delete(`http://localhost:3000/api/partidos/${id}`); await cargarTodo();
  }
}

const getLogoUrl = (n) => n ? new URL(`../assets/equipos/${n}`, import.meta.url).href : ''
onMounted(cargarTodo)
</script>

<template>
  <div class="w-full space-y-10 pb-20 px-[5%]" v-if="torneoInfo">
    <header class="bg-white p-10 rounded-[3rem] shadow-xl border-l-[16px] border-indigo-600 flex justify-between items-center">
      <div class="flex items-center gap-6">
        <h1 class="text-4xl font-black text-slate-800 uppercase italic tracking-tighter">{{ torneoInfo.nombre }}</h1>
        <div class="flex gap-3">
          <div class="bg-indigo-50 px-5 py-2 rounded-2xl border border-indigo-100 flex flex-col items-center">
            <span class="text-[8px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Goles</span>
            <span class="text-xl font-black text-indigo-600 italic leading-none">{{ totalGolesTorneo }}</span>
          </div>
          <div class="bg-slate-50 px-5 py-2 rounded-2xl border border-slate-100 flex flex-col items-center">
            <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Asistencia</span>
            <span class="text-xl font-black text-slate-700 italic leading-none">{{ totalAsistenciaTorneo.toLocaleString() }}</span>
          </div>
        </div>
      </div>
      <router-link to="/torneos" class="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] tracking-widest uppercase">← Volver</router-link>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <aside class="lg:col-span-4">
        <div class="bg-white p-8 rounded-[2.5rem] shadow-xl sticky top-10 border border-slate-100 max-h-[90vh] overflow-y-auto custom-scroll">
          <form @submit.prevent="guardar" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <input v-model="form.jornada" placeholder="Jor" class="bg-slate-50 rounded-2xl p-4 text-xs font-bold uppercase border-none">
              <input v-model="form.num_partido" type="number" class="bg-slate-50 rounded-2xl p-4 text-xs font-bold border-none">
            </div>

            <div class="grid grid-cols-2 gap-4">
              <input v-model="form.fecha" type="date" class="bg-slate-50 rounded-2xl p-4 text-[10px] font-bold border-none">
              <input v-model="form.hora" type="time" class="bg-slate-50 rounded-2xl p-4 text-xs font-bold border-none">
            </div>
            
            <div class="bg-slate-900 p-6 rounded-[2rem] shadow-2xl space-y-4">
              <select v-model="form.equipo_local_id" class="w-full bg-slate-800 text-white rounded-xl p-3 text-[10px] font-black uppercase border-none">
                <option :value="null">-- Local --</option>
                <option v-for="eq in equiposTorneo" :key="eq.id" :value="eq.id">{{ eq.nombre }}</option>
              </select>
              <div class="flex gap-3 justify-center items-center">
                <img v-if="equipoLocalSeleccionado" :src="getLogoUrl(equipoLocalSeleccionado.logo)" class="w-10 h-10 object-contain">
                <input v-model="form.goleslocal" type="number" class="w-14 h-14 bg-white rounded-xl text-center font-black text-xl border-none">
                <span class="text-indigo-400 font-black italic">VS</span>
                <input v-model="form.golesvisitante" type="number" class="w-14 h-14 bg-white rounded-xl text-center font-black text-xl border-none">
                <img v-if="equipoVisitanteSeleccionado" :src="getLogoUrl(equipoVisitanteSeleccionado.logo)" class="w-10 h-10 object-contain">
              </div>
              <select v-model="form.equipo_visitante_id" class="w-full bg-slate-800 text-white rounded-xl p-3 text-[10px] font-black uppercase border-none">
                <option :value="null">-- Visita --</option>
                <option v-for="eq in equiposTorneo" :key="eq.id" :value="eq.id">{{ eq.nombre }}</option>
              </select>
            </div>

            <div class="space-y-3">
              <select v-model="form.estadio_id" class="w-full bg-slate-100 rounded-2xl p-4 text-[10px] font-black uppercase border-none">
                <option :value="null">-- Estadio --</option>
                <option v-for="est in estadiosList" :key="est.id" :value="est.id">{{ est.nombre }}</option>
              </select>
              <select v-model="form.arbitro_id" class="w-full bg-slate-100 rounded-2xl p-4 text-[10px] font-black uppercase border-none">
                <option :value="null">-- Árbitro --</option>
                <option v-for="arb in arbitrosList" :key="arb.id" :value="arb.id">{{ arb.nombre }}</option>
              </select>
              <input v-model="form.asistencia" type="number" placeholder="Asistencia" class="w-full bg-slate-100 rounded-2xl p-4 text-xs font-black border-none">
            </div>

            <textarea v-model="form.comentarios" rows="2" placeholder="Comentarios..." class="w-full bg-slate-50 rounded-2xl p-4 text-xs font-medium border-none resize-none"></textarea>

            <button type="submit" class="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black uppercase text-xs shadow-lg hover:bg-slate-900 transition-all">
              {{ editando ? 'ACTUALIZAR' : 'GUARDAR' }}
            </button>

            <div class="flex items-center gap-4 bg-amber-50 p-4 rounded-2xl border border-amber-100">
              <input v-model="form.estuve" type="checkbox" class="w-6 h-6 accent-amber-500">
              <span class="text-[10px] font-black uppercase text-amber-700 italic">Asistí al Estadio</span>
            </div>

            <div class="pt-4 space-y-3">
              <div class="bg-indigo-50 p-4 rounded-3xl border border-indigo-100 space-y-3">
                <div class="flex items-center gap-3">
                  <input v-model="form.tiempoextra" type="checkbox" class="w-5 h-5 accent-indigo-600">
                  <span class="text-[10px] font-black uppercase text-indigo-800 italic">Tiempo Extra</span>
                </div>
                <div v-if="form.tiempoextra" class="flex gap-2 justify-center items-center">
                  <img v-if="equipoLocalSeleccionado" :src="getLogoUrl(equipoLocalSeleccionado.logo)" class="w-6 h-6 object-contain">
                  <input v-model="form.goleslocaltiempoextra" type="number" class="w-12 h-10 bg-white rounded-lg text-center font-bold border-none">
                  <span class="text-[9px] font-black text-indigo-300">E.T.</span>
                  <input v-model="form.golesvisitantetiempoextra" type="number" class="w-12 h-10 bg-white rounded-lg text-center font-bold border-none">
                  <img v-if="equipoVisitanteSeleccionado" :src="getLogoUrl(equipoVisitanteSeleccionado.logo)" class="w-6 h-6 object-contain">
                </div>
              </div>
              <div class="bg-rose-50 p-4 rounded-3xl border border-rose-100 space-y-3">
                <div class="flex items-center gap-3">
                  <input v-model="form.penales" type="checkbox" class="w-5 h-5 accent-rose-600">
                  <span class="text-[10px] font-black uppercase text-rose-800 italic">Penales</span>
                </div>
                <div v-if="form.penales" class="flex gap-2 justify-center items-center">
                  <img v-if="equipoLocalSeleccionado" :src="getLogoUrl(equipoLocalSeleccionado.logo)" class="w-6 h-6 object-contain">
                  <input v-model="form.goleslocalpenales" type="number" class="w-12 h-10 bg-white rounded-lg text-center font-bold border-none">
                  <span class="text-[9px] font-black text-rose-300">PEN</span>
                  <input v-model="form.golesvisitantepenales" type="number" class="w-12 h-10 bg-white rounded-lg text-center font-bold border-none">
                  <img v-if="equipoVisitanteSeleccionado" :src="getLogoUrl(equipoVisitanteSeleccionado.logo)" class="w-6 h-6 object-contain">
                </div>
              </div>
            </div>
            <button v-if="editando" @click="cancelar" type="button" class="w-full text-slate-400 text-[10px] font-bold uppercase py-2">Cancelar</button>
          </form>
        </div>
      </aside>

      <div class="lg:col-span-8 space-y-4">
        <div v-for="(info, jor) in partidosAgrupados" :key="jor">
          <button @click="toggleJornada(jor)" class="w-full flex justify-between items-center bg-white p-6 rounded-[2.5rem] shadow-sm mb-2 border-l-8 border-indigo-600 hover:bg-slate-50 transition-all group">
            <div class="flex items-baseline gap-4">
              <span class="text-2xl font-black text-slate-800 italic uppercase tracking-tighter">Jornada: {{ jor }} | Goles: {{ info.totalGoles }}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                {{ info.lista.length }} Partidos
              </span>
              <span class="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-50/50 px-3 py-1 rounded-full border border-indigo-100">
                👥 {{ info.totalAsistencia.toLocaleString() }}
              </span>
            </div>
            <span class="text-indigo-600 font-black text-xl">{{ jornadaAbierta === jor ? '−' : '+' }}</span>
          </button>

          <div v-if="jornadaAbierta === jor" class="space-y-4 py-2 animate-fade-in">
            <div v-for="p in info.lista" :key="p.id" class="bg-white rounded-[4rem] border border-slate-100 shadow-xl flex flex-col relative transition-all duration-300 hover:shadow-2xl overflow-visible">
              <div v-if="p.comentarios" class="absolute top-6 right-8 z-[50]">
                <div class="group/comentario relative">
                  <div class="cursor-help bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center border border-slate-200">
                    <span class="text-sm">⚠️</span>
                  </div>
                  <div class="absolute top-full right-0 mt-2 w-64 opacity-0 pointer-events-none group-hover/comentario:opacity-100 transition-all duration-300 z-[999]">
                    <div class="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl text-xs italic border border-slate-700 leading-relaxed">
                      {{ p.comentarios }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="p-6 md:px-8 flex items-center relative group/card">
                <div class="w-28 border-r-2 border-slate-50 pr-4 mr-2 text-center flex flex-col justify-center items-center">
                  <div class="flex items-center gap-1 mb-1">
                    <span class="text-indigo-600 text-[18px] font-black leading-none">{{ formatearHora(p.hora) }}</span>
                    <span v-if="p.estuve === 1" class="text-sm" title="Asistí">🎫</span>
                  </div>
                  <span class="text-slate-900 text-[12px] font-black italic mt-1">{{ formatearFecha(p.fecha) }}</span>
                  <div class="bg-slate-900 text-white px-3 py-1 rounded-md text-[8px] font-black mt-3 uppercase tracking-tighter">#{{ p.num_partido }}</div>
                </div>

                <div class="flex-1">
                  <div class="flex items-center justify-between w-full">
                    <router-link :to="{ name: 'equipo-detalle', params: { torneoId: torneoId, equipoId: p.equipo_local_id } }" class="flex-1 flex flex-col items-center gap-2 group/team">
                      <div class="relative">
                        <img :src="getLogoUrl(p.equipos_partidos_equipo_local_idToequipos?.logo)" class="w-[70px] h-[70px] object-contain group-hover/team:scale-110 transition-transform">
                        <div v-if="obtenerPosicion(p.jornada, p.equipo_local_id)" class="absolute -top-2 -right-2 bg-slate-800 text-white w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center border-2 border-white italic">
                          {{ obtenerPosicion(p.jornada, p.equipo_local_id) }}
                        </div>
                      </div>
                      <span class="text-sm font-black uppercase text-slate-800 text-center leading-none">{{ p.equipolocal }}</span>
                      <div v-if="p.tiempoextra || p.penales" class="flex flex-col gap-1 items-center mt-1">
                        <span v-if="p.tiempoextra" class="text-[9px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase italic">ET: {{ p.goleslocaltiempoextra }}</span>
                        <span v-if="p.penales" class="text-[9px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold uppercase italic">PEN: {{ p.goleslocalpenales }}</span>
                      </div>
                    </router-link>

                    <div class="flex items-center gap-4 bg-white px-6 py-2 rounded-3xl border-2 border-slate-100 shadow-sm relative mx-2">
                      <div class="absolute -top-12 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity z-50">
                        <button @click="prepararEdicion(p)" class="p-2 bg-indigo-50 rounded-full">📝</button>
                        <button @click="eliminar(p.id)" class="p-2 bg-red-50 rounded-full">🗑️</button>
                      </div>
                      <span class="text-5xl font-black text-slate-900 tabular-nums">{{ p.goleslocal }}</span>
                      <span class="text-slate-200 font-black text-2xl">:</span>
                      <span class="text-5xl font-black text-slate-900 tabular-nums">{{ p.golesvisitante }}</span>
                    </div>

                    <router-link :to="{ name: 'equipo-detalle', params: { torneoId: torneoId, equipoId: p.equipo_visitante_id } }" class="flex-1 flex flex-col items-center gap-2 group/team">
                      <div class="relative">
                        <img :src="getLogoUrl(p.equipos_partidos_equipo_visitante_idToequipos?.logo)" class="w-[70px] h-[70px] object-contain group-hover/team:scale-110 transition-transform">
                        <div v-if="obtenerPosicion(p.jornada, p.equipo_visitante_id)" class="absolute -top-2 -right-2 bg-slate-800 text-white w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center border-2 border-white italic">
                          {{ obtenerPosicion(p.jornada, p.equipo_visitante_id) }}
                        </div>
                      </div>
                      <span class="text-sm font-black uppercase text-slate-800 text-center leading-none">{{ p.equipovisitante }}</span>
                      <div v-if="p.tiempoextra || p.penales" class="flex flex-col gap-1 items-center mt-1">
                        <span v-if="p.tiempoextra" class="text-[9px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase italic">ET: {{ p.golesvisitantetiempoextra }}</span>
                        <span v-if="p.penales" class="text-[9px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold uppercase italic">PEN: {{ p.golesvisitantepenales }}</span>
                      </div>
                    </router-link>
                  </div>
                </div>
              </div>

              <div class="flex flex-wrap justify-center items-center gap-6 pt-6 border-t border-slate-100 text-[13px] font-bold uppercase italic shadow-inner bg-slate-50/50 rounded-b-[4rem] py-5 px-8">
                <span>📍 {{ p.nombre_estadio || 'N/A' }}</span>
                <span v-if="p.arbitros" class="flex items-center gap-2">
                  <span class="text-slate-400">REF:</span>
                  <span class="text-indigo-600 font-black">{{ p.arbitros.nombre }}</span>
                </span>
                <span v-if="p.asistencia > 0">👥 {{ p.asistencia.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tabular-nums { font-variant-numeric: tabular-nums; }
.overflow-visible { overflow: visible !important; }
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
.custom-scroll::-webkit-scrollbar { width: 4px; }
.custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
</style>
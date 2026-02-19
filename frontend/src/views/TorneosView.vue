<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const torneos = ref([])
const equiposList = ref([]) 
const seleccionado = ref(null)
const vistaActual = ref('lista')
const editando = ref(false)

const formulario = ref({
  id: null,
  nombre: '',
  inicio: '',
  fin: '',
  tipo: 'LIGA',
  status: 'ACTIVO',
  comentarios: '',
  equipo_id: null
})

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return 'TBD'
  const [year, month, day] = fechaStr.split('T')[0].split('-')
  return `${day}/${month}/${year}`
}

const cargarDatos = async () => {
  try {
    const [resTor, resEq] = await Promise.all([
      axios.get('http://localhost:3000/api/torneos'),
      axios.get('http://localhost:3000/api/equipos')
    ])
    torneos.value = resTor.data
    equiposList.value = resEq.data
  } catch (error) {
    console.error("Error al cargar datos:", error)
  }
}

const equiposDisponibles = computed(() => {
  if (!seleccionado.value || !equiposList.value) return []
  const inscritosIds = seleccionado.value.equipos_torneo.map(et => String(et.equipo_id))
  return equiposList.value.filter(eq => !inscritosIds.includes(String(eq.id)))
})

const agregarEquipoAlTorneo = async (equipoId) => {
  try {
    await axios.post('http://localhost:3000/api/torneos/add-equipo', {
      torneo_id: seleccionado.value.id,
      equipo_id: equipoId
    })
    await verDetalles(seleccionado.value.id, 'equipos')
  } catch (error) {
    alert("Error al añadir equipo")
  }
}

const quitarEquipoDelTorneo = async (relacionId) => {
  if (!confirm('¿Quitar este equipo del torneo?')) return
  try {
    await axios.delete(`http://localhost:3000/api/torneos/remove-equipo/${relacionId}`)
    await verDetalles(seleccionado.value.id, 'equipos')
  } catch (error) {
    alert("Error al quitar equipo")
  }
}

const guardar = async () => {
  try {
    if (editando.value) {
      await axios.put(`http://localhost:3000/api/torneos/${formulario.value.id}`, formulario.value)
    } else {
      await axios.post('http://localhost:3000/api/torneos', formulario.value)
    }
    resetearFormulario()
    await cargarDatos()
  } catch (error) {
    alert("Error al guardar")
  }
}

const prepararEdicion = (t) => {
  editando.value = true
  formulario.value = {
    ...t,
    inicio: t.inicio ? t.inicio.split('T')[0] : '',
    fin: t.fin ? t.fin.split('T')[0] : '',
    equipo_id: t.equipo_id
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const eliminar = async (id) => {
  if (confirm('¿Eliminar torneo?')) {
    await axios.delete(`http://localhost:3000/api/torneos/${id}`)
    await cargarDatos()
  }
}

const verDetalles = async (id, vista) => {
  try {
    const res = await axios.get(`http://localhost:3000/api/torneos/${id}`)
    seleccionado.value = res.data
    vistaActual.value = vista
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (error) {
    console.error("Error al cargar detalles:", error.response?.data || error.message)
  }
}

const resetearFormulario = () => {
  editando.value = false
  formulario.value = { id: null, nombre: '', inicio: '', fin: '', tipo: 'LIGA', status: 'ACTIVO', comentarios: '', equipo_id: null }
}

const getLogoUrl = (n) => n ? new URL(`../assets/equipos/${n}`, import.meta.url).href : ''

onMounted(cargarDatos)
</script>

<template>
  <div class="w-full space-y-10 pb-20 px-[5%]">
    
    <header class="flex flex-col md:flex-row items-end justify-between border-l-[12px] border-indigo-600 pl-8 py-4 bg-white p-8 rounded-r-[3rem] shadow-sm border border-slate-100 mt-6">
      <div>
        <h1 class="text-6xl font-black text-slate-800 tracking-tighter uppercase leading-none">
          Tournaments <span class="text-indigo-600">{{ seleccionado ? 'Details' : 'Registry' }}</span>
        </h1>
        <p class="text-slate-400 font-mono tracking-[0.3em] text-[10px] mt-3 uppercase font-bold italic">Championship Management</p>
      </div>
      <button v-if="seleccionado" @click="seleccionado = null; vistaActual = 'lista'" class="px-10 py-4 bg-slate-900 text-white font-black uppercase text-xs rounded-2xl hover:bg-indigo-600 transition-all shadow-xl active:scale-95 border-none">
        ← Back to List
      </button>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
      
      <aside v-if="!seleccionado" class="lg:col-span-4">
        <div class="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 sticky top-10">
          <h2 class="text-xs font-black uppercase tracking-widest text-slate-400 border-b pb-4 mb-6">
            {{ editando ? 'Update Tournament' : 'New Tournament' }}
          </h2>
          
          <form @submit.prevent="guardar" class="space-y-4">
            <div>
              <label class="text-[10px] font-black uppercase ml-2 text-slate-400">Nombre</label>
              <input v-model="formulario.nombre" required class="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold">
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-[10px] font-black uppercase ml-2 text-slate-400">Inicio</label>
                <input v-model="formulario.inicio" type="date" class="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold">
              </div>
              <div>
                <label class="text-[10px] font-black uppercase ml-2 text-slate-400">Fin</label>
                <input v-model="formulario.fin" type="date" class="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold">
              </div>
            </div>

            <div>
              <label class="text-[10px] font-black uppercase ml-2 text-amber-500">🏆 Campeón del Torneo</label>
              <select v-model="formulario.equipo_id" class="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold">
                <option :value="null">-- Ninguno (En curso) --</option>
                <option v-for="eq in equiposList" :key="eq.id.toString()" :value="eq.id">{{ eq.nombre }}</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <select v-model="formulario.tipo" class="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold">
                <option value="LIGA">LIGA</option>
                <option value="COPA">COPA</option>
              </select>
              <select v-model="formulario.status" class="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold">
                <option value="ACTIVO">ACTIVO</option>
                <option value="FINALIZADO">FINALIZADO</option>
              </select>
            </div>

            <button type="submit" :class="editando ? 'bg-amber-500' : 'bg-indigo-600'" class="w-full py-5 text-white font-black uppercase text-xs rounded-2xl shadow-lg transition-all hover:brightness-110 border-none">
              {{ editando ? 'Save Changes' : 'Create Tournament' }}
            </button>
            <button v-if="editando" @click="resetearFormulario" type="button" class="w-full py-2 text-slate-400 text-[10px] uppercase font-bold border-none">Cancel Edition</button>
          </form>
        </div>
      </aside>

      <div :class="seleccionado ? 'lg:col-span-12' : 'lg:col-span-8'">
        
        <div v-if="vistaActual === 'lista'" class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div v-for="t in torneos" :key="t.id.toString()" 
               class="group bg-white p-10 rounded-[3.5rem] border border-slate-100 hover:shadow-2xl transition-all duration-500 relative flex flex-col justify-between min-h-[280px]">
            
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="text-[9px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-widest border-none">
                    {{ t.tipo }}
                  </span>
                  <span class="text-[9px] font-black bg-slate-900 text-white px-3 py-1 rounded-full uppercase tracking-widest border-none">
                    {{ t.equipos_torneo?.length || 0 }} Equipos
                  </span>
                </div>
                <h3 class="text-3xl font-black text-slate-800 uppercase tracking-tighter mt-3 leading-none group-hover:text-indigo-600 transition-colors cursor-pointer" @click="verDetalles(t.id, 'info')">
                  {{ t.nombre }}
                </h3>
                <div class="mt-4 flex items-center gap-3">
                  <span class="text-[11px] font-mono font-bold text-slate-500 uppercase flex items-center gap-2">
                    📅 {{ formatearFecha(t.inicio) }} — {{ formatearFecha(t.fin) }}
                  </span>
                </div>
              </div>

              <div class="flex gap-2">
                <button @click="prepararEdicion(t)" class="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all border-none">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button @click="eliminar(t.id)" class="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all border-none">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>

            <div class="flex items-end justify-between mt-8">
              <div class="flex gap-2">
                <router-link :to="`/torneos/${t.id}/partidos`" class="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl border-none">
                  Matches
                </router-link>
                <button 
                  @click="verDetalles(t.id, 'equipos')" 
                  class="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-4 py-2 rounded-xl hover:bg-slate-900 hover:text-white transition-all border-none"
                >
                  Teams
                </button>
                <router-link :to="{ name: 'torneo-tabla', params: { id: t.id } }" class="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border-none">
                   📊 Tabla
                </router-link>
              </div>
              <div v-if="t.equipos" class="flex flex-col items-center">
                <div class="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center p-2 border-2 border-amber-100 shadow-inner">
                  <img :src="getLogoUrl(t.equipos.logo)" class="max-w-full max-h-full object-contain">
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="bg-white rounded-[4rem] shadow-2xl border-none overflow-hidden min-h-[600px]">
          <div class="bg-slate-900 p-8 flex flex-col md:flex-row justify-between items-center border-b-[8px] border-indigo-600 gap-6">
            <div class="flex items-center gap-4">
              <h2 class="text-4xl font-black text-white uppercase italic tracking-tighter">{{ seleccionado.nombre }}</h2>
              <div class="bg-indigo-600 text-white px-4 py-1 rounded-full text-[12px] font-black uppercase italic animate-pulse">
                {{ seleccionado.equipos_torneo.length }} Inscritos
              </div>
            </div>
            
            <div class="flex gap-2 bg-slate-800 p-2 rounded-2xl border-none">
              <button @click="vistaActual = 'info'" :class="vistaActual === 'info' ? 'bg-indigo-600 text-white' : 'text-slate-500'" class="px-8 py-3 rounded-xl text-[10px] font-black uppercase border-none transition-all">Info</button>
              <button @click="vistaActual = 'equipos'" :class="vistaActual === 'equipos' ? 'bg-indigo-600 text-white' : 'text-slate-500'" class="px-8 py-3 rounded-xl text-[10px] font-black uppercase border-none transition-all">Teams Panel</button>
            </div>
          </div>
          
          <div class="p-12">
            <div v-if="vistaActual === 'equipos'" class="space-y-12">
              <section>
                <h3 class="text-[11px] font-black uppercase text-indigo-500 tracking-widest mb-6 flex items-center gap-3">
                  <span class="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  Participants ({{ seleccionado.equipos_torneo.length }})
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div v-for="eqt in seleccionado.equipos_torneo" :key="eqt.id.toString()" 
                       class="group flex items-center justify-between bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div class="flex items-center gap-4">
                      <div class="w-14 h-14 bg-slate-50 rounded-2xl p-2">
                        <img :src="getLogoUrl(eqt.equipos.logo)" class="w-full h-full object-contain">
                      </div>
                      <p class="text-[12px] font-black text-slate-800 uppercase">{{ eqt.equipos.nombre }}</p>
                    </div>
                    <button @click="quitarEquipoDelTorneo(eqt.id)" class="p-2 text-slate-200 hover:text-red-500 transition-colors border-none">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </section>

              <section class="pt-10 border-t border-dashed border-slate-200">
                <h3 class="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-6">Available Clubs</h3>
                <div class="flex flex-wrap gap-4">
                  <button v-for="eq in equiposDisponibles" :key="eq.id.toString()" 
                          @click="agregarEquipoAlTorneo(eq.id)"
                          class="flex items-center gap-4 bg-slate-900 text-white pl-4 pr-6 py-3 rounded-2xl hover:bg-indigo-600 transition-all border-none shadow-lg active:scale-95">
                    <div class="w-8 h-8 bg-white/10 rounded-lg p-1">
                      <img :src="getLogoUrl(eq.logo)" class="w-full h-full object-contain brightness-0 invert">
                    </div>
                    <span class="text-[11px] font-black uppercase">{{ eq.nombre }}</span>
                    <span class="text-indigo-400 font-bold text-xl ml-2">+</span>
                  </button>
                </div>
              </section>
            </div>

            <div v-if="vistaActual === 'info'" class="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div class="space-y-6">
                 <div>
                   <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type & Status</label>
                   <p class="text-2xl font-black text-slate-800 uppercase italic">{{ seleccionado.tipo }} / {{ seleccionado.status }}</p>
                 </div>
                 <div>
                   <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Observations</label>
                   <p class="text-slate-500 font-bold leading-relaxed">{{ seleccionado.comentarios || 'No additional comments.' }}</p>
                 </div>
               </div>
               <div v-if="seleccionado.equipos" class="bg-amber-50 p-8 rounded-[3rem] border border-amber-100 text-center">
                 <p class="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-4">🏆 Defending Champion</p>
                 <img :src="getLogoUrl(seleccionado.equipos.logo)" class="w-32 h-32 mx-auto object-contain drop-shadow-xl">
                 <h4 class="text-2xl font-black text-amber-700 uppercase mt-4">{{ seleccionado.equipos.nombre }}</h4>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
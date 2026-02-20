<template>
  <div class="min-h-screen bg-white py-10 px-[5%] animate-fade-in">
    <div class="mb-10">
      <h2 class="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-2">Catálogo Maestro</h2>
      <h1 class="text-4xl font-light text-slate-900">Gestión de <span class="font-black">Técnicos</span></h1>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
      
      <div class="lg:col-span-4">
        <div class="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 sticky top-24">
          <div class="flex items-center gap-3 mb-8">
            <div class="w-2 h-8 bg-indigo-600 rounded-full"></div>
            <h2 class="text-xl font-black text-slate-800 tracking-tighter uppercase italic">
              {{ editandoId ? 'Editar' : 'Registro' }}
            </h2>
          </div>

          <form @submit.prevent="guardarTecnico" class="space-y-5">
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nombre Completo</label>
              <input v-model="form.nombre" type="text" required class="form-input-standard">
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Código</label>
                <input v-model="form.codigo" type="text" required class="form-input-standard" placeholder="DT-XXX">
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">País</label>
                <select v-model="form.nacionalidad_id" required class="form-input-standard">
                  <option value="" disabled>Seleccionar...</option>
                  <option v-for="p in paises" :key="p.id" :value="p.id">{{ p.nombre }}</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Fecha de Nacimiento</label>
              <input v-model="form.fecha_nacimiento" type="date" class="form-input-standard">
            </div>

            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Foto Técnico (JPG/PNG/WEBP)</label>
              <input v-model="form.foto" type="text" placeholder="ej: guardiola.webp" class="form-input-standard">
            </div>

            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Reseña</label>
              <textarea v-model="form.descripcion" rows="3" class="form-input-standard resize-none"></textarea>
            </div>

            <div class="pt-4 flex gap-3">
              <button type="submit" class="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg transform active:scale-95">
                {{ editandoId ? 'Actualizar' : 'Guardar' }}
              </button>
              <button v-if="editandoId" @click="cancelarEdicion" type="button" class="px-6 bg-slate-200 text-slate-600 rounded-2xl font-black uppercase text-[10px] hover:bg-slate-300 transition-all">
                ✕
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="lg:col-span-8">
        <div class="mb-6">
          <input v-model="filtro" type="text" placeholder="Filtrar por nombre o código..." 
            class="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none">
        </div>

        <div class="overflow-hidden border border-slate-100 rounded-[2.5rem] bg-white shadow-sm">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/50">
                <th class="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Técnico</th>
                <th class="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nacimiento / Edad</th>
                <th class="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">País</th>
                <th class="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="t in tecnicosFiltrados" :key="t.id" class="hover:bg-slate-50/50 transition-colors group">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-indigo-50 rounded-xl overflow-hidden flex-shrink-0 border border-indigo-100 flex items-center justify-center">
                      <img v-if="t.foto && getFotoUrl(t.foto)" :src="getFotoUrl(t.foto)" class="w-full h-full object-cover">
                      <span v-else class="text-indigo-300 font-black text-[10px]">DT</span>
                    </div>
                    <div>
                      <p class="font-bold text-slate-800 text-sm leading-tight">{{ t.nombre }}</p>
                      <p class="text-[9px] text-slate-400 font-black uppercase italic">{{ t.codigo }}</p>
                    </div>
                  </div>
                </td>

                <td class="px-6 py-4">
                  <p class="text-xs font-bold text-slate-600">{{ t.fecha_nacimiento ? formatearFecha(t.fecha_nacimiento) : '---' }}</p>
                  <p class="text-[10px] text-indigo-500 font-black">{{ t.fecha_nacimiento ? calcularEdad(t.fecha_nacimiento) + ' AÑOS' : '' }}</p>
                </td>
                
                <td class="px-6 py-4 text-center">
                  <div class="flex flex-col items-center gap-1">
                    <img :src="getBanderaUrl(t.paises?.nombre)" class="w-6 h-4 object-cover rounded-[2px] shadow-sm border border-slate-200">
                    <span class="text-[9px] font-bold text-slate-500 uppercase">{{ t.paises?.nombre }}</span>
                  </div>
                </td>

                <td class="px-6 py-4 text-right">
                  <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button @click="abrirEdicion(t)" class="p-2 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-colors">✏️</button>
                    <button @click="eliminarTecnico(t.id)" class="p-2 hover:bg-rose-50 rounded-lg text-rose-500 transition-colors">🗑️</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const tecnicos = ref([])
const paises = ref([])
const filtro = ref('')
const editandoId = ref(null)

const form = ref({
  nombre: '',
  codigo: '',
  nacionalidad_id: '',
  fecha_nacimiento: '', // Agregado al estado
  foto: '',
  descripcion: ''
})

// LÓGICA DE FOTOS (Soporte WebP incluido)
const getFotoUrl = (n) => {
  if (!n || n === 'undefined') return ''
  const nombreLimpio = n.toLowerCase().trim().replace(/\s+/g, '_')
  const tieneExtension = /\.(jpg|jpeg|png|webp|avif|bmp)$/.test(nombreLimpio)
  const file = tieneExtension ? nombreLimpio : `${nombreLimpio}.jpg`
  try { return new URL(`../assets/tecnicos/${file}`, import.meta.url).href } catch (e) { return '' }
}

const getBanderaUrl = (val) => {
  if (!val) return ''
  const file = val.toLowerCase().trim().replace(/\s+/g, '_') + '.png'
  try { return new URL(`../assets/banderas/${file}`, import.meta.url).href } catch (e) { return '' }
}

// HELPERS DE FECHAS
const formatearFecha = (f) => new Date(f).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })

const calcularEdad = (f) => {
  const birthDate = new Date(f)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
  return age
}

const cargarDatos = async () => {
  try {
    const [resT, resP] = await Promise.all([
      axios.get('http://localhost:3000/api/tecnicos'),
      axios.get('http://localhost:3000/api/paises')
    ])
    tecnicos.value = resT.data
    paises.value = resP.data
  } catch (e) { console.error(e) }
}

const tecnicosFiltrados = computed(() => {
  return tecnicos.value.filter(t => 
    t.nombre.toLowerCase().includes(filtro.value.toLowerCase()) || 
    t.codigo.toLowerCase().includes(filtro.value.toLowerCase())
  )
})

const abrirEdicion = (t) => {
  editandoId.value = t.id
  // Convertimos la fecha al formato YYYY-MM-DD que requiere el input de tipo date
  const fechaFormateada = t.fecha_nacimiento ? new Date(t.fecha_nacimiento).toISOString().split('T')[0] : ''
  form.value = { ...t, fecha_nacimiento: fechaFormateada }
}

const cancelarEdicion = () => {
  editandoId.value = null
  form.value = { nombre: '', codigo: '', nacionalidad_id: '', fecha_nacimiento: '', foto: '', descripcion: '' }
}

const guardarTecnico = async () => {
  try {
    if (editandoId.value) {
      await axios.put(`http://localhost:3000/api/tecnicos/${editandoId.value}`, form.value)
    } else {
      await axios.post('http://localhost:3000/api/tecnicos', form.value)
    }
    cancelarEdicion()
    cargarDatos()
  } catch (e) { alert("Error al guardar") }
}

const eliminarTecnico = async (id) => {
  if (!confirm("¿Eliminar?")) return
  try {
    await axios.delete(`http://localhost:3000/api/tecnicos/${id}`)
    cargarDatos()
  } catch (e) { alert("Error") }
}

onMounted(cargarDatos)
</script>

<style scoped>
.form-input-standard {
  width: 100%; background-color: white; border: 1px solid #e2e8f0; border-radius: 1rem;
  padding: 0.75rem 1rem; font-size: 0.875rem; color: #334155; outline: none; transition: all 0.2s;
}
.form-input-standard:focus { border-color: #4f46e5; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }
.animate-fade-in { animation: fadeIn 0.5s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
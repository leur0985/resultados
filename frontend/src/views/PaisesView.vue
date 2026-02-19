<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const paises = ref([])
const confederacionesList = ref([]) // Para llenar el select
const formulario = ref({ id: null, codigo: '', nombre: '', continente: '', bandera: '', confederacion_id: null })
const editando = ref(false)

const getLogoUrl = (nombreArchivo) => {
  if (!nombreArchivo) return '';
  return new URL(`../assets/banderas/${nombreArchivo}`, import.meta.url).href;
};

const resetearFormulario = () => {
  formulario.value = { id: null, codigo: '', nombre: '', continente: '', bandera: '', confederacion_id: null }
  editando.value = false
}

const cargarDatos = async () => {
  try {
    // Usamos esta forma para disparar ambas al mismo tiempo
    const [resPaises, resConf] = await Promise.all([
      axios.get('http://localhost:3000/api/paises'),
      axios.get('http://localhost:3000/api/confederaciones')
    ]);
    paises.value = resPaises.data;
    confederacionesList.value = resConf.data;
  } catch (error) {
    console.error("Error detallado:", error);
    // Si sale Network Error aquí tras configurar CORS, el servidor está caído
  }
}

const guardar = async () => {
  try {
    // PREPARACIÓN DEL PAYLOAD (Limpieza de datos)
    const payload = {
      codigo: formulario.value.codigo,
      nombre: formulario.value.nombre,
      continente: formulario.value.continente,
      bandera: formulario.value.bandera,
      confederacion_id: Number(formulario.value.confederacion_id)
    }

    if (editando.value) {
      // BACKTICKS CORREGIDOS
      await axios.put(`http://localhost:3000/api/paises/${formulario.value.id}`, payload)
    } else {
      await axios.post('http://localhost:3000/api/paises', payload)
    }
    resetearFormulario()
    await cargarDatos()
  } catch (error) {
    console.error("Error al guardar:", error.response?.data);
    alert("Error: " + (error.response?.data?.detalle || "Revisa los campos"));
  }
}

const eliminar = async (id) => {
  if (confirm("¿Eliminar este país?")) {
    try {
      await axios.delete(`http://localhost:3000/api/paises/${id}`)
      await cargarDatos()
    } catch (error) {
      console.error(error);
    }
  }
}

const prepararEdicion = (p) => {
  formulario.value = { ...p };
  editando.value = true;
}

onMounted(cargarDatos)
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
    <div class="mx-auto space-y-10">
      
      <header class="flex flex-col md:flex-row items-end justify-between border-l-8 border-indigo-600 pl-6 py-2 bg-white p-6 rounded-r-2xl shadow-sm">
        <div>
          <h1 class="text-5xl font-black text-slate-800 tracking-tighter uppercase leading-none">
            Global <span class="text-indigo-600">Nations</span>
          </h1>
          <p class="text-slate-400 font-mono tracking-[0.2em] text-[10px] mt-2 uppercase">Database // Management</p>
        </div>
        <button @click="resetearFormulario" class="px-8 py-3 bg-slate-900 text-white font-black uppercase text-xs rounded-lg hover:bg-indigo-600 transition-all">
          + New Nation
        </button>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside class="lg:col-span-4">
          <div class="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 sticky top-8">
            <div class="space-y-6">
              <div class="grid grid-cols-3 gap-4">
                <div class="col-span-1">
                  <label class="text-[10px] font-black text-slate-400 uppercase">ISO</label>
                  <input v-model="formulario.codigo" class="w-full bg-slate-50 border-2 border-transparent p-3 rounded-xl focus:border-indigo-600 outline-none transition-all font-bold">
                </div>
                <div class="col-span-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase">Nombre</label>
                  <input v-model="formulario.nombre" class="w-full bg-slate-50 border-2 border-transparent p-3 rounded-xl focus:border-indigo-600 outline-none transition-all">
                </div>
              </div>

              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase">Continente</label>
                <input v-model="formulario.continente" class="w-full bg-slate-50 border-2 border-transparent p-3 rounded-xl focus:border-indigo-600 outline-none transition-all">
              </div>

              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase">Confederación</label>
                <select v-model="formulario.confederacion_id" class="w-full bg-slate-50 border-2 border-transparent p-3 rounded-xl focus:border-indigo-600 outline-none transition-all">
                  <option :value="null">Seleccionar...</option>
                  <option v-for="c in confederacionesList" :key="c.id" :value="c.id">{{ c.abreviatura }} - {{ c.nombre }}</option>
                </select>
              </div>

              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase">Bandera (archivo)</label>
                <input v-model="formulario.bandera" class="w-full bg-slate-50 border-2 border-transparent p-3 rounded-xl focus:border-indigo-600 outline-none transition-all">
              </div>

              <button @click="guardar" :class="editando ? 'bg-amber-500' : 'bg-indigo-600'" class="w-full py-4 text-white text-xs font-black uppercase rounded-xl shadow-lg active:scale-95 transition-all">
                {{ editando ? 'Update' : 'Commit Data' }}
              </button>
            </div>
          </div>
        </aside>

        <div class="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="p in paises" :key="p.id" class="group relative bg-white border border-slate-100 p-6 rounded-3xl hover:shadow-2xl transition-all overflow-hidden">
            <div class="absolute top-0 right-0 bg-slate-900 text-white px-6 py-1 font-black italic text-sm skew-x-[-15deg] -translate-y-1 translate-x-2">
              {{ p.confederaciones?.abreviatura || 'N/A' }}
            </div>
            <div class="flex items-center gap-6">
              <div class="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center p-2 border group-hover:border-indigo-200 transition-all overflow-hidden">
                <img v-if="p.bandera" :src="getLogoUrl(p.bandera)" class="max-w-full max-h-full object-contain drop-shadow-sm">
              </div>
              <div>
                <h3 class="text-slate-800 font-black text-xl uppercase truncate">{{ p.nombre }}</h3>
                <p class="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{{ p.continente }}</p>
                <p class="text-[10px] font-mono text-slate-400">ISO: {{ p.codigo }}</p>
              </div>
            </div>
            <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-50 opacity-40 group-hover:opacity-100 transition-opacity">
              <button @click="prepararEdicion(p)" class="text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600">Edit</button>
              <button @click="eliminar(p.id)" class="text-[10px] font-black uppercase text-slate-400 hover:text-red-600">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
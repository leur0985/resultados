<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const estadios = ref([])
const paisesList = ref([])
const formulario = ref({ id: null, nombre: '', ciudad: '', capacidad: '', pais_id: null, foto: '' })
const editando = ref(false)

const getLogoUrl = (nombreArchivo) => {
  if (!nombreArchivo) return '';
  return new URL(`../assets/estadios/${nombreArchivo}`, import.meta.url).href;
};

const cargarDatos = async () => {
  try {
    const [resEst, resPais] = await Promise.all([
      axios.get('http://localhost:3000/api/estadios'),
      axios.get('http://localhost:3000/api/paises')
    ]);
    estadios.value = resEst.data;
    paisesList.value = resPais.data;
  } catch (error) {
    console.error("Error cargando estadios:", error);
  }
}

const guardar = async () => {
  try {
    const payload = { 
        
      ...formulario.value, 
      capacidad: Number(formulario.value.capacidad), 
      pais_id: Number(formulario.value.pais_id) 
    };
    if (editando.value) {
      await axios.put(`http://localhost:3000/api/estadios/${formulario.value.id}`, payload);
    } else {
      await axios.post('http://localhost:3000/api/estadios', payload);
    }
    resetearFormulario();
    await cargarDatos();
  } catch (error) {
    console.error(error.response?.data);
    alert("Error al guardar el estadio.");
  }
}

const resetearFormulario = () => {
  formulario.value = { id: null, nombre: '', ciudad: '', capacidad: '', pais_id: null, foto: '' };
  editando.value = false;
}

const prepararEdicion = (e) => {
  formulario.value = { ...e };
  editando.value = true;
}

const eliminar = async (id) => {
  if (confirm("¿Eliminar este estadio?")) {
    try {
      await axios.delete(`http://localhost:3000/api/estadios/${id}`);
      await cargarDatos();
    } catch (error) {
      console.error(error);
    }
  }
}

onMounted(cargarDatos);
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
    <div class="mx-auto space-y-10">
      
      <header class="flex flex-col md:flex-row items-end justify-between border-l-8 border-indigo-600 pl-6 py-2 bg-white p-6 rounded-r-2xl shadow-sm">
        <div>
          <h1 class="text-5xl font-black text-slate-800 tracking-tighter uppercase leading-none">
            Venues <span class="text-indigo-600">Hub</span>
          </h1>
          <p class="text-slate-400 font-mono tracking-[0.2em] text-[10px] mt-2 uppercase">Stadiums & Arenas Database</p>
        </div>
        <button @click="resetearFormulario" class="px-8 py-3 bg-slate-900 text-white font-black uppercase text-xs rounded-lg hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200">
          + New Stadium
        </button>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <aside class="lg:col-span-4">
          <div class="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 sticky top-8">
            <div class="flex items-center gap-2 mb-8 border-b border-slate-100 pb-4">
              <div class="w-3 h-3 bg-indigo-600 rounded-full"></div>
              <h2 class="text-xs font-black uppercase tracking-widest text-slate-800">Stadium Editor</h2>
            </div>

            <div class="space-y-6">
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Oficial</label>
                <input v-model="formulario.nombre" class="w-full bg-slate-50 border-2 border-transparent p-3 rounded-xl outline-none focus:border-indigo-600 focus:bg-white transition-all">
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ciudad</label>
                  <input v-model="formulario.ciudad" class="w-full bg-slate-50 border-2 border-transparent p-3 rounded-xl focus:border-indigo-600 focus:bg-white transition-all">
                </div>
                <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Aforo (Cap)</label>
                  <input v-model="formulario.capacidad" type="number" class="w-full bg-slate-50 border-2 border-transparent p-3 rounded-xl focus:border-indigo-600 focus:bg-white transition-all">
                </div>
              </div>

              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">País Sede</label>
                <select v-model="formulario.pais_id" class="w-full bg-slate-50 border-2 border-transparent p-3 rounded-xl focus:border-indigo-600 focus:bg-white transition-all text-slate-800">
                  <option :value="null">Selecciona un país...</option>
                  <option v-for="p in paisesList" :key="p.id" :value="p.id">{{ p.nombre }}</option>
                </select>
              </div>

              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">URL Imagen/Foto</label>
                <input v-model="formulario.foto" class="w-full bg-slate-50 border-2 border-transparent p-3 rounded-xl focus:border-indigo-600 focus:bg-white transition-all">
              </div>

              <button @click="guardar" 
                class="w-full py-4 text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg active:scale-95"
                :class="editando ? 'bg-amber-500 text-white shadow-amber-100' : 'bg-indigo-600 text-white shadow-indigo-100'">
                {{ editando ? 'Update Registry' : 'Commit Venue' }}
              </button>
            </div>
          </div>
        </aside>

        <div class="lg:col-span-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="est in estadios" :key="est.id" class="group relative bg-white border border-slate-100 p-6 rounded-3xl hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 overflow-hidden">
              
              <div class="absolute top-0 right-0 bg-slate-900 text-white px-6 py-1.5 font-black italic text-[10px] skew-x-[-15deg] -translate-y-1 translate-x-2 uppercase tracking-widest">
                {{ est.ciudad }}
              </div>

              <div class="flex flex-col gap-4">
                <div class="w-full h-40 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-50 group-hover:border-indigo-200 transition-colors duration-500">
                  <img v-if="est.imagen" :src="getLogoUrl(est.imagen)" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                  <div v-else class="text-slate-300 font-black text-[10px]">NO_PHOTO_ID</div>
                </div>

                <div class="min-w-0">
                  <h3 class="text-slate-800 font-black text-xl uppercase truncate group-hover:text-indigo-600 transition-colors">
                    {{ est.nombre }}
                  </h3>
                  <div class="flex justify-between items-center mt-3">
                    <span class="text-[10px] font-black text-indigo-500 uppercase tracking-tighter">
                      {{ est.paises?.nombre || 'N/A' }}
                    </span>
                    <span class="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                      Cap: {{ est.capacidad.toLocaleString() }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-50 opacity-40 group-hover:opacity-100 transition-opacity">
                <button @click="prepararEdicion(est)" class="text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-colors">Edit</button>
                <div class="w-1 h-1 bg-slate-200 rounded-full my-auto"></div>
                <button @click="eliminar(est.id)" class="text-[10px] font-black uppercase text-slate-400 hover:text-red-600 transition-colors">Delete</button>
              </div>
            </div>
          </div>

          <div v-if="estadios.length === 0" class="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <p class="text-slate-300 font-mono text-sm italic italic">NO_VENUES_FOUND // SYSTEM_IDLE</p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
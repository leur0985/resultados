<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const arbitros = ref([])
const paisesList = ref([])
const formulario = ref({ id: null, iniciales: '', nombre: '', fecha_nacimiento: '', foto: '', pais_id: null })
const editando = ref(false)

const getFotoUrl = (nombreArchivo) => {
  if (!nombreArchivo) return '';
  return new URL(`../assets/arbitros/${nombreArchivo}`, import.meta.url).href;
};

const cargarDatos = async () => {
  try {
    const [resArb, resPais] = await Promise.all([
      axios.get('http://localhost:3000/api/arbitros'),
      axios.get('http://localhost:3000/api/paises')
    ]);
    arbitros.value = resArb.data;
    paisesList.value = resPais.data;
  } catch (error) {
    console.error("Error cargando datos:", error);
  }
}

const guardar = async () => {
  try {
    const payload = { 
      ...formulario.value, 
      pais_id: Number(formulario.value.pais_id)
    };
    if (editando.value) {
      await axios.put(`http://localhost:3000/api/arbitros/${formulario.value.id}`, payload);
    } else {
      await axios.post('http://localhost:3000/api/arbitros', payload);
    }
    resetearFormulario();
    await cargarDatos();
  } catch (error) {
    alert("Error al guardar el árbitro.");
  }
}

const resetearFormulario = () => {
  formulario.value = { id: null, iniciales: '', nombre: '', fecha_nacimiento: '', foto: '', pais_id: null };
  editando.value = false;
}

const prepararEdicion = (a) => {
  formulario.value = { ...a, fecha_nacimiento: a.fecha_nacimiento ? a.fecha_nacimiento.split('T')[0] : '' };
  editando.value = true;
}

const eliminar = async (id) => {
  if (confirm("¿Eliminar este árbitro?")) {
    await axios.delete(`http://localhost:3000/api/arbitros/${id}`);
    await cargarDatos();
  }
}

onMounted(cargarDatos);
</script>

<template>
  <div class="w-full space-y-10">
    
    <header class="flex flex-col md:flex-row items-end justify-between border-l-8 border-indigo-600 pl-6 py-2 bg-white p-6 rounded-r-2xl shadow-sm">
      <div>
        <h1 class="text-5xl font-black text-slate-800 tracking-tighter uppercase leading-none">
          Referees <span class="text-indigo-600">Panel</span>
        </h1>
        <p class="text-slate-400 font-mono tracking-[0.2em] text-[10px] mt-2 uppercase font-bold text-xs">Official Match Officials Registry</p>
      </div>
      <button @click="resetearFormulario" class="px-8 py-3 bg-slate-900 text-white font-black uppercase text-xs rounded-lg hover:bg-indigo-600 transition-all shadow-xl active:scale-95">
        + New Referee
      </button>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      <aside class="lg:col-span-3">
        <div class="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 sticky top-8">
          <div class="space-y-5">
            <h2 class="text-xs font-black uppercase tracking-widest text-slate-800 border-b pb-2 italic">Official Editor</h2>
            
            <div class="grid grid-cols-3 gap-4">
              <div class="col-span-2">
                <label class="text-[10px] font-black text-slate-400 uppercase">Nombre Completo</label>
                <input v-model="formulario.nombre" class="w-full bg-slate-50 border-2 border-transparent p-3 rounded-xl focus:border-indigo-600 outline-none transition-all">
              </div>
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase">Siglas</label>
                <input v-model="formulario.iniciales" class="w-full bg-slate-50 border-2 border-transparent p-3 rounded-xl focus:border-indigo-600 outline-none transition-all font-bold uppercase text-center">
              </div>
            </div>

            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase">Nacimiento</label>
              <input v-model="formulario.fecha_nacimiento" type="date" class="w-full bg-slate-50 border-2 border-transparent p-3 rounded-xl focus:border-indigo-600 outline-none transition-all">
            </div>

            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase">Foto (archivo)</label>
              <input v-model="formulario.foto" class="w-full bg-slate-50 border-2 border-transparent p-3 rounded-xl focus:border-indigo-600 outline-none transition-all">
            </div>

            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase">País / Nacionalidad</label>
              <select v-model="formulario.pais_id" class="w-full bg-slate-50 border-2 border-transparent p-3 rounded-xl focus:border-indigo-600 outline-none transition-all">
                <option :value="null">Seleccionar...</option>
                <option v-for="p in paisesList" :key="p.id" :value="p.id">{{ p.nombre }}</option>
              </select>
            </div>

            <button @click="guardar" :class="editando ? 'bg-amber-500' : 'bg-indigo-600'" class="w-full py-4 text-white text-xs font-black uppercase rounded-xl transition-all shadow-lg active:scale-95">
              {{ editando ? 'Update Official' : 'Commit Referee' }}
            </button>
          </div>
          </div>
        </aside>

      <div class="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="arb in arbitros" :key="arb.id" class="group relative bg-white border border-slate-100 p-6 rounded-3xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
          
          <div class="absolute top-0 right-0 bg-slate-900 text-white px-5 py-1.5 font-black italic text-sm skew-x-[-15deg] translate-x-1">
            {{ arb.iniciales }}
          </div>

          <div class="flex items-center gap-6">
            <div class="w-28 h-28 bg-slate-50 rounded-full flex items-center justify-center border-4 border-white shadow-md group-hover:border-indigo-200 transition-all overflow-hidden shrink-0">
              <img v-if="arb.foto" 
                   :src="getFotoUrl(arb.foto)" 
                   class="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-125">
              <span v-else class="text-[10px] font-black text-slate-300">NO_IMG</span>
            </div>

            <div class="min-w-0">
              <h3 class="text-slate-800 font-black text-xl uppercase truncate group-hover:text-indigo-600 transition-colors">
                {{ arb.nombre }}
              </h3>
              <div class="mt-2 space-y-1">
                <p class="text-[10px] font-bold text-slate-400 uppercase">
                  Nacionalidad: <span class="text-indigo-500">{{ arb.paises?.nombre || 'N/A' }}</span>
                </p>
                <p class="text-[10px] font-bold text-slate-400 uppercase">
                  Nacimiento: <span class="text-slate-700">{{ arb.fecha_nacimiento ? new Date(arb.fecha_nacimiento).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : 'N/A'}}</span>
                </p>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-50 opacity-40 group-hover:opacity-100 transition-opacity">
            <button @click="prepararEdicion(arb)" class="text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-colors">Edit</button>
            <div class="w-1 h-1 bg-slate-200 rounded-full my-auto"></div>
            <button @click="eliminar(arb.id)" class="text-[10px] font-black uppercase text-slate-400 hover:text-red-600 transition-colors">Delete</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
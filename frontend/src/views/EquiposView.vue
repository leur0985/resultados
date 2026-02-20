<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const equipos = ref([])
const paisesList = ref([])
const estadiosList = ref([])

const formulario = ref({ 
  id: null, nombre: '', abreviacion: '', logo: '', tipo: 1, pais_id: null, estadio_id: null 
})
const editando = ref(false)

const getLogoUrl = (n) => n ? new URL(`../assets/equipos/${n}`, import.meta.url).href : '';

const cargarDatos = async () => {
  try {
    const [resEq, resPa, resEst] = await Promise.all([
      axios.get('http://localhost:3000/api/equipos'),
      axios.get('http://localhost:3000/api/paises'),
      axios.get('http://localhost:3000/api/estadios')
    ]);
    equipos.value = resEq.data;
    paisesList.value = resPa.data;
    estadiosList.value = resEst.data;
  } catch (error) { 
    console.error("Error al conectar con la API:", error); 
  }
}

const guardar = async () => {
  try {
    const { id, ...datosSinId } = formulario.value;
    const payload = { 
      ...datosSinId, 
      tipo: Number(formulario.value.tipo),
      pais_id: formulario.value.pais_id ? String(formulario.value.pais_id) : null,
      estadio_id: formulario.value.estadio_id ? String(formulario.value.estadio_id) : null
    };
    if (editando.value) await axios.put(`http://localhost:3000/api/equipos/${id}`, payload);
    else await axios.post('http://localhost:3000/api/equipos', payload);
    resetearFormulario();
    await cargarDatos();
  } catch (error) { alert("Error al guardar"); }
}

const resetearFormulario = () => {
  formulario.value = { id: null, nombre: '', abreviacion: '', logo: '', tipo: 1, pais_id: null, estadio_id: null };
  editando.value = false;
}

const prepararEdicion = (e) => {
  formulario.value = { ...e };
  editando.value = true;
}

const eliminar = async (id) => {
  if (confirm("¿Eliminar?")) {
    await axios.delete(`http://localhost:3000/api/equipos/${id}`);
    await cargarDatos();
  }
}

onMounted(cargarDatos);
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
    <div class="max-w-[95%] mx-auto space-y-10">
      
      <header class="flex flex-col md:flex-row items-end justify-between border-l-8 border-indigo-600 pl-6 py-2 bg-white p-6 rounded-r-2xl shadow-sm">
        <div>
          <h1 class="text-5xl font-black text-slate-800 uppercase tracking-tighter">Clubs <span class="text-indigo-600">& Teams</span></h1>
        </div>
        <button @click="resetearFormulario" class="px-8 py-3 bg-slate-900 text-white font-black uppercase text-xs rounded-lg"> + New Entry </button>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside class="lg:col-span-3">
          <div class="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 sticky top-8">
            <h2 class="text-xs font-black uppercase text-slate-400 border-b pb-2 mb-4 italic">Team Editor</h2>
            <form @submit.prevent="guardar" class="space-y-4">
              <div class="grid grid-cols-3 gap-3">
                <div class="col-span-2">
                  <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nombre</label>
                  <input v-model="formulario.nombre" class="w-full bg-slate-50 border-none p-3 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500">
                </div>
                <div>
                  <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Siglas</label>
                  <input v-model="formulario.abreviacion" class="w-full bg-slate-50 border-none p-3 rounded-xl font-black uppercase text-center focus:ring-2 focus:ring-indigo-500">
                </div>
              </div>
              <div>
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Logo (Archivo)</label>
                <input v-model="formulario.logo" class="w-full bg-slate-50 border-none p-3 rounded-xl focus:ring-2 focus:ring-indigo-500">
              </div>
              <div>
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">País</label>
                <select v-model="formulario.pais_id" class="w-full bg-slate-50 border-none p-3 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500">
                  <option v-for="p in paisesList" :key="p.id" :value="p.id">{{ p.nombre }}</option>
                </select>
              </div>
              <div>
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Estadio</label>
                <select v-model="formulario.estadio_id" class="w-full bg-slate-50 border-none p-3 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500">
                  <option v-for="e in estadiosList" :key="e.id" :value="e.id">{{ e.nombre }}</option>
                </select>
              </div>
              <button type="submit" :class="editando ? 'bg-amber-500' : 'bg-indigo-600'" class="w-full py-4 text-white text-xs font-black uppercase rounded-xl shadow-lg border-none active:scale-95 transition-all">
                {{ editando ? 'Update' : 'Commit Team' }}
              </button>
            </form>
          </div>
        </aside>

        <div class="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="eq in equipos" :key="eq.id" class="group bg-white p-6 rounded-3xl border border-slate-100 hover:shadow-2xl transition-all relative">
            
            <div class="absolute top-0 right-0 flex">
              <div :class="eq.tipo === 2 ? 'bg-rose-600' : 'bg-indigo-600'" class="text-white px-3 py-1 font-black text-[9px] uppercase tracking-tighter">
                {{ eq.tipo === 2 ? 'National' : 'Club' }}
              </div>
              <div class="bg-slate-900 text-white px-4 py-1 font-black italic text-sm skew-x-[-15deg] translate-x-1">
                {{ eq.abreviacion }}
              </div>
            </div>

            <div class="flex items-center gap-6">
              <router-link :to="{ name: 'equipo-perfil', params: { id: eq.id } }" class="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center p-2 group-hover:bg-indigo-50 transition-all overflow-hidden">
                <img :src="getLogoUrl(eq.logo)" class="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500">
              </router-link>

              <div class="flex-1">
                <router-link :to="{ name: 'equipo-perfil', params: { id: eq.id } }" class="text-slate-800 font-black text-xl uppercase truncate hover:text-indigo-600 block transition-colors">
                  {{ eq.nombre }}
                </router-link>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">🏟️ {{ eq.estadios?.nombre || 'Stadium TBD' }}</p>
              </div>
            </div>

            <div class="flex justify-end gap-3 mt-4 opacity-40 group-hover:opacity-100 transition-opacity">
              <button @click.stop="prepararEdicion(eq)" class="text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 border-none">Edit</button>
              <button @click.stop="eliminar(eq.id)" class="text-[10px] font-black uppercase text-slate-400 hover:text-red-600 border-none">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
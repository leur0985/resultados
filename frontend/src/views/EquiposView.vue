<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const equipos = ref([])
const paisesList = ref([])
const estadiosList = ref([])

// Ajustamos el formulario con los nombres de campos de tu controlador: nombre, abreviacion, logo, tipo
const formulario = ref({ 
  id: null, 
  nombre: '', 
  abreviacion: '', 
  logo: '', 
  tipo: 1, // Por defecto Club
  pais_id: null, 
  estadio_id: null 
})
const editando = ref(false)

const getLogoUrl = (nombreArchivo) => {
  if (!nombreArchivo) return '';
  // Usamos 'escudos' o la carpeta donde guardes los logos de equipos
  return new URL(`../assets/equipos/${nombreArchivo}`, import.meta.url).href;
};

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
    console.error("Error cargando datos:", error);
  }
}

const guardar = async () => {
  // Debug inicial para ver qué modo estamos usando
  console.log("Modo editando:", editando.value);
  console.log("Datos del formulario:", formulario.value);

  try {
    // 1. Limpiamos el payload
    // IMPORTANTE: Eliminamos el 'id' del cuerpo del JSON porque el ID va en la URL
    const { id, ...datosSinId } = formulario.value;

    const payload = { 
      ...datosSinId, 
      tipo: Number(formulario.value.tipo),
      pais_id: formulario.value.pais_id ? BigInt(formulario.value.pais_id).toString() : null,
      estadio_id: formulario.value.estadio_id ? BigInt(formulario.value.estadio_id).toString() : null
    };

    if (editando.value) {
      if (!id) {
        console.error("Error: Intentando editar pero el ID es nulo");
        return;
      }
      
      console.log(`Enviando PUT a: http://localhost:3000/api/equipos/${id}`);
      await axios.put(`http://localhost:3000/api/equipos/${id}`, payload);
    } else {
      console.log("Enviando POST a equipos");
      await axios.post('http://localhost:3000/api/equipos', payload);
    }

    alert("¡Guardado con éxito! ⚽");
    resetearFormulario();
    await cargarDatos();
  } catch (error) {
    console.error("Error completo de Axios:", error);
    console.error("Respuesta del servidor:", error.response?.data);
    alert("Error al guardar: " + (error.response?.data?.error || "Error desconocido"));
  }
}

const resetearFormulario = () => {
  formulario.value = { id: null, nombre: '', abreviacion: '', logo: '', tipo: 1, pais_id: null, estadio_id: null };
  editando.value = false;
}

const prepararEdicion = (e) => {
  // Aseguramos que los IDs y el tipo se carguen correctamente para los selects
  formulario.value = { ...e };
  editando.value = true;
}

const eliminar = async (id) => {
  if (confirm("¿Eliminar este equipo?")) {
    try {
      await axios.delete(`http://localhost:3000/api/equipos/${id}`);
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
    <div class="max-w-[95%] mx-auto space-y-10">
      
      <header class="flex flex-col md:flex-row items-end justify-between border-l-8 border-indigo-600 pl-6 py-2 bg-white p-6 rounded-r-2xl shadow-sm">
        <div>
          <h1 class="text-5xl font-black text-slate-800 tracking-tighter uppercase leading-none">
            Clubs <span class="text-indigo-600">& Teams</span>
          </h1>
          <p class="text-slate-400 font-mono tracking-[0.2em] text-[10px] mt-2 uppercase">Official Squad Registry</p>
        </div>
        <button @click="resetearFormulario" class="px-8 py-3 bg-slate-900 text-white font-black uppercase text-xs rounded-lg hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200">
          + New Entry
        </button>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <aside class="lg:col-span-3">
          <div class="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 sticky top-8">
            <div class="space-y-5">
              <h2 class="text-xs font-black uppercase tracking-widest text-slate-800 border-b pb-2">Team Editor</h2>
              
              <div class="grid grid-cols-3 gap-4">
                <div class="col-span-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase">Nombre</label>
                  <input v-model="formulario.nombre" class="w-full bg-slate-50 border-2 border-transparent p-3 rounded-xl focus:border-indigo-600 outline-none transition-all">
                </div>
                <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase">Siglas</label>
                  <input v-model="formulario.abreviacion" class="w-full bg-slate-50 border-2 border-transparent p-3 rounded-xl focus:border-indigo-600 outline-none transition-all font-bold uppercase">
                </div>
              </div>

              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase">Tipo de Equipo</label>
                <div class="flex gap-4 mt-1">
                  <label class="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" v-model="formulario.tipo" value="1" class="accent-indigo-600">
                    <span class="text-xs font-bold uppercase text-slate-600 group-hover:text-indigo-600">Club</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" v-model="formulario.tipo" value="2" class="accent-indigo-600">
                    <span class="text-xs font-bold uppercase text-slate-600 group-hover:text-indigo-600">Selección</span>
                  </label>
                </div>
              </div>

              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase">Logo (archivo)</label>
                <input v-model="formulario.logo" class="w-full bg-slate-50 border-2 border-transparent p-3 rounded-xl focus:border-indigo-600 outline-none transition-all">
              </div>

              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase">País</label>
                <select v-model="formulario.pais_id" class="w-full bg-slate-50 border-2 border-transparent p-3 rounded-xl focus:border-indigo-600 outline-none transition-all">
                  <option :value="null">Seleccionar...</option>
                  <option v-for="p in paisesList" :key="p.id" :value="p.id">{{ p.nombre }}</option>
                </select>
              </div>

              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase">Estadio Local</label>
                <select v-model="formulario.estadio_id" class="w-full bg-slate-50 border-2 border-transparent p-3 rounded-xl focus:border-indigo-600 outline-none transition-all">
                  <option :value="null">Seleccionar...</option>
                  <option v-for="e in estadiosList" :key="e.id" :value="e.id">{{ e.nombre }}</option>
                </select>
              </div>

              <button @click="guardar" :class="editando ? 'bg-amber-500' : 'bg-indigo-600'" class="w-full py-4 text-white text-xs font-black uppercase rounded-xl transition-all shadow-lg active:scale-95">
                {{ editando ? 'Update Entry' : 'Commit Team' }}
              </button>
            </div>
          </div>
        </aside>

        <div class="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="eq in equipos" :key="eq.id" class="group relative bg-white border border-slate-100 p-6 rounded-3xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
            
            <div class="absolute top-0 right-0 flex">
              <div :class="eq.tipo === 2 ? 'bg-rose-600' : 'bg-indigo-600'" class="text-white px-3 py-1 font-black text-[9px] uppercase tracking-tighter">
                {{ eq.tipo === 2 ? 'National' : 'Club' }}
              </div>
              <div class="bg-slate-900 text-white px-4 py-1 font-black italic text-sm skew-x-[-15deg] translate-x-1">
                {{ eq.abreviacion }}
              </div>
            </div>

            <div class="flex items-center gap-6">
              <div class="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center p-2  group-hover:border-indigo-200 transition-all duration-500 overflow-hidden">
                <img v-if="eq.logo" 
                     :src="getLogoUrl(eq.logo)" 
                     class="max-w-full max-h-full object-contain drop-shadow-sm transition-transform duration-500 ease-in-out group-hover:scale-110">
                <span v-else class="text-[10px] font-black text-slate-300">NO_LOGO</span>
              </div>

              <div class="min-w-0">
                <h3 class="text-slate-800 font-black text-xl uppercase truncate group-hover:text-indigo-600 transition-colors">
                  {{ eq.nombre }}
                </h3>
                <div class="mt-2 space-y-1">
                  <p class="text-[10px] font-bold text-slate-400 uppercase">
                    Stadium: <span class="text-slate-700">{{ eq.estadios?.nombre || 'N/A' }}</span>
                  </p>
                  <p class="text-[10px] font-bold text-slate-400 uppercase">
                    Conf: <span class="text-indigo-500">{{ eq.paises?.confederaciones?.abreviatura || 'N/A' }}</span>
                  </p>
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-50 opacity-40 group-hover:opacity-100 transition-opacity">
              <button @click="prepararEdicion(eq)" class="text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-colors">Edit</button>
              <button @click="eliminar(eq.id)" class="text-[10px] font-black uppercase text-slate-400 hover:text-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
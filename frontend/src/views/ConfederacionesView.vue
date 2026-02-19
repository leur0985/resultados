<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const confederaciones = ref([])
const formulario = ref({ id: null, nombre: '', abreviatura: '', logo: '', fundacion: '' })
const editando = ref(false)
// Función para obtener la ruta dinámica de la imagen en assets
const getLogoUrl = (nombreArchivo) => {
  if (!nombreArchivo) return '';
  // Esto busca el archivo dentro de src/assets/
  return new URL(`../assets/${nombreArchivo}`, import.meta.url).href;
};

const resetearFormulario = () => {
  formulario.value = { id: null, nombre: '', abreviatura: '', logo: '', fundacion: '' }
  editando.value = false
}

const cargarDatos = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/confederaciones');
    confederaciones.value = res.data;
    console.log("Datos en confederaciones.value:", confederaciones.value);
  } catch (error) {
    console.error("Error al conectar con la API:", error.message);
  }
}

const guardar = async () => {
  try {
    if (editando.value) {
      await axios.put(`http://localhost:3000/api/confederaciones/${formulario.value.id}`, formulario.value)
    } else {
      await axios.post('http://localhost:3000/api/confederaciones', formulario.value)
    }
    resetearFormulario()
    await cargarDatos()
  } catch (error) {
    console.error("Error al guardar:", error);
    alert("No se pudo guardar la información.");
  }
}

const eliminar = async (id) => {
  if (confirm("¿Estás seguro de eliminar esta confederación?")) {
    try {
      await axios.delete(`http://localhost:3000/api/confederaciones/${id}`)
      await cargarDatos()
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  }
}

const prepararEdicion = (c) => {
  formulario.value = { ...c }
  editando.value = true
}

onMounted(cargarDatos)
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500/30 p-4 md:p-8">
    
    <div class="max-w-7xl mx-auto space-y-10">
      
      <header class="flex flex-col md:flex-row items-end justify-between border-l-8 border-indigo-600 pl-6 py-2 bg-white p-6 rounded-r-2xl shadow-sm">
        <div>
          <h1 class="text-5xl font-black text-slate-800 tracking-tighter uppercase leading-none">
            Confed <span class="text-indigo-600">HUB</span>
          </h1>
          <p class="text-slate-400 font-mono tracking-[0.2em] text-[10px] mt-2 uppercase">Management System // Database 2026</p>
        </div>
        <button @click="resetearFormulario" class="group relative px-8 py-3 bg-slate-900 text-white font-black uppercase text-xs tracking-widest transition-all overflow-hidden rounded-lg shadow-xl shadow-slate-200">
          <div class="absolute inset-0 w-0 bg-indigo-600 transition-all duration-300 group-hover:w-full"></div>
          <span class="relative">+ New Entity</span>
        </button>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <aside class="lg:col-span-4">
          <div class="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 sticky top-8">
            <div class="flex items-center gap-2 mb-8 border-b border-slate-100 pb-4">
              <div class="w-3 h-3 bg-indigo-600 rounded-full"></div>
              <h2 class="text-xs font-black uppercase tracking-widest text-slate-800">Control Panel</h2>
            </div>

            <div class="space-y-6">
              <div class="group">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-indigo-600 transition-colors">Nombre Institucional</label>
                <input v-model="formulario.nombre" class="w-full bg-slate-50 border-2 border-transparent p-3 rounded-xl outline-none focus:border-indigo-600 focus:bg-white transition-all text-slate-800 placeholder:text-slate-300" placeholder="Ej. UEFA Champions...">
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="group">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Siglas</label>
                  <input v-model="formulario.abreviatura" class="w-full bg-slate-50 border-2 border-transparent p-3 rounded-xl outline-none focus:border-indigo-600 focus:bg-white transition-all text-slate-800 font-bold uppercase" placeholder="UEFA">
                </div>
                <div class="group">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Año Est.</label>
                  <input v-model="formulario.fundacion" class="w-full bg-slate-50 border-2 border-transparent p-3 rounded-xl outline-none focus:border-indigo-600 focus:bg-white transition-all text-slate-800" placeholder="1954">
                </div>
              </div>

              <div class="group">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Filename</label>
                <input v-model="formulario.logo" class="w-full bg-slate-50 border-2 border-transparent p-3 rounded-xl outline-none focus:border-indigo-600 focus:bg-white transition-all text-slate-800" placeholder="logo_file.png">
              </div>

              <button @click="guardar" 
                class="w-full py-4 text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg active:scale-95"
                :class="editando ? 'bg-amber-500 text-white shadow-amber-100' : 'bg-indigo-600 text-white shadow-indigo-100'">
                {{ editando ? 'Update Registry' : 'Commit Data' }}
              </button>
            </div>
          </div>
        </aside>

        <div class="lg:col-span-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="c in confederaciones" :key="c.id" 
                 class="group relative bg-white border border-slate-100 p-6 rounded-3xl hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 overflow-hidden">
              
              <div class="absolute top-0 right-0 bg-slate-900 text-white px-6 py-1.5 font-black italic text-sm skew-x-[-15deg] -translate-y-1 translate-x-2">
                {{ c.abreviatura }}
              </div>

              <div class="flex items-center gap-6">
                <div class="relative shrink-0">
                  <div class="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center p-3 border border-slate-100 group-hover:bg-white group-hover:border-indigo-200 transition-all duration-500">
                    <img v-if="c.logo" :src="getLogoUrl(c.logo)" class="max-w-full max-h-full object-contain drop-shadow-sm">
                    <span v-else class="text-[10px] font-black text-slate-300 uppercase">No Logo</span>
                  </div>
                </div>

                <div class="min-w-0">
                  <h3 class="text-slate-800 font-black text-xl uppercase leading-tight truncate group-hover:text-indigo-600 transition-colors">
                    {{ c.nombre }}
                  </h3>
                  <div class="flex items-center gap-2 mt-2">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Est.</span>
                    <span class="text-[10px] font-black text-indigo-500">{{ c.fundacion || 'N/A' }}</span>
                  </div>
                </div>
              </div>

              <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-50 opacity-40 group-hover:opacity-100 transition-opacity">
                <button @click="prepararEdicion(c)" class="text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-colors">Edit</button>
                <div class="w-1 h-1 bg-slate-200 rounded-full my-auto"></div>
                <button @click="eliminar(c.id)" class="text-[10px] font-black uppercase text-slate-400 hover:text-red-600 transition-colors">Delete</button>
              </div>
            </div>
          </div>

          <div v-if="confederaciones.length === 0" class="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <p class="text-slate-300 font-mono text-sm italic">SYSTEM_IDLE // NO_RECORDS_AVAILABLE</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
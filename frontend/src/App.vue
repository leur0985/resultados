<script setup>
import Navbar from './components/Navbar.vue'
</script>

<template>
  <div class="min-h-screen bg-slate-100 text-slate-900 font-sans">
    
    <Navbar />

    <main class="w-[90%] mx-auto py-10">
      <router-view />
    </main>

  </div>
</template>
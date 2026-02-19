<template>
  <div class="flex items-center justify-center h-screen bg-slate-50">
    
    <div class="p-4">
      <img 
        src="../assets/liga_mx.png" 
        alt="Liga MX Logo" 
        class="w-80 md:w-[500px] h-auto object-contain drop-shadow-2xl animate-fade-in"
      />
    </div>

  </div>
</template>

<style scoped>
/* Un pequeño efecto de entrada opcional */
.animate-fade-in {
  animation: fadeIn 1s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
</style>
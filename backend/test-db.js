const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Conectando a la base de datos...");
  // Intentamos obtener el primer torneo de la lista
  const torneo = await prisma.torneos.findFirst();
  
  if (torneo) {
    console.log("✅ ¡Conexión exitosa!");
    console.log("Primer torneo encontrado:", torneo.nombre);
  } else {
    console.log("⚠️ Conexión establecida, pero la tabla de torneos parece estar vacía.");
  }
}

main()
  .catch((e) => {
    console.error("❌ Error de validación:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
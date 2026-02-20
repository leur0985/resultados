const express = require('express');
const cors = require('cors');

const app = express();

// 1. MIDDLEWARES (Configuración de seguridad y datos)
app.use(cors()); // Esto soluciona el bloqueo de CORS en el frontend
app.use(express.json());

// Arreglo para BigInt (Evita que la app truene con MariaDB/Prisma)
BigInt.prototype.toJSON = function() {
  return this.toString();
};

// 2. IMPORTACIÓN DE RUTAS (Solo archivos que SÍ existen)
const confederacionesRoutes = require('./routes/confederaciones');
const paisesRoutes = require('./routes/paises');
const equiposRoutes = require('./routes/equipos');
const estadiosRoutes = require('./routes/estadios');
const arbitrosRoutes = require('./routes/arbitros');
const torneosRoutes = require('./routes/torneos');
const partidosRoutes = require('./routes/partidos');
const tecnicosRoutes = require('./routes/tecnicos');

// 3. RUTA DE PRUEBA
app.get('/', (req, res) => {
  res.json({ mensaje: "¡Servidor en línea y funcionando! ⚽" });
});


console.log('Confederaciones:', typeof confederacionesRoutes);
console.log('Paises:', typeof paisesRoutes);
console.log('Equipos:', typeof equiposRoutes); // Si alguno dice 'object', ese es el que está mal
console.log('Estadios:', typeof estadiosRoutes);
console.log('Arbitros:', typeof arbitrosRoutes);
console.log('Torneos:', typeof torneosRoutes);
console.log('Partidos:', typeof partidosRoutes);
// 4. DEFINICIÓN DE ENDPOINTS
app.use('/api/confederaciones', confederacionesRoutes);
app.use('/api/paises', paisesRoutes);
app.use('/api/estadios', estadiosRoutes);
app.use('/api/equipos', equiposRoutes);
app.use('/api/arbitros', arbitrosRoutes);
app.use('/api/torneos', torneosRoutes);
app.use('/api/partidos', partidosRoutes);
app.use('/api/tecnicos', tecnicosRoutes);


// 5. ESCUCHA DEL SERVIDOR
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  --------------------------------------------------
  🚀 SERVIDOR CORRIENDO EN: http://localhost:${PORT}
  📡 API BASE: http://localhost:${PORT}/api
  --------------------------------------------------
  `);
});
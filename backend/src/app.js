const express = require('express');
const cors = require('cors');

const app = express();
const confederacionesRoutes = require('./routes/confederaciones');
const paisesRoutes = require('./routes/paises');
const equiposRoutes = require('./routes/equipos');
const estadiosRoutes = require('./routes/estadios');
const arbitrosRoutes = require('./routes/arbitros');
const torneosRoutes = require('./routes/torneos');
const tecnicosRoutes = require('./routes/tecnicos');
const partidosRoutes = require('./routes/partidos');
const { equipos } = require('./config/db');


// Middlewares básicos
app.use(cors());
app.use(express.json());

// Arreglo para BigInt (fundamental para que no explote con MariaDB)
BigInt.prototype.toJSON = function() {
  return this.toString();
};

// Ruta de prueba inicial
app.get('/', (req, res) => {
  res.json({ mensaje: "¡Servidor arrancado con éxito! ⚽" });
});

app.use('/api/confederaciones', confederacionesRoutes);
app.use('/api/paises', paisesRoutes);
app.use('/api/estadios', estadiosRoutes);
app.use('/api/equipos', equiposRoutes);
app.use('/api/arbitros', arbitrosRoutes);
app.use('/api/torneos', torneosRoutes);
app.use('/api/partidos', partidosRoutes);


const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

// Le decimos que todas las rutas dentro de ese archivo empiecen con /api/confederaciones

const prisma = require('../config/db'); // Importamos nuestra conexión única

const TecnicosController = {
    // Función para obtener todas las confederaciones
    async getAll(req, res) {
        try {
            // Consultamos la base de datos
            const tecnicos = await prisma.tecnicos.findMany({
                include: {
                    paises: true // Traemos también los países hijos (Jerarquía)
                }
            });

            // Si todo sale bien, enviamos los datos al cliente
            res.json(tecnicos);
        } catch (error) {
            // Si hay un error, lo registramos y avisamos al cliente
            console.error("Error en ConfederacionesController:", error);
            res.status(500).json({ error: "No se pudieron obtener las confederaciones" });
        }
    }
};

module.exports = TecnicosController;
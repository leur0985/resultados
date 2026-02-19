const prisma = require('../config/db'); 

const ConfederacionesController = {
    // 1. Obtener todas
    async getAll(req, res) {
        try {
            const confederaciones = await prisma.confederaciones.findMany({
                orderBy: { nombre: 'asc' }
            });
            res.json(confederaciones);
        } catch (error) {
            console.error("Error en getAll:", error);
            res.status(500).json({ error: "No se pudieron obtener" });
        }
    },

    // 2. Crear
    async create(req, res) {
        try {
            // ERROR CORREGIDO: Debes incluir 'fundacion' en la extracción
            const { nombre, abreviatura, logo, fundacion } = req.body; 
            const nueva = await prisma.confederaciones.create({
                data: { 
                    nombre: nombre, 
                    abreviatura: abreviatura, 
                    logo: logo, 
                    // Aseguramos que sea número para la DB
                    fundacion: fundacion ? parseInt(fundacion) : null
                }
            });
            res.status(201).json(nueva);
        } catch (error) {
            console.error("Error en create:", error);
            res.status(500).json({ error: "No se pudo crear" });
        }
    },

    // 3. Editar (Actualizar)
    async update(req, res) {
        try {
            const { id } = req.params;
            // ERROR CORREGIDO: Debes incluir 'fundacion' aquí también
            const { nombre, abreviatura, logo, fundacion } = req.body;

            const actualizado = await prisma.confederaciones.update({
                where: { id: Number(id) },
                data: { 
                    nombre: nombre, 
                    abreviatura: abreviatura, 
                    logo: logo,
                    // Conversión segura
                    fundacion: fundacion ? parseInt(fundacion) : null
                }
            });
            res.json(actualizado);
        } catch (error) {
            // Tip: Imprime el error real en la terminal para debuguear mejor
            console.error("Error en update:", error);
            res.status(500).json({ error: "No se pudo actualizar", detalle: error.message });
        }
    },

    // 4. Eliminar
    async destroy(req, res) {
        try {
            const { id } = req.params;
            await prisma.confederaciones.delete({
                where: { id: Number(id) }
            });
            res.json({ message: "Eliminado con éxito" });
        } catch (error) {
            console.error("Error en destroy:", error);
            res.status(500).json({ error: "No se pudo eliminar" });
        }
    }
};

module.exports = ConfederacionesController;
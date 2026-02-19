const prisma = require('../config/db');

const PaisesController = {
    // Obtener todos los países con su confederación
    async getAll(req, res) {
        try {
            const paises = await prisma.paises.findMany({
                include: { 
                    // IMPORTANTE: Asegúrate que en tu schema.prisma 
                    // la relación se llame 'confederaciones'
                    confederaciones: true 
                },
                orderBy: { id: 'asc' }
            });
            res.json(paises);
        } catch (error) {
            console.error("Error en getAll:", error);
            res.status(500).json({ error: "No se pudieron obtener los países" });
        }
    },

    // Crear un país
    async create(req, res) {
        try {
            const { codigo, nombre, continente, bandera, confederacion_id } = req.body;
            
            const nuevo = await prisma.paises.create({
                data: {
                    codigo,
                    nombre,
                    continente,
                    bandera,
                    // Usamos el ID directamente si tu schema lo permite como 'confederacion_id'
                    // Si falla, usa la forma de 'connect'
                    confederacion_id: Number(confederacion_id)
                }
            });
            res.status(201).json(nuevo);
        } catch (error) {
            console.error("Error detallado en create:", error);
            res.status(500).json({ error: "Error al crear", detalle: error.message });
        }
    },

    // Actualizar un país
    async update(req, res) {
        try {
            const { id } = req.params;
            const { codigo, nombre, continente, bandera, confederacion_id } = req.body;

            const actualizado = await prisma.paises.update({
                where: { id: Number(id) },
                data: {
                    codigo,
                    nombre,
                    continente,
                    bandera,
                    confederacion_id: Number(confederacion_id)
                }
            });
            res.json(actualizado);
        } catch (error) {
            console.error("Error detallado en update:", error);
            res.status(500).json({ error: "Error al actualizar", detalle: error.message });
        }
    },

    // Eliminar un país
    async destroy(req, res) {
        try {
            const { id } = req.params;
            await prisma.paises.delete({
                where: { id: Number(id) }
            });
            res.json({ message: "País eliminado" });
        } catch (error) {
            console.error("Error en destroy:", error);
            res.status(500).json({ error: "No se pudo eliminar" });
        }
    }
};

module.exports = PaisesController;
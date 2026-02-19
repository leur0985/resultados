const prisma = require('../config/db');

const ArbitrosController = {
    async getAll(req, res) {
        try {
            const arbitros = await prisma.arbitros.findMany({
                include: { paises: true },
                orderBy: { id: 'asc' }
            });
            res.json(arbitros);
        } catch (error) {
            res.status(500).json({ error: "Error al obtener los árbitros" });
        }
    },

    async create(req, res) {
        try {
            const { iniciales, nombre, fecha_nacimiento, foto, pais_id } = req.body;
            const nuevo = await prisma.arbitros.create({
                data: {
                    iniciales,
                    nombre,
                    fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : null,
                    foto,
                    paises: { connect: { id: Number(pais_id) } }
                }
            });
            res.status(201).json(nuevo);
        } catch (error) {
            res.status(500).json({ error: "No se pudo crear el árbitro", detalle: error.message });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const { iniciales, nombre, fecha_nacimiento, foto, pais_id } = req.body;
            const actualizado = await prisma.arbitros.update({
                where: { id: Number(id) },
                data: {
                    iniciales,
                    nombre,
                    fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : null,
                    foto,
                    paises: { connect: { id: Number(pais_id) } }
                }
            });
            res.json(actualizado);
        } catch (error) {
            res.status(500).json({ error: "Error al actualizar", detalle: error.message });
        }
    },

    async destroy(req, res) {
        try {
            const { id } = req.params;
            await prisma.arbitros.delete({ where: { id: Number(id) } });
            res.json({ message: "Árbitro eliminado" });
        } catch (error) {
            res.status(500).json({ error: "No se pudo eliminar" });
        }
    }
};

module.exports = ArbitrosController;
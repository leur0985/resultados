const prisma = require('../config/db');

const EstadiosController = {
    async getAll(req, res) {
        try {
            const estadios = await prisma.estadios.findMany({
                include: { 
                    paises: true // Para mostrar en qué país está el estadio
                },
                orderBy: { id: 'asc' }
            });
            res.json(estadios);
        } catch (error) {
            res.status(500).json({ error: "Error al obtener estadios" });
        }
    },

    async create(req, res) {
        try {
            const { nombre, ciudad, capacidad, pais_id, foto } = req.body;
            const nuevo = await prisma.estadios.create({
                data: {
                    nombre,
                    ciudad,
                    capacidad: Number(capacidad),
                    foto,
                    paises: {
                        connect: { id: Number(pais_id) }
                    }
                }
            });
            res.status(201).json(nuevo);
        } catch (error) {
            res.status(500).json({ error: "No se pudo crear el estadio", detalle: error.message });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const { nombre, ciudad, capacidad, pais_id, foto } = req.body;
            const actualizado = await prisma.estadios.update({
                where: { id: Number(id) },
                data: {
                    nombre,
                    ciudad,
                    capacidad: Number(capacidad),
                    foto,
                    paises: {
                        connect: { id: Number(pais_id) }
                    }
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
            await prisma.estadios.delete({ where: { id: Number(id) } });
            res.json({ message: "Estadio eliminado" });
        } catch (error) {
            res.status(500).json({ error: "No se pudo eliminar" });
        }
    }
};

module.exports = EstadiosController;
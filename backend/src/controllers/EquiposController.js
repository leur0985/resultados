const prisma = require('../config/db');

const EquiposController = {
    // Listar todos los equipos
    async getAll(req, res) {
        try {
            const equipos = await prisma.equipos.findMany({
                include: {
                    paises: true,
                    estadios: true
                },
                orderBy: { id: 'asc' }
            });

            // Convertimos BigInt a String para evitar error de JSON
            const respuesta = JSON.parse(JSON.stringify(equipos, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            ));

            res.json(respuesta);
        } catch (error) {
            console.error("Error en getAll:", error.message);
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener un solo equipo por ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const equipo = await prisma.equipos.findUnique({
                where: { id: BigInt(id) },
                include: { paises: true, estadios: true }
            });

            if (!equipo) return res.status(404).json({ error: "Equipo no encontrado" });

            const respuesta = JSON.parse(JSON.stringify(equipo, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            ));

            res.json(respuesta);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Crear un nuevo equipo
    async create(req, res) {
        try {
            const { nombre, iniciales, logo, tipo, pais_id, estadio_id } = req.body;
            const nuevoEquipo = await prisma.equipos.create({
                data: {
                    nombre,
                    iniciales,
                    logo,
                    tipo: tipo ? Number(tipo) : 1,
                    pais_id: pais_id ? BigInt(pais_id) : null,
                    estadio_id: estadio_id ? BigInt(estadio_id) : null
                }
            });

            const respuesta = JSON.parse(JSON.stringify(nuevoEquipo, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            ));

            res.json(respuesta);
        } catch (error) {
            console.error("Error en create:", error.message);
            res.status(500).json({ error: error.message });
        }
    },

    // Actualizar equipo existente
    async update(req, res) {
        try {
            const { id } = req.params;
            const { nombre, iniciales, logo, tipo, pais_id, estadio_id } = req.body;

            const equipoActualizado = await prisma.equipos.update({
                where: { id: BigInt(id) },
                data: {
                    nombre,
                    iniciales,
                    logo,
                    tipo: tipo ? Number(tipo) : undefined,
                    pais_id: pais_id ? BigInt(pais_id) : null,
                    estadio_id: estadio_id ? BigInt(estadio_id) : null
                }
            });

            const respuesta = JSON.parse(JSON.stringify(equipoActualizado, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            ));

            res.json(respuesta);
        } catch (error) {
            console.error("Error en update:", error.message);
            res.status(500).json({ error: "Error al actualizar el equipo" });
        }
    },

    // Eliminar equipo
    async destroy(req, res) {
        try {
            const { id } = req.params;
            await prisma.equipos.delete({
                where: { id: BigInt(id) }
            });
            res.json({ message: "Equipo eliminado correctamente" });
        } catch (error) {
            console.error("Error en destroy:", error.message);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = EquiposController;
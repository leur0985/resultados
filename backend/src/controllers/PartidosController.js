const prisma = require('../config/db');

/**
 * Serializador para manejar BigInt.
 */
const serialize = (data) => JSON.parse(JSON.stringify(data, (key, value) => 
    typeof value === 'bigint' ? value.toString() : value
));

const PartidosController = {

    /**
     * HISTORIAL CARA A CARA (H2H)
     */
    async getH2H(req, res) {
        try {
            const { equipoA, equipoB, limite } = req.query;
            if (!equipoA || !equipoB) return res.status(400).json({ error: "Faltan equipos" });

            const idA = BigInt(equipoA);
            const idB = BigInt(equipoB);

            const partidosH2H = await prisma.partidos.findMany({
                where: {
                    OR: [
                        { AND: [{ equipo_local_id: idA }, { equipo_visitante_id: idB }] },
                        { AND: [{ equipo_local_id: idB }, { equipo_visitante_id: idA }] }
                    ]
                },
                take: Number(limite) || 10,
                include: {
                    equipos_partidos_equipo_local_idToequipos: true,
                    equipos_partidos_equipo_visitante_idToequipos: true,
                    estadios: true,
                    arbitros: true
                },
                orderBy: { fecha: 'desc' }
            });
            res.json(serialize(partidosH2H));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * EVOLUCIÓN COMPLETA (Mapa de posiciones para todos los equipos)
     */
    async getEvolucionCompleta(req, res) {
        try {
            const { torneo_id } = req.params;
            const partidos = await prisma.partidos.findMany({
                where: { torneo_id: BigInt(torneo_id) },
                orderBy: { jornada: 'asc' }
            });

            const partidosRegulares = partidos.filter(p => !isNaN(parseFloat(p.jornada)));
            const equipoIds = [...new Set(partidosRegulares.flatMap(p => [p.equipo_local_id.toString(), p.equipo_visitante_id.toString()]))];
            const jornadasUnicas = [...new Set(partidosRegulares.map(p => p.jornada))].sort((a, b) => Number(a) - Number(b));

            const evolucionCompleta = {};

            jornadasUnicas.forEach(jor => {
                const tablaJornada = equipoIds.map(id => {
                    let pts = 0, gf = 0, gc = 0;
                    const partidosHastaHoy = partidosRegulares.filter(p => Number(p.jornada) <= Number(jor));

                    partidosHastaHoy.forEach(p => {
                        const loc = p.equipo_local_id.toString();
                        const vis = p.equipo_visitante_id.toString();
                        if (loc === id) {
                            gf += p.goleslocal; gc += p.golesvisitante;
                            if (p.goleslocal > p.golesvisitante) pts += 3;
                            else if (p.goleslocal === p.golesvisitante) pts += 1;
                        } else if (vis === id) {
                            gf += p.golesvisitante; gc += p.goleslocal;
                            if (p.golesvisitante > p.goleslocal) pts += 3;
                            else if (p.golesvisitante === p.goleslocal) pts += 1;
                        }
                    });
                    return { id, pts, dg: gf - gc, gf };
                });

                tablaJornada.sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf);

                evolucionCompleta[jor] = {};
                tablaJornada.forEach((equipo, index) => {
                    evolucionCompleta[jor][equipo.id] = index + 1;
                });
            });

            res.json(serialize(evolucionCompleta));
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * OBTENER TODOS LOS PARTIDOS
     */
    async getAll(req, res) {
        try {
            const data = await prisma.partidos.findMany({
                include: {
                    equipos_partidos_equipo_local_idToequipos: true,
                    equipos_partidos_equipo_visitante_idToequipos: true,
                    estadios: true,
                    arbitros: true
                },
                orderBy: { fecha: 'desc' }
            });
            res.json(serialize(data));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * PARTIDOS POR TORNEO
     */
    async getByTorneo(req, res) {
        try {
            const { torneo_id } = req.params;
            const partidosList = await prisma.partidos.findMany({
                where: { torneo_id: BigInt(torneo_id) },
                include: {
                    equipos_partidos_equipo_local_idToequipos: true,
                    equipos_partidos_equipo_visitante_idToequipos: true,
                    estadios: { include: { paises: true } },
                    arbitros: true
                },
                orderBy: [{ jornada: 'asc' }, { num_partido: 'asc' }]
            });
            res.json(serialize(partidosList));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * CREAR PARTIDO (Incluye T.E. y Penales)
     */
    async create(req, res) {
        try {
            const d = req.body;
            const [local, visita, estadio] = await Promise.all([
                prisma.equipos.findUnique({ where: { id: BigInt(d.equipo_local_id) } }),
                prisma.equipos.findUnique({ where: { id: BigInt(d.equipo_visitante_id) } }),
                d.estadio_id ? prisma.estadios.findUnique({ where: { id: BigInt(d.estadio_id) } }) : null
            ]);

            const nuevo = await prisma.partidos.create({
                data: {
                    torneo_id: BigInt(d.torneo_id),
                    equipo_local_id: BigInt(d.equipo_local_id),
                    equipolocal: local.nombre,
                    equipo_visitante_id: BigInt(d.equipo_visitante_id),
                    equipovisitante: visita.nombre,
                    estadio_id: d.estadio_id ? BigInt(d.estadio_id) : null,
                    nombre_estadio: estadio?.nombre || '',
                    jornada: String(d.jornada),
                    num_partido: Number(d.num_partido),
                    fecha: new Date(`${d.fecha}T12:00:00.000Z`),
                    hora: new Date(`1970-01-01T${d.hora}:00.000Z`),
                    goleslocal: Number(d.goleslocal),
                    golesvisitante: Number(d.golesvisitante),
                    // Nuevos campos
                    tiempoextra: d.tiempoextra ? 1 : 0,
                    goleslocaltiempoextra: d.tiempoextra ? Number(d.goleslocaltiempoextra) : 0,
                    golesvisitantetiempoextra: d.tiempoextra ? Number(d.golesvisitantetiempoextra) : 0,
                    penales: d.penales ? 1 : 0,
                    goleslocalpenales: d.penales ? Number(d.goleslocalpenales) : 0,
                    golesvisitantepenales: d.penales ? Number(d.golesvisitantepenales) : 0,
                    
                    asistencia: d.asistencia ? Number(d.asistencia) : 0,
                    estuve: d.estuve ? 1 : 0,
                    arbitro_id: d.arbitro_id ? BigInt(d.arbitro_id) : null,
                    comentarios: d.comentarios || ''
                }
            });
            res.json(serialize(nuevo));
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    /**
     * ACTUALIZAR PARTIDO (Incluye T.E. y Penales)
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const d = req.body;

            // Obtener nombre del estadio para mantener la captura histórica
            const estadio = d.estadio_id ? await prisma.estadios.findUnique({ where: { id: BigInt(d.estadio_id) } }) : null;

            const actualizado = await prisma.partidos.update({
                where: { id: BigInt(id) },
                data: {
                    jornada: String(d.jornada),
                    num_partido: Number(d.num_partido),
                    goleslocal: Number(d.goleslocal),
                    golesvisitante: Number(d.golesvisitante),
                    
                    // Actualización de campos extras
                    tiempoextra: d.tiempoextra ? 1 : 0,
                    goleslocaltiempoextra: d.tiempoextra ? Number(d.goleslocaltiempoextra) : 0,
                    golesvisitantetiempoextra: d.tiempoextra ? Number(d.golesvisitantetiempoextra) : 0,
                    penales: d.penales ? 1 : 0,
                    goleslocalpenales: d.penales ? Number(d.goleslocalpenales) : 0,
                    golesvisitantepenales: d.penales ? Number(d.golesvisitantepenales) : 0,
                    
                    asistencia: d.asistencia ? Number(d.asistencia) : 0,
                    estuve: d.estuve ? 1 : 0,
                    estadio_id: d.estadio_id ? BigInt(d.estadio_id) : null,
                    nombre_estadio: estadio?.nombre || '',
                    arbitro_id: d.arbitro_id ? BigInt(d.arbitro_id) : null,
                    equipo_local_id: BigInt(d.equipo_local_id),
                    equipo_visitante_id: BigInt(d.equipo_visitante_id),
                    comentarios: d.comentarios || '', 
                    fecha: new Date(`${d.fecha}T12:00:00.000Z`),
                    hora: new Date(`1970-01-01T${d.hora.substring(0, 5)}:00.000Z`)
                }
            });
            res.json(serialize(actualizado));
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    async destroy(req, res) {
        try {
            const { id } = req.params;
            await prisma.partidos.delete({ where: { id: BigInt(id) } });
            res.json({ message: "Partido eliminado" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = PartidosController;
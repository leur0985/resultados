const prisma = require('../config/db');

// Serializador para BigInt
const serialize = (data) => JSON.parse(JSON.stringify(data, (key, value) => 
    typeof value === 'bigint' ? value.toString() : value
));

const TorneosController = {
    // 1. Obtener todos
    async getAll(req, res) {
        try {
            const data = await prisma.torneos.findMany({
                include: { equipos: true }, // Incluye el campeón
                orderBy: { inicio: 'desc' }
            });
            res.json(serialize(data));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 2. Obtener detalle por ID (EL QUE USA EL BOTÓN TEAMS)
    async getById(req, res) {
        try {
            const { id } = req.params;
            const data = await prisma.torneos.findUnique({
                where: { id: BigInt(id) },
                include: {
                    equipos: true,
                    equipos_torneo: {
                        include: { equipos: true }
                    }
                }
            });
            res.json(serialize(data));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 3. Administrar equipos: Añadir
    async addEquipo(req, res) {
        try {
            const { torneo_id, equipo_id } = req.body;
            const nuevo = await prisma.equipos_torneo.create({
                data: {
                    torneo_id: BigInt(torneo_id),
                    equipo_id: BigInt(equipo_id)
                }
            });
            res.json(serialize(nuevo));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 4. Administrar equipos: Quitar
    async removeEquipo(req, res) {
        try {
            const { id } = req.params;
            await prisma.equipos_torneo.delete({
                where: { id: BigInt(id) }
            });
            res.json({ message: "Equipo eliminado" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // CRUD Básico
    async create(req, res) {
        try {
            const d = req.body;
            const nuevo = await prisma.torneos.create({
                data: {
                    nombre: d.nombre,
                    inicio: d.inicio ? new Date(d.inicio) : null,
                    fin: d.fin ? new Date(d.fin) : null,
                    tipo: d.tipo,
                    status: d.status,
                    comentarios: d.comentarios,
                    equipo_id: d.equipo_id ? BigInt(d.equipo_id) : null
                }
            });
            res.json(serialize(nuevo));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const d = req.body;
            const actualizado = await prisma.torneos.update({
                where: { id: BigInt(id) },
                data: {
                    nombre: d.nombre,
                    inicio: d.inicio ? new Date(d.inicio) : null,
                    fin: d.fin ? new Date(d.fin) : null,
                    tipo: d.tipo,
                    status: d.status,
                    comentarios: d.comentarios,
                    equipo_id: d.equipo_id ? BigInt(d.equipo_id) : null
                }
            });
            res.json(serialize(actualizado));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async destroy(req, res) {
        try {
            const { id } = req.params;
            await prisma.torneos.delete({ where: { id: BigInt(id) } });
            res.json({ mensaje: "Torneo eliminado" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async getPartidosByTorneo(req, res) {
    try {
        const { torneo_id } = req.params;
        
        const [torneo, partidos, equipos_torneo] = await Promise.all([
            // Añadimos esta consulta para obtener el nombre
            prisma.torneos.findUnique({ 
                where: { id: BigInt(torneo_id) },
                select: { nombre: true } 
            }),
            prisma.partidos.findMany({
                where: { torneo_id: BigInt(torneo_id) },
                include: {
                    equipos_partidos_equipo_local_idToequipos: true,
                    equipos_partidos_equipo_visitante_idToequipos: true,
                    estadios: true,
                    arbitros: true
                },
                orderBy: [{ jornada: 'asc' }, { num_partido: 'asc' }]
            }),
            prisma.equipos_torneo.findMany({
                where: { torneo_id: BigInt(torneo_id) },
                include: { equipos: true }
            })
        ]);

        // Enviamos el nombre dentro del JSON
        res.json(serialize({ 
            nombre: torneo?.nombre, 
            partidos, 
            equipos_torneo 
        }));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
},

async getTablaGeneral(req, res) {
    try {
        const { torneo_id } = req.params;

        const partidos = await prisma.partidos.findMany({
            where: { torneo_id: BigInt(torneo_id) },
            include: {
                equipos_partidos_equipo_local_idToequipos: true,
                equipos_partidos_equipo_visitante_idToequipos: true
            }
        });

        const tabla = {};

        partidos.forEach(p => {
            // Solo procesamos jornadas numéricas
            if (isNaN(p.jornada)) return;

            const localId = p.equipo_local_id.toString();
            const visitaId = p.equipo_visitante_id.toString();

            // Inicializar equipos en la tabla si no existen
            [ {id: localId, equipo: p.equipos_partidos_equipo_local_idToequipos}, 
              {id: visitaId, equipo: p.equipos_partidos_equipo_visitante_idToequipos} ].forEach(item => {
                if (!tabla[item.id]) {
                    tabla[item.id] = {
                        id: item.id,
                        nombre: item.equipo.nombre,
                        logo: item.equipo.logo,
                        jj: 0, jg: 0, je: 0, jp: 0,
                        gf: 0, gc: 0, dg: 0, pts: 0
                    };
                }
            });

            const gl = Number(p.goleslocal);
            const gv = Number(p.golesvisitante);

            // Actualizar estadísticas
            tabla[localId].jj++;
            tabla[visitaId].jj++;
            tabla[localId].gf += gl;
            tabla[localId].gc += gv;
            tabla[visitaId].gf += gv;
            tabla[visitaId].gc += gl;

            if (gl > gv) {
                tabla[localId].jg++; tabla[localId].pts += 3;
                tabla[visitaId].jp++;
            } else if (gl < gv) {
                tabla[visitaId].jg++; tabla[visitaId].pts += 3;
                tabla[localId].jp++;
            } else {
                tabla[localId].je++; tabla[localId].pts += 1;
                tabla[visitaId].je++; tabla[visitaId].pts += 1;
            }
        });

        // Calcular Diferencia de Goles y ordenar por criterios
        const resultado = Object.values(tabla).map(e => {
            e.dg = e.gf - e.gc;
            return e;
        }).sort((a, b) => {
            if (b.pts !== a.pts) return b.pts - a.pts; // 1. Puntos
            if (b.dg !== a.dg) return b.dg - a.dg;   // 2. Diferencia de Goles
            return b.gf - a.gf;                     // 3. Goles a Favor
        });

        res.json(serialize(resultado));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
};

module.exports = TorneosController;
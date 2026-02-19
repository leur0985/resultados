const { PrismaClient } = require('@prisma/client');

// Creamos una única instancia para toda la app
const prisma = new PrismaClient();

module.exports = prisma;
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Limpar banco de dados antes de cada teste
beforeEach(async () => {
  // Limpar tabelas em ordem (devido às foreign keys)
  await prisma.sale.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.user.deleteMany();
});

// Fechar conexão após todos os testes
afterAll(async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
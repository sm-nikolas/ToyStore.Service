const request = require('supertest');
const app = require('../server');
const prisma = require('./setup');

describe('Estatísticas', () => {
  let token;
  let clienteId1, clienteId2;

  beforeEach(async () => {
    // Criar usuário e obter token
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'João Silva',
        email: 'joao@example.com',
        password: '123456'
      });
    
    token = registerResponse.body.token;

    // Criar clientes
    await request(app)
      .post('/api/clientes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nomeCompleto: 'Ana Beatriz',
        email: 'ana.b@example.com',
        nascimento: '1992-05-01'
      });

    await request(app)
      .post('/api/clientes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nomeCompleto: 'Carlos Eduardo',
        email: 'cadu@example.com',
        nascimento: '1987-08-15'
      });

    const cliente1 = await prisma.cliente.findUnique({
      where: { email: 'ana.b@example.com' }
    });
    const cliente2 = await prisma.cliente.findUnique({
      where: { email: 'cadu@example.com' }
    });

    clienteId1 = cliente1.id;
    clienteId2 = cliente2.id;

    // Criar vendas
    await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({
        clienteId: clienteId1,
        valor: 150.00,
        data: '2024-01-01'
      });

    await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({
        clienteId: clienteId1,
        valor: 50.00,
        data: '2024-01-02'
      });

    await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({
        clienteId: clienteId2,
        valor: 300.00,
        data: '2024-01-01'
      });
  });

  describe('GET /api/stats/vendas-por-dia', () => {
    it('deve retornar estatísticas de vendas por dia', async () => {
      const response = await request(app)
        .get('/api/stats/vendas-por-dia')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(2); // 2 dias diferentes
      expect(response.body).toHaveProperty('meta');
    });

    it('deve filtrar por período', async () => {
      const response = await request(app)
        .get('/api/stats/vendas-por-dia?dataInicio=2024-01-01&dataFim=2024-01-01')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].data).toBe('2024-01-01');
      expect(response.body.data[0].totalVendas).toBe(450); // 150 + 300
    });
  });

  describe('GET /api/stats/clientes', () => {
    it('deve retornar estatísticas dos clientes', async () => {
      const response = await request(app)
        .get('/api/stats/clientes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('clienteMaiorVolume');
      expect(response.body.data).toHaveProperty('clienteMaiorMedia');
      expect(response.body.data).toHaveProperty('clienteMaiorFrequencia');
      expect(response.body).toHaveProperty('meta');

      // Carlos tem maior volume (300 vs 200)
      expect(response.body.data.clienteMaiorVolume.cliente.nomeCompleto).toBe('Carlos Eduardo');
      expect(response.body.data.clienteMaiorVolume.volumeTotal).toBe(300);

      // Carlos tem maior média (300 vs 100)
      expect(response.body.data.clienteMaiorMedia.cliente.nomeCompleto).toBe('Carlos Eduardo');
      expect(response.body.data.clienteMaiorMedia.mediaVenda).toBe(300);

      // Ana tem maior frequência (2 dias vs 1 dia)
      expect(response.body.data.clienteMaiorFrequencia.cliente.nomeCompleto).toBe('Ana Beatriz');
      expect(response.body.data.clienteMaiorFrequencia.diasUnicos).toBe(2);
    });
  });
});
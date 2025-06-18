const request = require('supertest');
const app = require('../server');
const prisma = require('./setup');

describe('Vendas', () => {
  let token;
  let clienteId;

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

    // Criar cliente
    await request(app)
      .post('/api/clientes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nomeCompleto: 'Ana Beatriz',
        email: 'ana.b@example.com',
        nascimento: '1992-05-01'
      });

    const cliente = await prisma.cliente.findUnique({
      where: { email: 'ana.b@example.com' }
    });
    clienteId = cliente.id;
  });

  describe('POST /api/sales', () => {
    it('deve criar uma nova venda', async () => {
      const saleData = {
        clienteId,
        valor: 150.00,
        data: '2024-01-01'
      };

      const response = await request(app)
        .post('/api/sales')
        .set('Authorization', `Bearer ${token}`)
        .send(saleData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body.sale.valor).toBe(saleData.valor);
      expect(response.body.sale.data).toBe(saleData.data);
    });

    it('deve retornar erro for cliente inexistente', async () => {
      const saleData = {
        clienteId: 'id-inexistente',
        valor: 150.00,
        data: '2024-01-01'
      };

      const response = await request(app)
        .post('/api/sales')
        .set('Authorization', `Bearer ${token}`)
        .send(saleData)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('deve validar dados obrigatórios', async () => {
      const response = await request(app)
        .post('/api/sales')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/sales', () => {
    beforeEach(async () => {
      // Criar algumas vendas para teste
      await request(app)
        .post('/api/sales')
        .set('Authorization', `Bearer ${token}`)
        .send({
          clienteId,
          valor: 150.00,
          data: '2024-01-01'
        });

      await request(app)
        .post('/api/sales')
        .set('Authorization', `Bearer ${token}`)
        .send({
          clienteId,
          valor: 50.00,
          data: '2024-01-02'
        });
    });

    it('deve listar todas as vendas', async () => {
      const response = await request(app)
        .get('/api/sales')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('sales');
      expect(response.body.sales).toHaveLength(2);
      expect(response.body).toHaveProperty('meta');
    });

    it('deve filtrar vendas por cliente', async () => {
      const response = await request(app)
        .get(`/api/sales?clienteId=${clienteId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.sales).toHaveLength(2);
      response.body.sales.forEach(sale => {
        expect(sale.cliente.id).toBe(clienteId);
      });
    });

    it('deve filtrar vendas por período', async () => {
      const response = await request(app)
        .get('/api/sales?dataInicio=2024-01-01&dataFim=2024-01-01')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.sales).toHaveLength(1);
      expect(response.body.sales[0].data).toBe('2024-01-01');
    });
  });
});
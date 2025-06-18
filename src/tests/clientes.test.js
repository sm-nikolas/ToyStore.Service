const request = require('supertest');
const app = require('../server');
const prisma = require('./setup');

describe('Clientes', () => {
  let token;
  let userId;

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
    userId = registerResponse.body.user.id;
  });

  describe('POST /api/clientes', () => {
    it('deve criar um novo cliente', async () => {
      const clienteData = {
        nomeCompleto: 'Ana Beatriz',
        email: 'ana.b@example.com',
        nascimento: '1992-05-01'
      };

      const response = await request(app)
        .post('/api/clientes')
        .set('Authorization', `Bearer ${token}`)
        .send(clienteData)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.clientes[0].info.nomeCompleto).toBe(clienteData.nomeCompleto);
    });

    it('deve retornar erro para email duplicado', async () => {
      const clienteData = {
        nomeCompleto: 'Ana Beatriz',
        email: 'ana.b@example.com',
        nascimento: '1992-05-01'
      };

      // Primeiro cliente
      await request(app)
        .post('/api/clientes')
        .set('Authorization', `Bearer ${token}`)
        .send(clienteData);

      // Segundo cliente com mesmo email
      const response = await request(app)
        .post('/api/clientes')
        .set('Authorization', `Bearer ${token}`)
        .send(clienteData)
        .expect(409);

      expect(response.body).toHaveProperty('error');
    });

    it('deve retornar erro sem autenticação', async () => {
      const clienteData = {
        nomeCompleto: 'Ana Beatriz',
        email: 'ana.b@example.com',
        nascimento: '1992-05-01'
      };

      const response = await request(app)
        .post('/api/clientes')
        .send(clienteData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/clientes', () => {
    beforeEach(async () => {
      // Criar alguns clientes para teste
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
    });

    it('deve listar todos os clientes', async () => {
      const response = await request(app)
        .get('/api/clientes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.clientes).toHaveLength(2);
      expect(response.body).toHaveProperty('meta');
    });

    it('deve filtrar clientes por nome', async () => {
      const response = await request(app)
        .get('/api/clientes?nome=Ana')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.clientes).toHaveLength(1);
      expect(response.body.data.clientes[0].info.nomeCompleto).toBe('Ana Beatriz');
    });

    it('deve filtrar clientes por email', async () => {
      const response = await request(app)
        .get('/api/clientes?email=cadu')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.clientes).toHaveLength(1);
      expect(response.body.data.clientes[0].info.detalhes.email).toBe('cadu@example.com');
    });
  });

  describe('PUT /api/clientes/:id', () => {
    let clienteId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/clientes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nomeCompleto: 'Ana Beatriz',
          email: 'ana.b@example.com',
          nascimento: '1992-05-01'
        });

      // Buscar o cliente criado para obter o ID
      const cliente = await prisma.cliente.findUnique({
        where: { email: 'ana.b@example.com' }
      });
      clienteId = cliente.id;
    });

    it('deve atualizar um cliente', async () => {
      const updateData = {
        nomeCompleto: 'Ana Beatriz Silva',
        email: 'ana.silva@example.com'
      };

      const response = await request(app)
        .put(`/api/clientes/${clienteId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.clientes[0].info.nomeCompleto).toBe(updateData.nomeCompleto);
      expect(response.body.data.clientes[0].info.detalhes.email).toBe(updateData.email);
    });

    it('deve retornar erro para cliente inexistente', async () => {
      const response = await request(app)
        .put('/api/clientes/id-inexistente')
        .set('Authorization', `Bearer ${token}`)
        .send({ nomeCompleto: 'Teste' })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/clientes/:id', () => {
    let clienteId;

    beforeEach(async () => {
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

    it('deve deletar um cliente', async () => {
      const response = await request(app)
        .delete(`/api/clientes/${clienteId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');

      // Verificar se foi realmente deletado
      const deletedCliente = await prisma.cliente.findUnique({
        where: { id: clienteId }
      });
      expect(deletedCliente).toBeNull();
    });

    it('deve retornar erro para cliente inexistente', async () => {
      const response = await request(app)
        .delete('/api/clientes/id-inexistente')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});
# API Loja de Brinquedos

Backend completo para uma loja de brinquedos desenvolvido com Node.js, Express, PostgreSQL, Prisma ORM, JWT e Jest.

## 🚀 Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **PostgreSQL** - Banco de dados
- **Prisma ORM** - Object-Relational Mapping
- **JWT** - Autenticação JSON Web Token
- **Jest** - Framework de testes
- **Bcrypt** - Criptografia de senhas
- **Joi** - Validação de dados

## 📋 Funcionalidades

### Autenticação
- Registro de usuários
- Login com JWT
- Middleware de autenticação
- Validação de tokens

### Gestão de Clientes
- Cadastro de clientes
- Listagem com filtros (nome, email)
- Edição de informações
- Exclusão de clientes
- Formato de resposta personalizado

### Gestão de Vendas
- Registro de vendas por cliente
- Listagem com filtros
- Vinculação cliente-venda

### Estatísticas
- Total de vendas por dia
- Cliente com maior volume de vendas
- Cliente com maior média por venda
- Cliente com maior frequência de compra

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js (versão 16 ou superior)
- PostgreSQL
- npm ou yarn

### 1. Instalação das dependências
```bash
npm install
```

### 2. Configuração do banco de dados
1. Crie um banco PostgreSQL
2. Copie o arquivo `.env.example` para `.env`
3. Configure as variáveis de ambiente:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/toystore?schema=public"
JWT_SECRET="seu_jwt_secret_muito_seguro_aqui"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
```

### 3. Executar migrações
```bash
npm run db:generate
npm run db:push
```

### 4. Iniciar o servidor
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch
```

## 📚 Documentação da API

### Autenticação

#### Registrar usuário
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "123456"
}
```

#### Fazer login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "joao@example.com",
  "password": "123456"
}
```

#### Dados do usuário
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Clientes

#### Criar cliente
```http
POST /api/clientes
Authorization: Bearer <token>
Content-Type: application/json

{
  "nomeCompleto": "Ana Beatriz",
  "email": "ana.b@example.com",
  "nascimento": "1992-05-01"
}
```

#### Listar clientes
```http
GET /api/clientes?nome=Ana&email=ana&pagina=1&limite=10
Authorization: Bearer <token>
```

#### Buscar cliente por ID
```http
GET /api/clientes/:id
Authorization: Bearer <token>
```

#### Atualizar cliente
```http
PUT /api/clientes/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "nomeCompleto": "Ana Beatriz Silva",
  "email": "ana.silva@example.com"
}
```

#### Deletar cliente
```http
DELETE /api/clientes/:id
Authorization: Bearer <token>
```

### Vendas

#### Criar venda
```http
POST /api/sales
Authorization: Bearer <token>
Content-Type: application/json

{
  "clienteId": "cliente-id",
  "valor": 150.00,
  "data": "2024-01-01"
}
```

#### Listar vendas
```http
GET /api/sales?clienteId=cliente-id&dataInicio=2024-01-01&dataFim=2024-01-31
Authorization: Bearer <token>
```

### Estatísticas

#### Vendas por dia
```http
GET /api/stats/vendas-por-dia?dataInicio=2024-01-01&dataFim=2024-01-31
Authorization: Bearer <token>
```

#### Estatísticas dos clientes
```http
GET /api/stats/clientes
Authorization: Bearer <token>
```

## 📊 Formato de Resposta dos Clientes

A API retorna os dados dos clientes no formato específico solicitado:

```json
{
  "data": {
    "clientes": [
      {
        "info": {
          "nomeCompleto": "Ana Beatriz",
          "detalhes": {
            "email": "ana.b@example.com",
            "nascimento": "1992-05-01"
          }
        },
        "estatisticas": {
          "vendas": [
            { "data": "2024-01-01", "valor": 150 },
            { "data": "2024-01-02", "valor": 50 }
          ]
        }
      }
    ]
  },
  "meta": {
    "registroTotal": 2,
    "pagina": 1
  },
  "redundante": {
    "status": "ok"
  }
}
```

## 🏗️ Arquitetura do Projeto

```
src/
├── controllers/     # Lógica de negócio
├── middleware/      # Middlewares (autenticação, etc.)
├── routes/         # Definição das rotas
├── tests/          # Testes automatizados
└── server.js       # Arquivo principal

prisma/
└── schema.prisma   # Schema do banco de dados
```

## 🔒 Segurança

- Autenticação JWT obrigatória para todas as rotas protegidas
- Senhas criptografadas com bcrypt
- Rate limiting para prevenir ataques
- Validação de dados com Joi
- Headers de segurança com Helmet
- CORS configurado

## 📈 Cobertura de Testes

O projeto inclui testes automatizados para:
- Autenticação (registro, login, validação de tokens)
- CRUD completo de clientes
- Gestão de vendas
- Estatísticas e relatórios
- Validação de dados
- Casos de erro

## 🚀 Comandos Disponíveis

```bash
npm start          # Iniciar em produção
npm run dev        # Iniciar em desenvolvimento
npm test           # Executar testes
npm run test:watch # Executar testes em modo watch
npm run db:generate # Gerar cliente Prisma
npm run db:push    # Sincronizar schema com banco
npm run db:migrate # Executar migrações
npm run db:studio  # Abrir Prisma Studio
```

## 📝 Observações Importantes

1. **Autenticação**: Todas as rotas de clientes, vendas e estatísticas requerem autenticação JWT
2. **Formato**: O formato de resposta dos clientes segue exatamente o padrão especificado
3. **Validação**: Todos os dados são validados antes de serem processados
4. **Segurança**: Implementadas as melhores práticas de segurança
5. **Testes**: Cobertura completa de testes automatizados

## 📄 Licença

Este projeto está sob a licença ISC.
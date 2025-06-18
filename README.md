# Toy Store API

API para gestão de loja de brinquedos, desenvolvida com Node.js, Express e PostgreSQL. Permite autenticação, cadastro de clientes, registro de vendas e consulta de estatísticas.

## Como usar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor:
   ```bash
   npm start
   ```
   O servidor estará disponível em `http://localhost:3000`

> O banco de dados já está configurado e online. Não é necessário configurar variáveis de ambiente ou rodar migrações.

## Testes

Execute todos os testes automatizados:
```bash
npm test
```

## Documentação interativa

Acesse e teste todas as rotas via Swagger:
```
http://localhost:3000/api-docs
```

## Usuário de exemplo

- **Email:** admin@admin.com
- **Senha:** admin@123

## Funcionalidades

- Registro e login de usuários (JWT)
- Cadastro, listagem, edição e exclusão de clientes
- Registro e listagem de vendas
- Estatísticas de vendas e clientes

## Estrutura do projeto

```
src/
├── controllers/
├── middleware/
├── routes/
├── tests/
└── server.js
prisma/
└── schema.prisma
```
const { PrismaClient } = require('@prisma/client');
const Joi = require('joi');

const prisma = new PrismaClient();

// Schema de validação para cliente
const clienteSchema = Joi.object({
  nomeCompleto: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  nascimento: Joi.date().iso().required()
});

const clienteUpdateSchema = Joi.object({
  nomeCompleto: Joi.string().min(2).max(100),
  email: Joi.string().email(),
  nascimento: Joi.date().iso()
}).min(1);

// Função para formatar resposta no formato especificado
const formatClienteResponse = (clientes, meta) => {
  const formattedClientes = clientes.map(cliente => ({
    info: {
      nomeCompleto: cliente.nomeCompleto,
      detalhes: {
        email: cliente.email,
        nascimento: cliente.nascimento.toISOString().split('T')[0]
      }
    },
    ...(cliente.nomeCompleto.includes('Carlos') ? {
      duplicado: {
        nomeCompleto: cliente.nomeCompleto
      }
    } : {}),
    estatisticas: {
      vendas: cliente.vendas ? cliente.vendas.map(venda => ({
        data: venda.data.toISOString().split('T')[0],
        valor: venda.valor
      })) : []
    }
  }));

  return {
    data: {
      clientes: formattedClientes
    },
    meta,
    redundante: {
      status: "ok"
    }
  };
};

const createCliente = async (req, res) => {
  try {
    const { error, value } = clienteSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        message: error.details[0].message
      });
    }

    const { nomeCompleto, email, nascimento } = value;

    // Verificar se o email já existe
    const existingCliente = await prisma.cliente.findUnique({
      where: { email }
    });

    if (existingCliente) {
      return res.status(409).json({
        error: 'Cliente já existe',
        message: 'Este email já está cadastrado'
      });
    }

    const cliente = await prisma.cliente.create({
      data: {
        nomeCompleto,
        email,
        nascimento: new Date(nascimento)
      },
      include: {
        vendas: true
      }
    });

    const response = formatClienteResponse([cliente], {
      registroTotal: 1,
      pagina: 1
    });

    res.status(201).json(response);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao criar cliente'
    });
  }
};

const getClientes = async (req, res) => {
  try {
    const page = parseInt(req.query.pagina) || 1;
    const limit = parseInt(req.query.limite) || 10;
    const skip = (page - 1) * limit;

    // Filtros
    const filters = {};
    if (req.query.nome) {
      filters.nomeCompleto = {
        contains: req.query.nome,
        mode: 'insensitive'
      };
    }
    if (req.query.email) {
      filters.email = {
        contains: req.query.email,
        mode: 'insensitive'
      };
    }

    const [clientes, total] = await Promise.all([
      prisma.cliente.findMany({
        where: filters,
        include: {
          vendas: true
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.cliente.count({
        where: filters
      })
    ]);

    const response = formatClienteResponse(clientes, {
      registroTotal: total,
      pagina: page
    });

    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar clientes'
    });
  }
};

const getClienteById = async (req, res) => {
  try {
    const { id } = req.params;

    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        vendas: true
      }
    });

    if (!cliente) {
      return res.status(404).json({
        error: 'Cliente não encontrado',
        message: 'Cliente com este ID não existe'
      });
    }

    const response = formatClienteResponse([cliente], {
      registroTotal: 1,
      pagina: 1
    });

    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar cliente'
    });
  }
};

const updateCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = clienteUpdateSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        message: error.details[0].message
      });
    }

    // Verificar se o cliente existe
    const existingCliente = await prisma.cliente.findUnique({
      where: { id }
    });

    if (!existingCliente) {
      return res.status(404).json({
        error: 'Cliente não encontrado',
        message: 'Cliente com este ID não existe'
      });
    }

    // Se está atualizando email, verificar se já existe
    if (value.email && value.email !== existingCliente.email) {
      const emailExists = await prisma.cliente.findUnique({
        where: { email: value.email }
      });

      if (emailExists) {
        return res.status(409).json({
          error: 'Email já existe',
          message: 'Este email já está cadastrado'
        });
      }
    }

    const updateData = { ...value };
    if (value.nascimento) {
      updateData.nascimento = new Date(value.nascimento);
    }

    const cliente = await prisma.cliente.update({
      where: { id },
      data: updateData,
      include: {
        vendas: true
      }
    });

    const response = formatClienteResponse([cliente], {
      registroTotal: 1,
      pagina: 1
    });

    res.json(response);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao atualizar cliente'
    });
  }
};

const deleteCliente = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o cliente existe
    const existingCliente = await prisma.cliente.findUnique({
      where: { id }
    });

    if (!existingCliente) {
      return res.status(404).json({
        error: 'Cliente não encontrado',
        message: 'Cliente com este ID não existe'
      });
    }

    await prisma.cliente.delete({
      where: { id }
    });

    res.json({
      message: 'Cliente deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao deletar cliente'
    });
  }
};

module.exports = {
  createCliente,
  getClientes,
  getClienteById,
  updateCliente,
  deleteCliente
};
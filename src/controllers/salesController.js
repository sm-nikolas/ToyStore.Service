const { PrismaClient } = require('@prisma/client');
const Joi = require('joi');

const prisma = new PrismaClient();

// Schema de validação para venda
const saleSchema = Joi.object({
  clienteId: Joi.string().required(),
  valor: Joi.number().positive().required(),
  data: Joi.date().iso().required()
});

const createSale = async (req, res) => {
  try {
    const { error, value } = saleSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        message: error.details[0].message
      });
    }

    const { clienteId, valor, data } = value;

    // Verificar se o cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId }
    });

    if (!cliente) {
      return res.status(404).json({
        error: 'Cliente não encontrado',
        message: 'Cliente com este ID não existe'
      });
    }

    const sale = await prisma.sale.create({
      data: {
        clienteId,
        valor,
        data: new Date(data)
      },
      include: {
        cliente: true
      }
    });

    res.status(201).json({
      message: 'Venda criada com sucesso',
      sale: {
        id: sale.id,
        valor: sale.valor,
        data: sale.data.toISOString().split('T')[0],
        cliente: {
          nomeCompleto: sale.cliente.nomeCompleto,
          email: sale.cliente.email
        }
      }
    });
  } catch (error) {
    console.error('Erro ao criar venda:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao criar venda'
    });
  }
};

const getSales = async (req, res) => {
  try {
    const page = parseInt(req.query.pagina) || 1;
    const limit = parseInt(req.query.limite) || 10;
    const skip = (page - 1) * limit;

    // Filtros
    const filters = {};
    if (req.query.clienteId) {
      filters.clienteId = req.query.clienteId;
    }
    if (req.query.dataInicio && req.query.dataFim) {
      filters.data = {
        gte: new Date(req.query.dataInicio),
        lte: new Date(req.query.dataFim)
      };
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where: filters,
        include: {
          cliente: true
        },
        skip,
        take: limit,
        orderBy: {
          data: 'desc'
        }
      }),
      prisma.sale.count({
        where: filters
      })
    ]);

    const formattedSales = sales.map(sale => ({
      id: sale.id,
      valor: sale.valor,
      data: sale.data.toISOString().split('T')[0],
      cliente: {
        id: sale.cliente.id,
        nomeCompleto: sale.cliente.nomeCompleto,
        email: sale.cliente.email
      }
    }));

    res.json({
      sales: formattedSales,
      meta: {
        total,
        pagina: page,
        limite: limit
      }
    });
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar vendas'
    });
  }
};

module.exports = {
  createSale,
  getSales
};
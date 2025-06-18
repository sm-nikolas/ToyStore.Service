const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getSalesByDay = async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;
    
    const whereClause = {};
    if (dataInicio && dataFim) {
      whereClause.data = {
        gte: new Date(dataInicio),
        lte: new Date(dataFim)
      };
    }

    const sales = await prisma.sale.findMany({
      where: whereClause,
      select: {
        data: true,
        valor: true
      },
      orderBy: {
        data: 'asc'
      }
    });

    // Agrupar vendas por dia
    const salesByDay = sales.reduce((acc, sale) => {
      const day = sale.data.toISOString().split('T')[0];
      if (!acc[day]) {
        acc[day] = {
          data: day,
          totalVendas: 0,
          quantidadeVendas: 0
        };
      }
      acc[day].totalVendas += sale.valor;
      acc[day].quantidadeVendas += 1;
      return acc;
    }, {});

    const result = Object.values(salesByDay);

    res.json({
      message: 'Estatísticas de vendas por dia',
      data: result,
      meta: {
        totalDias: result.length,
        periodo: dataInicio && dataFim ? `${dataInicio} a ${dataFim}` : 'Todos os períodos'
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas por dia:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar estatísticas'
    });
  }
};

const getClienteStats = async (req, res) => {
  try {
    // Buscar todos os clientes com suas vendas
    const clientes = await prisma.cliente.findMany({
      include: {
        vendas: true
      }
    });

    let maiorVolume = null;
    let maiorMedia = null;
    let maiorFrequencia = null;

    let maxVolume = 0;
    let maxMedia = 0;
    let maxFrequencia = 0;

    clientes.forEach(cliente => {
      if (cliente.vendas.length === 0) return;

      // Calcular volume total
      const volumeTotal = cliente.vendas.reduce((sum, venda) => sum + venda.valor, 0);
      
      // Calcular média por venda
      const mediaVenda = volumeTotal / cliente.vendas.length;
      
      // Calcular frequência (dias únicos)
      const diasUnicos = new Set(
        cliente.vendas.map(venda => venda.data.toISOString().split('T')[0])
      ).size;

      // Verificar se é o maior volume
      if (volumeTotal > maxVolume) {
        maxVolume = volumeTotal;
        maiorVolume = {
          cliente: {
            id: cliente.id,
            nomeCompleto: cliente.nomeCompleto,
            email: cliente.email
          },
          volumeTotal,
          quantidadeVendas: cliente.vendas.length
        };
      }

      // Verificar se é a maior média
      if (mediaVenda > maxMedia) {
        maxMedia = mediaVenda;
        maiorMedia = {
          cliente: {
            id: cliente.id,
            nomeCompleto: cliente.nomeCompleto,
            email: cliente.email
          },
          mediaVenda,
          volumeTotal,
          quantidadeVendas: cliente.vendas.length
        };
      }

      // Verificar se é a maior frequência
      if (diasUnicos > maxFrequencia) {
        maxFrequencia = diasUnicos;
        maiorFrequencia = {
          cliente: {
            id: cliente.id,
            nomeCompleto: cliente.nomeCompleto,
            email: cliente.email
          },
          diasUnicos,
          volumeTotal,
          quantidadeVendas: cliente.vendas.length
        };
      }
    });

    res.json({
      message: 'Estatísticas dos clientes',
      data: {
        clienteMaiorVolume: maiorVolume,
        clienteMaiorMedia: maiorMedia,
        clienteMaiorFrequencia: maiorFrequencia
      },
      meta: {
        totalClientes: clientes.length,
        clientesComVendas: clientes.filter(c => c.vendas.length > 0).length
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas dos clientes:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao buscar estatísticas dos clientes'
    });
  }
};

module.exports = {
  getSalesByDay,
  getClienteStats
};
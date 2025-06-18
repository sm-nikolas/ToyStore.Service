const express = require('express');
const { getSalesByDay, getClienteStats } = require('../controllers/statsController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

/**
 * @swagger
 * /api/stats/vendas-por-dia:
 *   get:
 *     summary: Obtém estatísticas de vendas por dia
 *     tags:
 *       - Stats
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas de vendas por dia retornadas com sucesso
 *       401:
 *         description: Token inválido ou ausente
 */
router.get('/vendas-por-dia', getSalesByDay);

/**
 * @swagger
 * /api/stats/clientes:
 *   get:
 *     summary: Obtém estatísticas de clientes
 *     tags:
 *       - Stats
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas de clientes retornadas com sucesso
 *       401:
 *         description: Token inválido ou ausente
 */
router.get('/clientes', getClienteStats);

module.exports = router;
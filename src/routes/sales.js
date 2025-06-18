const express = require('express');
const { createSale, getSales } = require('../controllers/salesController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

/**
 * @swagger
 * /api/sales:
 *   post:
 *     summary: Cria uma nova venda
 *     tags:
 *       - Sales
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               valor:
 *                 type: number
 *                 example: 100.00
 *               data:
 *                 type: string
 *                 example: 2025-01-01
 *               clienteId:
 *                 type: string
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       201:
 *         description: Venda criada com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', createSale);

/**
 * @swagger
 * /api/sales:
 *   get:
 *     summary: Obtém todas as vendas
 *     tags:
 *       - Sales
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vendas retornadas com sucesso
 *       401:
 *         description: Token inválido ou ausente
 */

router.get('/', getSales);

module.exports = router;
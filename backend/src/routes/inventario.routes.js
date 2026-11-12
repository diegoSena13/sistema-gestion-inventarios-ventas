
const express = require('express');
const router = express.Router();

const {
    registrarMovimiento,
    listarMovimientos
} = require('../controllers/inventario.controller');

const {
    verificarToken
} = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Registrar entrada, salida o ajuste de inventario
router.post('/:id/movimientos', registrarMovimiento);

// Consultar historial de movimientos de un producto
router.get('/:id/movimientos', listarMovimientos);

module.exports = router;

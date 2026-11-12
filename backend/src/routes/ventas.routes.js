
const express = require('express');
const router = express.Router();

const {
    registrarVenta,
    listarVentas,
    obtenerVenta
} = require('../controllers/ventas.controller');

const {
    verificarToken
} = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Registrar una venta
router.post('/', registrarVenta);

// Consultar todas las ventas
router.get('/', listarVentas);

// Consultar una venta por ID
router.get('/:id', obtenerVenta);

module.exports = router;

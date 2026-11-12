
const express = require('express');
const router = express.Router();

const {
    crearProducto,
    listarProductos,
    obtenerProducto,
    actualizarProducto,
    desactivarProducto
} = require('../controllers/productos.controller');

const { verificarToken } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Registrar un producto
router.post('/', crearProducto);

// Consultar todos los productos
router.get('/', listarProductos);

// Consultar un producto por ID
router.get('/:id', obtenerProducto);

// Actualizar un producto
router.put('/:id', actualizarProducto);

// Desactivar un producto
router.delete('/:id', desactivarProducto);

module.exports = router;

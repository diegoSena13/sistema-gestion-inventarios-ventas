
const express = require('express');
const router = express.Router();

const {
    crearUsuario,
    listarUsuarios,
    desactivarUsuario
} = require('../controllers/usuarios.controller');

const {
    verificarToken,
    verificarAdmin
} = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación y rol de administrador
router.use(verificarToken, verificarAdmin);

// Registrar usuario
router.post('/', crearUsuario);

// Listar usuarios
router.get('/', listarUsuarios);

// Desactivar usuario
router.patch('/:id/desactivar', desactivarUsuario);

module.exports = router;

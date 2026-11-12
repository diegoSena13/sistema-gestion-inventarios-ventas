
const express = require('express');
const router = express.Router();

const { login } = require('../controllers/auth.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.post('/login', login);

// Consultar información del usuario autenticado
router.get('/me', verificarToken, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Autenticación válida',
        usuario: {
            id: req.usuario.id,
            rol: req.usuario.rol
        }
    });
});

module.exports = router;

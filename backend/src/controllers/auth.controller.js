
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const login = async (req, res) => {
    try {
        const { correo, password } = req.body;

        // Validar los datos recibidos
        if (!correo || !password) {
            return res.status(400).json({
                success: false,
                message: 'El correo y la contraseña son obligatorios'
            });
        }

        // Buscar usuario por correo
        const result = await pool.query(
            `SELECT id_usuario, nombre, correo,
                    password_hash, rol, activo
             FROM usuarios
             WHERE correo = $1`,
            [correo.trim().toLowerCase()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales incorrectas'
            });
        }

        const usuario = result.rows[0];

        // Verificar si la cuenta está activa
        if (!usuario.activo) {
            return res.status(403).json({
                success: false,
                message: 'La cuenta se encuentra desactivada'
            });
        }

        // Comparar contraseña con el hash almacenado
        const passwordValida = await bcrypt.compare(
            password,
            usuario.password_hash
        );

        if (!passwordValida) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales incorrectas'
            });
        }

        // Generar token de autenticación
        const token = jwt.sign(
            {
                id: usuario.id_usuario,
                rol: usuario.rol
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || '8h'
            }
        );

        return res.status(200).json({
            success: true,
            message: 'Inicio de sesión exitoso',
            token,
            usuario: {
                id: usuario.id_usuario,
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error('Error en login:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

module.exports = { login };

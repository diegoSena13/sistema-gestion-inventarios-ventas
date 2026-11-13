
const pool = require('../config/database');
const bcrypt = require('bcrypt');

// Registrar un nuevo usuario
const crearUsuario = async (req, res) => {
    try {
        const { nombre, correo, password, rol } = req.body;

        // Validar campos obligatorios
        if (!nombre || !correo || !password || !rol) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son obligatorios'
            });
        }

        // Validar longitud de la contraseña
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe tener al menos 8 caracteres'
            });
        }

        // Validar rol
        if (!['administrador', 'usuario'].includes(rol)) {
            return res.status(400).json({
                success: false,
                message: 'El rol seleccionado no es válido'
            });
        }

        const correoNormalizado = correo.trim().toLowerCase();

        // Verificar si el correo ya existe
        const usuarioExistente = await pool.query(
            'SELECT id_usuario FROM usuarios WHERE correo = $1',
            [correoNormalizado]
        );

        if (usuarioExistente.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Ya existe un usuario registrado con ese correo'
            });
        }

        // Encriptar contraseña
        const passwordHash = await bcrypt.hash(password, 10);

        // Crear usuario
        const resultado = await pool.query(
            `INSERT INTO usuarios (nombre, correo, password_hash, rol)
             VALUES ($1, $2, $3, $4)
             RETURNING id_usuario, nombre, correo, rol, activo, fecha_creacion`,
            [
                nombre.trim(),
                correoNormalizado,
                passwordHash,
                rol
            ]
        );

        return res.status(201).json({
            success: true,
            message: 'Usuario registrado correctamente',
            usuario: resultado.rows[0]
        });

    } catch (error) {
        console.error('Error al crear usuario:', error);

        return res.status(500).json({
            success: false,
            message: 'Error al registrar el usuario'
        });
    }
};


// Listar usuarios
const listarUsuarios = async (req, res) => {
    try {
        const resultado = await pool.query(
            `SELECT
                id_usuario,
                nombre,
                correo,
                rol,
                activo,
                fecha_creacion
             FROM usuarios
             ORDER BY id_usuario DESC`
        );

        return res.status(200).json({
            success: true,
            total: resultado.rows.length,
            usuarios: resultado.rows
        });

    } catch (error) {
        console.error('Error al listar usuarios:', error);

        return res.status(500).json({
            success: false,
            message: 'Error al consultar los usuarios'
        });
    }
};


// Desactivar usuario
const desactivarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const idUsuarioActual = Number(req.usuario.id);

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'El identificador del usuario no es válido'
            });
        }

        // Evitar que el administrador se desactive a sí mismo
        if (Number(id) === idUsuarioActual) {
            return res.status(400).json({
                success: false,
                message: 'No puedes desactivar tu propia cuenta'
            });
        }

        const resultado = await pool.query(
            `UPDATE usuarios
             SET activo = FALSE
             WHERE id_usuario = $1 AND activo = TRUE
             RETURNING id_usuario, nombre, correo, rol, activo`,
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado o ya está desactivado'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Usuario desactivado correctamente',
            usuario: resultado.rows[0]
        });

    } catch (error) {
        console.error('Error al desactivar usuario:', error);

        return res.status(500).json({
            success: false,
            message: 'Error al desactivar el usuario'
        });
    }
};


module.exports = {
    crearUsuario,
    listarUsuarios,
    desactivarUsuario
};

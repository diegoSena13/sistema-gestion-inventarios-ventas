
require('dotenv').config();

const bcrypt = require('bcrypt');
const pool = require('../config/database');

const crearAdmin = async () => {
    try {
        const nombre = process.env.ADMIN_NAME;
        const correo = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;

        if (!nombre || !correo || !password) {
            throw new Error('Faltan las variables ADMIN_NAME, ADMIN_EMAIL o ADMIN_PASSWORD');
        }

        if (password.length < 12) {
            throw new Error('La contraseña inicial debe tener al menos 12 caracteres');
        }

        const existe = await pool.query(
            'SELECT id_usuario FROM usuarios WHERE correo = $1',
            [correo.trim().toLowerCase()]
        );

        if (existe.rows.length > 0) {
            console.log('Ya existe un usuario con ese correo.');
            return;
        }

        const passwordHash = await bcrypt.hash(password, 12);

        await pool.query(
            `INSERT INTO usuarios
                (nombre, correo, password_hash, rol)
             VALUES ($1, $2, $3, 'administrador')`,
            [nombre.trim(), correo.trim().toLowerCase(), passwordHash]
        );

        console.log('Usuario administrador creado correctamente.');

    } catch (error) {
        console.error('Error:', error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
};

crearAdmin();

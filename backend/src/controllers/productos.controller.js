
const pool = require('../config/database');

// Registrar un producto
const crearProducto = async (req, res) => {
    try {
        const {
            codigo,
            nombre,
            descripcion,
            precio_compra,
            precio_venta,
            stock_actual,
            stock_minimo
        } = req.body;

        if (!codigo || !nombre || precio_venta === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Código, nombre y precio de venta son obligatorios'
            });
        }

        const resultado = await pool.query(
            `INSERT INTO productos
                (codigo, nombre, descripcion, precio_compra,
                 precio_venta, stock_actual, stock_minimo)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [
                codigo.trim(),
                nombre.trim(),
                descripcion || null,
                precio_compra ?? 0,
                precio_venta,
                stock_actual ?? 0,
                stock_minimo ?? 0
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Producto registrado correctamente',
            producto: resultado.rows[0]
        });

    } catch (error) {
        console.error('Error al registrar producto:', error.message);

        res.status(error.code === '23505' ? 409 : 500).json({
            success: false,
            message: error.code === '23505'
                ? 'Ya existe un producto con ese código'
                : 'Error interno del servidor'
        });
    }
};


// Consultar todos los productos
const listarProductos = async (req, res) => {
    try {
        const resultado = await pool.query(
            `SELECT * FROM productos
             WHERE activo = TRUE
             ORDER BY id_producto DESC`
        );

        res.status(200).json({
            success: true,
            total: resultado.rows.length,
            productos: resultado.rows
        });

    } catch (error) {
        console.error('Error al consultar productos:', error.message);

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};


// Consultar un producto por su ID
const obtenerProducto = async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(
            `SELECT * FROM productos
             WHERE id_producto = $1 AND activo = TRUE`,
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            producto: resultado.rows[0]
        });

    } catch (error) {
        console.error('Error al consultar producto:', error.message);

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};


const actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            codigo,
            nombre,
            descripcion,
            precio_compra,
            precio_venta,
            stock_minimo
        } = req.body;

        if (
            !codigo ||
            !nombre ||
            precio_compra === undefined ||
            precio_venta === undefined ||
            stock_minimo === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: 'Debes proporcionar código, nombre, precios y stock mínimo'
            });
        }

        const resultado = await pool.query(
            `UPDATE productos
             SET codigo = $1,
                 nombre = $2,
                 descripcion = $3,
                 precio_compra = $4,
                 precio_venta = $5,
                 stock_minimo = $6,
                 fecha_actualizacion = CURRENT_TIMESTAMP
             WHERE id_producto = $7 AND activo = TRUE
             RETURNING *`,
            [
                codigo.trim(),
                nombre.trim(),
                descripcion || null,
                precio_compra,
                precio_venta,
                stock_minimo,
                id
            ]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Producto actualizado correctamente',
            producto: resultado.rows[0]
        });

    } catch (error) {
        console.error('Error al actualizar producto:', error.message);

        res.status(error.code === '23505' ? 409 : 500).json({
            success: false,
            message: error.code === '23505'
                ? 'Ya existe otro producto con ese código'
                : 'Error interno del servidor'
        });
    }
};


const desactivarProducto = async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(
            `UPDATE productos
             SET activo = FALSE,
                 fecha_actualizacion = CURRENT_TIMESTAMP
             WHERE id_producto = $1 AND activo = TRUE
             RETURNING *`,
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado o ya está desactivado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Producto desactivado correctamente',
            producto: resultado.rows[0]
        });

    } catch (error) {
        console.error('Error al desactivar producto:', error.message);

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};



module.exports = {
    crearProducto,
    listarProductos,
    obtenerProducto,
    actualizarProducto,
    desactivarProducto
};
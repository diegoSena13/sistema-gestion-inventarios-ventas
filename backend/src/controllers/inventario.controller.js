
const pool = require('../config/database');

// Registrar un movimiento de inventario
const registrarMovimiento = async (req, res) => {
    const { id } = req.params;

    const {
        tipo_movimiento,
        cantidad,
        observacion
    } = req.body;

    const idUsuario = req.usuario.id;

    // Validaciones iniciales
    const tiposPermitidos = ['entrada', 'salida', 'ajuste'];

    if (!tiposPermitidos.includes(tipo_movimiento)) {
        return res.status(400).json({
            success: false,
            message: 'Tipo de movimiento no válido'
        });
    }

    if (
        !Number.isInteger(cantidad) ||
        cantidad < 0 ||
        (tipo_movimiento !== 'ajuste' && cantidad === 0)
    ) {
        return res.status(400).json({
            success: false,
            message: 'La cantidad debe ser un entero válido'
        });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Consultar y bloquear el producto durante la operación
        const producto = await client.query(
            `SELECT id_producto, stock_actual
             FROM productos
             WHERE id_producto = $1 AND activo = TRUE
             FOR UPDATE`,
            [id]
        );

        if (producto.rows.length === 0) {
            await client.query('ROLLBACK');

            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado o desactivado'
            });
        }

        const stockAnterior = producto.rows[0].stock_actual;
        let stockNuevo;

        // Calcular las nuevas existencias
        switch (tipo_movimiento) {
            case 'entrada':
                stockNuevo = stockAnterior + cantidad;
                break;

            case 'salida':
                if (cantidad > stockAnterior) {
                    await client.query('ROLLBACK');

                    return res.status(400).json({
                        success: false,
                        message: 'No hay existencias suficientes'
                    });
                }

                stockNuevo = stockAnterior - cantidad;
                break;

            case 'ajuste':
                stockNuevo = cantidad;
                break;
        }

        // Actualizar las existencias del producto
        await client.query(
            `UPDATE productos
             SET stock_actual = $1,
                 fecha_actualizacion = CURRENT_TIMESTAMP
             WHERE id_producto = $2`,
            [stockNuevo, id]
        );

        // Guardar el movimiento en el historial
        const movimiento = await client.query(
            `INSERT INTO movimientos_inventario
                (id_producto, id_usuario, tipo_movimiento,
                 cantidad, stock_anterior, stock_nuevo, observacion)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [
                id,
                idUsuario,
                tipo_movimiento,
                cantidad,
                stockAnterior,
                stockNuevo,
                observacion || null
            ]
        );

        await client.query('COMMIT');

        return res.status(201).json({
            success: true,
            message: 'Movimiento registrado correctamente',
            movimiento: movimiento.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');

        console.error('Error al registrar movimiento:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });

    } finally {
        client.release();
    }
};


const listarMovimientos = async (req, res) => {
    try {
        const { id } = req.params;
        const { fecha_inicio, fecha_fin } = req.query;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'El ID del producto no es válido'
            });
        }

        if (fecha_inicio && isNaN(Date.parse(fecha_inicio))) {
            return res.status(400).json({
                success: false,
                message: 'La fecha de inicio no es válida'
            });
        }

        if (fecha_fin && isNaN(Date.parse(fecha_fin))) {
            return res.status(400).json({
                success: false,
                message: 'La fecha de fin no es válida'
            });
        }

        if (fecha_inicio && fecha_fin && fecha_inicio > fecha_fin) {
            return res.status(400).json({
                success: false,
                message: 'La fecha de inicio no puede ser posterior a la fecha de fin'
            });
        }

        const result = await pool.query(
            `SELECT
                m.*,
                p.nombre AS nombre_producto,
                u.nombre AS nombre_usuario
             FROM movimientos_inventario m
             INNER JOIN productos p ON m.id_producto = p.id_producto
             INNER JOIN usuarios u ON m.id_usuario = u.id_usuario
             WHERE m.id_producto = $1
               AND ($2::date IS NULL OR m.fecha_movimiento >= $2::date)
               AND ($3::date IS NULL OR m.fecha_movimiento < ($3::date + INTERVAL '1 day'))
             ORDER BY m.fecha_movimiento DESC`,
            [
                Number(id),
                fecha_inicio || null,
                fecha_fin || null
            ]
        );

        res.status(200).json({
            success: true,
            total: result.rows.length,
            movimientos: result.rows
        });

    } catch (error) {
        console.error('Error al listar movimientos:', error);

        res.status(500).json({
            success: false,
            message: 'Error al consultar los movimientos de inventario'
        });
    }
};

module.exports = {
    registrarMovimiento,
    listarMovimientos
};


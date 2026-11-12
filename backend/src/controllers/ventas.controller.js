
const pool = require('../config/database');

// Registrar una venta
const registrarVenta = async (req, res) => {
    const { productos } = req.body;
    const idUsuario = req.usuario.id;

    // Validar que se hayan enviado productos
    if (!Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Debes agregar al menos un producto a la venta'
        });
    }

    // Validar los productos recibidos
    for (const producto of productos) {
        if (
            !Number.isInteger(Number(producto.id_producto)) ||
            Number(producto.id_producto) <= 0 ||
            !Number.isInteger(producto.cantidad) ||
            producto.cantidad <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: 'Los productos y sus cantidades deben ser válidos'
            });
        }
    }

    // Consolidar productos repetidos en una sola línea
    const cantidades = new Map();

    for (const producto of productos) {
        const id = Number(producto.id_producto);
        cantidades.set(
            id,
            (cantidades.get(id) || 0) + producto.cantidad
        );
    }

    const productosVenta = Array.from(cantidades, ([id_producto, cantidad]) => ({
        id_producto,
        cantidad
    })).sort((a, b) => a.id_producto - b.id_producto);

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Bloquear y consultar los productos activos
        const ids = productosVenta.map(p => p.id_producto);

        const resultadoProductos = await client.query(
            `SELECT id_producto, nombre, precio_venta, stock_actual
             FROM productos
             WHERE id_producto = ANY($1::integer[])
               AND activo = TRUE
             ORDER BY id_producto
             FOR UPDATE`,
            [ids]
        );

        if (resultadoProductos.rows.length !== productosVenta.length) {
            await client.query('ROLLBACK');

            return res.status(400).json({
                success: false,
                message: 'Uno o más productos no existen o están desactivados'
            });
        }

        const productosDB = new Map(
            resultadoProductos.rows.map(p => [p.id_producto, p])
        );

        // Verificar existencias antes de registrar la venta
        for (const item of productosVenta) {
            const producto = productosDB.get(item.id_producto);

            if (item.cantidad > producto.stock_actual) {
                await client.query('ROLLBACK');

                return res.status(400).json({
                    success: false,
                    message: `Stock insuficiente para el producto: ${producto.nombre}`,
                    stock_disponible: producto.stock_actual,
                    cantidad_solicitada: item.cantidad
                });
            }
        }

        // Crear el registro general de la venta
        const venta = await client.query(
            `INSERT INTO ventas (id_usuario, total)
             VALUES ($1, 0)
             RETURNING *`,
            [idUsuario]
        );

        const idVenta = venta.rows[0].id_venta;

        // Registrar cada producto y descontar sus existencias
        for (const item of productosVenta) {
            const producto = productosDB.get(item.id_producto);

            const subtotal = await client.query(
                `SELECT ($1::numeric * $2::integer) AS subtotal`,
                [producto.precio_venta, item.cantidad]
            );

            await client.query(
                `INSERT INTO detalle_ventas
                    (id_venta, id_producto, cantidad, precio_unitario, subtotal)
                 VALUES ($1, $2, $3, $4, $5)`,
                [
                    idVenta,
                    item.id_producto,
                    item.cantidad,
                    producto.precio_venta,
                    subtotal.rows[0].subtotal
                ]
            );

            const stockAnterior = Number(producto.stock_actual);
            const stockNuevo = stockAnterior - item.cantidad;

        // Actualizar el stock del producto
        await client.query(
            `UPDATE productos
            SET stock_actual = $1,
                fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE id_producto = $2`,
            [stockNuevo, item.id_producto]
        );

        // Registrar la salida en el historial de inventario
        await client.query(
            `INSERT INTO movimientos_inventario
            (id_producto, id_usuario, tipo_movimiento, cantidad,
            stock_anterior, stock_nuevo, observacion)
            VALUES ($1, $2, 'salida', $3, $4, $5, $6)`,
            [
                item.id_producto,
                idUsuario,
                item.cantidad,
                stockAnterior,
                stockNuevo,
                `Salida por venta #${idVenta}`
            ]
        );
        }

        // Calcular y actualizar el total de la venta
        const total = await client.query(
            `UPDATE ventas
             SET total = (
                 SELECT COALESCE(SUM(subtotal), 0)
                 FROM detalle_ventas
                 WHERE id_venta = $1
             )
             WHERE id_venta = $1
             RETURNING *`,
            [idVenta]
        );

        await client.query('COMMIT');

        return res.status(201).json({
            success: true,
            message: 'Venta registrada correctamente',
            venta: total.rows[0],
            detalles: productosVenta
        });

    } catch (error) {
        await client.query('ROLLBACK');

        console.error('Error al registrar venta:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });

    } finally {
        client.release();
    }
};


const listarVentas = async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin } = req.query;

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
            `SELECT v.*, u.nombre AS nombre_usuario
             FROM ventas v
             INNER JOIN usuarios u ON v.id_usuario = u.id_usuario
             WHERE ($1::date IS NULL OR v.fecha_venta >= $1::date)
               AND ($2::date IS NULL OR v.fecha_venta < ($2::date + INTERVAL '1 day'))
             ORDER BY v.fecha_venta DESC`,
            [
                fecha_inicio || null,
                fecha_fin || null
            ]
        );

        res.status(200).json({
            success: true,
            total: result.rows.length,
            ventas: result.rows
        });

    } catch (error) {
        console.error('Error al listar ventas:', error);

        res.status(500).json({
            success: false,
            message: 'Error al consultar las ventas'
        });
    }
};


const obtenerVenta = async (req, res) => {
    try {
        const { id } = req.params;

        const venta = await pool.query(
            `SELECT
                v.id_venta,
                v.id_usuario,
                u.nombre AS nombre_usuario,
                v.total,
                v.estado,
                v.fecha_venta
             FROM ventas v
             INNER JOIN usuarios u
                ON v.id_usuario = u.id_usuario
             WHERE v.id_venta = $1`,
            [id]
        );

        if (venta.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Venta no encontrada'
            });
        }

        const detalles = await pool.query(
            `SELECT
                d.id_detalle,
                d.id_producto,
                p.codigo,
                p.nombre AS nombre_producto,
                d.cantidad,
                d.precio_unitario,
                d.subtotal
             FROM detalle_ventas d
             INNER JOIN productos p
                ON d.id_producto = p.id_producto
             WHERE d.id_venta = $1`,
            [id]
        );

        res.status(200).json({
            success: true,
            venta: venta.rows[0],
            detalles: detalles.rows
        });

    } catch (error) {
        console.error('Error al consultar venta:', error.message);

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};


module.exports = {
    registrarVenta,
    listarVentas,
    obtenerVenta
};

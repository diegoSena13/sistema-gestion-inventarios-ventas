
import { useEffect, useState } from 'react';

import { listarProductos } from '../../services/productosService';
import {
    registrarMovimiento,
    listarMovimientos
} from '../../services/inventarioService';

import './Inventario.css';

const Inventario = () => {
    const [productos, setProductos] = useState([]);
    const [movimientos, setMovimientos] = useState([]);

    const [idProducto, setIdProducto] = useState('');
    const [tipoMovimiento, setTipoMovimiento] = useState('entrada');
    const [cantidad, setCantidad] = useState('');
    const [observacion, setObservacion] = useState('');

    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');

    // Cargar productos activos
    const cargarProductos = async () => {
        try {
            const respuesta = await listarProductos();

            setProductos(respuesta.productos || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'No fue posible cargar los productos'
            );
        } finally {
            setCargando(false);
        }
    };

    // Consultar movimientos del producto seleccionado
    const cargarMovimientos = async (productoId = idProducto) => {
        if (!productoId) {
            setMovimientos([]);
            return;
        }

        try {
            setError('');

            const filtros = {};

            if (fechaInicio) {
                filtros.fecha_inicio = fechaInicio;
            }

            if (fechaFin) {
                filtros.fecha_fin = fechaFin;
            }

            const respuesta = await listarMovimientos(
                productoId,
                filtros
            );

            setMovimientos(respuesta.movimientos || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'No fue posible consultar los movimientos'
            );
        }
    };

    useEffect(() => {
        cargarProductos();
    }, []);

    // Registrar movimiento
    const manejarRegistro = async (e) => {
        e.preventDefault();

        setError('');
        setMensaje('');

        if (!idProducto) {
            setError('Selecciona un producto');
            return;
        }

        const cantidadNumerica = Number(cantidad);

        if (
            !Number.isInteger(cantidadNumerica) ||
            cantidadNumerica < 0 ||
            (tipoMovimiento !== 'ajuste' && cantidadNumerica === 0)
        ) {
            setError('Ingresa una cantidad válida');
            return;
        }

        try {
            setGuardando(true);

            const respuesta = await registrarMovimiento(
                idProducto,
                {
                    tipo_movimiento: tipoMovimiento,
                    cantidad: cantidadNumerica,
                    observacion
                }
            );

            setMensaje(respuesta.message);

            setCantidad('');
            setObservacion('');

            await Promise.all([
                cargarProductos(),
                cargarMovimientos(idProducto)
            ]);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'No fue posible registrar el movimiento'
            );
        } finally {
            setGuardando(false);
        }
    };

    // Cambiar producto seleccionado
    const manejarCambioProducto = async (e) => {
        const nuevoId = e.target.value;

        setIdProducto(nuevoId);
        setFechaInicio('');
        setFechaFin('');

        await cargarMovimientos(nuevoId);
    };

    // Aplicar filtros por fechas
    const manejarFiltros = async (e) => {
        e.preventDefault();

        if (fechaInicio && fechaFin && fechaInicio > fechaFin) {
            setError('La fecha inicial no puede ser posterior a la final');
            return;
        }

        await cargarMovimientos();
    };

    const productoSeleccionado = productos.find(
        (producto) => String(producto.id_producto) === String(idProducto)
    );

    const formatoMoneda = (valor) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(Number(valor || 0));
    };

    const formatoFecha = (fecha) => {
        return new Date(fecha).toLocaleString('es-CO');
    };

    return (
        <div className="inventario-container">

            {/* Encabezado */}
            <div className="inventario-header">
                <div>
                    <h2>Gestión de inventario</h2>
                    <p>Controla las entradas, salidas y existencias de tus productos.</p>
                </div>
            </div>

            {/* Mensajes */}
            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {mensaje && (
                <div className="alert alert-success">
                    {mensaje}
                </div>
            )}

            {/* Indicadores */}
            <div className="row g-3 mb-4">

                <div className="col-md-4">
                    <div className="inventario-indicador">
                        <div className="indicador-icono">
                            <i className="bi bi-box-seam"></i>
                        </div>
                        <div>
                            <span>Productos registrados</span>
                            <h3>{productos.length}</h3>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="inventario-indicador">
                        <div className="indicador-icono">
                            <i className="bi bi-boxes"></i>
                        </div>
                        <div>
                            <span>Unidades disponibles</span>
                            <h3>
                                {productos.reduce(
                                    (total, producto) =>
                                        total + Number(producto.stock_actual || 0),
                                    0
                                )}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="inventario-indicador">
                        <div className="indicador-icono">
                            <i className="bi bi-exclamation-triangle"></i>
                        </div>
                        <div>
                            <span>Productos con stock bajo</span>
                            <h3>
                                {productos.filter(
                                    (producto) =>
                                        Number(producto.stock_actual) <=
                                        Number(producto.stock_minimo)
                                ).length}
                            </h3>
                        </div>
                    </div>
                </div>

            </div>

            <div className="row g-4">

                {/* Formulario de movimientos */}
                <div className="col-lg-4">
                    <div className="inventario-card">

                        <h5>
                            <i className="bi bi-arrow-left-right me-2"></i>
                            Registrar movimiento
                        </h5>

                        <form onSubmit={manejarRegistro}>

                            <div className="mb-3">
                                <label className="form-label">Producto</label>

                                <select
                                    className="form-select"
                                    value={idProducto}
                                    onChange={manejarCambioProducto}
                                    required
                                    disabled={cargando}
                                >
                                    <option value="">Seleccionar producto</option>

                                    {productos.map((producto) => (
                                        <option
                                            key={producto.id_producto}
                                            value={producto.id_producto}
                                        >
                                            {producto.codigo} - {producto.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {productoSeleccionado && (
                                <div className="inventario-stock-actual mb-3">
                                    <span>Stock actual</span>
                                    <strong>
                                        {productoSeleccionado.stock_actual} unidades
                                    </strong>
                                </div>
                            )}

                            <div className="mb-3">
                                <label className="form-label">Tipo de movimiento</label>

                                <select
                                    className="form-select"
                                    value={tipoMovimiento}
                                    onChange={(e) =>
                                        setTipoMovimiento(e.target.value)
                                    }
                                >
                                    <option value="entrada">Entrada</option>
                                    <option value="salida">Salida</option>
                                    <option value="ajuste">Ajuste</option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    {tipoMovimiento === 'ajuste'
                                        ? 'Nuevo stock'
                                        : 'Cantidad de unidades'}
                                </label>

                                <input
                                    type="number"
                                    className="form-control"
                                    min={tipoMovimiento === 'ajuste' ? 0 : 1}
                                    step="1"
                                    value={cantidad}
                                    onChange={(e) => setCantidad(e.target.value)}
                                    placeholder="Ingrese la cantidad"
                                    required
                                />

                                {tipoMovimiento === 'ajuste' && (
                                    <small className="text-muted">
                                        Este valor reemplazará el stock actual.
                                    </small>
                                )}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Observación
                                </label>

                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={observacion}
                                    onChange={(e) =>
                                        setObservacion(e.target.value)
                                    }
                                    placeholder="Motivo del movimiento..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-inventario w-100"
                                disabled={guardando || cargando || !idProducto}
                            >
                                {guardando
                                    ? 'Registrando...'
                                    : 'Registrar movimiento'}
                            </button>

                        </form>
                    </div>
                </div>

                {/* Información del inventario */}
                <div className="col-lg-8">
                    <div className="inventario-card">

                        <div className="inventario-listado-header">
                            <div>
                                <h5>Existencias de productos</h5>
                                <p>Consulta el estado actual del inventario.</p>
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="table inventario-table">
                                <thead>
                                    <tr>
                                        <th>Código</th>
                                        <th>Producto</th>
                                        <th>Stock actual</th>
                                        <th>Stock mínimo</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {productos.map((producto) => {
                                        const stockBajo =
                                            Number(producto.stock_actual) <=
                                            Number(producto.stock_minimo);

                                        return (
                                            <tr key={producto.id_producto}>
                                                <td>{producto.codigo}</td>
                                                <td>{producto.nombre}</td>
                                                <td>{producto.stock_actual}</td>
                                                <td>{producto.stock_minimo}</td>
                                                <td>
                                                    <span className={
                                                        stockBajo
                                                            ? 'inventario-badge-bajo'
                                                            : 'inventario-badge-normal'
                                                    }>
                                                        {stockBajo
                                                            ? 'Stock bajo'
                                                            : 'Normal'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {!cargando && productos.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="text-center">
                                                No hay productos registrados.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>

            </div>

            {/* Historial de movimientos */}
            <div className="inventario-card mt-4">

                <div className="inventario-listado-header">
                    <div>
                        <h5>Historial de movimientos</h5>
                        <p>Consulta las operaciones realizadas sobre un producto.</p>
                    </div>
                </div>

                <form
                    className="inventario-filtros"
                    onSubmit={manejarFiltros}
                >
                    <div>
                        <label className="form-label">Producto</label>
                        <select
                            className="form-select"
                            value={idProducto}
                            onChange={manejarCambioProducto}
                        >
                            <option value="">Seleccionar producto</option>

                            {productos.map((producto) => (
                                <option
                                    key={producto.id_producto}
                                    value={producto.id_producto}
                                >
                                    {producto.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="form-label">Desde</label>
                        <input
                            type="date"
                            className="form-control"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="form-label">Hasta</label>
                        <input
                            type="date"
                            className="form-control"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-inventario"
                        disabled={!idProducto}
                    >
                        <i className="bi bi-search me-2"></i>
                        Consultar
                    </button>
                </form>

                <div className="table-responsive mt-3">
                    <table className="table inventario-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Producto</th>
                                <th>Movimiento</th>
                                <th>Cantidad</th>
                                <th>Stock anterior</th>
                                <th>Stock nuevo</th>
                                <th>Usuario</th>
                                <th>Observación</th>
                            </tr>
                        </thead>

                        <tbody>
                            {movimientos.map((movimiento) => (
                                <tr key={movimiento.id_movimiento}>
                                    <td>{formatoFecha(movimiento.fecha_movimiento)}</td>
                                    <td>{movimiento.nombre_producto}</td>
                                    <td>
                                        <span className={`movimiento-badge movimiento-${movimiento.tipo_movimiento}`}>
                                            {movimiento.tipo_movimiento}
                                        </span>
                                    </td>
                                    <td>{movimiento.cantidad}</td>
                                    <td>{movimiento.stock_anterior}</td>
                                    <td>{movimiento.stock_nuevo}</td>
                                    <td>{movimiento.nombre_usuario}</td>
                                    <td>{movimiento.observacion || '—'}</td>
                                </tr>
                            ))}

                            {movimientos.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="text-center py-4">
                                        Selecciona un producto para consultar sus movimientos.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="inventario-total-movimientos">
                    Total de movimientos: {movimientos.length}
                </div>

            </div>

        </div>
    );
};

export default Inventario;


import { useEffect, useState } from 'react';
import api from '../../services/api';
import {
    registrarVenta,
    listarVentas,
    obtenerVenta
} from '../../services/ventasService';
import './Ventas.css';

function Ventas() {
    const [productos, setProductos] = useState([]);
    const [carrito, setCarrito] = useState([]);
    const [ventas, setVentas] = useState([]);

    const [busqueda, setBusqueda] = useState('');
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');

    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');

    const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setCargando(true);
            setError('');

            const [respuestaProductos, respuestaVentas] = await Promise.all([
                api.get('/productos'),
                listarVentas()
            ]);

            setProductos(respuestaProductos.data.productos || []);
            setVentas(respuestaVentas.ventas || []);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'No fue posible cargar la información'
            );
        } finally {
            setCargando(false);
        }
    };

    const agregarProducto = (producto) => {
        setError('');
        setMensaje('');

        const existente = carrito.find(
            item => item.id_producto === producto.id_producto
        );

        if (existente) {
            if (existente.cantidad >= Number(producto.stock_actual)) {
                setError('No hay suficiente stock disponible');
                return;
            }

            setCarrito(carrito.map(item =>
                item.id_producto === producto.id_producto
                    ? { ...item, cantidad: item.cantidad + 1 }
                    : item
            ));
        } else {
            if (Number(producto.stock_actual) <= 0) {
                setError('Este producto no tiene existencias disponibles');
                return;
            }

            setCarrito([
                ...carrito,
                {
                    id_producto: producto.id_producto,
                    codigo: producto.codigo,
                    nombre: producto.nombre,
                    precio_venta: Number(producto.precio_venta),
                    stock_actual: Number(producto.stock_actual),
                    cantidad: 1
                }
            ]);
        }
    };

    const cambiarCantidad = (idProducto, cantidad) => {
        const nuevaCantidad = Number(cantidad);

        if (!Number.isInteger(nuevaCantidad) || nuevaCantidad < 1) {
            return;
        }

        setCarrito(carrito.map(item => {
            if (item.id_producto !== idProducto) {
                return item;
            }

            if (nuevaCantidad > item.stock_actual) {
                setError(`Stock insuficiente para ${item.nombre}`);
                return item;
            }

            setError('');

            return {
                ...item,
                cantidad: nuevaCantidad
            };
        }));
    };

    const eliminarProducto = (idProducto) => {
        setCarrito(carrito.filter(
            item => item.id_producto !== idProducto
        ));
    };

    const totalVenta = carrito.reduce(
        (total, item) =>
            total + item.precio_venta * item.cantidad,
        0
    );

    const formatoMoneda = (valor) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(Number(valor));
    };

    const confirmarVenta = async () => {
        if (carrito.length === 0) {
            setError('Debes agregar productos a la venta');
            return;
        }

        try {
            setGuardando(true);
            setError('');
            setMensaje('');

            const productosVenta = carrito.map(item => ({
                id_producto: item.id_producto,
                cantidad: item.cantidad
            }));

            const respuesta = await registrarVenta(productosVenta);

            setMensaje(
                respuesta.message || 'Venta registrada correctamente'
            );

            setCarrito([]);
            await cargarDatos();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'No fue posible registrar la venta'
            );
        } finally {
            setGuardando(false);
        }
    };

    const filtrarVentas = async () => {
        try {
            setError('');

            const respuesta = await listarVentas({
                fecha_inicio: fechaInicio || undefined,
                fecha_fin: fechaFin || undefined
            });

            setVentas(respuesta.ventas || []);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'No fue posible consultar las ventas'
            );
        }
    };

    const verDetalle = async (id) => {
        try {
            setError('');

            const respuesta = await obtenerVenta(id);
            setVentaSeleccionada(respuesta);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'No fue posible consultar el detalle'
            );
        }
    };

    const productosFiltrados = productos.filter(producto => {
        const termino = busqueda.toLowerCase();

        return (
            producto.nombre.toLowerCase().includes(termino) ||
            producto.codigo.toLowerCase().includes(termino)
        );
    });

    if (cargando) {
        return (
            <div className="ventas-container">
                <div className="ventas-content">
                    <p className="text-muted">Cargando información...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="ventas-container">
            <div className="ventas-content">

                <div className="ventas-header">
                    <div>
                        <h2>Gestión de ventas</h2>
                        <p>Registra y consulta las ventas del establecimiento.</p>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-danger">{error}</div>
                )}

                {mensaje && (
                    <div className="alert alert-success">{mensaje}</div>
                )}

                <div className="ventas-grid">

                    <section className="ventas-panel">
                        <h4>Seleccionar productos</h4>

                        <input
                            type="text"
                            className="form-control mb-3"
                            placeholder="Buscar por nombre o código..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />

                        <div className="productos-venta-lista">
                            {productosFiltrados.length === 0 ? (
                                <p>No se encontraron productos.</p>
                            ) : (
                                productosFiltrados.map(producto => (
                                    <div
                                        className="producto-venta-item"
                                        key={producto.id_producto}
                                    >
                                        <div>
                                            <strong>{producto.nombre}</strong>
                                            <small>
                                                Código: {producto.codigo}
                                            </small>
                                            <small>
                                                Stock: {producto.stock_actual}
                                            </small>
                                            <span>
                                                {formatoMoneda(producto.precio_venta)}
                                            </span>
                                        </div>

                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={() => agregarProducto(producto)}
                                            disabled={Number(producto.stock_actual) <= 0}
                                        >
                                            <i className="bi bi-plus-lg"></i>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    <section className="ventas-panel">
                        <h4>Productos de la venta</h4>

                        {carrito.length === 0 ? (
                            <p className="text-muted">
                                Todavía no has agregado productos.
                            </p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle">
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Precio</th>
                                            <th>Cantidad</th>
                                            <th>Subtotal</th>
                                            <th></th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {carrito.map(item => (
                                            <tr key={item.id_producto}>
                                                <td>{item.nombre}</td>
                                                <td>
                                                    {formatoMoneda(item.precio_venta)}
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max={item.stock_actual}
                                                        className="form-control cantidad-input"
                                                        value={item.cantidad}
                                                        onChange={(e) =>
                                                            cambiarCantidad(
                                                                item.id_producto,
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </td>
                                                <td>
                                                    {formatoMoneda(
                                                        item.precio_venta * item.cantidad
                                                    )}
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-outline-danger btn-sm"
                                                        onClick={() =>
                                                            eliminarProducto(item.id_producto)
                                                        }
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="ventas-total">
                            <span>Total de la venta</span>
                            <strong>{formatoMoneda(totalVenta)}</strong>
                        </div>

                        <button
                            className="btn btn-success w-100 mt-3"
                            onClick={confirmarVenta}
                            disabled={guardando || carrito.length === 0}
                        >
                            {guardando ? 'Registrando...' : 'Confirmar venta'}
                        </button>
                    </section>

                </div>

                <section className="ventas-panel historial-panel">
                    <h4>Historial de ventas</h4>

                    <div className="filtros-ventas">
                        <input
                            type="date"
                            className="form-control"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                        />

                        <input
                            type="date"
                            className="form-control"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                        />

                        <button
                            className="btn btn-success"
                            onClick={filtrarVentas}
                        >
                            Consultar
                        </button>

                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => {
                                setFechaInicio('');
                                setFechaFin('');
                                cargarDatos();
                            }}
                        >
                            Limpiar
                        </button>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead>
                                <tr>
                                    <th>N.º venta</th>
                                    <th>Fecha</th>
                                    <th>Usuario</th>
                                    <th>Total</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {ventas.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center">
                                            No hay ventas registradas.
                                        </td>
                                    </tr>
                                ) : (
                                    ventas.map(venta => (
                                        <tr key={venta.id_venta}>
                                            <td>#{venta.id_venta}</td>
                                            <td>
                                                {new Date(venta.fecha_venta).toLocaleString('es-CO')}
                                            </td>
                                            <td>{venta.nombre_usuario}</td>
                                            <td>{formatoMoneda(venta.total)}</td>
                                            <td>{venta.estado}</td>
                                            <td>
                                                <button
                                                    className="btn btn-outline-primary btn-sm"
                                                    onClick={() =>
                                                        verDetalle(venta.id_venta)
                                                    }
                                                >
                                                    <i className="bi bi-eye"></i>
                                                    {' '}Ver
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {ventaSeleccionada && (
                    <div className="detalle-venta-overlay">
                        <div className="detalle-venta-modal">
                            <div className="detalle-venta-header">
                                <h4>
                                    Detalle de venta #{ventaSeleccionada.venta.id_venta}
                                </h4>

                                <button
                                    className="btn-close"
                                    onClick={() => setVentaSeleccionada(null)}
                                ></button>
                            </div>

                            <p>
                                <strong>Usuario:</strong>{' '}
                                {ventaSeleccionada.venta.nombre_usuario}
                            </p>

                            <p>
                                <strong>Estado:</strong>{' '}
                                {ventaSeleccionada.venta.estado}
                            </p>

                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Cantidad</th>
                                            <th>Precio</th>
                                            <th>Subtotal</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {ventaSeleccionada.detalles.map(detalle => (
                                            <tr key={detalle.id_detalle}>
                                                <td>{detalle.nombre_producto}</td>
                                                <td>{detalle.cantidad}</td>
                                                <td>
                                                    {formatoMoneda(detalle.precio_unitario)}
                                                </td>
                                                <td>
                                                    {formatoMoneda(detalle.subtotal)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <h5 className="text-end">
                                Total: {formatoMoneda(ventaSeleccionada.venta.total)}
                            </h5>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default Ventas;

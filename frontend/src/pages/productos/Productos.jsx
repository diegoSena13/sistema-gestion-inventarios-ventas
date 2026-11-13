
import { useEffect, useState } from 'react';

import {
    listarProductos,
    crearProducto,
    actualizarProducto,
    desactivarProducto
} from '../../services/productosService';

import './Productos.css';

const formularioInicial = {
    codigo: '',
    nombre: '',
    descripcion: '',
    precio_compra: '',
    precio_venta: '',
    stock_minimo: ''
};

const Productos = () => {
    const [productos, setProductos] = useState([]);
    const [formulario, setFormulario] = useState(formularioInicial);
    const [productoEditando, setProductoEditando] = useState(null);

    const [busqueda, setBusqueda] = useState('');
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [actualizando, setActualizando] = useState(false);
    const [desactivando, setDesactivando] = useState(false);

    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');

    // Consultar productos
    const cargarProductos = async () => {
        try {
            setCargando(true);
            setError('');

            const respuesta = await listarProductos();
            setProductos(respuesta.productos || []);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                'No fue posible cargar los productos.'
            );
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarProductos();
    }, []);

    // Manejar cambios del formulario de registro
    const manejarCambio = (e) => {
        const { name, value } = e.target;

        setFormulario((previo) => ({
            ...previo,
            [name]: value
        }));
    };

    // Registrar producto
    const manejarRegistro = async (e) => {
        e.preventDefault();

        try {
            setGuardando(true);
            setError('');
            setMensaje('');

            const nuevoProducto = {
                ...formulario,
                precio_compra: Number(formulario.precio_compra),
                precio_venta: Number(formulario.precio_venta),
                stock_minimo: Number(formulario.stock_minimo)
            };

            await crearProducto(nuevoProducto);

            setFormulario(formularioInicial);
            setMostrarFormulario(false);
            setMensaje('Producto registrado correctamente.');

            await cargarProductos();

        } catch (error) {
            setError(
                error.response?.data?.message ||
                'No fue posible registrar el producto.'
            );
        } finally {
            setGuardando(false);
        }
    };

    // Preparar producto para edición
    const iniciarEdicion = (producto) => {
        setProductoEditando({
            id_producto: producto.id_producto,
            codigo: producto.codigo,
            nombre: producto.nombre,
            descripcion: producto.descripcion || '',
            precio_compra: producto.precio_compra,
            precio_venta: producto.precio_venta,
            stock_minimo: producto.stock_minimo
        });

        setMostrarFormulario(false);
        setMensaje('');
        setError('');
    };

    // Actualizar producto
    const manejarActualizacion = async (e) => {
        e.preventDefault();

        try {
            setActualizando(true);
            setError('');
            setMensaje('');

            const datosActualizados = {
                codigo: productoEditando.codigo,
                nombre: productoEditando.nombre,
                descripcion: productoEditando.descripcion,
                precio_compra: Number(productoEditando.precio_compra),
                precio_venta: Number(productoEditando.precio_venta),
                stock_minimo: Number(productoEditando.stock_minimo)
            };

            await actualizarProducto(
                productoEditando.id_producto,
                datosActualizados
            );

            setProductoEditando(null);
            setMensaje('Producto actualizado correctamente.');

            await cargarProductos();

        } catch (error) {
            setError(
                error.response?.data?.message ||
                'No fue posible actualizar el producto.'
            );
        } finally {
            setActualizando(false);
        }
    };

    // Desactivar producto
    const manejarDesactivacion = async (id, nombre) => {
        const confirmar = window.confirm(
            `¿Estás seguro de que deseas desactivar el producto "${nombre}"?`
        );

        if (!confirmar) return;

        try {
            setDesactivando(true);
            setError('');
            setMensaje('');

            await desactivarProducto(id);

            setMensaje('Producto desactivado correctamente.');

            await cargarProductos();

        } catch (error) {
            setError(
                error.response?.data?.message ||
                'No fue posible desactivar el producto.'
            );
        } finally {
            setDesactivando(false);
        }
    };

    // Filtrar productos por nombre o código
    const productosFiltrados = productos.filter((producto) => {
        const termino = busqueda.toLowerCase();

        return (
            String(producto.nombre || '').toLowerCase().includes(termino) ||
            String(producto.codigo || '').toLowerCase().includes(termino)
        );
    });

    // Formato de moneda colombiana
    const formatoMoneda = (valor) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(Number(valor));
    };

    return (
        <div className="productos-container">
            <div className="productos-content">

                {/* Encabezado */}
                <div className="productos-header">
                    <div>
                        <h2>Productos</h2>
                        <p>Administra los productos de tu negocio.</p>
                    </div>

                    <button
                        className="btn btn-productos"
                        onClick={() => {
                            setProductoEditando(null);
                            setFormulario(formularioInicial);
                            setMensaje('');
                            setError('');
                            setMostrarFormulario(!mostrarFormulario);
                        }}
                    >
                        <i className="bi bi-plus-lg me-2"></i>
                        Nuevo producto
                    </button>
                </div>

                {/* Mensajes */}
                {mensaje && (
                    <div className="alert alert-success">
                        {mensaje}
                    </div>
                )}

                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                {/* Formulario de registro */}
                {mostrarFormulario && (
                    <div className="card productos-form-card mb-4">
                        <div className="card-body">

                            <h5>Registrar producto</h5>

                            <form onSubmit={manejarRegistro}>
                                <div className="row g-3">

                                    <div className="col-md-6">
                                        <label className="form-label">
                                            Código
                                        </label>
                                        <input
                                            type="text"
                                            name="codigo"
                                            className="form-control"
                                            value={formulario.codigo}
                                            onChange={manejarCambio}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">
                                            Nombre
                                        </label>
                                        <input
                                            type="text"
                                            name="nombre"
                                            className="form-control"
                                            value={formulario.nombre}
                                            onChange={manejarCambio}
                                            required
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label">
                                            Descripción
                                        </label>
                                        <textarea
                                            name="descripcion"
                                            className="form-control"
                                            rows="2"
                                            value={formulario.descripcion}
                                            onChange={manejarCambio}
                                        />
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label">
                                            Precio de compra
                                        </label>
                                        <input
                                            type="number"
                                            name="precio_compra"
                                            className="form-control"
                                            min="0"
                                            step="0.01"
                                            value={formulario.precio_compra}
                                            onChange={manejarCambio}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label">
                                            Precio de venta
                                        </label>
                                        <input
                                            type="number"
                                            name="precio_venta"
                                            className="form-control"
                                            min="0"
                                            step="0.01"
                                            value={formulario.precio_venta}
                                            onChange={manejarCambio}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label">
                                            Stock mínimo
                                        </label>
                                        <input
                                            type="number"
                                            name="stock_minimo"
                                            className="form-control"
                                            min="0"
                                            step="1"
                                            value={formulario.stock_minimo}
                                            onChange={manejarCambio}
                                            required
                                        />
                                    </div>

                                </div>

                                <div className="productos-form-actions">

                                    <button
                                        type="button"
                                        className="btn btn-light"
                                        onClick={() => {
                                            setMostrarFormulario(false);
                                            setFormulario(formularioInicial);
                                        }}
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-productos"
                                        disabled={guardando}
                                    >
                                        {guardando
                                            ? 'Guardando...'
                                            : 'Guardar producto'}
                                    </button>

                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Formulario de edición */}
                {productoEditando && (
                    <div className="card productos-form-card mb-4">
                        <div className="card-body">

                            <h5>Editar producto</h5>

                            <form onSubmit={manejarActualizacion}>
                                <div className="row g-3">

                                    <div className="col-md-6">
                                        <label className="form-label">
                                            Código
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={productoEditando.codigo}
                                            onChange={(e) =>
                                                setProductoEditando({
                                                    ...productoEditando,
                                                    codigo: e.target.value
                                                })
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">
                                            Nombre
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={productoEditando.nombre}
                                            onChange={(e) =>
                                                setProductoEditando({
                                                    ...productoEditando,
                                                    nombre: e.target.value
                                                })
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label">
                                            Descripción
                                        </label>
                                        <textarea
                                            className="form-control"
                                            rows="2"
                                            value={productoEditando.descripcion}
                                            onChange={(e) =>
                                                setProductoEditando({
                                                    ...productoEditando,
                                                    descripcion: e.target.value
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label">
                                            Precio de compra
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            className="form-control"
                                            value={productoEditando.precio_compra}
                                            onChange={(e) =>
                                                setProductoEditando({
                                                    ...productoEditando,
                                                    precio_compra: e.target.value
                                                })
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label">
                                            Precio de venta
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            className="form-control"
                                            value={productoEditando.precio_venta}
                                            onChange={(e) =>
                                                setProductoEditando({
                                                    ...productoEditando,
                                                    precio_venta: e.target.value
                                                })
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label">
                                            Stock mínimo
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="1"
                                            className="form-control"
                                            value={productoEditando.stock_minimo}
                                            onChange={(e) =>
                                                setProductoEditando({
                                                    ...productoEditando,
                                                    stock_minimo: e.target.value
                                                })
                                            }
                                            required
                                        />
                                    </div>

                                </div>

                                <div className="productos-form-actions">

                                    <button
                                        type="button"
                                        className="btn btn-light"
                                        onClick={() => setProductoEditando(null)}
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-productos"
                                        disabled={actualizando}
                                    >
                                        {actualizando
                                            ? 'Actualizando...'
                                            : 'Guardar cambios'}
                                    </button>

                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Tabla de productos */}
                <div className="productos-table-card">

                    <div className="productos-table-header">

                        <div>
                            <h5>Listado de productos</h5>
                            <small>
                                {productos.length} productos registrados
                            </small>
                        </div>

                        <div className="productos-search">
                            <i className="bi bi-search"></i>
                            <input
                                type="text"
                                placeholder="Buscar por nombre o código..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>

                    </div>

                    <div className="table-responsive">

                        <table className="table productos-table">

                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Producto</th>
                                    <th>Precio compra</th>
                                    <th>Precio venta</th>
                                    <th>Stock actual</th>
                                    <th>Stock mínimo</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>

                            <tbody>

                                {cargando ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4">
                                            Cargando productos...
                                        </td>
                                    </tr>

                                ) : productosFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4">
                                            No se encontraron productos.
                                        </td>
                                    </tr>

                                ) : (
                                    productosFiltrados.map((producto) => (
                                        <tr key={producto.id_producto}>

                                            <td>
                                                <span className="producto-codigo">
                                                    {producto.codigo}
                                                </span>
                                            </td>

                                            <td>
                                                <strong>{producto.nombre}</strong>
                                                <small className="d-block text-muted">
                                                    {producto.descripcion || 'Sin descripción'}
                                                </small>
                                            </td>

                                            <td>
                                                {formatoMoneda(producto.precio_compra)}
                                            </td>

                                            <td>
                                                {formatoMoneda(producto.precio_venta)}
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        Number(producto.stock_actual) <=
                                                        Number(producto.stock_minimo)
                                                            ? 'stock-bajo'
                                                            : 'stock-normal'
                                                    }
                                                >
                                                    {producto.stock_actual}
                                                </span>
                                            </td>

                                            <td>
                                                {producto.stock_minimo}
                                            </td>

                                            <td>
                                                <div className="d-flex gap-2">

                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        title="Editar producto"
                                                        onClick={() => iniciarEdicion(producto)}
                                                        disabled={desactivando}
                                                    >
                                                        <i className="bi bi-pencil-square"></i>
                                                    </button>

                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        title="Desactivar producto"
                                                        onClick={() =>
                                                            manejarDesactivacion(
                                                                producto.id_producto,
                                                                producto.nombre
                                                            )
                                                        }
                                                        disabled={desactivando}
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>

                                                </div>
                                            </td>

                                        </tr>
                                    ))
                                )}

                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Productos;

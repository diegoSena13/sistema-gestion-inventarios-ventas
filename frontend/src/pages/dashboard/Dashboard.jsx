
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Dashboard.css';

const Dashboard = () => {
    const { usuario } = useAuth();

    const [indicadores, setIndicadores] = useState({
        totalProductos: 0,
        unidadesInventario: 0,
        totalVentas: 0,
        ingresos: 0,
        productosBajoStock: 0
    });

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const cargarIndicadores = async () => {
            try {
                setCargando(true);
                setError('');

                const [respuestaProductos, respuestaVentas] =
                    await Promise.all([
                        api.get('/productos'),
                        api.get('/ventas')
                    ]);

                const productos = respuestaProductos.data.productos || [];
                const ventas = respuestaVentas.data.ventas || [];

                const unidadesInventario = productos.reduce(
                    (total, producto) =>
                        total + Number(producto.stock_actual),
                    0
                );

                const productosBajoStock = productos.filter(
                    producto =>
                        producto.activo !== false &&
                        Number(producto.stock_actual) <=
                        Number(producto.stock_minimo)
                ).length;

                const ventasCompletadas = ventas.filter(
                    venta => venta.estado === 'completada'
                );

                const ingresos = ventasCompletadas.reduce(
                    (total, venta) => total + Number(venta.total),
                    0
                );

                setIndicadores({
                    totalProductos: Number(respuestaProductos.data.total),
                    unidadesInventario,
                    totalVentas: ventasCompletadas.length,
                    ingresos,
                    productosBajoStock
                });

            } catch (error) {
                console.error('Error al cargar indicadores:', error);

                setError(
                    error.response?.data?.message ||
                    'No fue posible cargar la información del Dashboard.'
                );
            } finally {
                setCargando(false);
            }
        };

        cargarIndicadores();
    }, []);

    const formatoMoneda = (valor) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(valor);
    };

    return (
        <div className="dashboard-layout">
            <main className="dashboard-main">
                <div className="dashboard-content">

                    <div className="dashboard-welcome">
                        <div>
                            <h2>Panel principal</h2>
                            <p>
                                Bienvenido al sistema de gestión de
                                inventarios y ventas.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )}

                    {/* Indicadores principales */}
                    <div className="row g-4 mb-4">

                        <div className="col-12 col-md-6 col-xl-3">
                            <div className="dashboard-card">
                                <div className="dashboard-card-icon products-icon">
                                    <i className="bi bi-box-seam"></i>
                                </div>
                                <div>
                                    <span>Total de productos</span>
                                    <h3>
                                        {cargando ? '...' : indicadores.totalProductos}
                                    </h3>
                                    <small>Productos registrados</small>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-md-6 col-xl-3">
                            <div className="dashboard-card">
                                <div className="dashboard-card-icon inventory-icon">
                                    <i className="bi bi-clipboard-data"></i>
                                </div>
                                <div>
                                    <span>Unidades en inventario</span>
                                    <h3>
                                        {cargando ? '...' : indicadores.unidadesInventario}
                                    </h3>
                                    <small>Existencias actuales</small>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-md-6 col-xl-3">
                            <div className="dashboard-card">
                                <div className="dashboard-card-icon sales-icon">
                                    <i className="bi bi-cart-check"></i>
                                </div>
                                <div>
                                    <span>Ventas realizadas</span>
                                    <h3>
                                        {cargando ? '...' : indicadores.totalVentas}
                                    </h3>
                                    <small>Ventas completadas</small>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-md-6 col-xl-3">
                            <div className="dashboard-card">
                                <div className="dashboard-card-icon reports-icon">
                                    <i className="bi bi-currency-dollar"></i>
                                </div>
                                <div>
                                    <span>Ingresos por ventas</span>
                                    <h3 className="dashboard-income">
                                        {cargando
                                            ? '...'
                                            : formatoMoneda(indicadores.ingresos)}
                                    </h3>
                                    <small>Ventas completadas</small>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Accesos rápidos */}
                    <div className="dashboard-section">
                        <h5>Accesos rápidos</h5>
                        <p>Selecciona el módulo al que deseas ingresar.</p>

                        <div className="row g-3">

                            <div className="col-12 col-md-6 col-lg-3">
                                <Link
                                    to="/productos"
                                    className="quick-access-card"
                                >
                                    <i className="bi bi-box-seam"></i>
                                    <h6>Productos</h6>
                                    <span>Gestionar productos</span>
                                </Link>
                            </div>

                            <div className="col-12 col-md-6 col-lg-3">
                                <Link
                                    to="/inventario"
                                    className="quick-access-card"
                                >
                                    <i className="bi bi-clipboard-data"></i>
                                    <h6>Inventario</h6>
                                    <span>Controlar existencias</span>
                                </Link>
                            </div>

                            <div className="col-12 col-md-6 col-lg-3">
                                <Link
                                    to="/ventas"
                                    className="quick-access-card"
                                >
                                    <i className="bi bi-cart-check"></i>
                                    <h6>Ventas</h6>
                                    <span>Registrar y consultar ventas</span>
                                </Link>
                            </div>

                            {usuario?.rol === 'administrador' && (
                                <div className="col-12 col-md-6 col-lg-3">
                                    <Link
                                        to="/usuarios"
                                        className="quick-access-card"
                                    >
                                        <i className="bi bi-people"></i>
                                        <h6>Usuarios</h6>
                                        <span>Administrar usuarios</span>
                                    </Link>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Alerta de existencias */}
                    <div className={`dashboard-information ${
                        indicadores.productosBajoStock > 0
                            ? 'alerta-stock'
                            : 'stock-normal'
                    }`}>
                        <i className={`bi ${
                            indicadores.productosBajoStock > 0
                                ? 'bi-exclamation-triangle'
                                : 'bi-check-circle'
                        }`}></i>

                        <span>
                            {cargando
                                ? 'Consultando el estado del inventario...'
                                : indicadores.productosBajoStock > 0
                                    ? `${indicadores.productosBajoStock} producto(s) tienen existencias iguales o inferiores al stock mínimo.`
                                    : 'No hay productos con existencias iguales o inferiores al stock mínimo.'
                            }
                        </span>

                        {!cargando && indicadores.productosBajoStock > 0 && (
                            <Link to="/inventario">
                                Revisar inventario
                            </Link>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Dashboard;

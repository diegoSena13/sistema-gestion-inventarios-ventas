
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
    const { usuario } = useAuth();

    const enlaces = [
        {
            nombre: 'Panel principal',
            ruta: '/dashboard',
            icono: 'bi-speedometer2'
        },
        {
            nombre: 'Productos',
            ruta: '/productos',
            icono: 'bi-box-seam'
        },
        {
            nombre: 'Inventario',
            ruta: '/inventario',
            icono: 'bi-clipboard-data'
        },
        {
            nombre: 'Ventas',
            ruta: '/ventas',
            icono: 'bi-cart-check'
        }
    ];

    // Solo los administradores pueden ver este enlace
    if (usuario?.rol === 'administrador') {
        enlaces.push({
            nombre: 'Usuarios',
            ruta: '/usuarios',
            icono: 'bi-people'
        });
    }

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="sidebar-logo">
                    <i className="bi bi-box-seam"></i>
                </div>
                <div>
                    <h5>Gestión de Inventarios y Ventas</h5>
                    <small>Inventarios y ventas</small>
                </div>
            </div>

            <div className="sidebar-section">
                <span>MENÚ PRINCIPAL</span>
            </div>

            <nav className="sidebar-nav">
                {enlaces.map((enlace) => (
                    <NavLink
                        key={enlace.ruta}
                        to={enlace.ruta}
                        end={enlace.ruta === '/dashboard'}
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? 'active' : ''}`
                        }
                    >
                        <i className={`bi ${enlace.icono}`}></i>
                        <span>{enlace.nombre}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <i className="bi bi-shield-check"></i>
                <span>Sistema seguro</span>
            </div>
        </aside>
    );
};

export default Sidebar;

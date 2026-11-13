
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { usuario, logout } = useAuth();

    return (
        <header className="main-navbar">
            <div>
                <h6 className="mb-0">Sistema de gestión</h6>
                <small>Administración del negocio</small>
            </div>

            <div className="navbar-user">
                <div className="navbar-user-info">
                    <strong>Usuario #{usuario?.id}</strong>
                    <small>{usuario?.rol}</small>
                </div>

                <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={logout}
                >
                    <i className="bi bi-box-arrow-right me-1"></i>
                    Salir
                </button>
            </div>
        </header>
    );
};

export default Navbar;

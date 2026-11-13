
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, rolPermitido }) => {
    const { autenticado, cargando, usuario } = useAuth();

    if (cargando) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    if (!autenticado) {
        return <Navigate to="/login" replace />;
    }

    // Validar si la ruta requiere un rol específico
    if (rolPermitido && usuario?.rol !== rolPermitido) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default PrivateRoute;


import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const manejarEnvio = async (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);

        try {
            await login(correo, password);
            navigate('/dashboard');
        } catch (error) {
            setError(
                error.response?.data?.message ||
                'No fue posible iniciar sesión. Verifica tus credenciales.'
            );
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-icon">
                        <i className="bi bi-box-seam"></i>
                    </div>

                    <h2>Gestión de Inventarios</h2>
                    <p>Ingresa tus credenciales para continuar</p>
                </div>

                <form onSubmit={manejarEnvio}>
                    <div className="mb-3">
                        <label className="form-label">Correo electrónico</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="correo@ejemplo.com"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Contraseña</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Ingresa tu contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-login w-100"
                        disabled={cargando}
                    >
                        {cargando ? 'Ingresando...' : 'Iniciar sesión'}
                    </button>
                </form>

                <div className="login-footer">
                    Sistema de gestión de inventarios y ventas
                </div>
            </div>
        </div>
    );
};

export default Login;

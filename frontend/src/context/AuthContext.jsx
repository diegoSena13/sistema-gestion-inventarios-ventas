
import { createContext, useContext, useState, useEffect } from 'react';
import { iniciarSesion, verificarSesion } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const comprobarAutenticacion = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setCargando(false);
                return;
            }

            try {
                const respuesta = await verificarSesion();
                setUsuario(respuesta.usuario);
            } catch (error) {
                localStorage.removeItem('token');
                setUsuario(null);
            } finally {
                setCargando(false);
            }
        };

        comprobarAutenticacion();
    }, []);

    const login = async (correo, password) => {
        const respuesta = await iniciarSesion(correo, password);

        localStorage.setItem('token', respuesta.token);

        const sesion = await verificarSesion();
        setUsuario(sesion.usuario);

        return sesion.usuario;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUsuario(null);
    };

    return (
        <AuthContext.Provider
            value={{
                usuario,
                cargando,
                autenticado: !!usuario,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};

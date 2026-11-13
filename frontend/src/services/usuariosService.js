
import api from './api';

// Listar usuarios
export const listarUsuarios = async () => {
    const respuesta = await api.get('/usuarios');
    return respuesta.data;
};

// Crear usuario
export const crearUsuario = async (usuario) => {
    const respuesta = await api.post('/usuarios', usuario);
    return respuesta.data;
};

// Desactivar usuario
export const desactivarUsuario = async (id) => {
    const respuesta = await api.patch(`/usuarios/${id}/desactivar`);
    return respuesta.data;
};

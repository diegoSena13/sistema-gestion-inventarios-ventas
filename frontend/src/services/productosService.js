
import api from './api';

// Consultar todos los productos activos
export const listarProductos = async () => {
    const respuesta = await api.get('/productos');
    return respuesta.data;
};

// Consultar un producto por su ID
export const obtenerProducto = async (id) => {
    const respuesta = await api.get(`/productos/${id}`);
    return respuesta.data;
};

// Registrar un producto
export const crearProducto = async (producto) => {
    const respuesta = await api.post('/productos', producto);
    return respuesta.data;
};

// Actualizar un producto
export const actualizarProducto = async (id, producto) => {
    const respuesta = await api.put(`/productos/${id}`, producto);
    return respuesta.data;
};

// Desactivar un producto
export const desactivarProducto = async (id) => {
    const respuesta = await api.delete(`/productos/${id}`);
    return respuesta.data;
};

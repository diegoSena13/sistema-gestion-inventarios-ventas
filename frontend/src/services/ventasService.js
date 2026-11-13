
import api from './api';

// Registrar una venta
export const registrarVenta = async (productos) => {
    const respuesta = await api.post('/ventas', { productos });
    return respuesta.data;
};

// Consultar todas las ventas o filtrar por fechas
export const listarVentas = async (filtros = {}) => {
    const respuesta = await api.get('/ventas', {
        params: filtros
    });

    return respuesta.data;
};

// Consultar el detalle de una venta
export const obtenerVenta = async (id) => {
    const respuesta = await api.get(`/ventas/${id}`);
    return respuesta.data;
};

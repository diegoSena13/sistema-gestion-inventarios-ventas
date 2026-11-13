
import api from './api';

// Registrar una entrada, salida o ajuste de inventario
export const registrarMovimiento = async (idProducto, movimiento) => {
    const respuesta = await api.post(
        `/inventario/${idProducto}/movimientos`,
        movimiento
    );

    return respuesta.data;
};

// Consultar movimientos de un producto
export const listarMovimientos = async (idProducto, filtros = {}) => {
    const respuesta = await api.get(
        `/inventario/${idProducto}/movimientos`,
        {
            params: filtros
        }
    );

    return respuesta.data;
};

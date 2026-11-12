
-- ==========================================
-- SISTEMA DE GESTION DE INVENTARIOS Y VENTAS
-- Base de datos: gestion_inventarios_ventas
-- ==========================================

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(30) NOT NULL DEFAULT 'usuario'
        CHECK (rol IN ('administrador', 'usuario')),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
    id_producto SERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio_compra NUMERIC(12,2) NOT NULL DEFAULT 0
        CHECK (precio_compra >= 0),
    precio_venta NUMERIC(12,2) NOT NULL
        CHECK (precio_venta >= 0),
    stock_actual INTEGER NOT NULL DEFAULT 0
        CHECK (stock_actual >= 0),
    stock_minimo INTEGER NOT NULL DEFAULT 0
        CHECK (stock_minimo >= 0),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS movimientos_inventario (
    id_movimiento SERIAL PRIMARY KEY,

    id_producto INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,

    tipo_movimiento VARCHAR(20) NOT NULL
        CHECK (tipo_movimiento IN ('entrada', 'salida', 'ajuste')),

    cantidad INTEGER NOT NULL
        CHECK (cantidad >= 0),

    stock_anterior INTEGER NOT NULL
        CHECK (stock_anterior >= 0),

    stock_nuevo INTEGER NOT NULL
        CHECK (stock_nuevo >= 0),

    observacion TEXT,

    fecha_movimiento TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_movimiento_producto
        FOREIGN KEY (id_producto)
        REFERENCES productos(id_producto),

    CONSTRAINT fk_movimiento_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
);


CREATE TABLE IF NOT EXISTS ventas (
    id_venta SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    total NUMERIC(12,2) NOT NULL DEFAULT 0
        CHECK (total >= 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'completada'
        CHECK (estado IN ('completada', 'anulada')),
    fecha_venta TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_venta_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
);

CREATE TABLE IF NOT EXISTS detalle_ventas (
    id_detalle SERIAL PRIMARY KEY,
    id_venta INTEGER NOT NULL,
    id_producto INTEGER NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(12,2) NOT NULL
        CHECK (precio_unitario >= 0),
    subtotal NUMERIC(12,2) NOT NULL
        CHECK (subtotal >= 0),

    CONSTRAINT fk_detalle_venta
        FOREIGN KEY (id_venta)
        REFERENCES ventas(id_venta),

    CONSTRAINT fk_detalle_producto
        FOREIGN KEY (id_producto)
        REFERENCES productos(id_producto)
);


-- Índices para facilitar las consultas
CREATE INDEX IF NOT EXISTS idx_productos_nombre
ON productos(nombre);

CREATE INDEX IF NOT EXISTS idx_productos_activos
ON productos(activo);

CREATE INDEX IF NOT EXISTS idx_usuarios_correo
ON usuarios(correo);

CREATE INDEX IF NOT EXISTS idx_movimientos_producto
ON movimientos_inventario(id_producto);

CREATE INDEX IF NOT EXISTS idx_movimientos_usuario
ON movimientos_inventario(id_usuario);

CREATE INDEX IF NOT EXISTS idx_movimientos_fecha
ON movimientos_inventario(fecha_movimiento);

CREATE INDEX IF NOT EXISTS idx_ventas_fecha
ON ventas(fecha_venta);

CREATE INDEX IF NOT EXISTS idx_ventas_usuario
ON ventas(id_usuario);

CREATE INDEX IF NOT EXISTS idx_detalle_venta
ON detalle_ventas(id_venta);

CREATE INDEX IF NOT EXISTS idx_detalle_producto
ON detalle_ventas(id_producto);

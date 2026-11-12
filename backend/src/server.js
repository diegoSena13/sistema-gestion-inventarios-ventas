const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/database');
const authRoutes = require('./routes/auth.routes');
const productosRoutes = require('./routes/productos.routes');
const inventarioRoutes = require('./routes/inventario.routes');
const ventasRoutes = require('./routes/ventas.routes');


const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta inicial para verificar el funcionamiento de la API
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API del Sistema de Gestión de Inventarios y Ventas funcionando correctamente'
    });
});

app.get('/api/db-test', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW() AS fecha');

        res.status(200).json({
            success: true,
            message: 'Conexión con PostgreSQL exitosa',
            fecha: result.rows[0].fecha
        });
    } catch (error) {
        console.error('Error de conexión:', error.message);

        res.status(500).json({
            success: false,
            message: 'No fue posible conectar con PostgreSQL'
        });
    }
});

app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/ventas', ventasRoutes);


// Puerto del servidor
const PORT = process.env.PORT || 3000;

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

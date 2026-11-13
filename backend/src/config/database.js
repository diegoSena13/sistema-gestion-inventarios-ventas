
const { Pool } = require('pg');
require('dotenv').config();

const configuracion = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    }
    : {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    };

const pool = new Pool(configuracion);

pool.on('connect', () => {
    console.log('Conexión establecida con PostgreSQL');
});

pool.on('error', (error) => {
    console.error('Error inesperado en PostgreSQL:', error.message);
});

module.exports = pool;

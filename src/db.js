// db.js — Conexión a PostgreSQL usando un pool de conexiones.
// Un pool mantiene varias conexiones abiertas y las reutiliza,
// evitando abrir/cerrar una conexión nueva en cada petición.

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'restaurante',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Verificar que la conexión funciona al iniciar
pool.connect((err, client, release) => {
  if (err) {
    console.error('ERROR conectando a la base de datos:', err.message);
  } else {
    console.log('>>> Conexión a PostgreSQL establecida.');
    release(); // Devolver la conexión al pool
  }
});

module.exports = pool;

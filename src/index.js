// src/index.js — Punto de entrada del servidor Express.
// Aquí se registran todos los middlewares y rutas.

require('dotenv').config(); // Cargar variables de entorno desde .env
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middlewares globales ──────────────────────────────────────
app.use(cors());            // Permitir peticiones desde cualquier origen (útil en desarrollo)
app.use(express.json());    // Parsear body de las peticiones como JSON

// Servir archivos estáticos del frontend (carpeta public/)
app.use(express.static(path.join(__dirname, '..', 'public')));

// ── Rutas de la API ───────────────────────────────────────────
// Cada archivo de rutas se encarga de un recurso específico.
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/productos',   require('./routes/productos'));
app.use('/api/clientes',    require('./routes/clientes'));
app.use('/api/empleados',   require('./routes/empleados'));
app.use('/api/ingredientes',require('./routes/ingredientes'));
app.use('/api/ordenes',     require('./routes/ordenes'));
app.use('/api/facturas',    require('./routes/facturas'));
app.use('/api/reportes',    require('./routes/reportes'));

// ── Ruta raíz de la API (health check) ───────────────────────
app.get('/api', (req, res) => {
  res.json({
    version: '1.0.0',
    endpoints: [
      'GET  /api/productos',
      'GET  /api/productos/sobre-promedio',
      'GET  /api/clientes',
      'GET  /api/empleados',
      'GET  /api/ingredientes',
      'GET  /api/ordenes',
      'GET  /api/facturas',
      'GET  /api/reportes/productos-mas-vendidos',
      'GET  /api/reportes/ordenes-sin-factura',
      'GET  /api/reportes/clientes-efectivo-sobre-promedio',
      'GET  /api/reportes/resumen-ingresos',
      'GET  /api/reportes/inventario-critico',
    ]
  });
});

// ── Iniciar servidor ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n Servidor corriendo en http://localhost:${PORT}`);
  console.log(`   Frontend: http://localhost:${PORT}`);
  console.log(`   API:      http://localhost:${PORT}/api\n`);
});

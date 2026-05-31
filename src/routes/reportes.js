// routes/reportes.js
// Endpoints de consultas especiales: vistas y subconsultas.

const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// GET /reportes/productos-mas-vendidos
// Usa la VISTA vista_productos_vendidos.
// Muestra cuántas unidades se han vendido de cada producto.
router.get('/productos-mas-vendidos', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT * FROM vista_productos_vendidos
      ORDER BY total_vendido DESC
    `);
    res.json(resultado.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /reportes/ordenes-sin-factura
// SUBCONSULTA con NOT EXISTS.
// Encuentra órdenes que están "Pagada" pero no tienen factura registrada.
// Útil para detectar inconsistencias en la caja.
router.get('/ordenes-sin-factura', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT o.id, o.fecha_orden, o.estado, c.nombre AS cliente
      FROM   ordenes o
      JOIN   clientes c ON c.id = o.id_cliente
      WHERE  o.estado = 'Pagada'
        AND  NOT EXISTS (
               SELECT 1 FROM facturas f WHERE f.id_orden = o.id
             )
      ORDER BY o.fecha_orden
    `);
    res.json(resultado.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /reportes/clientes-efectivo-sobre-promedio
// SUBCONSULTA en HAVING.
// Clientes que pagan en efectivo y cuyo promedio de factura
// supera el promedio general de facturas en efectivo.
router.get('/clientes-efectivo-sobre-promedio', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT c.nombre, ROUND(AVG(f.precio), 2) AS promedio_factura
      FROM   clientes c
      JOIN   ordenes  o ON o.id_cliente = c.id
      JOIN   facturas f ON f.id_orden   = o.id
      WHERE  f.forma_pago = 'Efectivo'
      GROUP  BY c.nombre
      HAVING AVG(f.precio) > (
               SELECT AVG(precio) FROM facturas WHERE forma_pago = 'Efectivo'
             )
      ORDER BY promedio_factura DESC
    `);
    res.json(resultado.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /reportes/resumen-ingresos
// Resumen de ingresos: total facturado, número de órdenes pagadas
// y ticket promedio. Útil para el gerente.
router.get('/resumen-ingresos', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT
        COUNT(*)                      AS total_facturas,
        SUM(precio)                   AS ingresos_totales,
        ROUND(AVG(precio), 2)         AS ticket_promedio,
        SUM(CASE WHEN forma_pago='Efectivo' THEN precio ELSE 0 END) AS total_efectivo,
        SUM(CASE WHEN forma_pago='Tarjeta'  THEN precio ELSE 0 END) AS total_tarjeta
      FROM facturas
    `);
    res.json(resultado.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /reportes/inventario-critico
// Lista ingredientes con stock bajo (cantidad < 10).
// Ayuda al cocinero a saber qué re-stockear.
router.get('/inventario-critico', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT id, nombre, cantidad, unidad
      FROM   ingredientes
      WHERE  cantidad < 10
      ORDER  BY cantidad ASC
    `);
    res.json(resultado.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

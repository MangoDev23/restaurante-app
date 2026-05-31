// routes/facturas.js — Gestión de facturas

const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// GET /facturas
router.get('/', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT f.*, o.id_cliente, c.nombre AS cliente
      FROM   facturas f
      JOIN   ordenes o  ON o.id = f.id_orden
      JOIN   clientes c ON c.id = o.id_cliente
      ORDER  BY f.fecha_pago DESC
    `);
    res.json(resultado.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /facturas/sobre-promedio
// SUBCONSULTA: facturas con precio mayor al promedio de todas las facturas.
router.get('/sobre-promedio', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT f.id, f.id_orden, f.precio, f.fecha_pago, f.forma_pago,
             c.nombre AS cliente
      FROM   facturas f
      JOIN   ordenes  o ON o.id = f.id_orden
      JOIN   clientes c ON c.id = o.id_cliente
      WHERE  f.precio > (SELECT AVG(precio) FROM facturas)
      ORDER  BY f.precio DESC
    `);
    res.json(resultado.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /facturas/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await pool.query(
      `SELECT f.*, c.nombre AS cliente
       FROM   facturas f
       JOIN   ordenes  o ON o.id = f.id_orden
       JOIN   clientes c ON c.id = o.id_cliente
       WHERE  f.id = $1`, [id]
    );
    if (resultado.rowCount === 0) return res.status(404).json({ error: 'Factura no encontrada' });
    res.json(resultado.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /facturas — Registrar pago de una orden
// Body: { id_orden, precio, forma_pago }
router.post('/', async (req, res) => {
  try {
    const { id_orden, precio, forma_pago = 'Efectivo' } = req.body;
    if (!id_orden || precio == null) {
      return res.status(400).json({ error: 'id_orden y precio son obligatorios' });
    }

    // Verificar que la orden existe y está terminada
    const orden = await pool.query('SELECT estado FROM ordenes WHERE id=$1', [id_orden]);
    if (orden.rowCount === 0) return res.status(404).json({ error: 'Orden no encontrada' });
    if (!['Terminada', 'Pagada'].includes(orden.rows[0].estado)) {
      return res.status(409).json({ error: 'Solo se pueden facturar órdenes en estado "Terminada"' });
    }

    // Verificar que no tenga ya una factura
    const existing = await pool.query('SELECT id FROM facturas WHERE id_orden=$1', [id_orden]);
    if (existing.rowCount > 0) return res.status(409).json({ error: 'Esta orden ya tiene una factura' });

    const resultado = await pool.query(
      `INSERT INTO facturas (id_orden, precio, forma_pago)
       VALUES ($1, $2, $3) RETURNING *`,
      [id_orden, precio, forma_pago]
    );

    // Marcar la orden como Pagada
    await pool.query('UPDATE ordenes SET estado=$1 WHERE id=$2', ['Pagada', id_orden]);

    res.status(201).json(resultado.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

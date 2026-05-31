// routes/ingredientes.js — CRUD ingredientes 

const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// GET /ingredientes — con alerta de stock bajo (< 10 unidades)
router.get('/', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT *, (cantidad < 10) AS stock_bajo
      FROM   ingredientes
      ORDER  BY nombre
    `);
    res.json(resultado.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /ingredientes/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await pool.query('SELECT * FROM ingredientes WHERE id=$1', [id]);
    if (resultado.rowCount === 0) return res.status(404).json({ error: 'Ingrediente no encontrado' });
    res.json(resultado.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /ingredientes
router.post('/', async (req, res) => {
  try {
    const { nombre, cantidad = 0, unidad } = req.body;
    if (!nombre || !unidad) return res.status(400).json({ error: 'nombre y unidad son obligatorios' });

    const resultado = await pool.query(
      'INSERT INTO ingredientes (nombre, cantidad, unidad) VALUES ($1,$2,$3) RETURNING *',
      [nombre, cantidad, unidad]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /ingredientes/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, cantidad, unidad } = req.body;
    const resultado = await pool.query(
      'UPDATE ingredientes SET nombre=$1, cantidad=$2, unidad=$3 WHERE id=$4 RETURNING *',
      [nombre, cantidad, unidad, id]
    );
    if (resultado.rowCount === 0) return res.status(404).json({ error: 'Ingrediente no encontrado' });
    res.json(resultado.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /ingredientes/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await pool.query('DELETE FROM ingredientes WHERE id=$1', [id]);
    if (resultado.rowCount === 0) return res.status(404).json({ error: 'Ingrediente no encontrado' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -- CASO DE USO: Pedir re-stock
// PATCH /ingredientes/:id/restock
// Incrementa la cantidad de un ingrediente (Cocinero / Gerente).
// Body: { cantidad: 50 }  → suma esa cantidad al stock actual.
router.patch('/:id/restock', async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad } = req.body;

    if (!cantidad || cantidad <= 0) {
      return res.status(400).json({ error: 'La cantidad a agregar debe ser mayor a 0' });
    }

    const resultado = await pool.query(
      `UPDATE ingredientes
       SET    cantidad = cantidad + $1
       WHERE  id = $2
       RETURNING *`,
      [cantidad, id]
    );
    if (resultado.rowCount === 0) return res.status(404).json({ error: 'Ingrediente no encontrado' });
    res.json({ mensaje: 'Stock actualizado', ingrediente: resultado.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

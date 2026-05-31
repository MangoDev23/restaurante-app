// routes/clientes.js — CRUD Clientes 

const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// GET /clientes — lista todos los clientes
router.get('/', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM clientes ORDER BY nombre');
    res.json(resultado.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /clientes/:id — un cliente con su historial de órdenes
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const cliente = await pool.query('SELECT * FROM clientes WHERE id = $1', [id]);
    if (cliente.rowCount === 0) return res.status(404).json({ error: 'Cliente no encontrado' });

    const ordenes = await pool.query(
      `SELECT o.id, o.fecha_orden, o.estado
       FROM   ordenes o
       WHERE  o.id_cliente = $1
       ORDER  BY o.fecha_orden DESC`,
      [id]
    );

    res.json({ ...cliente.rows[0], ordenes: ordenes.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /clientes — crear cliente 
router.post('/', async (req, res) => {
  try {
    const { nombre, correo, telefono } = req.body;
    if (!nombre || !correo) return res.status(400).json({ error: 'nombre y correo son obligatorios' });

    const resultado = await pool.query(
      'INSERT INTO clientes (nombre, correo, telefono) VALUES ($1, $2, $3) RETURNING *',
      [nombre, correo, telefono]
    );
    res.status(201).json(resultado.rows[0]); // Creado exitosamente
  } catch (err) {
    // Código 23505 = violación de restricción UNIQUE (correo duplicado)
    if (err.code === '23505') return res.status(409).json({ error: 'El correo ya está registrado' });
    res.status(500).json({ error: err.message });
  }
});

// PUT /clientes/:id — actualizar
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, correo, telefono } = req.body;

    const resultado = await pool.query(
      'UPDATE clientes SET nombre=$1, correo=$2, telefono=$3 WHERE id=$4 RETURNING *',
      [nombre, correo, telefono, id]
    );
    if (resultado.rowCount === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(resultado.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'El correo ya está registrado' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /clientes/:id — eliminar 
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await pool.query('DELETE FROM clientes WHERE id=$1', [id]);
    if (resultado.rowCount === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.status(204).send(); // Eliminado exitosamente, sin contenido en la respuesta
  } catch (err) {
    // Código 23503 = FK violation (el cliente tiene órdenes asociadas)
    if (err.code === '23503') return res.status(409).json({ error: 'No se puede eliminar: el cliente tiene órdenes' });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

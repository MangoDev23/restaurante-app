// routes/empleados.js — CRUD Empleados

const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// GET /empleados
router.get('/', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM empleados ORDER BY rol, nombre');
    res.json(resultado.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /empleados/:id — con sus órdenes atendidas
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const emp = await pool.query('SELECT * FROM empleados WHERE id=$1', [id]);
    if (emp.rowCount === 0) return res.status(404).json({ error: 'Empleado no encontrado' });

    const ordenes = await pool.query(
      `SELECT id, fecha_orden, estado FROM ordenes WHERE id_empleado=$1 ORDER BY fecha_orden DESC`,
      [id]
    );
    res.json({ ...emp.rows[0], ordenes_atendidas: ordenes.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /empleados
router.post('/', async (req, res) => {
  try {
    const { nombre, correo, telefono, rol, salario } = req.body;
    if (!nombre || !correo || !rol) return res.status(400).json({ error: 'nombre, correo y rol son obligatorios' });

    const resultado = await pool.query(
      'INSERT INTO empleados (nombre, correo, telefono, rol, salario) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [nombre, correo, telefono, rol, salario]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Ese correo ya está registrado' });
    res.status(500).json({ error: err.message });
  }
});

// PUT /empleados/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, correo, telefono, rol, salario } = req.body;
    const resultado = await pool.query(
      'UPDATE empleados SET nombre=$1, correo=$2, telefono=$3, rol=$4, salario=$5 WHERE id=$6 RETURNING *',
      [nombre, correo, telefono, rol, salario, id]
    );
    if (resultado.rowCount === 0) return res.status(404).json({ error: 'Empleado no encontrado' });
    res.json(resultado.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Ese correo ya está registrado' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /empleados/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await pool.query('DELETE FROM empleados WHERE id=$1', [id]);
    if (resultado.rowCount === 0) return res.status(404).json({ error: 'Empleado no encontrado' });
    res.status(204).send();
  } catch (err) {
    if (err.code === '23503') return res.status(409).json({ error: 'No se puede eliminar: el empleado tiene órdenes asignadas' });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

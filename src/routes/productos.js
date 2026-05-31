// routes/productos.js
// CRUD completo para la entidad Productos
// También incluye un endpoint con subconsulta 

const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// GET /productos
// Retorna todos los productos. Acepta ?categoria=Fast Food para filtrar.
router.get('/', async (req, res) => {
  try {
    const { categoria } = req.query;
    let query  = 'SELECT * FROM productos ORDER BY categoria, nombre';
    let params = [];

    if (categoria) {
      query  = 'SELECT * FROM productos WHERE categoria = $1 ORDER BY nombre';
      params = [categoria];
    }

    const resultado = await pool.query(query, params);
    res.json(resultado.rows); // Retorna un array de productos
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /productos/sobre-promedio
// SUBCONSULTA: productos cuyo precio es mayor al promedio general.
// La subconsulta (SELECT AVG...) se evalúa primero y su resultado
// se usa como filtro en el WHERE.
router.get('/sobre-promedio', async (req, res) => {
  try {
    const query = `
      SELECT id, nombre, precio, categoria
      FROM   productos
      WHERE  precio > (SELECT AVG(precio) FROM productos)
      ORDER  BY precio DESC
    `;
    const resultado = await pool.query(query);
    res.json(resultado.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /productos/:id
// Retorna un producto por su id junto con sus ingredientes.
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Datos básicos del producto
    const prod = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);
    if (prod.rowCount === 0) return res.status(404).json({ error: 'Producto no encontrado' });

    // Ingredientes asociados (JOIN de tres tablas)
    const ingredientes = await pool.query(`
      SELECT i.nombre, pi.cantidad, i.unidad
      FROM   productos_ingredientes pi
      JOIN   ingredientes i ON i.id = pi.id_ingrediente
      WHERE  pi.id_producto = $1
    `, [id]);

    res.json({ ...prod.rows[0], ingredientes: ingredientes.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /productos
// Crea un nuevo producto. Retorna 201 Created con el registro insertado.
router.post('/', async (req, res) => {
  try {
    const { nombre, precio, categoria, disponible = true } = req.body;
    if (!nombre || precio == null) {
      return res.status(400).json({ error: 'nombre y precio son obligatorios' });
    }

    const resultado = await pool.query(
      `INSERT INTO productos (nombre, precio, categoria, disponible)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [nombre, precio, categoria, disponible]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /productos/:id
// Actualiza un producto existente.
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, precio, categoria, disponible } = req.body;

    const resultado = await pool.query(
      `UPDATE productos
       SET nombre = $1, precio = $2, categoria = $3, disponible = $4
       WHERE id = $5
       RETURNING *`,
      [nombre, precio, categoria, disponible, id]
    );
    if (resultado.rowCount === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(resultado.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /productos/:id
// Elimina un producto. Retorna 204 No Content si tuvo éxito.
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await pool.query('DELETE FROM productos WHERE id = $1', [id]);
    if (resultado.rowCount === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.status(204).send(); // Sin cuerpo
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

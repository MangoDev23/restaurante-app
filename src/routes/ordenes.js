// routes/ordenes.js
// Usa la VISTA vista_ordenes_detalle.
// Incluye el caso de uso "Finalizar orden + ajustar inventario".

const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// GET /ordenes
// Usa la vista vista_ordenes_detalle que ya hace los JOINs.
// Acepta ?estado=Pagada para filtrar por estado.
router.get('/', async (req, res) => {
  try {
    const { estado } = req.query;
    let query  = 'SELECT * FROM vista_ordenes_detalle ORDER BY fecha_orden DESC';
    let params = [];

    if (estado) {
      query  = 'SELECT * FROM vista_ordenes_detalle WHERE estado=$1 ORDER BY fecha_orden DESC';
      params = [estado];
    }

    const resultado = await pool.query(query, params);
    res.json(resultado.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /ordenes/:id
// Detalle completo de una orden: info de la vista + productos que incluye.
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Info general de la orden (via vista)
    const orden = await pool.query(
      'SELECT * FROM vista_ordenes_detalle WHERE id=$1', [id]
    );
    if (orden.rowCount === 0) return res.status(404).json({ error: 'Orden no encontrada' });

    // Productos de la orden
    const productos = await pool.query(`
      SELECT p.nombre, p.precio, op.cantidad,
             (p.precio * op.cantidad) AS subtotal
      FROM   ordenes_productos op
      JOIN   productos p ON p.id = op.id_producto
      WHERE  op.id_orden = $1
    `, [id]);

    // Total calculado
    const total = productos.rows.reduce((sum, r) => sum + parseFloat(r.subtotal), 0);

    res.json({ ...orden.rows[0], productos: productos.rows, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /ordenes 
// Crear una orden con sus productos.
// Body: { id_cliente, id_empleado, productos: [{id_producto, cantidad}] }
router.post('/', async (req, res) => {
  const client = await pool.connect(); // Usamos transacción para garantizar consistencia
  try {
    const { id_cliente, id_empleado, productos } = req.body;
    if (!id_cliente || !id_empleado || !productos?.length) {
      return res.status(400).json({ error: 'id_cliente, id_empleado y al menos un producto son obligatorios' });
    }

    await client.query('BEGIN');

    // 1. Insertar la orden
    const orden = await client.query(
      `INSERT INTO ordenes (id_cliente, id_empleado, estado)
       VALUES ($1, $2, 'En preparación') RETURNING *`,
      [id_cliente, id_empleado]
    );
    const id_orden = orden.rows[0].id;

    // 2. Insertar cada producto en ordenes_productos
    for (const p of productos) {
      await client.query(
        'INSERT INTO ordenes_productos (id_orden, id_producto, cantidad) VALUES ($1,$2,$3)',
        [id_orden, p.id_producto, p.cantidad]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ mensaje: 'Orden creada', id_orden });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PATCH /ordenes/:id/estado 
// Cambiar el estado de una orden (Cajero, Gerente).
// Body: { estado: "Terminada" | "Pagada" | "Anulada" }
router.patch('/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const estadosValidos = ['En preparación', 'Terminada', 'Pagada', 'Anulada'];

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: `Estado inválido. Opciones: ${estadosValidos.join(', ')}` });
    }

    const resultado = await pool.query(
      'UPDATE ordenes SET estado=$1 WHERE id=$2 RETURNING *',
      [estado, id]
    );
    if (resultado.rowCount === 0) return res.status(404).json({ error: 'Orden no encontrada' });
    res.json(resultado.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /ordenes/:id/finalizar
// CASO DE USO: Finalizar una orden y descontar ingredientes del inventario.
// Cuando una orden pasa a "Terminada", se calcula cuántos ingredientes
// se usaron (productos × cantidad × receta) y se resta del stock.
router.post('/:id/finalizar', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    // Verificar que la orden existe y está en preparación
    const ordenActual = await client.query('SELECT estado FROM ordenes WHERE id=$1', [id]);
    if (ordenActual.rowCount === 0) return res.status(404).json({ error: 'Orden no encontrada' });
    if (ordenActual.rows[0].estado !== 'En preparación') {
      return res.status(409).json({ error: 'La orden no está "En preparación"' });
    }

    await client.query('BEGIN');

    // 1. Obtener todos los ingredientes necesarios para esta orden
    //    (productos_ingredientes × cantidad de cada producto en la orden)
    const ingredientesUsados = await client.query(`
      SELECT pi.id_ingrediente,
             SUM(pi.cantidad * op.cantidad) AS total_usado
      FROM   ordenes_productos op
      JOIN   productos_ingredientes pi ON pi.id_producto = op.id_producto
      WHERE  op.id_orden = $1
      GROUP  BY pi.id_ingrediente
    `, [id]);

    // 2. Descontar cada ingrediente del inventario
    for (const ing of ingredientesUsados.rows) {
      await client.query(
        'UPDATE ingredientes SET cantidad = cantidad - $1 WHERE id = $2',
        [ing.total_usado, ing.id_ingrediente]
      );
    }

    // 3. Cambiar estado de la orden a "Terminada"
    const ordenActualizada = await client.query(
      'UPDATE ordenes SET estado=$1 WHERE id=$2 RETURNING *',
      ['Terminada', id]
    );

    await client.query('COMMIT');
    res.json({
      mensaje: 'Orden finalizada e inventario ajustado',
      orden: ordenActualizada.rows[0],
      ingredientes_descontados: ingredientesUsados.rows.length
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// DELETE /ordenes/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await pool.query('DELETE FROM ordenes WHERE id=$1', [id]);
    if (resultado.rowCount === 0) return res.status(404).json({ error: 'Orden no encontrada' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

// routes/auth.js — Login simple por correo electrónico.
// No hay contraseñas en la BD, así que solo verificamos que el correo existe.
// Para un proyecto real se agregaría bcrypt + JWT.

const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// POST /api/auth/login
// Body: { correo }
// Retorna los datos del empleado (id, nombre, rol) o 401 si no existe.
router.post('/login', async (req, res) => {
  try {
    const { correo } = req.body;
    if (!correo) return res.status(400).json({ error: 'El correo es obligatorio' });

    const resultado = await pool.query(
      'SELECT id, nombre, rol, telefono FROM empleados WHERE correo = $1',
      [correo.trim().toLowerCase()]
    );

    if (resultado.rowCount === 0) {
      return res.status(401).json({ error: 'Correo no encontrado. Verifica tus datos.' });
    }

    res.json({ empleado: resultado.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

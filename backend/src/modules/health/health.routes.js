const { Router } = require('express');
const pool = require('../../config/database');

const router = Router();

router.get('/probar-bd', async (req, res) => {
    const [fila] = await pool.query('SELECT DATABASE() AS base_datos');
    res.json({ mensaje: 'Conexión exitosa con MariaDB', base_datos: fila.base_datos });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.get('/', (req, res) => {

    db.all(`
        SELECT p.nombre,
               SUM(l.cantidad_restante) as stock,
               SUM(l.cantidad_restante * l.precio_costo_unitario) as valor
        FROM productos p
        JOIN lotes l ON p.id = l.producto_id
        GROUP BY p.id
    `, (err, rows) => {
        if (err) return res.status(500).json(err);

        res.json(rows);
    });
});

module.exports = router;
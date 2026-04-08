const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.get('/resumen', (req, res) => {

    db.all(`
        SELECT 
            SUM(CASE WHEN tipo_pago = 'CUP' AND estado='PAGADO' THEN dv.cantidad * dv.precio_venta_unitario ELSE 0 END) as efectivo,
            SUM(CASE WHEN tipo_pago = 'CUPD' AND estado='PAGADO' THEN dv.cantidad * dv.precio_venta_unitario ELSE 0 END) as digital,
            SUM(CASE WHEN estado='PENDIENTE' THEN dv.cantidad * dv.precio_venta_unitario ELSE 0 END) as por_cobrar
        FROM ventas v
        JOIN detalle_venta dv ON v.id = dv.venta_id
    `, (err, rows) => {
        if (err) return res.status(500).json(err);

        res.json(rows[0]);
    });
});

module.exports = router;
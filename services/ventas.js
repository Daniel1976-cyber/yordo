const express = require('express');
const router = express.Router();
const { registrarVenta } = require('../services/ventasService');

router.post('/', async (req, res) => {
    try {
        const resultado = await registrarVenta(req.body);
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
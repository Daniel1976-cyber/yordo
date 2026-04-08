const path = require('path');
const express = require('express');
const app = express();

app.use(express.json());

// servir frontend
app.use(express.static(path.join(__dirname, 'public')));

// Ruta raíz - servir index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rutas API
const ventasRoutes = require('./routes/ventas');
const inventarioRoutes = require('./routes/inventario');
const reportesRoutes = require('./routes/reportes');
const metricasRoutes = require('./routes/metricas');

app.use('/ventas', ventasRoutes);
app.use('/inventario', inventarioRoutes);
app.use('/reportes', reportesRoutes);
app.use('/metricas', metricasRoutes);

// Servidor
app.listen(3000, () => {
    console.log("Servidor corriendo en puerto 3000");
});
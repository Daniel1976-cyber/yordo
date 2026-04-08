const sqlite3 = require('sqlite3').verbose();

// Crear la base de datos en memoria o en archivo
const db = new sqlite3.Database('./db/yordo.db', (err) => {
    if (err) {
        console.error('Error al abrir la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite');
    }
});

module.exports = db;
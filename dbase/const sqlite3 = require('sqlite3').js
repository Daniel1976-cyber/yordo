const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./inventario.db', (err) => {
    if (err) {
        console.error("Error conectando a DB", err);
    } else {
        console.log("Conectado a SQLite");
    }
});

module.exports = db;
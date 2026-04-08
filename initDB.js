const db = require('./db/database');

db.serialize(() => {

    db.run(`
    CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT UNIQUE,
        unidad TEXT
    )`);

    db.run(`
    CREATE TABLE IF NOT EXISTS lotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        producto_id INTEGER,
        cantidad_inicial REAL,
        cantidad_restante REAL,
        precio_costo_unitario REAL,
        fecha TEXT
    )`);

    db.run(`
    CREATE TABLE IF NOT EXISTS ventas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha TEXT,
        tipo_pago TEXT,
        estado TEXT,
        cliente TEXT
    )`);

    db.run(`
    CREATE TABLE IF NOT EXISTS detalle_venta (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        venta_id INTEGER,
        producto_id INTEGER,
        cantidad REAL,
        precio_venta_unitario REAL
    )`);

});

console.log("Tablas creadas");
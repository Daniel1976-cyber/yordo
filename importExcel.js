const ExcelJS = require('exceljs');
const db = require('./db/database');

async function importarExcel() {

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('./data/compras.xlsx');

    const sheet = workbook.getWorksheet(1);

    sheet.eachRow((row, rowNumber) => {

        if (rowNumber === 1) return;

        const fecha = row.getCell(1).value;
        const nombreProducto = row.getCell(2).value;
        const unidad = row.getCell(3).value;
        const cantidad = row.getCell(4).value;
        const costo = row.getCell(5).value;

        // Insertar producto si no existe
        db.run(
            `INSERT OR IGNORE INTO productos (nombre, unidad) VALUES (?, ?)`,
            [nombreProducto, unidad],
            function (err) {
                if (err) return console.error(err);

                db.get(
                    `SELECT id FROM productos WHERE nombre = ?`,
                    [nombreProducto],
                    (err, producto) => {

                        if (err) return console.error(err);

                        const productoId = producto.id;

                        // Crear lote
                        db.run(
                            `INSERT INTO lotes 
                            (producto_id, cantidad_inicial, cantidad_restante, precio_costo_unitario, fecha)
                            VALUES (?, ?, ?, ?, ?)`,
                            [productoId, cantidad, cantidad, costo, fecha],
                            (err) => {
                                if (err) console.error(err);
                            }
                        );
                    }
                );
            }
        );

    });

    console.log("✅ Importación completada");
}

importarExcel();
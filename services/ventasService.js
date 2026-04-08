const db = require('../db/database');

async function registrarVenta(venta) {
    return new Promise((resolve, reject) => {

        const { fecha, tipo_pago, estado, cliente, productos } = venta;

        db.serialize(() => {

            db.run(
                `INSERT INTO ventas (fecha, tipo_pago, estado, cliente) VALUES (?, ?, ?, ?)`,
                [fecha, tipo_pago, estado, cliente],
                function (err) {
                    if (err) return reject(err);

                    const ventaId = this.lastID;
                    let costoTotal = 0;

                    productos.forEach((prod) => {

                        const { producto_id, cantidad, precio_venta } = prod;

                        // FIFO: buscar lotes disponibles
                        db.all(
                            `SELECT * FROM lotes 
                             WHERE producto_id = ? AND cantidad_restante > 0
                             ORDER BY fecha ASC`,
                            [producto_id],
                            (err, lotes) => {
                                if (err) return reject(err);

                                let cantidadNecesaria = cantidad;

                                for (let lote of lotes) {

                                    if (cantidadNecesaria <= 0) break;

                                    let cantidadTomada = Math.min(
                                        cantidadNecesaria,
                                        lote.cantidad_restante
                                    );

                                    // calcular costo
                                    costoTotal += cantidadTomada * lote.precio_costo_unitario;

                                    // actualizar lote
                                    db.run(
                                        `UPDATE lotes SET cantidad_restante = cantidad_restante - ? WHERE id = ?`,
                                        [cantidadTomada, lote.id]
                                    );

                                    cantidadNecesaria -= cantidadTomada;
                                }

                                // guardar detalle venta
                                db.run(
                                    `INSERT INTO detalle_venta 
                                     (venta_id, producto_id, cantidad, precio_venta_unitario)
                                     VALUES (?, ?, ?, ?)`,
                                    [ventaId, producto_id, cantidad, precio_venta]
                                );
                            }
                        );

                    });

                    resolve({
                        mensaje: "Venta registrada",
                        ventaId
                    });
                }
            );

        });

    });
}

module.exports = { registrarVenta };
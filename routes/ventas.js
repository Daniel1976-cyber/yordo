const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');

// Helper: extraer valor numérico de una celda (puede ser objeto con .result)
function getCellValue(cell) {
    if (cell === null || cell === undefined) return 0;
    if (typeof cell === 'object' && cell.result !== undefined) {
        return typeof cell.result === 'number' ? cell.result : parseFloat(cell.result) || 0;
    }
    return typeof cell === 'number' ? cell : parseFloat(cell) || 0;
}

// Helper: formatear fecha a string YYYY-MM-DD
function formatDate(date) {
    if (!date) return 'Sin fecha';
    if (date instanceof Date) {
        return date.toISOString().split('T')[0];
    }
    return String(date).split('T')[0];
}

router.get('/', async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile('./data/ventas.xlsx');
        
        const sheet = workbook.getWorksheet(1);
        const ventasPorFecha = {};
        let primerFecha = null;
        
        sheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Saltar encabezado
            
            const fechaRaw = row.getCell(1).value;
            const importeVenta = getCellValue(row.getCell(6));
            const utilidad = getCellValue(row.getCell(8));
            
            if (!fechaRaw) return;
            
            const fecha = formatDate(fechaRaw);
            
            // Registrar primera fecha
            if (!primerFecha) primerFecha = fecha;
            
            // Agrupar por fecha
            if (!ventasPorFecha[fecha]) {
                ventasPorFecha[fecha] = { fecha, ventas: 0, utilidad: 0 };
            }
            ventasPorFecha[fecha].ventas += importeVenta;
            ventasPorFecha[fecha].utilidad += utilidad;
        });
        
        // Convertir a array y ordenar por fecha
        const ventas = Object.values(ventasPorFecha).sort((a, b) => a.fecha.localeCompare(b.fecha));
        
        // Calcular totales
        const totales = ventas.reduce((acc, item) => {
            acc.totalVentas += item.ventas;
            acc.totalUtilidad += item.utilidad;
            return acc;
        }, { totalVentas: 0, totalUtilidad: 0, primerFecha });
        
        res.json({ ventas, totales });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Registrar una nueva venta
router.post('/', async (req, res) => {
    try {
        const { fecha, producto, cantidad, precio, tipo_pago, estado, cliente } = req.body;
        
        if (!producto || !cantidad || !precio) {
            return res.status(400).json({ error: 'Producto, cantidad y precio son requeridos' });
        }
        
        // Abrir el archivo de ventas
        let workbook = new ExcelJS.Workbook();
        let sheet;
        
        try {
            await workbook.xlsx.readFile('./data/ventas.xlsx');
            sheet = workbook.getWorksheet(1);
        } catch (err) {
            // Si no existe, crear uno nuevo
            sheet = workbook.addWorksheet('Ventas');
        }

        // Definir columnas SIEMPRE para asegurar el mapeo correcto por 'key'
        sheet.columns = [
            { header: 'Fecha', key: 'fecha', width: 12 },
            { header: 'Producto', key: 'producto', width: 25 },
            { header: 'Tipo Pago', key: 'tipo_pago', width: 10 },
            { header: 'Estado', key: 'estado', width: 10 },
            { header: 'Cantidad', key: 'cantidad', width: 10 },
            { header: 'Importe Venta', key: 'importe_venta', width: 15 },
            { header: 'Cliente', key: 'cliente', width: 20 },
            { header: 'Utilidad', key: 'utilidad', width: 15 }
        ];
        
        // Calcular importe y utilidad (estimada al 30% si no hay costo)
        const importeVenta = cantidad * precio;
        const utilidadEstimada = importeVenta * 0.3; // 30% margen estimado
        
        // Agregar nueva fila usando el mapeo de llaves definido arriba
        sheet.addRow({
            fecha: fecha || new Date().toISOString().split('T')[0],
            producto: producto,
            tipo_pago: tipo_pago || 'CUP',
            estado: estado || 'PAGADO',
            cantidad: parseInt(cantidad),
            importe_venta: importeVenta,
            cliente: cliente || '',
            utilidad: utilidadEstimada
        });
        
        // Guardar archivo
        await workbook.xlsx.writeFile('./data/ventas.xlsx');
        
        res.json({
            mensaje: 'Venta registrada exitosamente',
            venta: {
                fecha: fecha || new Date().toISOString().split('T')[0],
                producto,
                cantidad: parseInt(cantidad),
                precio: parseFloat(precio),
                importe: importeVenta,
                tipo_pago: tipo_pago || 'CUP',
                estado: estado || 'PAGADO',
                cliente: cliente || ''
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET: Listar ventas recientes (últimas 20)
router.get('/recientes', async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile('./data/ventas.xlsx');
        
        const sheet = workbook.getWorksheet(1);
        const ventas = [];
        
        sheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Saltar encabezado
            
            const fechaRaw = row.getCell(1).value;
            const producto = row.getCell(2).value;
            const tipoPago = row.getCell(3).value;
            const estado = row.getCell(4).value;
            const cantidad = getCellValue(row.getCell(5));
            const importeVenta = getCellValue(row.getCell(6));
            const cliente = row.getCell(7).value;
            const utilidad = getCellValue(row.getCell(8));
            
            const fecha = fechaRaw ? (fechaRaw instanceof Date ? fechaRaw.toISOString().split('T')[0] : String(fechaRaw).split('T')[0]) : 'Sin fecha';
            const productoStr = producto ? (typeof producto === 'object' ? producto.text || producto.result || String(producto) : String(producto)) : '';
            
            ventas.push({
                fecha,
                producto: productoStr,
                tipo_pago: tipoPago || 'CUP',
                estado: estado || 'PAGADO',
                cantidad,
                importe: importeVenta,
                cliente: cliente || '',
                utilidad
            });
        });
        
        // Devolver las últimas 20 ventas (más recientes primero)
        const recientes = ventas.reverse().slice(0, 20);
        
        res.json({ ventas: recientes, total: ventas.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
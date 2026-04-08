const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');

// Helper: extraer valor numérico de una celda
function getCellValue(cell) {
    if (cell === null || cell === undefined) return 0;
    if (typeof cell === 'object' && cell.result !== undefined) {
        return typeof cell.result === 'number' ? cell.result : parseFloat(cell.result) || 0;
    }
    return typeof cell === 'number' ? cell : parseFloat(cell) || 0;
}

router.get('/', async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile('./data/compras.xlsx');
        
        const sheet = workbook.getWorksheet(1);
        const productos = {};
        
        sheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;
            
            const nombre = row.getCell(2).value;
            const cantidad = getCellValue(row.getCell(4));
            const costo = getCellValue(row.getCell(5));
            
            if (nombre) {
                const nombreStr = typeof nombre === 'object' ? nombre.text || nombre.result || String(nombre) : String(nombre);
                
                if (!productos[nombreStr]) {
                    // Calcular precio de venta sugerido (costo + 50% margen)
                    const precioVentaSugerido = costo > 0 ? Math.round(costo * 1.5 * 100) / 100 : 0;
                    productos[nombreStr] = { 
                        nombre: nombreStr, 
                        stock: 0, 
                        valor: 0,
                        costo: 0,
                        precioVentaSugerido: precioVentaSugerido
                    };
                }
                productos[nombreStr].stock += cantidad;
                productos[nombreStr].valor += cantidad * costo;
                // Actualizar costo al último valor encontrado
                productos[nombreStr].costo = costo;
                // Recalcular precio sugerido con el último costo
                productos[nombreStr].precioVentaSugerido = costo > 0 ? Math.round(costo * 1.5 * 100) / 100 : 0;
            }
        });
        
        res.json(Object.values(productos));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
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

// Helper: obtener texto de una celda
function getCellText(cell) {
    if (cell === null || cell === undefined) return '';
    if (typeof cell === 'object' && cell.text !== undefined) return cell.text;
    if (typeof cell === 'object' && cell.result !== undefined) return String(cell.result);
    return String(cell);
}

// Helper: formatear fecha
function formatDate(date) {
    if (!date) return 'Sin fecha';
    if (date instanceof Date) {
        return date.toISOString().split('T')[0];
    }
    return String(date).split('T')[0];
}

// Helper: obtener día de la semana
function getDayOfWeek(date) {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    if (date instanceof Date) {
        return dias[date.getDay()];
    }
    const d = new Date(date);
    return dias[d.getDay()];
}

router.get('/', async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile('./data/ventas.xlsx');
        
        const sheet = workbook.getWorksheet(1);
        
        // Estructuras para métricas
        const productos = {};
        const ventasPorDiaSemana = {};
        let totalVentas = 0;
        let totalUtilidad = 0;
        let totalTransacciones = 0;
        let ultimaFecha = null;
        let primeraFecha = null;
        
        sheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Saltar encabezado
            
            const fechaRaw = row.getCell(1).value;
            const producto = getCellText(row.getCell(2)); // Columna 2: nombre producto
            const cantidad = getCellValue(row.getCell(5));
            const importeVenta = getCellValue(row.getCell(6));
            const utilidad = getCellValue(row.getCell(8));
            
            if (!fechaRaw) return;
            
            const fecha = formatDate(fechaRaw);
            const diaSemana = getDayOfWeek(fechaRaw instanceof Date ? fechaRaw : new Date(fechaRaw));
            
            // Registrar fechas
            if (!primeraFecha) primeraFecha = fecha;
            ultimaFecha = fecha;
            
            // Contar transacciones (cada fila es una transacción)
            totalTransacciones++;
            
            // Métricas por producto
            if (producto && producto !== '') {
                if (!productos[producto]) {
                    productos[producto] = { 
                        nombre: producto, 
                        cantidadVendida: 0, 
                        ingresoTotal: 0, 
                        utilidadTotal: 0 
                    };
                }
                productos[producto].cantidadVendida += cantidad;
                productos[producto].ingresoTotal += importeVenta;
                productos[producto].utilidadTotal += utilidad;
            }
            
            // Ventas por día de la semana
            if (!ventasPorDiaSemana[diaSemana]) {
                ventasPorDiaSemana[diaSemana] = { dia: diaSemana, ventas: 0, utilidad: 0, transacciones: 0 };
            }
            ventasPorDiaSemana[diaSemana].ventas += importeVenta;
            ventasPorDiaSemana[diaSemana].utilidad += utilidad;
            ventasPorDiaSemana[diaSemana].transacciones++;
            
            // Totales generales
            if (!isNaN(importeVenta)) totalVentas += importeVenta;
            if (!isNaN(utilidad)) totalUtilidad += utilidad;
        });
        
        // Top 5 productos por cantidad vendida
        const topProductosCantidad = Object.values(productos)
            .sort((a, b) => b.cantidadVendida - a.cantidadVendida)
            .slice(0, 5)
            .map(p => ({
                ...p,
                margen: p.ingresoTotal > 0 ? ((p.utilidadTotal / p.ingresoTotal) * 100).toFixed(1) : 0
            }));
        
        // Top 5 productos por ingreso
        const topProductosIngreso = Object.values(productos)
            .sort((a, b) => b.ingresoTotal - a.ingresoTotal)
            .slice(0, 5)
            .map(p => ({
                ...p,
                margen: p.ingresoTotal > 0 ? ((p.utilidadTotal / p.ingresoTotal) * 100).toFixed(1) : 0
            }));
        
        // Margen de ganancia por producto
        const margenPorProducto = Object.values(productos)
            .map(p => ({
                nombre: p.nombre,
                margen: p.ingresoTotal > 0 ? ((p.utilidadTotal / p.ingresoTotal) * 100).toFixed(1) : 0,
                utilidadTotal: p.utilidadTotal,
                ingresoTotal: p.ingresoTotal
            }))
            .sort((a, b) => parseFloat(b.margen) - parseFloat(a.margen));
        
        // Ventas por día de la semana (orden correcto)
        const ordenDias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const ventasPorDia = ordenDias
            .filter(dia => ventasPorDiaSemana[dia])
            .map(dia => ({
                ...ventasPorDiaSemana[dia],
                ticketPromedio: ventasPorDiaSemana[dia].transacciones > 0 
                    ? (ventasPorDiaSemana[dia].ventas / ventasPorDiaSemana[dia].transacciones).toFixed(2) 
                    : 0
            }));
        
        // Resumen general
        const resumen = {
            totalVentas,
            totalUtilidad,
            margenGeneral: totalVentas > 0 ? ((totalUtilidad / totalVentas) * 100).toFixed(1) : 0,
            ticketPromedio: totalTransacciones > 0 ? (totalVentas / totalTransacciones).toFixed(2) : 0,
            totalTransacciones,
            periodo: { primeraFecha, ultimaFecha }
        };
        
        res.json({
            resumen,
            topProductosCantidad,
            topProductosIngreso,
            margenPorProducto,
            ventasPorDia
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.get('/ingenieria', async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile('./data/ventas.xlsx');
        const sheet = workbook.getWorksheet(1);
        
        const productos = {};
        
        sheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;
            
            const nombre = getCellText(row.getCell(2));
            const cantidad = getCellValue(row.getCell(5));
            const utilidad = getCellValue(row.getCell(8));
            
            if (nombre && nombre !== '') {
                if (!productos[nombre]) {
                    productos[nombre] = { nombre, cantidad: 0, utilidadTotal: 0 };
                }
                productos[nombre].cantidad += cantidad;
                productos[nombre].utilidadTotal += utilidad;
            }
        });
        
        const listaProductos = Object.values(productos).map(p => ({
            ...p,
            utilidadUnitaria: p.cantidad > 0 ? p.utilidadTotal / p.cantidad : 0
        }));
        
        if (listaProductos.length === 0) {
            return res.json({ categorias: {}, promedios: {} });
        }
        
        // Calcular promedios para los umbrales
        const totalCantidad = listaProductos.reduce((sum, p) => sum + p.cantidad, 0);
        const totalUtilidadUnitaria = listaProductos.reduce((sum, p) => sum + p.utilidadUnitaria, 0);
        
        const mediaPopularidad = totalCantidad / listaProductos.length;
        const mediaRentabilidad = totalUtilidadUnitaria / listaProductos.length;
        
        const categorias = {
            estrellas: {
                titulo: 'Estrellas',
                descripcion: 'Alta popularidad y alta rentabilidad. Son tus mejores productos. ¡Mantenlos siempre disponibles!',
                productos: []
            },
            caballitos: {
                titulo: 'Caballitos de Batalla',
                descripcion: 'Muy populares pero dejan poca ganancia. Intenta reducir sus costos o ajustar levemente su precio.',
                productos: []
            },
            rompecabezas: {
                titulo: 'Rompecabezas',
                descripcion: 'Dejan mucha ganancia pero se venden poco. Necesitan más promoción o una mejor ubicación.',
                productos: []
            },
            perros: {
                titulo: 'Perros',
                descripcion: 'Baja popularidad y baja ganancia. Considera eliminarlos o reemplazarlos por algo más rentable.',
                productos: []
            }
        };
        
        listaProductos.forEach(p => {
            const esPopular = p.cantidad >= mediaPopularidad;
            const esRentable = p.utilidadUnitaria >= mediaRentabilidad;
            
            if (esPopular && esRentable) categorias.estrellas.productos.push(p);
            else if (esPopular && !esRentable) categorias.caballitos.productos.push(p);
            else if (!esPopular && esRentable) categorias.rompecabezas.productos.push(p);
            else categorias.perros.productos.push(p);
        });
        
        res.json({
            categorias,
            promedios: {
                popularidad: mediaPopularidad.toFixed(2),
                rentabilidad: mediaRentabilidad.toFixed(2)
            }
        });
        
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

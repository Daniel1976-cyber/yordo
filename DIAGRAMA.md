# 📊 Diagrama del Proyecto Yordo

## Estructura General

```
yordo/
├── 📁 db/
│   ├── database.js        → Conexión a SQLite
│   └── yordo.db          → Base de datos SQLite
│
├── 📁 services/
│   ├── app.js            → Servidor Express principal
│   ├── ventas.js         → Router de ventas (API REST)
│   ├── ventasService.js  → Lógica de negocio de ventas (FIFO)
│   ├── inventario.js    → Router de inventario
│   └── reportes.js      → Router de reportes
│
├── initDB.js             → Inicialización de tablas
└── package.json          → Dependencias
```

---

## 🗄️ Base de Datos (SQLite)

### Tablas

| Tabla | Descripción | Campos |
|-------|-------------|--------|
| **productos** | Catálogo de productos | id, nombre (UNIQUE), unidad |
| **lotes** | Control de inventario por lotes | id, producto_id, cantidad_inicial, cantidad_restante, precio_costo_unitario, fecha |
| **ventas** | Registro de ventas | id, fecha, tipo_pago, estado, cliente |
| **detalle_venta** | Items de cada venta | id, venta_id, producto_id, cantidad, precio_venta_unitario |

---

## 🔄 Flujo de Datos

```
                    ┌─────────────────┐
                    │   Cliente       │
                    │  (Frontend)    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   app.js        │
                    │  Express Server │
                    │   Puerto 3000   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │ ventas   │   │inventario│   │reportes  │
        │  Router │   │  Router  │   │  Router  │
        └────┬─────┘   └────┬─────┘   └────┬─────┘
             │              │              │
             ▼              │              │
     ┌───────────────┐      │              │
     │ventasService  │      │              │
     │  (FIFO logic) │      │              │
     └───────┬───────┘      │              │
             │              │              │
             └──────┬───────┘              │
                    ▼                      ▼
            ┌────────────────────────────────┐
            │      database.js               │
            │   sqlite3 (yordo.db)          │
            └────────────────────────────────┘
```

---

## 📡 Endpoints API

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/ventas` | Registrar una venta |
| GET | `/inventario` | Ver stock y valor del inventario |
| GET | `/reportes/resumen` | Resumen de ventas (efectivo, digital, por cobrar) |

---

## 🔧 Lógica de Negocio

### Ventas (FIFO - First In First Out)
```
1. Se recibe la venta con lista de productos
2. Para cada producto:
   a. Se buscan lotes disponibles ordenados por fecha
   b. Se descuenta del lote más antiguo (FIFO)
   c. Se calcula el costo basado en precio_costo_unitario
3. Se registra la venta y su detalle
```

---

## 📦 Dependencias

- **express** - Framework web
- **sqlite3** - Base de datos
- **body-parser** - Parseo de JSON
- **cors** - CORS headers
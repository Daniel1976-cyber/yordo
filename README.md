# Yordo - Dashboard de Gestión Empresarial

Dashboard profesional diseñado para la gestión en tiempo real de ventas, métricas financieras e ingeniería de menú. 

![Dashboard Preview](https://raw.githubusercontent.com/Daniel1976-cyber/yordo/main/public/index.html) *(Nota: Sustituir por imagen real si se desea)*

## 🚀 Características
- **Métricas en Tiempo Real:** Visualización instantánea de Ingresos, Utilidad y Márgenes.
- **Ingeniería de Menú:** Clasificación estratégica de productos (Estrellas, Caballitos, Rompecabezas, Perros).
- **Gestión de Inventario:** Control de stock sincronizado con las ventas.
- **Persistencia en Excel:** Los datos se guardan y leen directamente de archivos `.xlsx` para fácil portabilidad.
- **Diseño Enterprise:** Interfaz limpia, responsive y orientada a datos.

## 🛠️ Requisitos
- [Node.js](https://nodejs.org/) (Versión 14 o superior)
- npm (incluido con Node.js)

## 💻 Instalación y Ejecución

Si quieres correr este proyecto en otra computadora:

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/Daniel1976-cyber/yordo.git
   cd yordo
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Prepara los datos:**
   Asegúrate de tener una carpeta `data/` con los archivos `ventas.xlsx` y `compras.xlsx`. (Opcional: el sistema los creará vacíos si no existen al registrar la primera venta).

4. **Inicia el servidor:**
   ```bash
   node app.js
   ```

5. **Abre el navegador:**
   Visita `http://localhost:3000`

## 📂 Estructura del Proyecto
- `/public`: Interfaz de usuario (HTML/CSS/JS).
- `/routes`: Endpoints de la API para métricas, ventas e inventario.
- `/data`: Archivos de datos Excel (ignorados en git por seguridad).
- `app.js`: Entrada principal del servidor Express.

---
Desarrollado con ❤️ para la optimización de negocios.

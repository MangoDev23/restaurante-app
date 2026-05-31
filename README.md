# RestauranteApp 🍽️

Sistema de gestión de restaurante con API REST + PostgreSQL.

## Descripción

Aplicación web para gestionar las operaciones diarias de un restaurante: empleados, clientes, productos del menú, inventario de ingredientes, órdenes y facturación. Permite a los empleados crear y gestionar pedidos, ajustar el inventario automáticamente y generar reportes de ventas.

**Usuarios:** Gerente, Cajero/a, Mesero/a, Cocinero/a.

---

## Integrantes

| Nombre | Rol en el proyecto |
|--------|-------------------|
| ...    | ...               |

---

## Requisitos previos

- Node.js v18 o superior
- PostgreSQL 14 o superior
- npm (incluido con Node.js)

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/restaurante-app.git
cd restaurante-app

# 2. Instalar dependencias
npm install

# 3. Crear la base de datos en PostgreSQL
#    (desde psql o pgAdmin)
CREATE DATABASE restaurante;

# 4. Cargar el esquema y datos de prueba
psql -U postgres -d restaurante -f sql/restaurante.sql

# 5. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL

# 6. Iniciar el servidor
npm start
# Servidor disponible en http://localhost:3000
```

---

## Diagrama ER

> *(Agregar imagen del diagrama aquí — exportar desde DBeaver o dbdiagram.io)*

---

## Endpoints de la API

### Productos
| Método | URL | Descripción |
|--------|-----|-------------|
| GET    | /api/productos | Todos los productos |
| GET    | /api/productos/:id | Producto con sus ingredientes |
| GET    | /api/productos/sobre-promedio | **[Subconsulta]** Productos con precio > promedio |
| POST   | /api/productos | Crear producto |
| PUT    | /api/productos/:id | Actualizar producto |
| DELETE | /api/productos/:id | Eliminar producto |

### Clientes
| Método | URL | Descripción |
|--------|-----|-------------|
| GET    | /api/clientes | Todos los clientes |
| GET    | /api/clientes/:id | Cliente + historial de órdenes |
| POST   | /api/clientes | Crear cliente |
| PUT    | /api/clientes/:id | Actualizar cliente |
| DELETE | /api/clientes/:id | Eliminar cliente |

### Empleados
| Método | URL | Descripción |
|--------|-----|-------------|
| GET    | /api/empleados | Todos los empleados |
| GET    | /api/empleados/:id | Empleado + órdenes atendidas |
| POST   | /api/empleados | Crear empleado |
| PUT    | /api/empleados/:id | Actualizar empleado |
| DELETE | /api/empleados/:id | Eliminar empleado |

### Ingredientes / Inventario
| Método | URL | Descripción |
|--------|-----|-------------|
| GET    | /api/ingredientes | Inventario completo (con flag `stock_bajo`) |
| GET    | /api/ingredientes/:id | Un ingrediente |
| POST   | /api/ingredientes | Crear ingrediente |
| PUT    | /api/ingredientes/:id | Actualizar ingrediente |
| DELETE | /api/ingredientes/:id | Eliminar ingrediente |
| PATCH  | /api/ingredientes/:id/restock | **[RF]** Agregar stock |

### Órdenes
| Método | URL | Descripción |
|--------|-----|-------------|
| GET    | /api/ordenes | **[Vista]** Todas las órdenes con cliente y empleado |
| GET    | /api/ordenes/:id | Detalle completo con productos y total |
| POST   | /api/ordenes | Crear orden (transacción) |
| PATCH  | /api/ordenes/:id/estado | Cambiar estado |
| POST   | /api/ordenes/:id/finalizar | **[RF]** Finalizar y ajustar inventario |
| DELETE | /api/ordenes/:id | Eliminar orden |

### Facturas
| Método | URL | Descripción |
|--------|-----|-------------|
| GET    | /api/facturas | Historial de facturas |
| GET    | /api/facturas/:id | Una factura |
| GET    | /api/facturas/sobre-promedio | **[Subconsulta]** Facturas con precio > promedio |
| POST   | /api/facturas | Registrar pago y marcar orden como Pagada |

### Reportes
| Método | URL | Descripción |
|--------|-----|-------------|
| GET    | /api/reportes/productos-mas-vendidos | **[Vista]** Ranking por unidades vendidas |
| GET    | /api/reportes/ordenes-sin-factura | **[Subconsulta NOT EXISTS]** Órdenes pagadas sin factura |
| GET    | /api/reportes/clientes-efectivo-sobre-promedio | **[Subconsulta HAVING]** Mejores clientes en efectivo |
| GET    | /api/reportes/resumen-ingresos | Totales, ticket promedio |
| GET    | /api/reportes/inventario-critico | Ingredientes con stock < 10 |

---

## Requerimientos funcionales implementados (R5)

1. **RF1 — Crear y gestionar órdenes**: Un mesero puede crear una orden asignando cliente, empleado y productos. La orden inicia en estado "En preparación".

2. **RF2 — Finalizar orden y ajustar inventario automáticamente**: Al finalizar una orden (`POST /ordenes/:id/finalizar`), el sistema calcula los ingredientes utilizados (cruzando la receta de cada producto con la cantidad pedida) y los descuenta del inventario en una sola transacción. La orden pasa a estado "Terminada".

3. **RF3 — Re-stock de ingredientes**: El cocinero o gerente puede solicitar re-stock (`PATCH /ingredientes/:id/restock`) indicando cuántas unidades agregar. El frontend muestra alertas de ingredientes con stock crítico (< 10).

4. **RF4 — Generación de facturas y cierre de caja**: El cajero registra el pago de una orden terminada (`POST /facturas`) con forma de pago y monto. La orden se marca automáticamente como "Pagada". El reporte de ingresos muestra el total facturado, desglosado por efectivo y tarjeta.

5. **RF5 — Reportes de consulta**: Subconsultas y vistas permiten identificar los productos más vendidos, órdenes sin factura, y clientes con mayor gasto en efectivo.

---

## Stack tecnológico

- **Backend**: Node.js + Express
- **Base de datos**: PostgreSQL
- **Driver DB**: pg (node-postgres)
- **Frontend**: HTML + CSS + JavaScript vanilla (sin frameworks)

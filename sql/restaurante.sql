---------------------
-- CREACIÓN TABLAS --
---------------------
-- Limpiar si ya existen --
DROP TABLE IF EXISTS ordenes_productos      CASCADE;
DROP TABLE IF EXISTS productos_ingredientes CASCADE;
DROP TABLE IF EXISTS facturas               CASCADE;
DROP TABLE IF EXISTS ordenes                CASCADE;
DROP TABLE IF EXISTS clientes               CASCADE;
DROP TABLE IF EXISTS empleados              CASCADE;
DROP TABLE IF EXISTS productos              CASCADE;
DROP TABLE IF EXISTS ingredientes           CASCADE;

-- Tabla: Empleados
CREATE TABLE empleados (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    correo VARCHAR(50) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    rol VARCHAR(20) NOT NULL,
    salario NUMERIC(12,2)
);

-- Tabla: Clientes
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20)
);

-- Tabla: Productos
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    precio NUMERIC(8,2) NOT NULL CHECK (precio >= 0),
    categoria VARCHAR(30),
    disponible BOOL NOT NULL DEFAULT true
);

-- Tabla: Ingredientes
CREATE TABLE ingredientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    cantidad NUMERIC(6,3) NOT NULL DEFAULT 0.0 CHECK (cantidad >= 0),
    unidad VARCHAR(20) NOT NULL
);

-- Tabla: Ordenes
CREATE TABLE ordenes (
    id SERIAL PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_empleado INT NOT NULL,
    fecha_orden DATE NOT NULL DEFAULT CURRENT_DATE,
    estado VARCHAR(20) NOT NULL DEFAULT 'En preparación',
    FOREIGN KEY (id_cliente) REFERENCES clientes(id),
    FOREIGN KEY (id_empleado) REFERENCES empleados(id)
);

-- Tabla: Facturas
CREATE TABLE facturas (
    id SERIAL PRIMARY KEY,
    id_orden INT NOT NULL,
    precio NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
    fecha_pago DATE NOT NULL DEFAULT CURRENT_DATE,
    forma_pago VARCHAR(20) DEFAULT 'Efectivo',
    FOREIGN KEY (id_orden) REFERENCES ordenes(id)
);

-- relación muchos a muchos entre órdenes y productos
CREATE TABLE ordenes_productos (
    id_orden INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    PRIMARY KEY (id_orden, id_producto),
    FOREIGN KEY (id_orden) REFERENCES ordenes(id) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id)
);

-- relación muchos a muchos con cantidad del ingrediente usado por producto
CREATE TABLE productos_ingredientes (
    id_producto INT NOT NULL,
    id_ingrediente INT NOT NULL,
    cantidad NUMERIC(10,3) NOT NULL CHECK (cantidad > 0),
    PRIMARY KEY (id_producto, id_ingrediente),
    FOREIGN KEY (id_producto) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (id_ingrediente) REFERENCES ingredientes(id)
);

----------------------
-- Datos de ejemplo --
----------------------

INSERT INTO clientes (nombre, correo, telefono) VALUES
    ('Ana García'   , 'analu_23@example.com'    , '321-XXX-1231'),
    ('Carlos Pérez' , 'carlos.perez@example.com', '301-XXX-5678'),
    ('María López'  , 'marialopez98@example.com', '312-XXX-9012'),
    ('Luis Martínez', 'luismar_gg@example.com'  , '310-XXX-3456');

INSERT INTO empleados (nombre, correo, telefono, rol, salario) VALUES
    ('Juan Rodríguez',  'juan.rodriguez@example.com' , '301-XXX-1234', 'Gerente',   2500000.00),
    ('Ana Martínez',    'ana.martinez@example.com'   , '301-XXX-5678', 'Cajero/a',  1500000.00),
    ('Luis Fernández',  'luis.fernandez@example.com' , '301-XXX-9012', 'Cocinero/a',2000000.00),
    ('Sofía Gómez',     'sofia.gomez@example.com'    , '301-XXX-3456', 'Mesero/a',  1500000.00),
    ('Carlos Sánchez',  'carlos.sanchez@example.com' , '301-XXX-7890', 'Mesero/a',  1800000.00),
    ('María Torres',    'maria.torres@example.com'   , '301-XXX-1111', 'Mesero/a',  1500000.00);

INSERT INTO productos (nombre, precio, categoria, disponible) VALUES
    ('Hamburguesa',            15000.00, 'Fast Food',       TRUE),
    ('Pizza',                  12500.00, 'Fast Food',       TRUE),
    ('Pechuga gratinada',      21000.00, 'Ejecutivo',       TRUE),
    ('Cheesecake de maracuyá',  7500.00, 'Postre',          TRUE),  
    ('Ensalada',                7000.00, 'Entradas',        TRUE),
    ('Coca-Cola',               3500.00, 'Bebida Fría',     TRUE),
    ('Café',                    2500.00, 'Bebida Caliente', TRUE), 
    ('Agua Mineral',            1500.00, 'Bebida Fría',     TRUE);

INSERT INTO ingredientes (nombre, cantidad, unidad) VALUES
    ('Carne de res',        100,'kg'),         -- id 1
    ('Pan de hamburguesa',  200,'unidades'),   -- id 2
    ('Lechuga',             50, 'kg'),         -- id 3
    ('Tomate',              50, 'kg'),         -- id 4
    ('Queso',               30, 'kg'),         -- id 5
    ('Masa para pizza',     100,'kg'),         -- id 6
    ('Salsa de tomate',     80, 'kg'),         -- id 7
    ('Pollo',               60, 'kg'),         -- id 8
    ('Aderezo',             40, 'kg'),         -- id 9
    -- Para Pizza
    ('Queso mozzarella',      25, 'kg'),       -- id 10
    ('Pepperoni',             15, 'kg'),       -- id 11
    ('Orégano',                5, 'kg'),       -- id 12
    -- Para Pechuga gratinada
    ('Crema de leche',        20, 'litros'),   -- id 13
    ('Champiñones',           15, 'kg'),       -- id 14
    ('Sal',                    5, 'kg'),       -- id 15
    ('Pimienta',               2, 'kg'),       -- id 16
    -- Para Cheesecake de maracuyá
    ('Queso crema',           20, 'kg'),       -- id 17
    ('Pulpa de maracuyá',     15, 'kg'),       -- id 18
    ('Galleta Maria',        100, 'unidades'), -- id 19
    ('Mantequilla',           10, 'kg'),       -- id 20
    ('Azúcar',                30, 'kg'),       -- id 21
    -- Para Ensalada
    ('Zanahoria',             20, 'kg'),       -- id 22
    ('Pepino',                15, 'kg'),       -- id 23
    ('Aceite de oliva',       10, 'litros'),   -- id 24
    ('Limón',                 30, 'unidades'), -- id 25
    -- Para Coca-Cola y Agua Mineral
    ('Coca-Cola 350ml',      144, 'unidades'), -- id 26
    ('Agua Mineral 500ml',   200, 'unidades'), -- id 27
    -- Para Café
    ('Café molido',           10, 'kg'),       -- id 28
    ('Leche',                 40, 'litros');   -- id 29

INSERT INTO ordenes (id_cliente, id_empleado, fecha_orden, estado) VALUES
    (1, 4, '2024-06-01', 'Terminada'),
    (2, 5, '2024-06-02', 'Pagada'),
    (3, 6, '2024-06-03', 'Anulada'),
    (4, 4, '2024-06-04', 'Pagada'),
    (1, 5, '2024-06-05', 'En preparación'),
    (2, 6, '2024-06-06', 'Terminada'),
    (3, 4, '2024-06-07', 'Pagada'),
    (4, 5, '2024-06-08', 'Pagada'),
    (1, 6, '2024-06-09', 'Pagada'),
    (2, 4, '2024-06-10', 'Pagada'),
    (3, 5, '2024-06-11', 'Pagada'),
    (4, 6, '2024-06-12', 'Pagada');

INSERT INTO facturas (id_orden, precio, fecha_pago, forma_pago) VALUES
    -- Orden 2: Pizza(12.500) + Ensalada(7.000) + Café(2.500) = 22.000
    (2,  22000.00, '2024-06-02', 'Efectivo'),
    -- Orden 4: Hamburguesa(15.000) + Cheesecake(7.500) + Coca-Cola(3.500) = 26.000
    (4,  26000.00, '2024-06-04', 'Tarjeta'),
    -- Orden 7: 3xHamburguesa(45.000) + 3xCoca-Cola(10.500) + 2xCheesecake(15.000) = 70.500
    (7,  70500.00, '2024-06-07', 'Efectivo'),
    -- Orden 8: Pizza(12.500) + Pechuga(21.000) + 2xCafé(5.000) = 38.500
    (8,  38500.00, '2024-06-08', 'Tarjeta'),
    -- Orden 9: Hamburguesa(15.000) + Ensalada(7.000) + Cheesecake(7.500) + Agua(1.500) = 31.000
    (9,  31000.00, '2024-06-09', 'Efectivo'),
    -- Orden 10: Pechuga(21.000) + Pizza(12.500) + Coca-Cola(3.500) = 37.000
    (10, 37000.00, '2024-06-10', 'Tarjeta');

INSERT INTO ordenes_productos (id_orden, id_producto, cantidad) VALUES
    -- Orden 1 (Terminada) — cliente 1, empleado 4
    (1, 1, 2),  -- 2x Hamburguesa  = 30.000
    (1, 6, 2),  -- 2x Coca-Cola    =  7.000
    -- Orden 2 (Pagada)
    (2, 2, 1),  -- 1x Pizza        = 12.500
    (2, 5, 1),  -- 1x Ensalada     =  7.000
    (2, 7, 1),  -- 1x Café         =  2.500
    -- Orden 3 (Anulada)
    (3, 3, 1),  -- 1x Pechuga gratinada = 21.000
    (3, 8, 1),  -- 1x Agua Mineral      =  1.500
    -- Orden 4 (Pagada)
    (4, 1, 1),  -- 1x Hamburguesa  = 15.000
    (4, 4, 1),  -- 1x Cheesecake   =  7.500
    (4, 6, 1),  -- 1x Coca-Cola    =  3.500
    -- Orden 5 (En preparación)
    (5, 2, 2),  -- 2x Pizza        = 25.000
    (5, 6, 2),  -- 2x Coca-Cola    =  7.000
    -- Orden 6 (Terminada)
    (6, 3, 2),  -- 2x Pechuga      = 42.000
    (6, 5, 1),  -- 1x Ensalada     =  7.000
    (6, 8, 2),  -- 2x Agua Mineral =  3.000
    -- Orden 7 (Pagada)
    (7, 1, 3),  -- 3x Hamburguesa  = 45.000
    (7, 6, 3),  -- 3x Coca-Cola    = 10.500
    (7, 4, 2),  -- 2x Cheesecake   = 15.000
    -- Orden 8 (Pagada)
    (8, 2, 1),  -- 1x Pizza        = 12.500
    (8, 3, 1),  -- 1x Pechuga      = 21.000
    (8, 7, 2),  -- 2x Café         =  5.000
    -- Orden 9 (Pagada)
    (9, 1, 1),  -- 1x Hamburguesa  = 15.000
    (9, 5, 1),  -- 1x Ensalada     =  7.000
    (9, 4, 1),  -- 1x Cheesecake   =  7.500
    (9, 8, 1),  -- 1x Agua Mineral =  1.500
    -- Orden 10 (Pagada)
    (10, 3, 1), -- 1x Pechuga      = 21.000
    (10, 2, 1), -- 1x Pizza        = 12.500
    (10, 6, 1), -- 1x Coca-Cola    =  3.500
    -- Orden 11 (Pagada) — sin factura 
    (11, 1, 2), -- 2x Hamburguesa  = 30.000
    (11, 5, 1), -- 1x Ensalada     =  7.000
    (11, 7, 1), -- 1x Café         =  2.500
    -- Orden 12 (Pagada) — sin factura 
    (12, 4, 2), -- 2x Cheesecake   = 15.000
    (12, 8, 2); -- 2x Agua Mineral =  3.000

INSERT INTO productos_ingredientes (id_producto, id_ingrediente, cantidad) VALUES
    -- Hamburguesa (id=1)
    (1, 1,  0.20),  -- Carne de res       200g por hamburguesa
    (1, 2,  1.00),  -- Pan de hamburguesa 1 unidad
    (1, 3,  0.03),  -- Lechuga            30g
    (1, 4,  0.04),  -- Tomate             40g
    (1, 5,  0.03),  -- Queso              30g

    -- Pizza (id=2)
    (2, 6,  0.25),  -- Masa para pizza    250g
    (2, 7,  0.08),  -- Salsa de tomate    80g
    (2, 10, 0.12),  -- Queso mozzarella   120g
    (2, 11, 0.06),  -- Pepperoni          60g
    (2, 12, 0.005), -- Orégano            5g

    -- Pechuga gratinada (id=3)
    (3, 8,  0.25),  -- Pollo              250g
    (3, 13, 0.05),  -- Crema de leche     50ml
    (3, 10, 0.05),  -- Queso mozzarella   50g (gratinado)
    (3, 14, 0.04),  -- Champiñones        40g
    (3, 15, 0.005), -- Sal                5g
    (3, 16, 0.002), -- Pimienta           2g

    -- Cheesecake de maracuyá (id=4)
    (4, 17, 0.12),  -- Queso crema        120g
    (4, 18, 0.06),  -- Pulpa de maracuyá  60g
    (4, 19, 6.00),  -- Galleta Maria      6 unidades (base)
    (4, 20, 0.02),  -- Mantequilla        20g
    (4, 21, 0.04),  -- Azúcar             40g

    -- Ensalada (id=5)
    (5, 3,  0.05),  -- Lechuga            50g
    (5, 4,  0.04),  -- Tomate             40g
    (5, 22, 0.03),  -- Zanahoria          30g
    (5, 23, 0.03),  -- Pepino             30g
    (5, 9,  0.02),  -- Aderezo            20g
    (5, 24, 0.01),  -- Aceite de oliva    10ml
    (5, 25, 1.00),  -- Limón              1 unidad

    -- Coca-Cola (id=6)
    (6, 26, 1.00),  -- Coca-Cola 350ml    1 unidad

    -- Café (id=7)
    (7, 28, 0.012), -- Café molido        12g por taza
    (7, 29, 0.10),  -- Leche              100ml

    -- Agua Mineral (id=8)
    (8, 27, 1.00);  -- Agua Mineral 500ml 1 unidad

-------------------------------------------------
-- VISTAS (R4)                                 --
-------------------------------------------------

-- VISTA: vista_ordenes_detalle
-- Combina las tablas ordenes, clientes y empleados en una sola consulta.
-- Evita repetir los JOINs en cada endpoint de la API.
-- Usada en: GET /api/ordenes  y  GET /api/ordenes/:id
CREATE OR REPLACE VIEW vista_ordenes_detalle AS
SELECT
    o.id,
    o.fecha_orden,
    o.estado,
    o.id_cliente,
    o.id_empleado,
    c.nombre   AS cliente,
    c.telefono AS telefono_cliente,
    e.nombre   AS empleado,
    e.rol      AS rol_empleado
FROM  ordenes  o
JOIN  clientes c ON c.id = o.id_cliente
JOIN  empleados e ON e.id = o.id_empleado;

-- VISTA: vista_productos_vendidos
-- Agrega cuántas unidades se han vendido de cada producto
-- y cuántos ingresos ha generado, considerando solo órdenes en estado 'Pagada'.
-- Usada en: GET /api/reportes/productos-mas-vendidos
CREATE OR REPLACE VIEW vista_productos_vendidos AS
SELECT
    p.id,
    p.nombre,
    p.categoria,
    p.precio,
    COALESCE(SUM(op.cantidad), 0)               AS total_vendido,
    COALESCE(SUM(op.cantidad * p.precio), 0)    AS ingresos_generados
FROM  productos p
LEFT  JOIN ordenes_productos op ON op.id_producto = p.id
LEFT  JOIN ordenes           o  ON o.id = op.id_orden AND o.estado = 'Pagada'
GROUP BY p.id, p.nombre, p.categoria, p.precio;

-- -- Crear los roles de BD
-- CREATE ROLE rol_mesero   LOGIN PASSWORD 'pass1';
-- CREATE ROLE rol_cajero   LOGIN PASSWORD 'pass2';
-- CREATE ROLE rol_cocinero LOGIN PASSWORD 'pass3';
-- CREATE ROLE rol_gerente  LOGIN PASSWORD 'pass4';

-- -- Mesero: solo puede leer clientes y crear/leer órdenes
-- GRANT SELECT, INSERT ON clientes          TO rol_mesero;
-- GRANT SELECT, INSERT ON ordenes           TO rol_mesero;
-- GRANT SELECT, INSERT ON ordenes_productos TO rol_mesero;

-- -- Cocinero: puede leer órdenes y actualizar ingredientes
-- GRANT SELECT         ON ordenes           TO rol_cocinero;
-- GRANT SELECT, UPDATE ON ingredientes      TO rol_cocinero;

-- -- Cajero: puede leer órdenes y gestionar facturas y clientes
-- GRANT SELECT         ON ordenes           TO rol_cajero;
-- GRANT SELECT, INSERT ON facturas          TO rol_cajero;
-- GRANT SELECT, INSERT, UPDATE ON clientes  TO rol_cajero;

-- -- Gerente: acceso total
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rol_gerente;


----------------------------------
-- TEST productos en cada orden --
----------------------------------

-- SELECT op.id_orden, p.nombre, op.cantidad FROM ordenes_productos op
-- JOIN productos p ON p.id = op.id_producto;
    
-- --------------------------
-- -- CONSULTAS DE EJEMPLO --
-- --------------------------

-- -- ¿Cuáles facturas tienen un precio mayor al promedio general?

-- SELECT id_orden, precio, fecha_pago, forma_pago FROM facturas
-- WHERE precio > (SELECT AVG(precio) FROM facturas);

-- -- ¿Qué clientes han pagado con efectivo y el promedio de sus facturas es mayor al promedio de esa forma de pago? 

-- SELECT c.nombre, ROUND(AVG(f.precio), 2) AS promedio_factura FROM clientes c
-- JOIN ordenes o ON c.id = o.id_cliente
-- JOIN facturas f ON o.id = f.id_orden
-- WHERE f.forma_pago = 'Efectivo'
-- GROUP BY c.nombre
-- HAVING AVG(f.precio) > (SELECT AVG(precio) FROM facturas WHERE forma_pago = 'Efectivo');

-- -- ¿Qué ordenes han sido pagadas pero no han generado una factura?

-- SELECT o.id, o.fecha_orden, o.estado FROM ordenes o
-- WHERE o.estado = 'Pagada' AND NOT EXISTS (
--     SELECT 1 FROM facturas f WHERE f.id_orden = o.id
-- );
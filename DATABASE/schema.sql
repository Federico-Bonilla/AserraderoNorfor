-- =========================================================================
-- AserraderoNorfor - Esquema PostgreSQL (DDL solo estructura)
-- Generado por auditoria T002 (no por pg_dump; reconstruido desde el catalogo).
-- Base de datos: aserradero_db
-- Version: PostgreSQL 17.3 on x86_64-windows, compiled by msvc-19.42.34436, 64-bit
-- Fecha de extraccion: 2026-08-08T02:18:48.793Z
-- NO incluye datos, credenciales ni secretos.
-- NO incluye CREATE DATABASE / roles / grants (fuera de alcance).
-- =========================================================================

SET client_min_messages = WARNING;

-- =========================================================================
-- SECUENCIAS (generadas por SERIAL en las PK de remitos / remitos_detalle)
-- Nota: al usar SERIAL, PostgreSQL crea la sequence Y el default nextval().
-- =========================================================================
CREATE SEQUENCE remitos_detalle_id_seq AS integer START 1 INCREMENT 1 MINVALUE 1 NO MAXVALUE CACHE 1;
CREATE SEQUENCE remitos_id_seq AS integer START 1 INCREMENT 1 MINVALUE 1 NO MAXVALUE CACHE 1;

-- =========================================================================
-- Tabla: productos
-- =========================================================================
CREATE TABLE productos (
  codigo character varying(10) NOT NULL,
  descripcion character varying(200) NOT NULL,
  unidad character varying(10) NOT NULL,
  activo boolean DEFAULT true NOT NULL,
  CONSTRAINT productos_pkey PRIMARY KEY (codigo)
);

-- =========================================================================
-- Tabla: proveedores
-- =========================================================================
CREATE TABLE proveedores (
  cuenta character varying(20) NOT NULL,
  razon_social character varying(200) NOT NULL,
  direccion character varying(250),
  telefono character varying(100),
  cuit character varying(20),
  vendedor character varying(100),
  localidad character varying(100),
  provincia character varying(100),
  CONSTRAINT proveedores_pkey PRIMARY KEY (cuenta)
);

-- =========================================================================
-- Tabla: remitos
-- =========================================================================
CREATE TABLE remitos (
  id integer DEFAULT nextval('remitos_id_seq'::regclass) NOT NULL,
  comprobante character varying(10) NOT NULL,
  letra character varying(5),
  numero_sucursal character varying(10) NOT NULL,
  numero_remito character varying(30) NOT NULL,
  fecha_comprobante date NOT NULL,
  fecha_recepcion date NOT NULL,
  nota_recepcion character varying(30),
  proveedor character varying(150) NOT NULL,
  direccion character varying(200),
  cuit character varying(20),
  origen character varying(100),
  certificado character varying(20) DEFAULT 'NO FSC'::character varying NOT NULL,
  transporte character varying(100),
  precio_transporte numeric(15, 2),
  centro_compra character varying(100),
  patente_chasis character varying(15),
  patente_acoplado character varying(15),
  chofer character varying(100),
  clausula_compra character varying(100),
  centro_auxiliar character varying(100),
  centro_credito character varying(100),
  obra character varying(100),
  lista_precio character varying(100),
  observaciones text,
  estado character varying(20) DEFAULT 'ACTIVO'::character varying NOT NULL,
  usuario character varying(100),
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT remitos_pkey PRIMARY KEY (id)
);

-- =========================================================================
-- Tabla: remitos_detalle
-- =========================================================================
CREATE TABLE remitos_detalle (
  id integer DEFAULT nextval('remitos_detalle_id_seq'::regclass) NOT NULL,
  remito_id integer NOT NULL,
  item integer,
  producto character varying(30),
  descripcion character varying(250),
  especie character varying(30),
  diametro character varying(50),
  largo numeric(5, 2),
  cantidad_rollos integer NOT NULL,
  peso_bruto numeric(12, 3),
  tara numeric(12, 3),
  peso_neto numeric(12, 3),
  deposito character varying(100),
  precio_unitario numeric(15, 2),
  lote character varying(30),
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT remitos_detalle_pkey PRIMARY KEY (id),
  CONSTRAINT fk_remito FOREIGN KEY (remito_id) REFERENCES remitos(id) ON DELETE CASCADE
);

-- =========================================================================
-- INDICES SECUNDARIOS: (ninguno)
-- =========================================================================

# PROJECT_CONTEXT.md — Contexto Maestro de Ingeniería

> Documento generado por auditoría técnica estática del código fuente (sin ejecución).
> Fecha de auditoría: 2026-08-07.
> Repo: `AserraderoNorfor`, branch `main`, último commit `ffba493 Primer commit del ERP AserraderoNorfor`.
> El análisis se basa en el código REAL. Cuando algo no puede confirmarse se indica `NO DETERMINADO`.

---

# 1. Identificación del proyecto

- **Nombre del proyecto:** `AserraderoNorfor` (ERP de Aserradero Norfor).
- **Objetivo principal:** Digitalizar el ingreso de materia prima (madera) al aserradero mediante un sistema de gestión de remitos (cabecera + detalle).
- **Problema que resuelve:** Reemplazar el registro manual/papel de remitos de recepción de madera por un sistema de escritorio con persistencia en PostgreSQL y exportación a Excel.
- **Estado actual del desarrollo:** Fase inicial / MVP temprano (1 único commit "Primer commit"). Funciona el flujo principal de carga de remitos y lookup de proveedores/productos, pero el sistema está incompleto (1 sola pantalla, sin edición/eliminación/listado de remitos guardados, sin autenticación, sin menús funcionales).
- **Tipo de aplicación:** Aplicación de escritorio nativa multiplataforma (Electron) con UI web (React) y API local (Express + PostgreSQL). Pensada para ejecutarse en una PC del aserradero (entorno Windows por el uso de `exec("start ...")`).

---

# 2. Stack tecnológico

### Frontend
- **React** `^18.2.0` (function components + hooks).
- **TypeScript** `^5.2.2`, `strict: true`.
- **Vite** `^5.1.6` (dev server + bundler).
- **Tailwind CSS** `^3.4.17` + **autoprefixer** `^10.5.4` + **postcss** `^8.5.19`.
- **Axios** `^1.18.1` (cliente HTTP hacia el backend).
- **Electron** `^30.0.1` (shell de escritorio).
- **electron-builder** `^24.13.3` (empaquetado final).
- **vite-plugin-electron** `^0.28.6` + **vite-plugin-electron-renderer** `^0.14.5`.
- **ESLint** `^8.57.0` con `@typescript-eslint` y `eslint-plugin-react-hooks`.

### Backend
- **Node.js + Express** `^5.2.1` (nota: Express 5, no 4).
- **TypeScript** `^7.0.2`, `strict: true`, target `ES2022`, module `CommonJS`.
- **pg (node-postgres)** `^8.22.0` (pool de conexiones a PostgreSQL).
- **exceljs** `^4.4.0` (generación del archivo `Stock.xlsx`).
- **cors** `^2.8.6`, **dotenv** `^17.4.2`.
- **tsx** `^4.23.1` (ejecución TS en desarrollo).

### Base de datos
- **PostgreSQL 17.3** ✅ verificado en runtime (`x86_64-windows`, msvc-19.42.34436, 64-bit). Puerto por defecto `5432`. Base `aserradero_db`, schema `public`, usuario `postgres`.

### Herramientas de build / 外
- Vite, tsc, electron-builder (NSIS en Windows, dmg en macOS, AppImage en Linux).

### APIs externas
- Ninguna. El sistema es 100% local/on-premise.

### Servicios externos
- Ninguno. No hay autenticación OAuth, ni servicios cloud, ni telemetry.

### Sistema operativo / entorno relevante
- Desarrollo y ejecución pensados en Windows. La exportación Excel usa `exec("start \"\" \"ruta\"")` (`excel.service.ts:32`), comando específico de Windows. En macOS/Linux esta línea fallaría.

---

# 3. Arquitectura

### Vista general
Arquitectura **cliente-servidor local de 3 capas**, empaquetada como app de escritorio:

```
┌──────────────────────────────────────────────────────────┐
│  Electron (proceso main)  →  BrowserWindow               │
│  carga el renderer (React/Vite)                          │
│       │                                                  │
│       ▼  HTTP (axios → localhost:3001)                    │
│  Express API (backend Node)                              │
│       │                                                  │
│       ▼  pg Pool                                         │
│  PostgreSQL  (aserradero_db)                             │
└──────────────────────────────────────────────────────────┘
```

### Frontend (Electron + React)
- **Proceso main de Electron** (`electron/main.ts`): crea `BrowserWindow`, carga `VITE_DEV_SERVER_URL` en dev o `dist/index.html` en producción. Preload (`electron/preload.ts`) expone `ipcRenderer` vía `contextBridge`, aunque en la práctica **no se usa IPC** para lógica de negocio: el renderer se comunica con el backend por HTTP.
- **Renderer React**: SPA de 1 sola pantalla (`FormularioRemito`). Sin enrutador. Consumo del backend mediante hooks (`useRemito`, `useProveedores`, `useProductos`) sobre servicios axios (`services/api.ts` baseURL fija `http://localhost:3001`).
- **Estado**: `useState` local en `useRemito`. No hay Redux/Zustand/Contexto global.

### Backend (Express)
- Capas: `routes → controllers → services → pg.Pool`. Patrón limpio pero mínimo.
- Sin middleware de autenticación, validación de schema, logging estructurado, ni rate limiting.
- Solo `cors()` y `express.json()`.

### Base de datos
- PostgreSQL externo, accesado vía `Pool` (`database/connection.ts:5`) con credenciales desde `.env`.
- **No hay migraciones, ni seeds, ni archivos SQL en el repo** (`DATABASE/` está vacío). El esquema debe existir previamente en la BD; las tablas se infieren de los `INSERT`/`SELECT` del código (ver sección 7).

### Comunicación entre componentes
- Renderer → Backend: **HTTP/REST (JSON)** sin auth ni validación.
- Proceso main Electron: solo shell + `ipcRenderer` expuesto pero sin uso negocio.

### Autenticación
- 🔴 **No implementada.** La API es completamente abierta en `localhost:3001`.

### Persistencia
- Únicamente PostgreSQL. No hay localStorage/IndexedDB en el renderer.

### Servicios externos
- Ninguno.

### Flujo general de información
`UI (Input/Lookup) → useRemito (state) → guardarRemito (axios POST /remitos) → controller.postRemito → service.guardarRemito (transacción BEGIN/INSERT remitos + INSERT remitos_detalle /COMMIT) → respuesta 201 → alert en UI`.

---

# 4. Estructura del proyecto

```
AserraderoNorfor/
├── .gitignore
├── .vscode/settings.json
├── BACKEND/
│   ├── .env                      (NO trackeado por git, existe localmente)
│   ├── package.json
│   ├── tsconfig.json
│   ├── Stock.xlsx                (salida generada — commiteada por error)
│   └── src/
│       ├── app.ts                (config Express + montaje de rutas)
│       ├── server.ts             (arranque + ping a Postgres)
│       ├── config/               (vacía)
│       ├── types/                (vacía)
│       ├── database/connection.ts (Pool pg)
│       ├── routes/
│       │   ├── remitos.routes.ts
│       │   ├── excel.routes.ts
│       │   ├── proveedor.routes.ts
│       │   └── productos.routes.ts
│       ├── controllers/
│       │   ├── remitos.controller.ts
│       │   ├── excel.controller.ts
│       │   ├── proveedor.controller.ts
│       │   └── productos.controller.ts
│       └── services/
│           ├── remitos.service.ts (INSERT cabecera + detalle en transacción)
│           ├── excel.service.ts   (genera y abre Stock.xlsx)
│           ├── proveedor.service.ts
│           └── productos.service.ts
├── DATABASE/                     (vacía — sin SQL/migraciones)
└── FRONTEND/
    ├── package.json
    ├── vite.config.ts            (plugin electron)
    ├── tailwind.config.ts
    ├── postcss.config.js
    ├── tsconfig.json / tsconfig.node.json
    ├── .eslintrc.cjs
    ├── electron-builder.json5
    ├── index.html
    ├── public/                   (svg boilerplate)
    ├── dist-electron/            (build commiteado por error)
    ├── electron/
    │   ├── main.ts
    │   ├── preload.ts
    │   └── electron-env.d.ts
    └── src/
        ├── main.tsx              (entrypoint renderer)
        ├── App.tsx               (Sidebar + FormularioRemito)
        ├── index.css            , Select, Textarea)
        ├── components/lookup/        (ProveedorLookup/Modal, ProductoLookup/Modal)
        ├── hooks/                   (useRemito, useProveedores, useProductos)
        └── services/                (api axios + remito/producto/proveedor service)
```

**Función de cada carpeta:**
- `BACKEND/src/routes/`: definición minimalista de endpoints (`Router`).
- `BACKEND/src/controllers/`: handlers HTTP, invocan services.
- `BACKEND/src/services/`: lógica de negocio + SQL directo (sin ORM).
- `BACKEND/src/database/`: pool único de conexiones.
- `FRONTEND/src/components/ui/`: primitivas reutilizables (Input/Button/Select/Textarea).
- `FRONTEND/src/components/lookup/`: buscadores tipo ERP (F12 abre modal, flechas/Enter navegan, scoring de coincidencias).
- `FRONTEND/src/hooks/`: estado y carga de datos asincrónica.
- `FRONTEND/src/services/`: cliente axios y wrappers de endpoints.

---

# 5. Frontend

### Estructura
SPA sin router, una sola vista (`App.tsx`) con `Sidebar` (decorativa) + `FormularioRemito` (la única funcionalidad real).

### Páginas
- Una sola: `FormularioRemito.tsx` (ingreso de remito de materia prima).

### Componentes principales
- `FormularioRemito.tsx` (419 líneas, monolítico): contiene la cabecera del remito, lookup de proveedor, lookup de producto + cantidad, tabla de detalle, observaciones, botones Guardar / Exportar Excel.
- `layout/Sidebar.tsx`: botones Dashboard / Materia Prima / Producción / Stock / Compras / Reportes / Configuración. **Ninguno navega a ninguna vista** (todos son `<button>` sin `onClick` salvo estilos). Solo "Materia Prima" está activo visualmente.
- `lookup/ProveedorLookup.tsx` + `ProveedorModal.tsx`: búsqueda por cuenta/CUIT/razón social con scoring y navegación por teclado (F12 abre, ↑↓ navega, Enter selecciona, Esc cierra).
- `lookup/ProductoLookup.tsx` + `ProductoModal.tsx`: análogo para productos por código/descripción.
- `ui/Input.tsx`: **custom keydown Enter** → mueve el foco al siguiente elemento del form (`form.elements[indice+1].focus()`). Esto intercepta Enter globalmente y puede chocar con OnKeyDown externos.
- `ui/Button/Select/Textarea`: wrappers estilados con Tailwind.

### Hooks
- `useRemito`: estado central del formulario (`Remito`), `agregarProducto`, `eliminarProducto`, `handleGuardarRemito` (POST + reset), `handleExportarExcel` (GET exportar-stock). Maneja `productoRef` / `cantidadRollosRef` para foco controlado.
- `useProveedores`: carga lista de proveedores una vez al montar, bandera `loading`.
- `useProductos`: idéntico para productos.

### Servicios
- `api.ts`: instancia axios con `baseURL: "http://localhost:3001"` (hardcodeado).
- `remito.service.ts`: `guardarRemito` (POST `/remitos`), `exportarExcel` (GET `/exportar-stock`).
- `proveedor.service.ts` / `producto.service.ts`: GET a catálogos; exponen interfaces `Proveedor`, `Producto`.

### Manejo de estado
- Puro `useState`/`useRef` dentro de hooks. Sin store global. `useRemito` resetea con `REMITO_INICIAL` del `constants/remito.ts`.

### Formularios y validaciones
- Cabecera del remito con ~20 campos (comprobante, letra, sucursal, número, fechas, proveedor, dirección, cuit, origen, certificado, transporte, patentes, chofer, listas, observaciones, etc.).
- Detalle: tabla editable; cada ítem trae `producto`, `descripcion`, `cantidad_rollos`; el resto del `RemitoDetalle` (especie, diámetro, largo, pesos, volumen, depósito, precio_unitario, lote) **se hardcodea a ""/0** al agregar (`useRemito.ts:75-91`).
- **Validaciones mínimas en frontend**: solo `if (!productoSeleccionado) return;` y `if (cantidadRollos.trim() === "") return;` y chequeo de duplicados. No valida tipos numéricos, no valida campos obligatorios de cabecera (sucursal, número, proveedor).

### Navegación
- Ninguna (sin router). `index.html` tiene title `"Vite + React + TS"` (sin renombrar).

### Estilos
- Tailwind utility-first. Config Tailwind mínima (sin `extend`). `index.css` con reset básico + `font-family: Arial`.

### Comunicación con backend
- Exclusivamente por axios a `http://localhost:3001`. Sin manejo de errores centralizado (cada hook hace `try/catch` y `alert`).

### Funcionalidades implementadas
- Carga completa de cabecera de remito.
- Búsqueda de proveedor (manual y modal con teclado).
- Búsqueda de producto (manual y modal con teclado).
- Agregar/quitar ítems al detalle.
- Guardar remito (POST).
- Exportar Excel (GET que el backend resuelve abriendo el `.xlsx` en la PC del server).

---

# 6. Backend

### Estructura
Ver sección 4. Patrón 3-capas sin ORM.

### Servidores
- `server.ts`: arranca Express en `PORT` (default 3001), primero hace `pool.query("SELECT NOW()")` y si falla no levanta el servidor (no `process.exit`, queda solo el error en consola).

### Rutas
Montadas en `app.ts`:
- `remitos.router` → `/remitos`, `/remitos`
- `excel.router` → `/exportar-stock`
- `/proveedores` → `/proveedores`
- `/productos` → `/productos`

### Controladores
Handlers `async` muy finos; los de proveedor y producto manejan `try/catch` y responden 500, **pero `remitos.controller.ts` NO captura errores**: si `guardarRemito` lanza, Express 5 propagará una excepción no manejada (la transacción hace ROLLBACK en el service, pero nada responde al cliente → request colgada o error genérico 500 sin JSON).

### Servicios
- `remitos.service.ts`: `obtenerRemitos` (SELECT * de `remitos`), `guardarRemito` con transacción (`BEGIN`, INSERT en `remitos` RETURNING id, loop INSERT en `remitos_detalle`, `COMMIT`/`ROLLBACK`, `client.release()` en finally). Parámetro `datos: any` — sin tipado.
- `proveedor.service.ts`: SELECT de 8 columnas de `proveedores` ORDER BY razon_social.
- `productos.service.ts`: SELECT `codigo`, `descripcion`, `unidad` de `productos` WHERE `activo = true`.
- `excel.service.ts`: SELECT * de `remitos`, arma workbook con ExcelJS, escribe a `process.cwd()/Stock.xlsx` y ejecuta `exec("start \"\" \"<archivo>\"")` (Windows-only) para abrirlo. Devuelve la ruta y `res.download(archivo)`.

### Middleware
- Solo `cors()` y `express.json()`. Sin logs, sin validación, sin manejo global de errores, sin 404.

### Validaciones
- 🔴 Ninguna en backend. `guardarRemito` acepta cualquier `body` y lo inserta.

### Manejo de errores
- Inconsistente: proveedor/producto/controllers responden 500 con JSON; remitos/controller no captura; el server no tiene ErrorHandler middleware. No hay logging estructurado (solo `console.log/error`).

### Conexión con PostgreSQL
- `Pool` único exportado como singleton desde `database/connection.ts`, configuración desde `.env`. Sin reintentos ni timeout de pool configurados.

### Endpoints disponibles

```
GET /remitos
- Propósito: listar todos los remitos guardados.
- Parámetros: ninguno.
- Body: —
- Respuesta: 200 JSON array de filas de la tabla `remitos` (sin detalle).
- Dependencias: pool → tabla `remitos`.
- Observación: el frontend NO consume este endpoint actualmente.
```

```
POST /remitos
- Propósito: guardar un remito (cabecera + N ítems de detalle) en transacción.
- Parámetros: ninguno.
- Body: { cabecera: RemitoCabecera, detalle: RemitoDetalle[] }  (ver models/Remito.ts)
        Cabecera: comprobante, letra, numero_sucursal, numero_remito,
                  fecha_comprobante, fecha_recepcion, nota_recepcion,
                  proveedor, direccion, cuit, origen, certificado,
                  transporte, precio_transporte, centro_compra,
                  patente_chasis, patente_acoplado, chofer,
                  clausula_compra, centro_auxiliar, centro_credito,
                  obra, lista_precio, observaciones, estado, usuario.
        Detalle item: item, producto, descripcion, especie, diametro,
                      largo, cantidad_rollos, peso_bruto, peso_neto,
                      volumen, deposito, precio_unitario, lote.
- Respuesta: 201 { id, mensaje } o excepción no capturada (sin código/status garante).
- Dependencias: tablas `remitos` y `remitos_detalle` (FK remito_id → remitos.id).
- Observaciones: parámetro `datos: any`; sin validación de esquema; 
                 el campo `estado` defaults a "ACTIVO" si no viene.
```

```
GET /exportar-stock
- Propósito: generar Stock.xlsx con la tabla `remitos` y abrirlo en Windows.
- Parámetros: ninguno.
- Body: —
- Respuesta: archivo enviado con res.download() (y además abre el archivo en el server).
- Dependencias: tabla `remitos`, ExcelJS, `child_process.exec`.
- Observaciones: SOLO funciona en Windows; abre el archivo en la máquina del backend,
                 no en el cliente Electron. Si el backend corre en otra PC, el Excel
                 se abre en el server.
```

```
GET /proveedores
- Propósito: listar proveedores activos para lookup.
- Parámetros: ninguno.
- Body: —
- Respuesta: 200 [{ cuenta, razon_social, direccion, telefono, cuit,
                    vendedor, localidad, provincia }]
- Dependencias: tabla `proveedores`.
```

```
GET /productos
- Propósito: listar productos activos para lookup.
- Parámetros: ninguno.
- Body: —
- Respuesta: 200 [{ codigo, descripcion, unidad }]
- Dependencias: tabla `productos` (filtro `activo = true`).
```

### Funcionalidades implementadas
- Listado y alta de remitos (con detalle transaccional).
- Listado de catálogos (proveedores, productos).
- Exportación Excel del stock.

---

# 7. Base de datos

> **VERIFICADO en runtime** el `2026-08-07` contra la instancia PostgreSQL real
> (`aserradero_db` en `localhost:5432`, PostgreSQL 17.3). Metadatos extraídos de
> `information_schema.columns`, `information_schema.table_constraints`,
> `pg_constraint` y `pg_indexes` (consultas de solo lectura — no se modificó la BD).
>
> Leyenda:
> - ✅ **verificado** en el catálogo real de la BD
> - 🟡 **inferido** del código (no consultable directamente o no aplicable)
> - 🔴 **no determinado**

- **Motor:** ✅ PostgreSQL 17.3 (`x86_64-windows`, msvc-19.42.34436, 64-bit).
- **Base de datos:** ✅ `aserradero_db`, esquema `public`.
- **Usuario de conexión:** ✅ `postgres` (rol superuser).
- **Esquema SQL** (DDL) en el repo: 🔴 NO existe. `DATABASE/` está vacío y no hay
  archivos `.sql`. La fuente de verdad es la BD en producción. **RIESGO de reproducibilidad del entorno** (ver sección 17).
- **Datos actuales** (verificado): `remitos`=5 filas, `remitos_detalle`=6 filas,
  `proveedores`=3.104 filas, `productos`=58 filas → hay datos reales cargados.

## 7.1. Esquema verificado — visión general

✅ 4 tablas en schema `public`: `productos`, `proveedores`, `remitos`, `remitos_detalle`.

## 7.2. `remitos` (cabecera) — ✅ VERIFICADO

| # | Columna | Tipo exacto | Nullable | Default | Origen |
|---|---|---|---|---|---|
| 1 | `id` | `integer` (precision 32, scale 0) | NO | `nextval('remitos_id_seq'::regclass)` | ✅ |
| 2 | `comprobante` | `varchar(10)` | NO | — | ✅ |
| 3 | `letra` | `varchar(5)` | YES | — | ✅ |
| 4 | `numero_sucursal` | `varchar(10)` | NO | — | ✅ |
| 5 | `numero_remito` | `varchar(30)` | NO | — | ✅ |
| 6 | `fecha_comprobante` | `date` | NO | — | ✅ |
| 7 | `fecha_recepcion` | `date` | NO | — | ✅ |
| 8 | `nota_recepcion` | `varchar(30)` | YES | — | ✅ |
| 9 | `proveedor` | `varchar(150)` | NO | — | ✅ |
| 10 | `direccion` | `varchar(200)` | YES | — | ✅ |
| 11 | `cuit` | `varchar(20)` | YES | — | ✅ |
| 12 | `origen` | `varchar(100)` | YES | — | ✅ |
| 13 | `certificado` | `varchar(20)` | NO | `'NO FSC'::character varying` | ✅ |
| 14 | `transporte` | `varchar(100)` | YES | — | ✅ |
| 15 | `precio_transporte` | `numeric(15,2)` | YES | — | ✅ |
| 16 | `centro_compra` | `varchar(100)` | YES | — | ✅ |
| 17 | `patente_chasis` | `varchar(15)` | YES | — | ✅ |
| 18 | `patente_acoplado` | `varchar(15)` | YES | — | ✅ |
| 19 | `chofer` | `varchar(100)` | YES | — | ✅ |
| 20 | `clausula_compra` | `varchar(100)` | YES | — | ✅ |
| 21 | `centro_auxiliar` | `varchar(100)` | YES | — | ✅ |
| 22 | `centro_credito` | `varchar(100)` | YES | — | ✅ |
| 23 | `obra` | `varchar(100)` | YES | — | ✅ |
| 24 | `lista_precio` | `varchar(100)` | YES | — | ✅ |
| 25 | `observaciones` | `text` (sin límite) | YES | — | ✅ |
| 26 | `estado` | `varchar(20)` | NO | `'ACTIVO'::character varying` | ✅ |
| 27 | `usuario` | `varchar(100)` | YES | — | ✅ |
| 28 | `created_at` | `timestamp` (sin timezone) | YES | `CURRENT_TIMESTAMP` | ✅ **NO en el código** |
| 29 | `updated_at` | `timestamp` (sin timezone) | YES | `CURRENT_TIMESTAMP` | ✅ **NO en el código** |

- **PK**: ✅ `remitos_pkey` → `PRIMARY KEY (id)` (btree unique).
- **NOT NULL**: ✓ implícitos (NOT NULL marcados arriba).
- **NO usa** `GENERATED ALWAYS AS IDENTITY` ni `BIGSERIAL`; es `integer` + sequence
  `remitos_id_seq` (patrón `SERIAL` legacy).

### Diferencias vs código
- ✅ Las 27 columnas del INSERT en `remitos.service.ts:25-52` existen exactamente
  con esos nombres.
- ✅ `RETURNING id` es válido (PK `id`).
- 🔴 **`created_at` y `updated_at` existen en la BD pero NO están en el `INSERT`**
  de `remitos.service.ts`. Sobreviven gracias a sus defaults `CURRENT_TIMESTAMP`,
  pero **el código nunca los actualiza**: `updated_at` quedará con el valor del
  alta y nunca reflejará ediciones futuras (no hay UPDATE en el código aún, pero
  cuando se agregue habrá que manejarlo).
- 🟡 El modelo TS `RemitoCabecera` (`FRONTEND/src/models/Remito.ts`) **no declara**
  `created_at` / `updated_at` (correcto, son timestamp del server; pero conviene
  documentarlo).
- 🔴 `excel.service.ts:20-21` define columnas Excel con keys `"fecha"` y `"patente"`
  que **NO existen** en la tabla real (las válidas serían `fecha_comprobante`,
  `fecha_recepcion`, `patente_chasis`, `patente_acoplado`). → celdas Excel vacías.
  (Bug confirmado en runtime-exacto, no solo inferido.)

## 7.3. `remitos_detalle` — ✅ VERIFICADO

| # | Columna | Tipo exacto | Nullable | Default | Origen |
|---|---|---|---|---|---|
| 1 | `id` | `integer` | NO | `nextval('remitos_detalle_id_seq'::regclass)` | ✅ |
| 2 | `remito_id` | `integer` | NO | — | ✅ |
| 3 | `item` | `integer` | YES | — | ✅ |
| 4 | `producto` | `varchar(30)` | YES | — | ✅ |
| 5 | `descripcion` | `varchar(250)` | YES | — | ✅ |
| 6 | `especie` | `varchar(30)` | YES | — | ✅ |
| 7 | `diametro` | `varchar(50)` | YES | — | ✅ |
| 8 | `largo` | `numeric(5,2)` | YES | — | ✅ |
| 9 | `cantidad_rollos` | `integer` | NO | — | ✅ |
| 10 | `peso_bruto` | `numeric(12,3)` | YES | — | ✅ |
| 11 | `peso_neto` | `numeric(12,3)` | YES | — | ✅ |
| 12 | `volumen` | `numeric(12,6)` | YES | — | ✅ |
| 13 | `deposito` | `varchar(100)` | YES | — | ✅ |
| 14 | `precio_unitario` | `numeric(15,2)` | YES | — | ✅ |
| 15 | `lote` | `varchar(30)` | YES | — | ✅ |
| 16 | `created_at` | `timestamp` | YES | `CURRENT_TIMESTAMP` | ✅ **NO en el código** |
| 17 | `updated_at` | `timestamp` | YES | `CURRENT_TIMESTAMP` | ✅ **NO en el código** |

- **PK**: ✅ `remitos_detalle_pkey` → `PRIMARY KEY (id)` (btree unique).
- **FK**: ✅ `fk_remito` → `FOREIGN KEY (remito_id) REFERENCES remitos(id) **ON DELETE CASCADE**`.
  → si se borra un `remitos`, sus detalles se borran automáticamente.
- Sequence: `remitos_detalle_id_seq`.
- `remito_id` y `cantidad_rollos` son `NOT NULL` (a diferencia de lo que sugería el código).

### Diferencias vs código
- ✅ Las 15 columnas del INSERT en `remitos.service.ts:99-114` existen con esos nombres.
- 🔴 **El INSERT nunca setea `id`** (correcto, es SERIAL), pero también **omite `created_at`/`updated_at`** (OK por el default). Conveniente documentar.
- 🔴 **El modelo TS `RemitoDetalle`** (`models/Remito.ts`) **no contiene `id` ni `remito_id` ni `created_at`/`updated_at`** → está bien, son del server, pero hay que tenerlo presente al diseñar pantallas de listado/edición.
- 🟡 `cantidad_rollos` en BD es `integer NOT NULL`; el TS lo declara `number`. ✅ compatible.
- 🟡 El frontend hardcodea `especie=""`, `diametro=""`, `largo=0`, `peso_bruto=0`,
  `peso_neto=0`, `volumen=0`, `deposito=""`, `precio_unitario=0`, `lote=""` al agregar
  (`useRemito.ts:75-91`). Tipos coherentes: `diametro`/`especie`/`deposito`/`lote`
  son varchar y reciben `""`; `largo`/`pesos`/`volumen`/`precio_unitario` son
  numeric y reciben `0`. **No falla**, pero los nums como `0` en `largo`/`peso_*`
  semánticamente deberían ser `null` si no fueron medidos — hoy se guardan como `0`.
- 🔴 **`FK ON DELETE CASCADE`** significa que borrar remitos borra su detalle en
  cascada. **El código no tiene `DELETE FROM remitos` aún**, pero cualquier futura
  "anulación/eliminación" debe considerar este comportamiento ya fijado en la BD.

## 7.4. `proveedores` — ✅ VERIFICADO

| # | Columna | Tipo | Nullable | Default | Origen |
|---|---|---|---|---|---|
| 1 | `cuenta` | `varchar(20)` | NO | — | ✅ |
| 2 | `razon_social` | `varchar(200)` | NO | — | ✅ |
| 3 | `direccion` | `varchar(250)` | YES | — | ✅ |
| 4 | `telefono` | `varchar(100)` | YES | — | 🟡 no se SELECT en código |
| 5 | `cuit` | `varchar(20)` | YES | — | ✅ |
| 6 | `vendedor` | `varchar(100)` | YES | — | 🟡 no se SELECT en código |
| 7 | `localidad` | `varchar(100)` | YES | — | 🟡 no se SELECT en código |
| 8 | `provincia` | `varchar(100)` | YES | — | 🟡 no se SELECT en código |

- **PK**: ✅ `proveedores_pkey` → `PRIMARY KEY (cuenta)` (btree unique).
- **Filas**: 3.104.

### Diferencias vs código
- ✅ `proveedor.service.ts:5-16` SELECT de las 8 columnas y coinciden exactamente
  con tipos/nombres. La query trae `telefono`, `vendedor`, `localidad`,
  `provincia` que luego el frontend `ProveedorLookup`/`ProveedorModal` NO muestra
  (solo `cuenta`, `razon_social`, `cuit`). No es error, es dato sin uso en la UI actual.
- 🔴 **No hay FK desde `remitos.proveedor` → `proveedores.cuenta`**: el campo
  `remitos.proveedor` es `varchar(150)` libre (no tiene constraint). El sistema
  guarda la **razón social** del proveedor elegido (ver `FormularioRemito.tsx:110`
  → `value: proveedor?.razon_social`), NO la `cuenta`. Esto es una **decisión
  implícita del código**: el vínculo proveedor↔remito es "por nombre" y no por PK.
  El código de lookup busca por `cuenta` y luego copia `razon_social` al campo
  `remitos.proveedor`. Riesgo: si dos proveedores comparten razón social o esta se
  renombra, el remito queda desreferenciado.

## 7.5. `productos` — ✅ VERIFICADO

| # | Columna | Tipo | Nullable | Default | Origen |
|---|---|---|---|---|---|
| 1 | `codigo` | `varchar(10)` | NO | — | ✅ |
| 2 | `descripcion` | `varchar(200)` | NO | — | ✅ |
| 3 | `unidad` | `varchar(10)` | NO | — | ✅ |
| 4 | `activo` | `boolean` | NO | `true` | ✅ |

- **PK**: ✅ `productos_pkey` → `PRIMARY KEY (codigo)` (btree unique).
- **Filas**: 58.

### Diferencias vs código
- ✅ `productos.service.ts:4-12` SELECT exacto de `codigo`, `descripcion`, `unidad`
  con `WHERE activo = true ORDER BY codigo`. Coherente con tipos.
- 🔴 **No hay FK desde `remitos_detalle.producto` → `productos.codigo`**: el campo
  `remitos_detalle.producto` es `varchar(30)` libre (sin constraint). El código
  guarda el `codigo` del producto seleccionado (`useRemito.ts:73`), por lo que
  el vínculo es "natural" pero **NO forzado por la BD**. Riesgo: si un producto se
  elimina o renombra, los detalles históricos quedan desreferenciados.

## 7.6. Constraints / Índices / Funciones / Procedimientos — ✅ VERIFICADO

### Constraints
- ✅ `productos_pkey` — PRIMARY KEY (`codigo`)
- ✅ `proveedores_pkey` — PRIMARY KEY (`cuenta`)
- ✅ `remitos_pkey` — PRIMARY KEY (`id`)
- ✅ `remitos_detalle_pkey` — PRIMARY KEY (`id`)
- ✅ `fk_remito` — FOREIGN KEY (`remitos_detalle.remito_id`) REFERENCES `remitos(id)` **ON DELETE CASCADE**
- ✅ NOT NULL checks generados automáticamente por las columnas `NOT NULL`
  (nombres internos `2200_<oid>_<col>_not_null` — son CHECK constraints implícitos).

### Índices
- ✅ Solo 4 índices existentes: los btree UNIQUE de cada PK (`productos_pkey`,
  `proveedores_pkey`, `remitos_pkey`, `remitos_detalle_pkey`).
- 🔴 **No hay índices secundarios**. En particular:
  - No hay índice sobre `remitos_detalle.remito_id` (la FK). Un `JOIN remitos r JOIN remitos_detalle d ON d.remito_id = r.id` hará seq scan sobre el detalle. OK con 6 filas actuales; relevante si el volumen crece.
  - No hay índice sobre `remitos.numero_remito`, `remitos.proveedor`, `remitos.fecha_comprobante`, `productos.descripcion`, `proveedores.razon_social` o `cuit` (que sí son usados en búsquedas UI/modales).

### Unique constraints adicionales
- 🔴 **No hay.** No hay `UNIQUE` sobre `proveedores.cuit`, ni sobre `productos.descripcion`, ni sobre `(numero_sucursal, numero_remito)` que naturalmente serían únicos. Riesgo de duplicados silenciosos.

### Funciones / procedimientos / triggers / views / materialized views
- ✅ **Ninguno.** El catálogo `pg_proc` (vía `pg_constraint` consultado) reporta 0 funciones custom en `public`. No hay triggers ni reglas. Toda la lógica está en la aplicación Node.

### Migraciones / seeds
- 🔴 NO existen en el repo. El esquema se creó manualmente (o por script externo no versionado). Las tablas y sequences existen pero su DDL original no está disponible salvo que se reconstruya con `pg_dump -s`.
- 🟡 Seeds: implícitamente los 3.104 proveedores y 58 productos cargados manualmente (no hay semilla formal).

## 7.7. Resumen de relaciones

```
productos                  proveedores
PK: codigo                 PK: cuenta
activo boolean             (3.104 filas)
(58 filas, solo activos)
       │                        │
       │ (sin FK)               │ (sin FK)
       ▼                        ▼
remitos_detalle.producto   remitos.proveedor   ← varchar libre (guarda razon_social)
(varchar 30)                (varchar 150)


remitos                    remitos_detalle
PK: id (SERIAL int)        PK: id (SERIAL int)
                            FK: remito_id → remitos.id  ON DELETE CASCADE ✅
                            cantidad_rollos NOT NULL
                            remito_id NOT NULL
```

## 7.8. Tipos numéricos y fechas (precisiones verificadas)

- `precio_transporte`: `numeric(15,2)` → hasta 13 dígitos enteros + 2 decimales.
- `remitos_detalle.largo`: `numeric(5,2)` (nnn.dd) — cuidado: el frontend envía `0`.
- `remitos_detalle.peso_bruto` / `peso_neto`: `numeric(12,3)`.
- `remitos_detalle.volumen`: `numeric(12,6)` (6 decimales).
- `remitos_detalle.precio_unitario`: `numeric(15,2)`.
- `fecha_comprobante` y `fecha_recepcion`: `date` (sin hora). El frontend las envía
  como `YYYY-MM-DD` desde `<input type="date">`, compatible con PostgreSQL.
- `created_at` / `updated_at`: `timestamp without time zone` (sin offset). Si la app
  se usa en distintas zonas horarias convendría `timestamptz`, pero NO DETERMINADO
  si se contempló.

## 7.9. Información que NO pudo verificarse / falta

- 🔴 **DDL original** (script `CREATE TABLE`) — no está en el repo. Recomendado
  extraerlo con `pg_dump -s aserradero_db > schema.sql` para versionarlo en `DATABASE/`.
- 🔴 **Intención de diseño de `remitos.usuario`**: existe pero nunca se setea en
  el código (no hay sesión/usuario). Probablemente previsto para futuro modulo auth.
- 🔴 **Constraints `UNIQUE` planeadas** (ver 7.6) — no implementadas en la BD.
- 🔴 **Política de `updated_at`**: existe el default `CURRENT_TIMESTAMP` pero **no
  hay trigger que lo actualice automáticamente** en UPDATE; el código tampoco
  hará UPDATE todavía. Cuando se agregue edición, hay que actualizarlo explícitamente
  o crear un trigger `BEFORE UPDATE`.
- 🔴 **Si existen otras bases/schemas** además de `public` con datos del proyecto —
  solo se consultó `public`. No se listaron otras BDs (scope de la tarea: solo la
  BD configurada en `.env`).
- 🔴 **Backups / políticas de retención** — fuera del alcance del código.

---

# 8. Flujos de negocio

### Flujo A — Carga de remito (principal)
```
Usuario completa cabecera (Input×20)
  → ProveedorLookup: escribe cuenta + Enter (o F12 → Modal → ↑↓ → Enter)
     ↳ useProveedores ya cargó la lista al montar
     ↳ Selecciona Proveedor → completa proveedor/dirección/cuit
  → ProductoLookup + cantidad + Enter/Click "➕ Agregar"
     ↳ Valida duplicados y cantidad no vacía
     ↳ Agrega fila a detalle (especie/diametro/largo/pesos/volumen/lote en ""/0)
  → Click "💾 Guardar"
     ↳ useRemito.handleGuardarRemito → axios POST /remitos
     ↳ controller.postRemito → service.guardarRemito
        ↳ BEGIN
        ↳ INSERT remitos ... RETURNING id
        ↳ for ítem: INSERT remitos_detalle(remito_id, ...)
        ↳ COMMIT  (ROLLBACK en catch)
     ↳ 201 {id, mensaje} → alert("Remito guardado correctamente") → reset form
```

### Flujo B — Exportar Excel
```
Click "📊 Exportar Excel"
  → useRemito.handleExportarExcel → axios GET /exportar-stock
  → controller.exportarExcel → service.exportarStockExcel
     ↳ SELECT * FROM remitos
     ↳ ExcelJS: workbook.Stock, define columnas (id, numero_remito, proveedor,
        fecha, patente, chofer, observaciones)
     ↳ workbook.xlsx.writeFile("Stock.xlsx") en process.cwd()
     ↳ exec("start \"\" \"<ruta>\"") // abre en Windows
  → res.download(archivo) → el navegador Electron descarga el .xlsx
```
Observación: el Excel generado y el archivo descargado coexisten; el `start` abre el archivo en la PC donde corre el backend (que en una app de escritorio normalmente coincide con el cliente, pero no es portable).

### Flujo C — Listar proveedores/productos (lookup)
Carga inicial del renderer → `useProveedores`/`useProductos` → `GET /proveedores`, `GET /productos` → poblado en memoria del modal.

### Flujo no implementado
- Listado/edición/anulación de remitos ya guardados (aunque `GET /remitos` existe, el frontend no lo consume).
- Dashboard / Producción / Stock / Compras / Reportes / Configuración (Sidebar sin handlers).

---

# 9. Funcionalidades terminadas

| Funcionalidad | Estado | Archivos principales | Observaciones |
|---|---|---|---|
| Carga de cabecera de remito (UI) | ✅ TERMINADA | `FormularioRemito.tsx`, `useRemito.ts`, `constants/remito.ts` | Muchos campos sin validación obligatoria |
| Lookup de proveedor (manual + modal F12) | ✅ TERMINADA | `ProveedorLookup.tsx`, `ProveedorModal.tsx`, `useProveedores.ts` | Scoring por cuenta/razón social/CUIT, navegación teclado completa |
| Lookup de producto (manual + modal F12) | ✅ TERMINADA | `ProductoLookup.tsx`, `ProductoModal.tsx`, `useProductos.ts` | Scoring por código/descripción |
| Agregar/quitar ítems del detalle | 🟡 PARCIAL | `useRemito.ts:agregarProducto/eliminarProducto` | Solo `producto`, `descripcion`, `cantidad_rollos` se completan; el resto del detalle se hardcodea a 0/"" |
| Guardar remito (POST transaccional) | 🟡 PARCIAL | `remitos.service.ts`, `remitos.controller.ts` | Funciona, PERO sin catch en el controller → error 500 sin JSON diferenciado |
| Exportar Excel | 🟡 PARCIAL | `excel.service.ts`, `excel.controller.ts` | Columnas `fecha`/`patente` no existen en la tabla → celdas vacías; además Windows-only por `exec start` |
| Listado de remitos guardados | 🔴 NO IMPLEMENTADA (UI) | `remitos.service.ts:obtenerRemitos` existe | Backend listo, frontend no lo consume |
| Edición / anulación de remitos | 🔴 NO IMPLEMENTADA | — | |
| Sidebar / Dashboard / Producción / Stock / Compras / Reportes / Configuración | 🔴 NO IMPLEMENTADA | `Sidebar.tsx` | Solo estilos; botones sin onClick |
| Autenticación / usuarios / permisos | 🔴 NO IMPLEMENTADA | — | El campo `usuario` se guarda pero nunca se setea |
| Validaciones cliente/servidor | 🔴 NO IMPLEMENTADA | — | Solo duplicados + no-vacío en `cantidad_rollos` |
| Logging estructurado | 🔴 NO IMPLEMENTADA | — | Solo `console.log/error` disperso |
| Manejo de errores global backend | 🔴 NO IMPLEMENTADA | `app.ts` | Sin middleware de errores |
| Tests | 🔴 NO IMPLEMENTADA | — | No hay tests ni runner configurado |
| Build de Electron multiplataforma | 🟡 PARCIAL | `electron-builder.json5` | `appId`/`productName` siguen como "YourAppID"/"YourAppName" (placeholder) |
| Icono de app / branding | ⚠️ REQUIERE VERIFICACIÓN | `electron/main.ts:31` | Carga `electron-vite.svg` como icono (boilerplate) |

---

# 10. Funcionalidades pendientes

### Crítico
- Definir y versionar el **esquema SQL** (migraciones). Hoy el sistema no arranca si las tablas no existen; no hay forma de reproducir el entorno.
- Validación de `POST /remitos` (esquema de cabecera/detalle, tipos numéricos, campos obligatorios). Hoy `datos: any`.
- Capturar errores en `remitos.controller.ts` para evitar respuestas 500 sin JSON.
- Middleware global de errores en `app.ts`.
- Renombrar `appId`/`productName` en `electron-builder.json5` (siguen en placeholder `YourAppID`/`YourAppName`).

### Importante
- Implementar edición/anulación/visualización de remitos guardados en el frontend (el backend `GET /remitos` ya existe).
- Completar los campos del detalle del remito (`especie`, `diámetro`, `largo`, `pesos`, `volumen`, `depósito`, `precio_unitario`, `lote`) en la UI o al menos definir si quedan deshabilitados.
- Hacer la exportación Excel portable (no usar `exec("start ..."`; resolver el archivo en el cliente Electron vía `res.download` y abrirlo desde Electron, no desde el backend).
- Corregir las columnas `fecha` y `patente` en `excel.service.ts` (no existen en la tabla real).
- Quitar del repo los build artifacts commiteados (`BACKEND/Stock.xlsx`, `FRONTEND/dist-electron/main.js`, `FRONTEND/dist-electron/preload.mjs`).
- Centralizar la URL del backend (`http://localhost:3001`) en una variable/env (`vite.config.ts` / `.env` del frontend).

### Secundario
- Implementar menú lateral (`Sidebar`) con rutas (Dashboard/Producción/Stock/Compras/Reportes/Configuración).
- Renombrar `index.html` title y favicon del boilerplate.
- Reemplazar `alert()` por notificaciones/toasts.
- Configurar timeouts en el `Pool` de `pg`.
- Logging estructurado (pino/winston) en backend.
- Revisar uso real de `ipcRenderer` expuesto (hoy declarado pero no usado para negocio).

---

# 11. Problemas técnicos conocidos

### Código
- `BACKEND/src/services/remitos.service.ts:13` usa `datos: any` → pierde tipado en el punto más crítico (POST de remito).
- `BACKEND/src/controllers/remitos.controller.ts` NO captura excepciones: si `guardarRemito` lanza (tras ROLLBACK), la promesa del handler se rechaza y Express 5 responde con un error genérico sin JSON controlado.
- `BACKEND/src/services/excel.service.ts:21-23` define `key: "fecha"` y `key: "patente"` que **no existen** como columnas en `remitos` (✅ verificado en runtime: las reales son `fecha_comprobante`, `fecha_recepcion`, `patente_chasis`, `patente_acoplado`). `worksheet.addRows(resultado.rows)` mapea por key y deja esas celdas vacías en el Excel. Adicionalmente `exec("start ...")` **abre** el archivo en la PC del backend, no del cliente Electron.
- `FRONTEND/src/components/ui/Input.tsx:7-25` intercepta globalmente Enter y mueve el foco al siguiente `form.element`. Esto puede entrar en conflicto con `onKeyDown` externos (por suerte los `onKeyDown` externos se llaman después vía `onKeyDown?.(e)`). Riesgo de UX sutil aunque funciona.
- `FRONTEND/src/components/FormularioRemito.tsx:241-304` contiene **5 bloques comentados** (`centroCompra`, `patente`, `clausulaCompra`, `centroAuxiliar`, `centroCredito`, `obra`) — código muerto referenciando campos que sí existen en el modelo/backend pero que la UI no expone. Representa pérdida de funcionalidad ya implementada.
- `FRONTEND/README.md` es el boilerplate de `vite-plugin-react` y no documenta el proyecto real.

### Configuración sospechosa
- `electron-builder.json5` con `appId: "YourAppID"` y `productName: "YourAppName"` (placeholders sin cambiar).
- `index.html` title `"Vite + React + TS"` y favicon `vite.svg` (boilerplate).
- `BACKEND/Stock.xlsx` está commiteado (2 KB, artefacto generado).
- `FRONTEND/dist-electron/main.js` y `FRONTEND/dist-electron/preload.mjs` están commiteados (build).
- `FRONTEND/.eslintrc.cjs` ignorea `dist` pero NO `dist-electron`, por lo que lint puede reportar contra el build.
- `tsconfig.json` del backend no define `strict` para los tipos Node completos (sí `strict: true`) pero el `package.json` declara `express: ^5.2.1` (Express 5, inestable/aversión muy nueva); verificar compatibilidad de `@types/express: ^5.0.6`.

### Seguridad
- 🔴 El archivo `BACKEND/.env` existe localmente con credenciales reales (`DB_PASSWORD=...`). Afortunadamente **NO está trackeado** por git (`.gitignore` raíz lo ignora correctamente, confirmado con `git ls-files` y `git check-ignore`). Indicar al orquestador: nunca commitear `.env`.
- 🔴 La API no tiene autenticación. Acepta cualquier POST a `/remitos` desde cualquier origen (CORS `*`).
- 🟡 SQL embebido con parámetros `$1..$N` (correcto, no hay inyección aparente), pero sin validación de payload.
- 🟡 Exposición del backend en `0.0.0.0` implícita? `app.listen(PORT)` sin host → escucha en todas las interfaces. En una app de escritorio local es bajo riesgo, pero convendría bind a `127.0.0.1`.

### Concurrency / rendimiento
- `guardarRemito` usa `pool.connect()` correctamente con `finally { client.release() }`. OK.
- `obtenerRemitos`, `getProveedores`, `getProductos` usan `pool.query` directo (sin `connect`) — correcto para queries puntuales.
- `exportarStockExcel` no tiene protección contra invocaciones concurrentes (escritura a `Stock.xlsx` compartido). dos exports simultáneos podrían corromper el archivo o generar error de escritura.
- El `useProveedores` y `useProductos` cargan TODOS los registros en memoria (sin paginación). Si los catálogos crecen, UI degrada.

### Manejo de errores
- `server.ts` no levanta el server si la BD no responde, pero tampoco `process.exit(1)`; el proceso queda vivo sin escuchar. Confuso para ops.

### Documentación contradicción
- El README del frontend es el del template Vite. El único "documento" del proyecto es el nombre del repo + el código. **Prioridad: código.**

---

# 12. Decisiones arquitectónicas existentes

### Decisiones explícitas encontradas
- Aplicación de escritorio con Electron (acción confirmada por `vite-plugin-electron` + `electron-builder`).
- Backend Express + `pg` directo (sin ORM/Query Builder).
- Tailwind como único sistema de estilos.
- Comentario en `FRONTEND/src/models/Remito.ts:1-3` documenta explícitamente que `RemitoCabecera` ↔ tabla `remitos` y `RemitoDetalle` ↔ tabla `remitos_detalle` en PostgreSQL.
- Comentarios en `remitos.service.ts:19-21` y `:93-95` refuerzan explícitamente los nombres reales de las tablas.
- `.gitignore` raíz ignora `.env` y `node_modules` (decisión explícita de seguridad).

### Decisiones inferidas
- **Sin router ni state manager** → se infiere que la app se concibe como 1 sola pantalla (al menos en esta etapa).
- **No hay capa de validación** → se infiere prototipo/MVP enfocado en demostrar el flujo de carga.
- **No hay migraciones** → se infiere que el esquema DB se gestiona manualmente fuera del repo (requiere definición).
- **Sin tests** → se infiere decisión implícita de "postergar QA hasta بعد del MVP".
- **`exec("start ...")`** → se infiere target explícito Windows (al menos para el MVP).
- **`http://localhost:3001` hardcoded** → se infiere arquitectura 100% local (backend y frontend corren en la misma PC).
- **Patrones**: Controller/Service/Route (3 capas) en backend; Container/Presentation vía hooks en frontend; Lookup pattern estilo ERP (búsqueda por código + modal F12) heredado de sistemas administrativos legacy.
- **Convención de naming**: snake_case en backend y modelos (`numero_remito`, `fecha_comprobante`), camelCase en TS puro de UI.

---

# 13. Variables de entorno y configuración

### Archivos `.env.example`
- 🔴 **No existe** `.env.example` en ningún lado. Recomendado crear uno.

### Variables requeridas (BACKEND/.env)
Existen localmente (NO se exponen valores por seguridad):

```
PORT=...        -> puerto del backend (default 3001)
DB_HOST=...     -> host PostgreSQL
DB_PORT=...     -> puerto PostgreSQL
DB_USER=...     -> usuario PostgreSQL
DB_PASSWORD=... -> [SECRET DETECTADO - NO INCLUIR] (existe en el archivo local, NO está en git)
DB_NAME=...     -> nombre de la base de datos (aserradero_db)
```

> ⚠️ **NOTA IMPORTANTE**: el archivo `BACKEND/.env` contiene la contraseña real de PostgreSQL. Está correctamente excluido del control de versiones (verificado con `git check-ignore` y `git ls-files`). El agente orquestador NO debe nunca commitear este archivo ni volcar sus valores en logs/documentos.

### Frontend
- No hay `.env` en el frontend. La URL del backend está **hardcodeada** en `FRONTEND/src/services/api.ts:4` (`baseURL: "http://localhost:3001"`). Decide inferida: faltan variables `VITE_API_URL`.

### Puertos
- Backend: `3001` (configurable por `PORT`).
- PostgreSQL: `5432` (default).
- Vite dev server: puerto por defecto de Vite (5173) cuando se ejecuta fuera de Electron.

### URLs
- API: `http://localhost:3001` (cliente → backend).
- Vite dev server (en Electron): `process.env.VITE_DEV_SERVER_URL` (lo setea `vite-plugin-electron`).

### Configuración importante
- `electron-builder.json5`: appId/productName en placeholder.
- `tailwind.config.ts`: sin extender tema (config mínima).
- `tsconfig` de ambos lados con `strict: true`.

---

# 14. Scripts y comandos

### Backend (`BACKEND/`)
```
npm install           # instala dependencias
npm run dev           # tsx watch src/server.ts  (hot reload)
npm run build         # tsc -> dist/
npm start             # node dist/server.js
```
No hay script de `lint`, `test`, ni `migrate`.

### Frontend (`FRONTEND/`)
```
npm install           # instala dependencias
npm run dev           # vite (dev server + Electron en modo dev)
npm run build         # tsc && vite build && electron-builder   (build final de escritorio)
npm run lint          # eslint . --ext ts,tsx
npm run preview       # vite preview
```
No hay script de `test` ni `migrate`.

### Ejecución combinada (manual, no script orquestado)
1. Levantar PostgreSQL (externo, `localhost:5432`, base `aserradero_db`). El esquema debe existir previamente (NO DETERMINADO cómo se crea).
2. `cd BACKEND && npm run dev` → Express en `:3001`.
3. `cd FRONTEND && npm run dev` → Vite + Electron abre la ventana de escritorio.

### Migraciones / seeds
- 🔴 No existen. Requiere definición.

---

# 15. Testing

- 🔴 **No hay tests** en todo el repo.
- **Cobertura**: 0% (no hay runners, ni `*.test.*`, ni `*.spec.*`).
- **Herramientas**: ninguna configurada (sin vitest, jest, playwright).
- **Partes sin tests**: la totalidad del sistema. Especialmente crítico: lógica transaccional de `guardarRemito`, scoring de los Lookups, validación de schemas.

---

# 16. Dependencias externas

- **PostgreSQL**: motor externo, debe estar instalado y con la base `aserradero_db` + tablas creadas fuera del repo.
- **Microsoft Excel / visor de .xlsx**: la exportación abre el archivo con `start`, lo que requiere una aplicación asociada a `.xlsx` en Windows.
- **Sin servicios cloud / SaaS**: no hay dependencias de terceros online.

---

# 17. Riesgos técnicos

| Riesgo | Nivel | Razón |
|---|---|---|
| Sin esquema SQL versionado | 🔴 ALTO | La BD **existe y funciona** (✅ verificada: 4 tablas, 5 remitos, 3.104 proveedores), pero el DDL no está en el repo → imposible reproducir el entorno desde el código. Cualquier nuevo dev/agente debe pedirlo o ejecutar `pg_dump -s`. |
| `POST /remitos` sin validación y con `datos: any` | 🔴 ALTO | Permite insertar basura / nulls / tipos erróneos en la BD. Corrupción de datos silenciosa. |
| `remitos.controller` no captura errores | 🔴 ALTO | Errores no devuelven JSON predecible; el frontend no puede distinguir fallos. |
| Sin autenticación en la API | 🔴 ALTO | Cualquier proceso en la red local puede POSTear remitos (CORS `*`, listen en todas las interfaces). |
| `.env` local con credenciales reales | 🟡 MEDIO | No está en git (OK), pero si un agente commitea por error, fuga credenciales. |
| Excel export con columnas inexistentes (`fecha`, `patente`) | 🟡 MEDIO | Exportación a medias; usuario final verá celdas vacías. |
| `exec("start ...")` Windows-only | 🟡 MEDIO | Rompe portabilidad Mac/Linux declarada en `electron-builder.json5`. |
| Exportación Excel sin protección de concurrencia | 🟡 MEDIO | Dos exports simultáneos corrompen `Stock.xlsx`. |
| Build artifacts commiteados (`Stock.xlsx`, `dist-electron/*`) | 🟡 MEDIO | Contaminación del repo, diffs innecesarios, riesgo de conflicto. |
| Campos de detalle hardcodeados a 0/"" | 🟡 MEDIO | Datos incompletos en la BD; reportes futuros inválidos. |
| `electron-builder` con appId/productName placeholder | 🟡 MEDIO | Build de producción inviable sin corrección. |
| Sin tests / sin logging / sin manejo global de errores | 🟡 MEDIO | Difícil diagnosticar incidentes en producción. |
| `app.listen(PORT)` sin bind a 127.0.0.1 | 🟢 BAJO | App local, pero conviene restringir. |
| `ipcRenderer` expuesto pero no usado | 🟢 BAJO | Código declarativo sin función; mantener o quitar con criterio. |
| Lookups sin paginación | 🟢 BAJO | Por hoy, catálogos probablemente chicos. |
| `README.md` del frontend es boilerplate | 🟢 BAJO | Documentación inexistente, pero no afecta runtime. |

---

# 18. Estado real del proyecto

### Funcionando (probablemente, requiere verificación en runtime)
- Carga de cabecera del remito en la UI.
- Lookups de proveedor y producto (módulos más maduros del proyecto, con teclado completo).
- Agregar/quitar ítems al detalle.
- `POST /remitos` con transacción (BEGIN/COMMIT/ROLLBACK) — asumiendo que la BD y las tablas existen con el esquema esperado.
- `GET /proveedores` y `GET /productos`.
- `GET /exportar-stock` (en Windows).
- Empaquetado Electron en dev (`npm run dev`).

### Incompleto
- 6 de 7 botones del Sidebar sin navegación.
- Edición / anulación / listado de remitos guardados (UI).
- Campos del detalle del remito (especie, diámetro, largo, pesos, volumen, depósito, precio, lote).
- Validaciones cliente + servidor.
- Manejo global de errores y logging.
- Tests.
- Build de producción (placeholders en electron-builder).

### Estable (no tocar sin razón técnica)
- `FRONTEND/src/components/lookup/ProveedorModal.tsx` y `ProductoModal.tsx` (lógica de scoring + teclado pulcra).
- Arquitectura 3-capas del backend (routes/controllers/services).
- `FRONTEND/src/hooks/useProveedores.ts` / `useProductos.ts`.
- `FRONTEND/src/models/Remito.ts` (contracts claros).

### Requiere pruebas
- Funcionamiento real de `POST /remitos` (✅ esquema BD verificado, pero la transacción de BEGIN/COMMIT no fue probada con datos end-to-end en esta auditoría).
- Exportación Excel (✅ columnas `fecha`/`patente` confirmadas inexistentes vs schema real; el `.xlsx` se genera pero con celdas vacías en esas columnas).
- `Input.tsx` en escenarios con muchos inputs (conflictos de foco).

### No debería modificarse sin razón técnica
- El patrón de scoring de los Modales ( Produce pérdida de capacidad existente).
- La estructura de carpetas (es coherente).

---

# 19. Próximos pasos recomendados

> Basados únicamente en problemas reales detectados. No se propone reorganizar ni cambiar stack.

1. **Recuperar el DDL de PostgreSQL** ✅ (ya verificado en runtime): versionarlo en `DATABASE/`. Extraer con `pg_dump -s -U postgres aserradero_db > DATABASE/schema.sql` (también `-a` para seeds de `productos`/`proveedores` si se desean). Sin este script, el entorno no se puede reprovisionar en otra PC. (Crítico — la BD existe y tiene datos, pero su DDL no está versionado.)
2. **Crear `.env.example`** en `BACKEND/` con las claves (`PORT`, `DB_HOST`, etc.) sin valores reales.
3. **Validar schema de `POST /remitos`** con zod/express-validator, eliminando `datos: any`.
4. **Capturar errores en controllers** (mínimo, agregar try/catch en `remitos.controller.ts` y un middleware de errores en `app.ts`).
5. **Reconciliar columnas del Excel** (`fecha`, `patente`) con los nombres reales de la tabla `remitos`.
6. **Eliminar el `exec start`** del backend o aislarlo: la exportación debe entregarse al cliente Electron (`res.download` ya lo hace) y abrir desde el renderer (vía Electron `shell.openPath`), no desde el backend.
7. **Quitar del repo** los build artifacts (`BACKEND/Stock.xlsx`, `FRONTEND/dist-electron/*`) y agregarlos a `.gitignore`.
8. **Renombrar** `appId` y `productName` en `electron-builder.json5`; actualizar `index.html` (title, favicon); leer el icono correcto en `electron/main.ts`.
9. **Centralizar** la URL del backend en `VITE_API_URL` (frontend `.env`) y exponerla vía `vite.config.ts`.
10. **Implementar** la visualización de remitos guardados (UI) consumiendo `GET /remitos` (extremo ya listo).
11. **Agregar** test mínimo del flujo `guardarRemito` (transacción) y de los lookups (scoring).
12. **Re-exponer** los campos comentados en `FormularioRemito.tsx` (centro de compra/auxiliar/crédito, obra, cláusula, patente) alineando con el modelo/backend.
13. **Reestringir** `app.listen` a `127.0.0.1` y limitar `cors()` a `http://localhost:*` (app local).

---

# 20. Mapa de archivos críticos

| Ruta | Propósito | Importancia |
|---|---|---|
| `BACKEND/src/app.ts` | Montaje de Express y rutas | 🔴 Alta |
| `BACKEND/src/server.ts` | Arranque + ping a Postgres | 🔴 Alta |
| `BACKEND/src/database/connection.ts` | Pool de conexiones pg | 🔴 Alta |
| `BACKEND/src/services/remitos.service.ts` | Lógica transaccionalmente de guardado | 🔴 Alta (núcleo del negocio) |
| `BACKEND/src/controllers/remitos.controller.ts` | Handler POST/GET remitos | 🔴 Alta (tiene el bug del catch faltante) |
| `BACKEND/src/services/excel.service.ts` | Exportación Excel (bug columnas + Windows-only) | 🟡 Media |
| `BACKEND/.env` | Credenciales DB (existe local, no commiteado) | 🔴 Alta (secreto) |
| `FRONTEND/src/components/FormularioRemito.tsx` | UI principal (419 líneas, monolítica) | 🔴 Alta |
| `FRONTEND/src/hooks/useRemito.ts` | Estado + handlers de la pantalla principal | 🔴 Alta |
| `FRONTEND/src/models/Remito.ts` | Contratos de datos cabecera/detalle | 🔴 Alta (contrato entre front y back) |
| `FRONTEND/src/constants/remito.ts` | Estado inicial del formulario | 🟡 Media |
| `FRONTEND/src/components/lookup/ProveedorModal.tsx` | Scoring + teclado proveedor | 🟡 Media (estable, sirve como patrón) |
| `FRONTEND/src/components/lookup/ProductoModal.tsx` | Scoring + teclado producto | 🟡 Media |
| `FRONTEND/electron/main.ts` | Shell Electron | 🟡 Media |
| `FRONTEND/vite.config.ts` | Config Vite + plugin Electron | 🟡 Media |
| `FRONTEND/electron-builder.json5` | Empaquetado (placeholders incorrectos) | 🟡 Media |
| `.gitignore` (raíz) | Exclusiones (OK) | 🟢 Baja |

---

# CONTEXTO PARA EL AGENTE ORQUESTADOR

**Síntesis técnica (≤1500 palabras)**

### 1. Qué es el proyecto
`AserraderoNorfor` es un ERP de escritorio temprano/MVP para un aserradero. Su único flujo funcional es registrar "remitos de recepción de materia prima" (madera) con cabecera y detalle, persistirlos en PostgreSQL y, eventualmente, exportarlos a Excel.

### 2. Cómo funciona
El usuario abre la app de escritorio (Electron) → ve un `Sidebar` decorativo + un formulario (`FormularioRemito`). Completa la cabecera; busca el proveedor por cuform (Input → Enter, o F12 → modal con scoring y flechas/Enter). Agrega productos al detalle (`ProductoLookup` + cantidad). Al "Guardar" se envía `POST /remitos` al backend Express (Node) que en una transacción PostgreSQL inserta en `remitos` y luego por cada item en `remitos_detalle` (BEGIN/COMMIT/ROLLBACK). El botón "Exportar Excel" hace `GET /exportar-stock` que genera `Stock.xlsx` con ExcelJS y lo abre en Windows con `exec start`.

### 3. Arquitectura
3 capas: Electron (renderer React) → HTTP axios (localhost:3001) → Express → pg Pool → PostgreSQL `aserradero_db`. Sin auth, sin router en frontend, sin state manager, sin ORM, sin migraciones. Backend en patrón routes/controllers/services. Frontend con patrón hooks/services/components. IPC de Electron expuesto pero no usado para negocio.

### 4. Stack
- Front: React 18 + TS 5.2 + Vite 5 + Tailwind 3 + axios 1 + Electron 30 + electron-builder 24.
- Back: Express 5 + TS 7 + pg 8 + exceljs 4 + dotenv + cors + tsx.
- DB: PostgreSQL.
- Sin APIs externas. Todo local.

### 5. Estado actual
1 solo commit, "Primer commit". Funciona el flujo de carga + lookups + save transaccional. Faltan: listado/edición de remitos, 6/7 secciones del sidebar, validaciones, schema SQL, tests, logging, manejo de errores, autenticación, build de producción con identidad correcta.

### 6. Decisiones importantes
- **Explícitas**: Electron + Express + pg sin ORM; `.env` ignorado por git; mapeo cabecera↔`remitos`, detalle↔`remitos_detalle` documentado en `models/Remito.ts`.
- **Inferidas**: target Windows; 1 sola pantalla por ahora; esquema DB gestionado a mano; `localhost:3001` hardcodeado; sin tests por ser MVP.

### 7. Restricciones
- No tocar sin razón: patrón de scoring de los modales, estructura de carpetas, contratos de `models/Remito.ts`, hooks de catálogos.
- No commitear `BACKEND/.env` (contiene credenciales reales; hoy bien ignorado).
- No asumir el esquema SQL: ya está **verificado en runtime** (sección 7). Apoyarse en esa sección en vez de inferir. Columns y tipos exactos disponibles.
- No agregar dependencias sin justificación documentada.
- Mantener TypeScript `strict: true` en ambos lados.

### 8. Problemas conocidos
- `POST /remitos` sin validación (`datos: any`) y sin catch en controller.
- `excel.service.ts` define columnas `fecha`/`patente` inexistentes → export vacío en esas celdas.
- `exec("start ...")` ROMPE portabilidad (Mac/Linux).
- `electron-builder.json5` con placeholders `YourAppID/YourAppName`.
- Build artifacts commiteados: `BACKEND/Stock.xlsx`, `FRONTEND/dist-electron/main.js`, `FRONTEND/dist-electron/preload.mjs`.
- 5 bloques de campos comentados en `FormularioRemito.tsx` (centro de compra, cláusula, auxiliar, crédito, obra, patente simple).
- `app.listen(PORT)` sin bind a 127.0.0.1; CORS `*`.
- Input component intercepta Enter globalmente (foco al siguiente form element).

### 9. Tareas pendientes
- Críticas: versionar DDL SQL; crear `.env.example`; validar `POST /remitos`; capturar errores en controllers; middleware global.
- Importantes: UI de listado/edición de remitos; completar campos del detalle; export portable; reconciliar columnas Excel; limpiar build artifacts del repo; renombrar appId/productName; centralizar `VITE_API_URL`.
- Secundarias: Sidebar funcional; toasts en lugar de `alert`; logging estructurado; timeouts en Pool; tests.

### 10. Qué debe verificar antes de modificar algo
1. **Esquema DB ya verificado** ✅ (ver sección 7): PostgreSQL 17.3, `aserradero_db`, 4 tablas (`remitos`, `remitos_detalle`, `proveedores`, `productos`) con PKs y una FK `fk_remito ON DELETE CASCADE`. `remitos` y `remitos_detalle` además tienen `created_at`/`updated_at` no expuestos en el código. Antes de tocar `remitos.service.ts`, **releer la sección 7** para respetar tipos exactos.
2. No asumir que `remitos.proveedor` sea FK de `proveedores.cuenta`: **NO lo es** (campo varchar libre). El sistema copia `razon_social`, no `cuenta`. Idem `remitos_detalle.producto` vs `productos.codigo`.
3. No usar credenciales del `.env` en logs ni documentos.
4. Antes de tocar `remitos.service.ts`, leer `models/Remito.ts` para respetar el contrato cabecera/detalle.
5. Antes de cambiar `excel.service.ts`, validar nombres reales de columnas en la BD (✅ confirmado: el código actual usa `fecha`/`patente` que NO existen — corregir, no preservar).
6. Antes de cambiar composición del detalle del remito, decidir con el negocio si los campos `especie`, `diametro`, `largo`, `peso_bruto`, `peso_neto`, `volumen`, `deposito`, `precio_unitario`, `lote` deben exponerse en la UI (hoy hardcodeados a ""/0; los numéricos se guardan como `0`, no `null`).
7. Si se ejecuta `npm run build` del frontend, recuerde que dispara `tsc && vite build && electron-builder`: requiere `appId` y `productName` válidos.
8. Si se ejecuta `npm run dev` del backend, requiere el `.env` presente (NO generarlo con credenciales arbitrarias; usar las del entorno real).
9. No confiar en `BACKEND/Stock.xlsx` ni `FRONTEND/dist-electron/*` del repo: son artefactos y deben regenerarse desde el código, no editarse.
10. Si se planea edición/eliminación de remitos: recordar que `fk_remito` es `ON DELETE CASCADE` (borrar un remito borra su detalle automáticamente; probablemente OK, pero documentado).

---

Fin del documento. Generado por análisis estático del código; no se ejecutó ningún comando ni se modificó ningún archivo excepto `PROJECT_CONTEXT.md`.

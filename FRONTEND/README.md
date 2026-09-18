# AserraderoNorfor — ERP de Aserradero

ERP de escritorio para digitalizar el ingreso de materia prima (madera) al aserradero:
remitos de recepción (cabecera + detalle de medición), persistidos en PostgreSQL,
con exportación a Excel.

## Arquitectura

```
Electron (BrowserWindow, shell)
   └── Renderer React/Vite (axios → http://127.0.0.1:3001)
          └── Backend Express (Node/TypeScript)
                 └── pg Pool → PostgreSQL aserradero_db
```

- **Backend**: Express 5 + TypeScript (strict), `pg` directo (sin ORM), ExcelJS, validación
  de payload propia (`remito.validation.ts`), middleware global de errores, CORS con
  allowlist de orígenes locales, bind a `127.0.0.1`.
- **Frontend**: React 18 + TypeScript + Vite 5 + Tailwind. SPA con 3 vistas
  (alta de remito, listado, detalle/edición). Lookups ERP (Proveedor/Producto/Origen)
  con F12/↑↓/Enter y navegación completa por teclado.
- **Electron**: empaquetado con electron-builder (NSIS Windows); en producción inicia
  automáticamente el backend empaquetado.

## Requisitos

- Node.js + npm (solo para desarrollo).
- PostgreSQL corriendo (no se incluye en la app), base `aserradero_db` con el esquema
  de `DATABASE/schema.sql` + migraciones de `DATABASE/migrations/` aplicadas.

## Configuración Backend (`.env`)

Crear `BACKEND/.env` (ver `BACKEND/.env.example`):

```
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=<contraseña real>
DB_NAME=aserradero_db
```

El backend no levanta si no puede conectar a PostgreSQL.

## Desarrollo

```bash
# Terminal 1 — backend (hot reload)
cd BACKEND
npm install
npm run dev        # tsx watch src/server.ts → http://127.0.0.1:3001

# Terminal 2 — frontend
cd FRONTEND
npm install
npm run dev        # vite → http://localhost:5173
```

## Compilar / empaquetar

```bash
cd BACKEND
npm run build      # tsc → BACKEND/dist/

cd FRONTEND
npm run build      # tsc && vite build && electron-builder
# genera FRONTEND/release/<version>/AserraderoNorfor-Windows-<version>-Setup.exe
# y FRONTEND/release/<version>/win-unpacked/
```

## Backend empaquetado

- `electron-builder` incluye el backend en el instalador vía `extraResources`
  (copiado a `resources/backend/`: `dist/`, `node_modules/`, `package.json`).
- Al abrir la app empaquetada, `electron/main.ts` arranca el backend con el runtime
  de Electron (`ELECTRON_RUN_AS_NODE=1`, no requiere Node.js instalado), espera a que
  escuche en `127.0.0.1:3001` y luego carga la UI. Al cerrar la app, el backend termina.
- **El `.env` NO viaja con el instalador**: colocar manualmente un `.env` con la
  configuración de PostgreSQL en `resources/backend/` (junto a `dist/`) después de
  instalar. Sin él, el backend no puede conectar y se reinicia en bucle (visible en logs).

## Estructura

```
AserraderoNorfor/
├── BACKEND/            API Express (routes/controllers/services/database/types/data)
├── DATABASE/           schema.sql + migrations/ (001_tara, 002_drop_volumen)
├── FRONTEND/           React+Electron (src/components, hooks, models, services, utils)
└── PROJECT_CONTEXT.md  contexto técnico del proyecto
```

## Estado funcional actual

- ✅ Alta completa de remitos con detalle de medición (especie, diámetro, largo,
  peso bruto/tara, peso neto calculado `bruto − tara` en backend, lote de 5 dígitos
  generado por BD con advisory lock, F3 para generar).
- ✅ Listado, visualización y edición de remitos; agregar/eliminar ítems en edición.
- ✅ Anulación lógica (`estado = "ANULADO"`, terminal; sin DELETE físico).
- ✅ Lookups de Proveedor/Producto/Origen con modal y teclado completo.
- ✅ Exportación Excel (`GET /exportar-stock`).
- ✅ Validaciones en frontend y backend (segunda barrera).
- ✅ Instalador Windows con backend incluido y arranque automático.

## Limitaciones conocidas

- Sin autenticación/usuarios (app local de un solo usuario); `usuario` no se setea.
- La exportación Excel usa `exec("start ...")` (Windows-only) y abre el archivo en la
  PC donde corre el backend.
- Sin paginación en listado/catálogos; sin índices secundarios en BD.
- Icono/branding de la app siguen siendo los del boilerplate de Vite.
- Postgres, Node y el `.env` deben proveerse fuera del instalador.

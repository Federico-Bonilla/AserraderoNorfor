function Sidebar() {
  return (
    <aside className="w-64 bg-slate-800 text-white">
      <div className="border-b border-slate-700 p-6">
        <h2 className="text-xl font-bold">🌲 ASERRADERO</h2>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          <li>
            <button className="w-full rounded-lg px-4 py-3 text-left transition hover:bg-slate-700">
              🏠 Dashboard
            </button>
          </li>

          <li>
            <button className="w-full rounded-lg bg-slate-700 px-4 py-3 text-left font-semibold">
              📦 Materia Prima
            </button>
          </li>

          <li>
            <button className="w-full rounded-lg px-4 py-3 text-left transition hover:bg-slate-700">
              🏭 Producción
            </button>
          </li>

          <li>
            <button className="w-full rounded-lg px-4 py-3 text-left transition hover:bg-slate-700">
              📋 Stock
            </button>
          </li>

          <li>
            <button className="w-full rounded-lg px-4 py-3 text-left transition hover:bg-slate-700">
              🚚 Compras
            </button>
          </li>

          <li>
            <button className="w-full rounded-lg px-4 py-3 text-left transition hover:bg-slate-700">
              📊 Reportes
            </button>
          </li>

          <li>
            <button className="w-full rounded-lg px-4 py-3 text-left transition hover:bg-slate-700">
              ⚙️ Configuración
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;

interface SidebarProps {
  vista: "formulario" | "listado";
  onNavigate: (vista: "formulario" | "listado") => void;
}

function Sidebar({ vista, onNavigate }: SidebarProps) {
  return (
    <aside className="w-64 bg-slate-800 text-white">
      <div className="border-b border-slate-700 p-6">
        <h2 className="text-xl font-bold">🌲 ASERRADERO</h2>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => onNavigate("listado")}
              className={`w-full rounded-lg px-4 py-3 text-left transition ${
                vista === "listado"
                  ? "bg-slate-700 font-semibold"
                  : "hover:bg-slate-700"
              }`}
            >
              📋 Listado Remitos
            </button>
          </li>

          <li>
            <button
              onClick={() => onNavigate("formulario")}
              className={`w-full rounded-lg px-4 py-3 text-left transition ${
                vista === "formulario"
                  ? "bg-slate-700 font-semibold"
                  : "hover:bg-slate-700"
              }`}
            >
              📦 Cargar Remito
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;

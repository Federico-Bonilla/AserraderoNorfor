import { useEffect, useRef, useState } from "react";
import FormularioRemito from "./components/FormularioRemito";
import ListadoRemitos from "./components/ListadoRemitos";
import Sidebar from "./components/layout/Sidebar";

function App() {
  const [vista, setVista] = useState<"formulario" | "listado">("formulario");
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [vista]);

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar vista={vista} onNavigate={setVista} />

      <main ref={mainRef} className="flex-1 overflow-auto p-8">
        <div className="rounded-xl bg-white shadow-lg">
          <header className="border-b border-slate-200 px-8 py-6">
            <h1 className="text-3xl font-bold text-slate-800">
              Sistema de Gestión de Aserradero
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {vista === "formulario"
                ? "Ingreso de Materia Prima"
                : "Listado de Remitos"}
            </p>
          </header>

          <section className="p-8">
            {vista === "formulario" ? (
              <FormularioRemito />
            ) : (
              <ListadoRemitos />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;

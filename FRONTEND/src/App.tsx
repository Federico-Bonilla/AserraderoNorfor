import { useEffect, useRef, useState } from "react";
import FormularioRemito from "./components/FormularioRemito";
import ListadoRemitos from "./components/ListadoRemitos";
import DetalleRemito from "./components/DetalleRemito";
import Sidebar from "./components/layout/Sidebar";

function App() {
  const [vista, setVista] = useState<"formulario" | "listado" | "detalle">(
    "formulario",
  );
  const [remitoSeleccionado, setRemitoSeleccionado] = useState<number | null>(
    null,
  );
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [vista]);

  const irA = (v: "formulario" | "listado") => {
    setRemitoSeleccionado(null);
    setVista(v);
  };

  const abrirDetalle = (id: number) => {
    setRemitoSeleccionado(id);
    setVista("detalle");
  };

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar
        vista={vista === "detalle" ? "listado" : vista}
        onNavigate={irA}
      />

      <main ref={mainRef} className="flex-1 overflow-auto p-8">
        <div className="rounded-xl bg-white shadow-lg">
          <header className="border-b border-slate-200 px-8 py-6">
            <h1 className="text-3xl font-bold text-slate-800">
              Sistema de Gestión de Aserradero
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {vista === "formulario"
                ? "Ingreso de Materia Prima"
                : vista === "listado"
                  ? "Listado de Remitos"
                  : "Detalle de Remito"}
            </p>
          </header>

          <section className="p-8">
            {vista === "formulario" && <FormularioRemito />}
            {vista === "listado" && <ListadoRemitos onVer={abrirDetalle} />}
            {vista === "detalle" && remitoSeleccionado !== null && (
              <DetalleRemito
                id={remitoSeleccionado}
                onCancelar={() => irA("listado")}
                onGuardado={() => irA("listado")}
              />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;

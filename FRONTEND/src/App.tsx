import FormularioRemito from "./components/FormularioRemito";
import Sidebar from "./components/layout/Sidebar";

function App() {
  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar />

      <main className="flex-1 overflow-auto p-8">
        <div className="rounded-xl bg-white shadow-lg">
          <header className="border-b border-slate-200 px-8 py-6">
            <h1 className="text-3xl font-bold text-slate-800">
              Sistema de Gestión de Aserradero
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Ingreso de Materia Prima
            </p>
          </header>

          <section className="p-8">
            <FormularioRemito />
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;

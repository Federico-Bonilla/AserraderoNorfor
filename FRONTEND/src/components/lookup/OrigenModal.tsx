import { useMemo, useState } from "react";
import Input from "../ui/Input";
import { Origen } from "../../services/origen.service";

interface OrigenModalProps {
  open: boolean;
  origenes: Origen[];
  onSelect: (origen: Origen) => void;
  onClose: () => void;
}

function OrigenModal({
  open,
  origenes,
  onSelect,
  onClose,
}: OrigenModalProps) {
  const [busqueda, setBusqueda] = useState("");
  const [indiceSeleccionado, setIndiceSeleccionado] = useState(0);

  const texto = busqueda.trim().toLowerCase();

  const resultados = useMemo(() => {
    if (!texto) return origenes;

    return origenes.filter(
      (origen) =>
        origen.codigo.toLowerCase().includes(texto) ||
        origen.descripcion.toLowerCase().includes(texto),
    );
  }, [origenes, texto]);

  const manejarTeclado = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setIndiceSeleccionado((i) =>
          Math.min(i + 1, resultados.length - 1),
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setIndiceSeleccionado((i) => Math.max(i - 1, 0));
        break;

      case "Enter":
        e.preventDefault();

        if (resultados[indiceSeleccionado]) {
          onSelect(resultados[indiceSeleccionado]);
          onClose();
        }
        break;

      case "Escape":
        e.preventDefault();
        onClose();
        break;
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="flex h-[450px] w-[700px] flex-col rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-xl font-bold">Buscar origen</h2>

          <button
            type="button"
            onClick={onClose}
            className="text-2xl font-bold hover:text-red-600"
          >
            ✕
          </button>
        </div>

        <div className="p-4">
          <Input
            noNavegar
            autoFocus
            placeholder="Buscar por código o descripción"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setIndiceSeleccionado(0);
            }}
            onKeyDown={manejarTeclado}
          />
        </div>

        <div className="flex-1 overflow-auto border-t">
          {resultados.length === 0 ? (
            <p className="p-4 text-center text-gray-500">
              Sin orígenes.
            </p>
          ) : (
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Código</th>
                  <th className="p-2 text-left">Descripción</th>
                </tr>
              </thead>

              <tbody>
                {resultados.map((origen, index) => (
                  <tr
                    key={origen.codigo}
                    onClick={() => setIndiceSeleccionado(index)}
                    onDoubleClick={() => {
                      onSelect(origen);
                      onClose();
                    }}
                    className={`cursor-pointer border-b ${
                      index === indiceSeleccionado
                        ? "bg-blue-200"
                        : "hover:bg-blue-100"
                    }`}
                  >
                    <td className="p-2">{origen.codigo}</td>
                    <td className="p-2">{origen.descripcion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrigenModal;
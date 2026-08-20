import { useEffect, useMemo, useRef, useState } from "react";
import { Producto } from "../../services/producto.service";
import Input from "../ui/Input";

interface ProductoModalProps {
  open: boolean;
  productos: Producto[];
  onSelect: (producto: Producto) => void;
  onClose: () => void;
}

function ProductoModal({
  open,
  productos,
  onSelect,
  onClose,
}: ProductoModalProps) {
  const [busqueda, setBusqueda] = useState("");
  const [indiceSeleccionado, setIndiceSeleccionado] = useState(0);

  const filasRef = useRef<(HTMLTableRowElement | null)[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const texto = busqueda.trim().toLowerCase();

  const resultados = useMemo(() => {
    if (!texto) return productos;

    const score = (p: Producto) => {
      const codigo = p.codigo.toLowerCase();
      const descripcion = p.descripcion.toLowerCase();

      if (codigo === texto) return 0;
      if (codigo.startsWith(texto)) return 1;
      if (descripcion.startsWith(texto)) return 2;
      if (descripcion.includes(texto)) return 3;

      return 999;
    };

    return productos
      .filter((p) => score(p) < 999)
      .sort((a, b) => score(a) - score(b));
  }, [productos, texto]);

  useEffect(() => {
    if (!open) return;

    setBusqueda("");
    setIndiceSeleccionado(0);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, [open]);

  useEffect(() => {
    setIndiceSeleccionado(0);
  }, [busqueda]);

  useEffect(() => {
    filasRef.current[indiceSeleccionado]?.scrollIntoView({
      block: "nearest",
    });
  }, [indiceSeleccionado]);

  const manejarTeclado = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setIndiceSeleccionado((i) => Math.min(i + 1, resultados.length - 1));
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
      <div className="flex h-[650px] w-[900px] flex-col rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-xl font-bold">Buscar producto</h2>

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
            ref={inputRef}
            noNavegar
            autoFocus
            placeholder="Buscar por código o descripción"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={manejarTeclado}
          />
        </div>

        <div className="flex-1 overflow-auto border-t">
          <table className="w-full">
            <thead className="sticky top-0 bg-gray-100">
              <tr>
                <th className="p-2 text-left">Código</th>
                <th className="p-2 text-left">Descripción</th>
                <th className="p-2 text-left">Unidad</th>
              </tr>
            </thead>

            <tbody>
              {resultados.map((producto, index) => (
                <tr
                  key={producto.codigo}
                  ref={(el) => {
                    filasRef.current[index] = el;
                  }}
                  onClick={() => setIndiceSeleccionado(index)}
                  onDoubleClick={() => {
                    onSelect(producto);
                    onClose();
                  }}
                  className={`cursor-pointer border-b ${
                    index === indiceSeleccionado
                      ? "bg-blue-200"
                      : "hover:bg-blue-100"
                  }`}
                >
                  <td className="p-2">{producto.codigo}</td>
                  <td className="p-2">{producto.descripcion}</td>
                  <td className="p-2">{producto.unidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ProductoModal;

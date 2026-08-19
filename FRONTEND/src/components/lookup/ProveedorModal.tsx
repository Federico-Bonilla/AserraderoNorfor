import { useEffect, useMemo, useRef, useState } from "react";
import { Proveedor } from "../../services/proveedor.service";
import Input from "../ui/Input";

interface ProveedorModalProps {
  open: boolean;
  proveedores: Proveedor[];
  onSelect: (proveedor: Proveedor) => void;
  onClose: () => void;
}

function ProveedorModal({
  open,
  proveedores,
  onSelect,
  onClose,
}: ProveedorModalProps) {
  const [busqueda, setBusqueda] = useState("");
  const [indiceSeleccionado, setIndiceSeleccionado] = useState(0);

  const filasRef = useRef<(HTMLTableRowElement | null)[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const texto = busqueda.trim().toLowerCase();
  const textoNumerico = texto.replace(/-/g, "").replace(/ /g, "");

  const resultados = useMemo(() => {
    if (!texto) return proveedores;

    const score = (p: Proveedor) => {
      const cuenta = p.cuenta.toLowerCase();
      const razon = p.razon_social.toLowerCase();
      const cuit = p.cuit.replace(/-/g, "").replace(/ /g, "");

      if (cuenta === texto) return 0;
      if (cuenta.startsWith(texto)) return 1;
      if (cuit === textoNumerico) return 2;
      if (cuit.startsWith(textoNumerico)) return 3;
      if (razon.startsWith(texto)) return 4;
      if (razon.includes(texto)) return 5;

      return 999;
    };

    return proveedores
      .filter((p) => score(p) < 999)
      .sort((a, b) => score(a) - score(b));
  }, [proveedores, texto, textoNumerico]);

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
          <h2 className="text-xl font-bold">Buscar proveedor</h2>

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
            placeholder="Buscar por Cuenta, Razón Social o CUIT"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={manejarTeclado}
          />
        </div>

        <div className="flex-1 overflow-auto border-t">
          <table className="w-full">
            <thead className="sticky top-0 bg-gray-100">
              <tr>
                <th className="p-2 text-left">Cuenta</th>
                <th className="p-2 text-left">Razón Social</th>
                <th className="p-2 text-left">CUIT</th>
              </tr>
            </thead>

            <tbody>
              {resultados.map((p, index) => (
                <tr
                  key={p.cuenta}
                  ref={(el) => {
                    filasRef.current[index] = el;
                  }}
                  onClick={() => setIndiceSeleccionado(index)}
                  onDoubleClick={() => {
                    onSelect(p);
                    onClose();
                  }}
                  className={`cursor-pointer border-b ${
                    index === indiceSeleccionado
                      ? "bg-blue-200"
                      : "hover:bg-blue-100"
                  }`}
                >
                  <td className="p-2">{p.cuenta}</td>
                  <td className="p-2">{p.razon_social}</td>
                  <td className="p-2">{p.cuit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ProveedorModal;

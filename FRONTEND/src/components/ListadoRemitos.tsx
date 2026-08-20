import { useState } from "react";
import { useRemitos } from "../hooks/useRemitos";
import { anularRemito } from "../services/remito.service";

interface ListadoRemitosProps {
  onVer: (id: number) => void;
}

function ListadoRemitos({ onVer }: ListadoRemitosProps) {
  const { remitos, loading, error, recargar } = useRemitos();
  const [anulandoId, setAnulandoId] = useState<number | null>(null);

  const confirmarAnular = async (id: number, numeroRemito: string) => {
    const ok = window.confirm(
      `Anular el remito ${numeroRemito}? Esta accion no se puede deshacer.`,
    );
    if (!ok) return;

    setAnulandoId(id);
    try {
      await anularRemito(id);
      await recargar();
    } catch (err) {
      console.error(err);
      window.alert("Error al anular el remito");
    } finally {
      setAnulandoId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-500">Cargando remitos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (remitos.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg text-slate-500">No hay remitos guardados</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
              N° Comprobante
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
              Fecha
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
              Proveedor
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
              Transporte
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
              Estado
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {remitos.map((remito) => {
            const anulado = remito.estado === "ANULADO";
            return (
              <tr
                key={remito.id}
                className="border-b border-slate-100 transition hover:bg-slate-50"
              >
                <td className="px-4 py-3 text-sm">
                  {remito.letra} {remito.numero_sucursal} - {remito.numero_remito}
                </td>
                <td className="px-4 py-3 text-sm">{remito.fecha_comprobante}</td>
                <td className="px-4 py-3 text-sm">{remito.proveedor}</td>
                <td className="px-4 py-3 text-sm">{remito.transporte}</td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                      anulado
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {remito.estado}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onVer(remito.id)}
                      className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-700"
                    >
                      👁 Ver
                    </button>
                    {!anulado && (
                      <button
                        onClick={() =>
                          confirmarAnular(
                            remito.id,
                            `${remito.letra} ${remito.numero_sucursal} - ${remito.numero_remito}`,
                          )
                        }
                        disabled={anulandoId === remito.id}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700 disabled:bg-red-300"
                      >
                        🚫 Anular
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ListadoRemitos;

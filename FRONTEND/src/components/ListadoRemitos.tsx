import { useRemitos } from "../hooks/useRemitos";

function ListadoRemitos() {
  const { remitos, loading, error } = useRemitos();

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
          </tr>
        </thead>
        <tbody>
          {remitos.map((remito) => (
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
                    remito.estado === "ACTIVO"
                      ? "bg-green-100 text-green-800"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {remito.estado}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ListadoRemitos;

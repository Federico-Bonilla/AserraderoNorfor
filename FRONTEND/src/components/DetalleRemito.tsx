import { useDetalleRemito } from "../hooks/useDetalleRemito";
import Input from "./ui/Input";
import Textarea from "./ui/Textarea";
import Button from "./ui/Button";

interface DetalleRemitoProps {
  id: number;
  onCancelar: () => void;
  onGuardado: () => void;
}

function DetalleRemito({ id, onCancelar, onGuardado }: DetalleRemitoProps) {
  const {
    formulario,
    loading,
    error,
    modo,
    guardando,
    errores,
    handleChange,
    activarEdicion,
    guardar,
  } = useDetalleRemito(id);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-500">Cargando remito...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-700">{error}</p>
        <div className="mt-4">
          <Button type="button" onClick={onCancelar}>
            Volver al listado
          </Button>
        </div>
      </div>
    );
  }

  if (!formulario) return null;

  const esVer = modo === "ver";
  const c = formulario.cabecera;

  const handleGuardar = async () => {
    const ok = await guardar();
    if (ok) onGuardado();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800">
          Remito N° {c.letra} {c.numero_sucursal} - {c.numero_remito}
        </h2>

        <span
          className={`ml-2 inline-block rounded-full px-2 py-1 text-xs font-medium ${
            esVer ? "bg-slate-100 text-slate-700" : "bg-blue-100 text-blue-800"
          }`}
        >
          {esVer ? "Modo Visualización" : "Modo Edición"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="col-span-2">
          <label className="mb-2 block font-medium">Comprobante</label>

          <div className="grid grid-cols-12 gap-2">
            <Input
              name="comprobante"
              value={c.comprobante}
              onChange={handleChange}
              disabled={esVer}
              className="col-span-2 text-center font-semibold"
            />

            <Input
              name="letra"
              value={c.letra}
              onChange={handleChange}
              disabled={esVer}
              className="col-span-1 text-center font-semibold"
            />

            <Input
              name="numero_sucursal"
              value={c.numero_sucursal}
              onChange={handleChange}
              disabled={esVer}
              className="col-span-2"
              placeholder="P.V."
            />

            <Input
              name="numero_remito"
              value={c.numero_remito}
              onChange={handleChange}
              disabled={esVer}
              className="col-span-3"
              placeholder="Número"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block font-medium">Fecha Comprobante</label>

          <Input
            type="date"
            name="fecha_comprobante"
            value={c.fecha_comprobante}
            onChange={handleChange}
            disabled={esVer}
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">Fecha Recepción</label>

          <Input
            type="date"
            name="fecha_recepcion"
            value={c.fecha_recepcion}
            onChange={handleChange}
            disabled={esVer}
          />
        </div>

        <div className="col-span-2">
          <label className="mb-2 block font-medium">Proveedor</label>

          <Input
            name="proveedor"
            value={c.proveedor}
            onChange={handleChange}
            disabled={esVer}
            placeholder="Proveedor"
          />
        </div>

        <div className="col-span-2 grid grid-cols-12 gap-4">
          <div className="col-span-8">
            <label className="mb-2 block font-medium">Dirección</label>

            <Input
              name="direccion"
              value={c.direccion}
              onChange={handleChange}
              disabled={esVer}
            />
          </div>

          <div className="col-span-4">
            <label className="mb-2 block font-medium">CUIT</label>

            <Input
              name="cuit"
              value={c.cuit}
              onChange={handleChange}
              disabled={esVer}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block font-medium">Origen</label>

          <Input
            name="origen"
            value={c.origen ?? ""}
            onChange={handleChange}
            disabled={esVer}
            placeholder="Origen"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">Certificado</label>

          <select
            name="certificado"
            value={c.certificado}
            onChange={handleChange}
            disabled={esVer}
            className="w-full rounded-md border px-3 py-2"
          >
            <option value="NO FSC">NO FSC</option>
            <option value="FSC 100%">FSC 100%</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block font-medium">Transporte</label>

          <Input
            name="transporte"
            value={c.transporte}
            onChange={handleChange}
            disabled={esVer}
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">Precio Transporte</label>

          <Input
            type="number"
            name="precio_transporte"
            value={c.precio_transporte}
            onChange={handleChange}
            disabled={esVer}
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">Lista de Precio</label>

          <Input
            name="lista_precio"
            value={c.lista_precio}
            onChange={handleChange}
            disabled={esVer}
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">Centro de Compra</label>

          <Input
            name="centro_compra"
            value={c.centro_compra}
            onChange={handleChange}
            disabled={esVer}
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">Patente Chasis</label>

          <Input
            name="patente_chasis"
            value={c.patente_chasis}
            onChange={handleChange}
            disabled={esVer}
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">Patente Acoplado</label>

          <Input
            name="patente_acoplado"
            value={c.patente_acoplado}
            onChange={handleChange}
            disabled={esVer}
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">Chofer</label>

          <Input
            name="chofer"
            value={c.chofer}
            onChange={handleChange}
            disabled={esVer}
          />
        </div>

        <div className="col-span-2">
          <label className="mb-2 block font-medium">Detalle del Remito</label>

          <table className="w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2 text-left">Código</th>
                <th className="border p-2 text-left">Descripción</th>
                <th className="border p-2 text-center">Cantidad</th>
                <th className="border p-2 text-center">Unidad</th>
              </tr>
            </thead>

            <tbody>
              {formulario.detalle.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="border p-4 text-center text-gray-500"
                  >
                    No hay productos en el detalle.
                  </td>
                </tr>
              ) : (
                formulario.detalle.map((detalle, index) => (
                  <tr key={index}>
                    <td className="border p-2">{detalle.producto}</td>

                    <td className="border p-2">{detalle.descripcion}</td>

                    <td className="border p-2 text-center">
                      {detalle.cantidad_rollos}
                    </td>

                    <td className="border p-2 text-center">TN</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <label className="mb-2 block font-medium">Observaciones</label>

        <Textarea
          rows={4}
          name="observaciones"
          value={c.observaciones}
          onChange={handleChange}
          disabled={esVer}
        />
      </div>

      {errores.length > 0 && (
        <div className="rounded-md border border-red-300 bg-red-50 p-4">
          <p className="mb-2 font-semibold text-red-700">
            {errores.length === 1
              ? "Falta 1 dato obligatorio para guardar el remito:"
              : `Faltan ${errores.length} datos obligatorios para guardar el remito:`}
          </p>
          <ul className="list-disc space-y-1 pl-5">
            {errores.map((err, i) => (
              <li key={i} className="text-sm text-red-600">
                {err}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-4">
        {esVer ? (
          <>
            <Button type="button" onClick={activarEdicion}>
              ✏️ Editar
            </Button>

            <Button type="button" onClick={onCancelar}>
              ← Volver al listado
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              onClick={handleGuardar}
              disabled={guardando}
            >
              💾 Guardar
            </Button>

            <Button type="button" onClick={onCancelar}>
              ✖ Cancelar
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default DetalleRemito;
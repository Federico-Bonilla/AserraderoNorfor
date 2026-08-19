import { useDetalleRemito } from "../hooks/useDetalleRemito";
import { useProveedores } from "../hooks/useProveedores";
import { useProductos } from "../hooks/useProductos";
import { useOrigenes } from "../hooks/useOrigenes";
import { obtenerSiguienteLote } from "../services/remito.service";
import { Proveedor } from "../services/proveedor.service";
import { Producto } from "../services/producto.service";
import Input, { enfocarSiguiente } from "./ui/Input";
import Textarea from "./ui/Textarea";
import Button from "./ui/Button";
import ProveedorLookup from "./lookup/ProveedorLookup";
import ProductoLookup from "./lookup/ProductoLookup";
import OrigenLookup from "./lookup/OrigenLookup";

const ESPECIES = ["TAEDA", "ELIOTI"];

const DIAMETROS = ["<30", "25-30", "15-25"];

const LARGOS = ["3.15", "3.50", "3.75"];

// Mantiene valores persistidos que ya no estan en el dropdown (datos
// existentes) para no romper la edicion de remitos viejos (T015B).
const opcionesConActual = (
  opciones: string[],
  actual: string | null,
): string[] => {
  if (actual && !opciones.includes(actual)) return [actual, ...opciones];
  return opciones;
};

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
    handleDetalleProducto,
    handleDetalleCantidad,
    handleDetalleMedicion,
    guardar,
  } = useDetalleRemito(id);

  const { proveedores } = useProveedores();
  const { productos } = useProductos();
  const { origenes } = useOrigenes();

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

  const proveedorActual: Proveedor | null =
    proveedores.find((p) => p.razon_social === c.proveedor) ??
    proveedores.find((p) => p.cuit === c.cuit) ??
    (c.proveedor
      ? {
          cuenta: "",
          razon_social: c.proveedor,
          direccion: c.direccion,
          telefono: "",
          cuit: c.cuit,
          vendedor: "",
          localidad: "",
          provincia: "",
        }
      : null);

  const seleccionarProveedor = (proveedor: Proveedor | null) => {
    handleChange({
      target: {
        name: "proveedor",
        value: proveedor?.razon_social ?? "",
      },
    } as React.ChangeEvent<HTMLInputElement>);
    handleChange({
      target: {
        name: "direccion",
        value: proveedor?.direccion ?? "",
      },
    } as React.ChangeEvent<HTMLInputElement>);
    handleChange({
      target: {
        name: "cuit",
        value: proveedor?.cuit ?? "",
      },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleGuardar = async () => {
    const ok = await guardar();
    if (ok) onGuardado();
  };

  const generarLote = async (index: number) => {
    try {
      const lote = await obtenerSiguienteLote();
      handleDetalleMedicion(index, "lote", lote);
    } catch (err) {
      console.error(err);
      alert("Error al generar el lote");
    }
  };

  // Enter en selects (Especie/Diámetro/Largo/Certificado) avanza al
  // siguiente campo del formulario.
  const onSelectEnter = (e: React.KeyboardEvent<HTMLSelectElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      enfocarSiguiente(e.currentTarget);
    }
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => event.preventDefault()}
    >
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

          {esVer ? (
            <Input
              name="proveedor"
              value={c.proveedor}
              disabled
              placeholder="Proveedor"
            />
          ) : (
            <ProveedorLookup
              proveedores={proveedores}
              value={proveedorActual}
              onChange={seleccionarProveedor}
            />
          )}
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

          {esVer ? (
            <Input
              value={c.origen ?? ""}
              readOnly
              placeholder="Origen"
            />
          ) : (
            <OrigenLookup
              origenes={origenes}
              value={c.origen ?? ""}
              onChange={(origen) =>
                handleChange({
                  target: {
                    name: "origen",
                    value: origen,
                  },
                } as React.ChangeEvent<HTMLInputElement>)
              }
            />
          )}
        </div>

        <div>
          <label className="mb-2 block font-medium">Certificado</label>

          <select
            name="certificado"
            value={c.certificado}
            onChange={handleChange}
            disabled={esVer}
            onKeyDown={onSelectEnter}
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

        <div className="col-span-2 overflow-x-auto">
          <label className="mb-2 block font-medium">Detalle del Remito</label>

          {esVer ? (
            <table className="w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2 text-left">Código</th>
                  <th className="border p-2 text-left">Descripción</th>
                  <th className="border p-2 text-center">Cantidad</th>
                  <th className="border p-2 text-center">Unidad</th>
                  <th className="border p-2 text-center">Especie</th>
                  <th className="border p-2 text-center">Ø</th>
                  <th className="border p-2 text-center">Largo</th>
                  <th className="border p-2 text-center">P.Bruto (TN)</th>
                  <th className="border p-2 text-center">Tara (TN)</th>
                  <th className="border p-2 text-center">P.Neto (TN)</th>
                  <th className="border p-2 text-center">Depósito</th>
                  <th className="border p-2 text-center">P.Unit</th>
                  <th className="border p-2 text-center">Lote</th>
                </tr>
              </thead>

              <tbody>
                {formulario.detalle.length === 0 ? (
                  <tr>
                    <td
                      colSpan={13}
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

                      <td className="border p-2 text-center">
                        {detalle.especie ?? "—"}
                      </td>

                      <td className="border p-2 text-center">
                        {detalle.diametro ?? "—"}
                      </td>

                      <td className="border p-2 text-center">
                        {detalle.largo ?? "—"}
                      </td>

                      <td className="border p-2 text-center">
                        {detalle.peso_bruto ?? "—"}
                      </td>

                      <td className="border p-2 text-center">
                        {detalle.tara ?? "—"}
                      </td>

                      <td className="border p-2 text-center">
                        {detalle.peso_neto ?? "—"}
                      </td>

                      <td className="border p-2 text-center">
                        {detalle.deposito ?? "—"}
                      </td>

                      <td className="border p-2 text-center">
                        {detalle.precio_unitario ?? "—"}
                      </td>

                      <td className="border p-2 text-center">
                        {detalle.lote ?? "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <div className="space-y-4">
              {formulario.detalle.length === 0 ? (
                <p className="text-gray-500">No hay productos en el detalle.</p>
              ) : (
                formulario.detalle.map((detalle, index) => {
                  const productoActual: Producto | null =
                    productos.find((p) => p.codigo === detalle.producto) ??
                    (detalle.producto
                      ? {
                          codigo: detalle.producto,
                          descripcion: detalle.descripcion,
                          unidad: "TN",
                        }
                      : null);

                  return (
                    <div
                      key={index}
                      className="space-y-4 rounded-lg border border-slate-200 p-4"
                    >
                      <div className="grid grid-cols-12 items-start gap-4">
                        <div className="col-span-7">
                          <label className="mb-2 block font-medium">
                            Código
                          </label>

                          <ProductoLookup
                            productos={productos}
                            value={productoActual}
                            onChange={(producto) =>
                              handleDetalleProducto(index, producto)
                            }
                          />
                        </div>

                        <div className="col-span-3">
                          <label className="mb-2 block font-medium">
                            Cantidad
                          </label>

                          <Input
                            type="number"
                            value={detalle.cantidad_rollos}
                            onChange={(e) =>
                              handleDetalleCantidad(index, e.target.value)
                            }
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="mb-2 block font-medium">
                            Unidad
                          </label>

                          <Input value="TN" readOnly />
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-4">
                          <label className="mb-2 block font-medium">
                            Especie
                          </label>

                          <select
                            value={detalle.especie ?? ""}
                            onChange={(e) =>
                              handleDetalleMedicion(
                                index,
                                "especie",
                                e.target.value,
                              )
                            }
                            onKeyDown={onSelectEnter}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          >
                            <option value="">—</option>
                            {opcionesConActual(
                              ESPECIES,
                              detalle.especie,
                            ).map((op) => (
                              <option key={op} value={op}>
                                {op}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-4">
                          <label className="mb-2 block font-medium">
                            Diámetro
                          </label>

                          <select
                            value={detalle.diametro ?? ""}
                            onChange={(e) =>
                              handleDetalleMedicion(
                                index,
                                "diametro",
                                e.target.value,
                              )
                            }
                            onKeyDown={onSelectEnter}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          >
                            <option value="">—</option>
                            {opcionesConActual(
                              DIAMETROS,
                              detalle.diametro,
                            ).map((op) => (
                              <option key={op} value={op}>
                                {op}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-4">
                          <label className="mb-2 block font-medium">
                            Largo
                          </label>

                          <select
                            value={detalle.largo == null ? "" : String(detalle.largo)}
                            onChange={(e) =>
                              handleDetalleMedicion(
                                index,
                                "largo",
                                e.target.value,
                              )
                            }
                            onKeyDown={onSelectEnter}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          >
                            <option value="">—</option>
                            {opcionesConActual(
                              LARGOS,
                              detalle.largo == null ? null : String(detalle.largo),
                            ).map((op) => (
                              <option key={op} value={op}>
                                {op}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-4">
                          <label className="mb-2 block font-medium">
                            Peso Bruto
                          </label>

                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="0.001"
                              value={detalle.peso_bruto ?? ""}
                              onChange={(e) =>
                                handleDetalleMedicion(
                                  index,
                                  "peso_bruto",
                                  e.target.value,
                                )
                              }
                            />

                            <span className="shrink-0 text-sm font-medium text-slate-500">
                              TN
                            </span>
                          </div>
                        </div>

                        <div className="col-span-4">
                          <label className="mb-2 block font-medium">
                            Tara
                          </label>

                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="0.001"
                              value={detalle.tara ?? ""}
                              onChange={(e) =>
                                handleDetalleMedicion(
                                  index,
                                  "tara",
                                  e.target.value,
                                )
                              }
                            />

                            <span className="shrink-0 text-sm font-medium text-slate-500">
                              TN
                            </span>
                          </div>
                        </div>

                        <div className="col-span-4">
                          <label className="mb-2 block font-medium">
                            Peso Neto
                          </label>

                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="0.001"
                              value={detalle.peso_neto ?? ""}
                              readOnly
                            />

                            <span className="shrink-0 text-sm font-medium text-slate-500">
                              TN
                            </span>
                          </div>
                        </div>

                        <div className="col-span-4">
                          <label className="mb-2 block font-medium">
                            Depósito
                          </label>

                          <Input
                            value={detalle.deposito ?? ""}
                            onChange={(e) =>
                              handleDetalleMedicion(
                                index,
                                "deposito",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        <div className="col-span-4">
                          <label className="mb-2 block font-medium">
                            Precio Unitario
                          </label>

                          <Input
                            type="number"
                            step="0.01"
                            value={detalle.precio_unitario ?? ""}
                            onChange={(e) =>
                              handleDetalleMedicion(
                                index,
                                "precio_unitario",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        <div className="col-span-4">
                          <label className="mb-2 block font-medium">
                            Lote
                          </label>

                          <Input
                            value={detalle.lote ?? ""}
                            onChange={(e) =>
                              handleDetalleMedicion(
                                index,
                                "lote",
                                e.target.value,
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "F3") {
                                e.preventDefault();
                                generarLote(index);
                              }
                            }}
                            placeholder="F3 para generar"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
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
    </form>
  );
}

export default DetalleRemito;
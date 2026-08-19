import { useRef, useState } from "react";
import { useRemito } from "../hooks/useRemito";
import { useProveedores } from "../hooks/useProveedores";
import { Proveedor } from "../services/proveedor.service";
import { useProductos } from "../hooks/useProductos";
import { useOrigenes } from "../hooks/useOrigenes";
import { obtenerSiguienteLote } from "../services/remito.service";
import Input, { enfocarSiguiente } from "./ui/Input";
import Textarea from "./ui/Textarea";
import Button from "./ui/Button";
import ProveedorLookup from "./lookup/ProveedorLookup";
import ProductoLookup from "./lookup/ProductoLookup";
import OrigenLookup from "./lookup/OrigenLookup";

const NUMERO_VALIDO = (v: string): number | null => {
  const t = v.trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};

function FormularioRemito() {
  const [proveedorSeleccionado, setProveedorSeleccionado] =
    useState<Proveedor | null>(null);

  const origenRef = useRef<HTMLInputElement>(null);

  const { proveedores } = useProveedores();
  const { productos } = useProductos();
  const { origenes } = useOrigenes();

  const {
    formulario,

    productoSeleccionado,
    setProductoSeleccionado,

    cantidadRollos,
    setCantidadRollos,

    nuevoItem,
    handleNuevoItemChange,

    productoRef,
    cantidadRollosRef,

    handleChange,
    eliminarProducto,
    agregarProducto,
    handleGuardarRemito,
    handleExportarExcel,
    errores,
  } = useRemito();

  // Peso Neto = Peso Bruto - Tara (preview; el backend recalcula al guardar).
  const pesoBrutoNuevo = NUMERO_VALIDO(nuevoItem.peso_bruto);
  const taraNueva = NUMERO_VALIDO(nuevoItem.tara);
  const pesoNetoNuevo =
    pesoBrutoNuevo === null
      ? null
      : Math.round((pesoBrutoNuevo - (taraNueva ?? 0)) * 1000) / 1000;

  const generarLote = async () => {
    try {
      const lote = await obtenerSiguienteLote();
      handleNuevoItemChange({
        target: { name: "lote", value: lote },
      } as React.ChangeEvent<HTMLSelectElement>);
    } catch (err) {
      console.error(err);
      alert("Error al generar el lote");
    }
  };

  const onLoteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "F3") {
      e.preventDefault();
      generarLote();
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
    <form className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="col-span-2">
          <label className="mb-2 block font-medium">Comprobante</label>

          <div className="grid grid-cols-12 gap-2">
            <Input
              value={formulario.cabecera.comprobante}
              readOnly
              className="col-span-2 text-center font-semibold"
            />

            <Input
              value={formulario.cabecera.letra}
              readOnly
              className="col-span-1 text-center font-semibold"
            />

            <Input
              name="numero_sucursal"
              value={formulario.cabecera.numero_sucursal}
              onChange={handleChange}
              className="col-span-2"
              placeholder="P.V."
            />

            <Input
              name="numero_remito"
              value={formulario.cabecera.numero_remito}
              onChange={handleChange}
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
            value={formulario.cabecera.fecha_comprobante}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">Fecha Recepción</label>

          <Input
            type="date"
            name="fecha_recepcion"
            value={formulario.cabecera.fecha_recepcion}
            onChange={handleChange}
          />
        </div>

        <div className="col-span-1">
          <ProveedorLookup
            proveedores={proveedores}
            value={proveedorSeleccionado}
            onChange={(proveedor) => {
              setProveedorSeleccionado(proveedor);

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

              if (proveedor) {
                setTimeout(() => {
                  origenRef.current?.focus();
                }, 0);
              }
            }}
          />
        </div>

        <div className="col-span-2 grid grid-cols-12 gap-4">
          <div className="col-span-8">
            <label className="mb-2 block font-medium">Dirección</label>

            <Input value={formulario.cabecera.direccion} readOnly />
          </div>

          <div className="col-span-4">
            <label className="mb-2 block font-medium">CUIT</label>

            <Input value={formulario.cabecera.cuit} readOnly />
          </div>
        </div>

        <div>
          <label className="mb-2 block font-medium">Origen</label>

          <OrigenLookup
            ref={origenRef}
            origenes={origenes}
            value={formulario.cabecera.origen ?? ""}
            onChange={(origen) =>
              handleChange({
                target: {
                  name: "origen",
                  value: origen,
                },
              } as React.ChangeEvent<HTMLInputElement>)
            }
          />
        </div>
        <div>
          <label className="mb-2 block font-medium">Certificado</label>

          <select
            name="certificado"
            value={formulario.cabecera.certificado}
            onChange={handleChange}
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
            value={formulario.cabecera.transporte}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="mb-2 block font-medium">Precio Transporte</label>

          <Input
            type="number"
            name="precio_transporte"
            value={formulario.cabecera.precio_transporte}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="mb-2 block font-medium">Lista de Precio</label>

          <Input
            name="lista_precio"
            value={formulario.cabecera.lista_precio}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="mb-2 block font-medium">Centro de Compra</label>

          <Input
            name="centro_compra"
            value={formulario.cabecera.centro_compra}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="mb-2 block font-medium">Patente Chasis</label>

          <Input
            name="patente_chasis"
            value={formulario.cabecera.patente_chasis}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">Patente Acoplado</label>

          <Input
            name="patente_acoplado"
            value={formulario.cabecera.patente_acoplado}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">Chofer</label>

          <Input
            name="chofer"
            value={formulario.cabecera.chofer}
            onChange={handleChange}
          />
        </div>

        {/* <div>
          <label className="mb-2 block font-medium">Centro de Compra</label>

          <Input
            name="centroCompra"
            value={(formulario as any).centroCompra ?? ""}
            onChange={handleChange}
            placeholder="Centro de Compra"
          />
        </div> */}

        {/* <div>
          <label className="mb-2 block font-medium">Patente</label>

          <Input
            name="patente"
            value={formulario.patente}
            onChange={handleChange}
          />
        </div> */}

        {/* <div>
          <label className="mb-2 block font-medium">Cláusula de Compra</label>

          <Input
            name="clausulaCompra"
            value={(formulario as any).clausulaCompra ?? ""}
            onChange={handleChange}
            placeholder="Cláusula"
          />
        </div> */}

        {/* <div>
          <label className="mb-2 block font-medium">Centro Auxiliar</label>

          <Input
            name="centroAuxiliar"
            value={(formulario as any).centroAuxiliar ?? ""}
            onChange={handleChange}
            placeholder="Centro Auxiliar"
          />
        </div> */}

        {/* <div>
          <label className="mb-2 block font-medium">Centro de Crédito</label>

          <Input
            name="centroCredito"
            value={(formulario as any).centroCredito ?? ""}
            onChange={handleChange}
            placeholder="Centro de Crédito"
          />
        </div> */}

        {/* <div>
          <label className="mb-2 block font-medium">Obra</label>

          <Input
            name="obra"
            value={(formulario as any).obra ?? ""}
            onChange={handleChange}
            placeholder="Obra"
          />
        </div> */}

        <div className="col-span-2">
          <label className="mb-2 block font-medium">Producto</label>

          <ProductoLookup
            ref={productoRef}
            productos={productos}
            value={productoSeleccionado}
            onChange={(producto) => {
              setProductoSeleccionado(producto);

              if (producto) {
                setTimeout(() => {
                  cantidadRollosRef.current?.focus();
                }, 0);
              }
            }}
          />
          <Input
            ref={cantidadRollosRef}
            type="number"
            value={cantidadRollos}
            onChange={(e) => setCantidadRollos(e.target.value)}
            placeholder="Cantidad"
          />
          <div className="mt-4 rounded-lg border border-slate-200 p-3">
            <p className="mb-2 text-sm font-semibold text-slate-600">
              Medición
            </p>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Especie
                </label>

                <select
                  name="especie"
                  value={nuevoItem.especie}
                  onChange={handleNuevoItemChange}
                  onKeyDown={onSelectEnter}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">—</option>
                  <option value="TAEDA">TAEDA</option>
                  <option value="ELIOTI">ELIOTI</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Diámetro
                </label>

                <select
                  name="diametro"
                  value={nuevoItem.diametro}
                  onChange={handleNuevoItemChange}
                  onKeyDown={onSelectEnter}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">—</option>
                  <option value="<30">&lt;30</option>
                  <option value="25-30">25-30</option>
                  <option value="15-25">15-25</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Largo
                </label>

                <select
                  name="largo"
                  value={nuevoItem.largo}
                  onChange={handleNuevoItemChange}
                  onKeyDown={onSelectEnter}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">—</option>
                  <option value="3.15">3.15</option>
                  <option value="3.50">3.50</option>
                  <option value="3.75">3.75</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Peso Bruto
                </label>

                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    name="peso_bruto"
                    value={nuevoItem.peso_bruto}
                    onChange={handleNuevoItemChange}
                    step="0.001"
                  />

                  <span className="shrink-0 text-xs font-medium text-slate-500">
                    TN
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Tara
                </label>

                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    name="tara"
                    value={nuevoItem.tara}
                    onChange={handleNuevoItemChange}
                    step="0.001"
                  />

                  <span className="shrink-0 text-xs font-medium text-slate-500">
                    TN
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Peso Neto
                </label>

                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.001"
                    value={pesoNetoNuevo ?? ""}
                    readOnly
                  />

                  <span className="shrink-0 text-xs font-medium text-slate-500">
                    TN
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Depósito
                </label>

                <Input
                  name="deposito"
                  value={nuevoItem.deposito}
                  onChange={handleNuevoItemChange}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Precio Unitario
                </label>

                <Input
                  type="number"
                  name="precio_unitario"
                  value={nuevoItem.precio_unitario}
                  onChange={handleNuevoItemChange}
                  step="0.01"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Lote
                </label>

                <Input
                  name="lote"
                  value={nuevoItem.lote}
                  onChange={handleNuevoItemChange}
                  onKeyDown={onLoteKeyDown}
                  placeholder="F3 para generar"
                />
              </div>
            </div>
          </div>

          <div className="flex items-end">
            <Button type="button" variant="success" onClick={agregarProducto}>
              ➕ Agregar
            </Button>
          </div>
        </div>
        <div className="col-span-2 overflow-x-auto">
          <label className="mb-2 block font-medium">Detalle del Remito</label>

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
                <th className="border p-2 text-center">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {formulario.detalle.length === 0 ? (
                <tr>
                  <td
                    colSpan={14}
                    className="border p-4 text-center text-gray-500"
                  >
                    No hay productos agregados.
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

                    <td className="border p-2 text-center">
                      <Button
                        type="button"
                        onClick={() => eliminarProducto(index)}
                      >
                        🗑️
                      </Button>
                    </td>
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
          value={formulario.cabecera.observaciones}
          onChange={handleChange}
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
        <Button type="button" onClick={handleGuardarRemito}>
          💾 Guardar
        </Button>

        <Button type="button" variant="success" onClick={handleExportarExcel}>
          📊 Exportar Excel
        </Button>
      </div>
    </form>
  );
}

export default FormularioRemito;

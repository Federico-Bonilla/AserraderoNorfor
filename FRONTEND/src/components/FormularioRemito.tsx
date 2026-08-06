import { useRef, useState } from "react";
import { useRemito } from "../hooks/useRemito";
import { useProveedores } from "../hooks/useProveedores";
import { Proveedor } from "../services/proveedor.service";
import { useProductos } from "../hooks/useProductos";
import Input from "./ui/Input";
import Textarea from "./ui/Textarea";
import Button from "./ui/Button";
import ProveedorLookup from "./lookup/ProveedorLookup";
import ProductoLookup from "./lookup/ProductoLookup";

function FormularioRemito() {
  const [proveedorSeleccionado, setProveedorSeleccionado] =
    useState<Proveedor | null>(null);

  const origenRef = useRef<HTMLInputElement>(null);

  const { proveedores } = useProveedores();
  const { productos } = useProductos();

  const {
    formulario,
    setFormulario,

    productoSeleccionado,
    setProductoSeleccionado,

    cantidadRollos,
    setCantidadRollos,

    productoRef,
    cantidadRollosRef,

    handleChange,
    eliminarProducto,
    agregarProducto,
    handleGuardarRemito,
    handleExportarExcel,
  } = useRemito();

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

          <Input
            ref={origenRef}
            name="origen"
            value={formulario.cabecera.origen ?? ""}
            onChange={handleChange}
            placeholder="Origen"
          />
        </div>
        <div>
          <label className="mb-2 block font-medium">Certificado</label>

          <select
            name="certificado"
            value={formulario.cabecera.certificado}
            onChange={handleChange}
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
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                agregarProducto();
              }
            }}
          />
          <div className="flex items-end">
            <Button type="button" variant="success" onClick={agregarProducto}>
              ➕ Agregar
            </Button>
          </div>
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
                <th className="border p-2 text-center">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {formulario.detalle.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
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

import { forwardRef, useEffect, useState } from "react";
import { Producto } from "../../services/producto.service";
import Input from "../ui/Input";
import Button from "../ui/Button";
import ProductoModal from "./ProductoModal";

interface ProductoLookupProps {
  productos: Producto[];
  value: Producto | null;
  onChange: (producto: Producto | null) => void;
}

const ProductoLookup = forwardRef<HTMLInputElement, ProductoLookupProps>(
  ({ productos, value, onChange }, ref) => {
    const [codigo, setCodigo] = useState("");
    const [modalAbierto, setModalAbierto] = useState(false);

    useEffect(() => {
      setCodigo(value?.codigo ?? "");

      if (value === null) {
        (ref as React.RefObject<HTMLInputElement>)?.current?.focus();
      }
    }, [value, ref]);

    const buscarProducto = () => {
      const producto =
        productos.find((p) => p.codigo.trim() === codigo.trim()) ?? null;

      onChange(producto);
    };

    return (
      <>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              ref={ref}
              placeholder="Código (F12 para buscar)"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  buscarProducto();
                }

                if (e.key === "F12") {
                  e.preventDefault();
                  setModalAbierto(true);
                }
              }}
            />

            <Button type="button" onClick={() => setModalAbierto(true)}>
              🔍
            </Button>
          </div>

          <Input value={value?.descripcion ?? ""} readOnly />
        </div>

        <ProductoModal
          open={modalAbierto}
          productos={productos}
          onSelect={(producto) => {
            onChange(producto);
            setModalAbierto(false);
          }}
          onClose={() => setModalAbierto(false)}
        />
      </>
    );
  },
);

ProductoLookup.displayName = "ProductoLookup";

export default ProductoLookup;

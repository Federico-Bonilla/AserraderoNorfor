import { forwardRef, useEffect, useRef, useState } from "react";
import { Producto } from "../../services/producto.service";
import Input, { enfocarSiguiente } from "../ui/Input";
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

    // ref interna para el input de codigo (admitira el ref externo tambien).
    const inputRef = useRef<HTMLInputElement | null>(null);

    const setRef = (el: HTMLInputElement | null) => {
      inputRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
    };

    useEffect(() => {
      setCodigo(value?.codigo ?? "");

      if (value === null) {
        inputRef.current?.focus();
      }
    }, [value]);

    const buscarProducto = () => {
      const producto =
        productos.find((p) => p.codigo.trim() === codigo.trim()) ?? null;

      onChange(producto);
      return producto;
    };

    // Enter en el input principal: si esta vacio abre el modal de
    // busqueda; si tiene codigo lo valida y avanza al siguiente campo.
    const onCodigoKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();

        if (codigo.trim() === "") {
          setModalAbierto(true);
          return;
        }

        // Solo avanza si el codigo da match; sin match mantiene el foco
        // (buscarProducto setea null y el efecto re-enfoca el input).
        const producto = buscarProducto();
        if (producto) {
          enfocarSiguiente(e.currentTarget);
        }
        return;
      }

      if (e.key === "F12") {
        e.preventDefault();
        setModalAbierto(true);
      }
    };

    return (
      <>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              ref={setRef}
              noNavegar
              placeholder="Código (F12 para buscar)"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              onKeyDown={onCodigoKeyDown}
            />

            <Button
              type="button"
              tabIndex={-1}
              onClick={() => setModalAbierto(true)}
            >
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

            // Tras seleccionar desde el modal: foco al siguiente campo
            // del formulario a partir del input de codigo.
            setTimeout(() => {
              enfocarSiguiente(inputRef.current as HTMLElement);
            }, 0);
          }}
          onClose={() => setModalAbierto(false)}
        />
      </>
    );
  },
);

ProductoLookup.displayName = "ProductoLookup";

export default ProductoLookup;

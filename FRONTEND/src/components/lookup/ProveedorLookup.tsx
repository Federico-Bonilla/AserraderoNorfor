import { forwardRef, useEffect, useRef, useState } from "react";
import { Proveedor } from "../../services/proveedor.service";
import Input, { enfocarSiguiente } from "../ui/Input";
import Button from "../ui/Button";
import ProveedorModal from "./ProveedorModal";

interface ProveedorLookupProps {
  proveedores: Proveedor[];
  value: Proveedor | null;
  onChange: (proveedor: Proveedor | null) => void;
}

const ProveedorLookup = forwardRef<HTMLInputElement, ProveedorLookupProps>(
  ({ proveedores, value, onChange }, ref) => {
    const [cuenta, setCuenta] = useState("");
    const [modalAbierto, setModalAbierto] = useState(false);

    const inputRef = useRef<HTMLInputElement | null>(null);

    const setRef = (el: HTMLInputElement | null) => {
      inputRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
    };

    useEffect(() => {
      setCuenta(value?.cuenta ?? "");
    }, [value]);

    const buscarProveedor = () => {
      const proveedor =
        proveedores.find((p) => p.cuenta.trim() === cuenta.trim()) ?? null;

      onChange(proveedor);
    };

    // Enter en el input principal: si esta vacio abre el modal de
    // busqueda; si tiene cuenta la valida y avanza al siguiente campo.
    const onCuentaKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();

        if (cuenta.trim() === "") {
          setModalAbierto(true);
          return;
        }

        buscarProveedor();
        enfocarSiguiente(e.currentTarget);
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
              placeholder="Cuenta (F12 para buscar)"
              value={cuenta}
              onChange={(e) => setCuenta(e.target.value)}
              onKeyDown={onCuentaKeyDown}
            />

            <Button
              type="button"
              tabIndex={-1}
              onClick={() => setModalAbierto(true)}
            >
              🔍
            </Button>
          </div>

          <Input value={value?.razon_social ?? ""} readOnly />
        </div>

        <ProveedorModal
          open={modalAbierto}
          proveedores={proveedores}
          onSelect={(proveedor) => {
            onChange(proveedor);
            setModalAbierto(false);

            // Tras seleccionar desde el modal: foco al siguiente campo
            // del formulario a partir del input de cuenta.
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

ProveedorLookup.displayName = "ProveedorLookup";

export default ProveedorLookup;

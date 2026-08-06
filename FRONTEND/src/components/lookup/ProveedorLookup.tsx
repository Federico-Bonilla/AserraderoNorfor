import { useEffect, useState } from "react";
import { Proveedor } from "../../services/proveedor.service";
import Input from "../ui/Input";
import Button from "../ui/Button";
import ProveedorModal from "./ProveedorModal";

interface ProveedorLookupProps {
  proveedores: Proveedor[];
  value: Proveedor | null;
  onChange: (proveedor: Proveedor | null) => void;
}

function ProveedorLookup({
  proveedores,
  value,
  onChange,
}: ProveedorLookupProps) {
  const [cuenta, setCuenta] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    setCuenta(value?.cuenta ?? "");
  }, [value]);

  const buscarProveedor = () => {
    const proveedor =
      proveedores.find((p) => p.cuenta.trim() === cuenta.trim()) ?? null;

    onChange(proveedor);
  };

  return (
    <>
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Cuenta (F12 para buscar)"
            value={cuenta}
            onChange={(e) => setCuenta(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                buscarProveedor();
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

        <Input value={value?.razon_social ?? ""} readOnly />
      </div>

      <ProveedorModal
        open={modalAbierto}
        proveedores={proveedores}
        onSelect={(proveedor) => {
          onChange(proveedor);
          setModalAbierto(false);
        }}
        onClose={() => setModalAbierto(false)}
      />
    </>
  );
}

export default ProveedorLookup;

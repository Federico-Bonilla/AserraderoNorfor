import { forwardRef, useEffect, useRef, useState } from "react";
import Input, { enfocarSiguiente } from "../ui/Input";
import Button from "../ui/Button";
import OrigenModal from "./OrigenModal";
import { Origen } from "../../services/origen.service";

interface OrigenLookupProps {
  origenes: Origen[];
  value: string;
  onChange: (codigo: string) => void;
}

const OrigenLookup = forwardRef<HTMLInputElement, OrigenLookupProps>(
  ({ origenes, value, onChange }, ref) => {
    const [texto, setTexto] = useState(value ?? "");
    const [modalAbierto, setModalAbierto] = useState(false);

    const inputRef = useRef<HTMLInputElement | null>(null);

    const setRef = (el: HTMLInputElement | null) => {
      inputRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
    };

    // Descripcion del codigo seleccionado (para mostrar debajo del input,
    // como los otros lookups).
    const origenActual = origenes.find((o) => o.codigo === value);

    // Mantiene el texto del input sincronizado con el valor (p.ej. al limpiar
    // el formulario despues de guardar).
    useEffect(() => {
      setTexto(value ?? "");
    }, [value]);

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();

        if (texto.trim() === "") {
          // Campo vacio + Enter: abrir el modal de seleccion.
          setModalAbierto(true);
          return;
        }

        // Con texto: avanza al siguiente campo.
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
              placeholder="Código (F12 para buscar)"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={onKeyDown}
            />

            <Button
              type="button"
              tabIndex={-1}
              onClick={() => setModalAbierto(true)}
            >
              🔍
            </Button>
          </div>

          <Input value={origenActual?.descripcion ?? ""} readOnly />
        </div>

        <OrigenModal
          open={modalAbierto}
          origenes={origenes}
          onSelect={(origen) => {
            onChange(origen.codigo);
            setModalAbierto(false);

            // Tras seleccionar desde el modal: foco al siguiente campo
            // del formulario a partir del input de origen.
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

OrigenLookup.displayName = "OrigenLookup";

export default OrigenLookup;
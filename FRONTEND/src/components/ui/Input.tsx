import { InputHTMLAttributes, forwardRef } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  // Indica que el input NO debe participar en la navegacion automatica
  // con Enter (usado por los inputs internos de los modales de lookup,
  // que viven dentro del <form> principal pero gestionan Enter por su
  // cuenta para seleccionar un resultado).
  noNavegar?: boolean;
};

// Avanza el foco al siguiente elemento focusable del mismo <form> en
// orden DOM, saltando readonly/disabled/tabIndex<0/hidden. No hace wrap.
export const enfocarSiguiente = (actual: HTMLElement) => {
  const form =
    actual instanceof HTMLInputElement ||
    actual instanceof HTMLSelectElement ||
    actual instanceof HTMLTextAreaElement ||
    actual instanceof HTMLButtonElement
      ? actual.form
      : null;

  if (!form) return;

  const elementos = Array.from(form.elements) as HTMLElement[];

  const indice = elementos.indexOf(actual);

  if (indice < 0) return;

  for (let i = indice + 1; i < elementos.length; i++) {
    const el = elementos[i];

    if (
      el instanceof HTMLInputElement ||
      el instanceof HTMLTextAreaElement
    ) {
      if (
        !el.disabled &&
        !el.readOnly &&
        el.tabIndex !== -1 &&
        !(el instanceof HTMLInputElement && el.type === "hidden")
      ) {
        el.focus();
        if (el instanceof HTMLInputElement) el.select();
        return;
      }
      continue;
    }

    if (el instanceof HTMLSelectElement) {
      if (!el.disabled && el.tabIndex !== -1) {
        el.focus();
        return;
      }
      continue;
    }

    if (el instanceof HTMLButtonElement) {
      if (!el.disabled && el.tabIndex !== -1) {
        el.focus();
        return;
      }
      continue;
    }
  }
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", onKeyDown, noNavegar, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !noNavegar) {
        e.preventDefault();
        enfocarSiguiente(e.currentTarget);
      }

      onKeyDown?.(e);
    };

    return (
      <input
        ref={ref}
        className={`
          w-full
          rounded-lg
          border
          border-slate-300
          px-3
          py-2
          outline-none
          transition
          focus:border-blue-500
          focus:ring-2
          focus:ring-blue-200
          ${className}
        `}
        onKeyDown={handleKeyDown}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export default Input;

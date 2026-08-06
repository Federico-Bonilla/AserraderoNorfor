import { InputHTMLAttributes, forwardRef } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", onKeyDown, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();

        const form = e.currentTarget.form;

        if (form) {
          const elementos = Array.from(form.elements) as HTMLElement[];

          const indice = elementos.indexOf(e.currentTarget);

          if (indice >= 0 && indice < elementos.length - 1) {
            elementos[indice + 1]?.focus();
          }
        }
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

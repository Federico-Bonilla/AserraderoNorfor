import { SelectHTMLAttributes, forwardRef } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <select
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
        {...props}
      >
        {children}
      </select>
    );
  },
);

Select.displayName = "Select";

export default Select;

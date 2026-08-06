import { TextareaHTMLAttributes, forwardRef } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <textarea
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
      />
    );
  },
);

Textarea.displayName = "Textarea";

export default Textarea;

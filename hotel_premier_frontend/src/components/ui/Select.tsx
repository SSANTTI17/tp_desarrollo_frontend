import React, { SelectHTMLAttributes, forwardRef } from "react";

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      error,
      placeholder = "Seleccione...",
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <div className="grid grid-cols-[160px_1fr] items-center gap-4 w-full">
        {label && (
          <label className="text-legacy-text font-semibold text-sm text-right">
            {label}
          </label>
        )}

        <div className="w-full flex flex-col gap-1">
          <div className="relative w-full">
            <select
              ref={ref}
              className={`
                w-full px-3 py-2 pr-10 rounded-lg border bg-white text-gray-700 text-sm outline-none appearance-none cursor-pointer transition-all
                ${
                  error
                    ? "border-legacy-error focus:border-legacy-error"
                    : "border-legacy-inputBorder focus:border-legacy-focus"
                }
                ${className}
              `}
              {...props}
            >
              <option value="">{placeholder}</option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Flecha Custom Estilo Legacy */}
            <div
              className={`
              absolute top-0 right-0 bottom-0 w-8 
              flex items-center justify-center pointer-events-none
              rounded-r-lg border-l
              bg-[#D4E3FC] 
              ${error ? "border-legacy-error" : "border-legacy-focus"}
            `}
            >
              <svg
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-gray-600 fill-current"
              >
                <path d="M13.098 8H6.902c-.751 0-1.172.754-.708 1.268L9.292 12.7c.36.399 1.055.399 1.416 0l3.098-3.433C14.27 8.754 13.849 8 13.098 8Z" />
              </svg>
            </div>
          </div>
          {error && (
            <span className="text-legacy-error text-xs ml-1">{error}</span>
          )}
        </div>
      </div>
    );
  }
);
Select.displayName = "Select";

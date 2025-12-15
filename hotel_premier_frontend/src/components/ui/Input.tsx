import React, { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="grid grid-cols-[160px_1fr] items-center gap-4 w-full">
        {label && (
          <label className="text-legacy-text font-semibold text-sm text-right">
            {label}
          </label>
        )}
        <div className="w-full flex flex-col gap-1">
          <input
            ref={ref}
            className={`
              w-full px-3 py-2 rounded-lg border bg-white text-gray-700 text-sm outline-none transition-all
              placeholder:text-gray-400
              focus:shadow-[0_0_5px_rgba(127,164,232,0.4)]
              ${
                error
                  ? "border-legacy-error focus:border-legacy-error"
                  : "border-legacy-inputBorder focus:border-legacy-focus"
              }
              ${className}
            `}
            {...props}
          />
          {error && (
            <span className="text-legacy-error text-xs ml-1">{error}</span>
          )}
        </div>
      </div>
    );
  }
);
Input.displayName = "Input";

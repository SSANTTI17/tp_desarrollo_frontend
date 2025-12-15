import React, { InputHTMLAttributes, forwardRef } from "react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = "", ...props }, ref) => {
    return (
      <label className="inline-flex items-center gap-2 cursor-pointer group">
        <div className="relative flex items-center">
          <input
            type="checkbox"
            ref={ref}
            className="peer sr-only" // Ocultamos el nativo
            {...props}
          />
          {/* Caja del checkbox custom */}
          <div
            className={`
            w-5 h-5 border-2 rounded 
            border-legacy-inputBorder bg-white
            peer-checked:bg-legacy-primary peer-checked:border-legacy-primary
            peer-focus:ring-2 peer-focus:ring-legacy-focus/50
            transition-all flex items-center justify-center
            ${className}
          `}
          >
            {/* Icono de Check (SVG) */}
            <svg
              className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        {label && (
          <span className="text-legacy-text text-sm select-none group-hover:text-legacy-primary transition-colors">
            {label}
          </span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";

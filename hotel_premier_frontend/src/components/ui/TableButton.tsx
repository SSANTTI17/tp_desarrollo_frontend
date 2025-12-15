import React, { ButtonHTMLAttributes } from "react";

interface TableButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "edit" | "delete" | "action";
}

export const TableButton = ({
  children,
  variant = "action",
  className = "",
  ...props
}: TableButtonProps) => {
  // Colores específicos para acciones de tabla
  const variants = {
    edit: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200",
    delete: "bg-red-100 text-red-700 hover:bg-red-200 border-red-200",
    action: "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300",
  };

  return (
    <button
      className={`
        px-3 py-1 text-xs font-semibold rounded border transition-colors
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

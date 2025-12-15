import React from "react";

interface BadgeProps {
  status: string; // Recibe "Disponible", "Ocupada", "Reservada", etc.
  className?: string;
}

export const Badge = ({ status, className = "" }: BadgeProps) => {
  // Normalizamos el texto para comparar sin importar mayúsculas/minúsculas
  const normalized = status.toString().toUpperCase();

  const getStyles = () => {
    if (normalized.includes("DISPONIBLE")) {
      return "bg-legacy-success/20 text-green-800 border-legacy-success";
    }
    if (normalized.includes("OCUPADA")) {
      return "bg-gray-200 text-gray-700 border-gray-300";
    }
    if (normalized.includes("RESERVADA")) {
      return "bg-red-100 text-red-800 border-red-200";
    }
    if (normalized.includes("FUERA") || normalized.includes("MANTENIMIENTO")) {
      return "bg-gray-800 text-white border-gray-900";
    }
    // Default (Azul/Gris)
    return "bg-legacy-container text-legacy-text border-legacy-inputBorder";
  };

  return (
    <span
      className={`
      px-2.5 py-0.5 rounded-full text-xs font-bold border
      uppercase tracking-wider shadow-sm select-none
      ${getStyles()}
      ${className}
    `}
    >
      {status}
    </span>
  );
};

import React, { useState } from "react";
import { HabitacionDTO, EstadoHabitacion } from "@/api/types";

interface AvailabilityGridProps {
  habitaciones: HabitacionDTO[];
  fechaInicio: string;
  dias: number;
  selectable?: boolean;
  onSelectionChange?: (
    seleccion: { habitacion: number; fechas: string[] } | null
  ) => void;
}

export const AvailabilityGrid = ({
  habitaciones,
  fechaInicio,
  dias,
  selectable = false,
  onSelectionChange,
}: AvailabilityGridProps) => {
  // Estado interno para la selección (Start y End)
  const [selection, setSelection] = useState<{
    room: number;
    startIndex: number;
    endIndex: number;
  } | null>(null);

  // Generador de fechas (igual que antes)
  const generateDates = () => {
    const dates = [];
    const [year, month, day] = fechaInicio.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    for (let i = 0; i < dias; i++) {
      dates.push(
        date.toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        })
      );
      date.setDate(date.getDate() + 1);
    }
    return dates;
  };
  const fechas = generateDates();

  // Manejo del Clic en Celda
  const handleCellClick = (
    roomNumber: number,
    dateIndex: number,
    estado: EstadoHabitacion
  ) => {
    if (!selectable) return;
    if (estado !== EstadoHabitacion.DISPONIBLE) return; // No se puede seleccionar ocupado

    // Lógica de selección de rango
    let newSelection = null;

    if (!selection || selection.room !== roomNumber) {
      // Nueva selección o cambio de habitación -> Inicio del rango
      newSelection = {
        room: roomNumber,
        startIndex: dateIndex,
        endIndex: dateIndex,
      };
    } else {
      // Misma habitación -> Expandir rango o reiniciar
      if (dateIndex < selection.startIndex) {
        // Clic anterior al inicio -> Nuevo inicio
        newSelection = {
          room: roomNumber,
          startIndex: dateIndex,
          endIndex: selection.endIndex,
        };
      } else {
        // Clic posterior -> Definir fin
        newSelection = {
          room: roomNumber,
          startIndex: selection.startIndex,
          endIndex: dateIndex,
        };
      }
    }

    setSelection(newSelection);

    // Notificar al padre
    if (onSelectionChange && newSelection) {
      const selectedDates = fechas.slice(
        newSelection.startIndex,
        newSelection.endIndex + 1
      );
      onSelectionChange({ habitacion: roomNumber, fechas: selectedDates });
    } else if (onSelectionChange) {
      onSelectionChange(null);
    }
  };

  // Función de Estilos
  const getCellColor = (
    estado: EstadoHabitacion,
    roomNumber: number,
    index: number
  ) => {
    // 1. Si está seleccionado (Azul fuerte)
    if (
      selection &&
      selection.room === roomNumber &&
      index >= selection.startIndex &&
      index <= selection.endIndex
    ) {
      return "bg-legacy-primary text-white border-blue-600 cursor-pointer";
    }

    // 2. Estados normales
    const s = estado?.toString().toUpperCase() || "";
    if (s === "DISPONIBLE")
      return `bg-[#A7D8A6] ${
        selectable ? "cursor-pointer hover:brightness-95" : ""
      }`;
    if (s === "OCUPADA") return "bg-[#C4C4C4] cursor-not-allowed";
    if (s === "RESERVADA") return "bg-[#FCA5A5] cursor-not-allowed";

    return "bg-white";
  };

  if (habitaciones.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-gray-50 border rounded">
        Sin resultados.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-legacy-inputBorder rounded-lg shadow-sm">
      <table className="w-full text-sm text-center border-collapse select-none">
        <thead>
          <tr className="bg-gray-100 text-legacy-text">
            <th className="p-3 border sticky left-0 bg-gray-100 z-10 w-24">
              Fecha
            </th>
            {habitaciones.map((h) => (
              <th key={h.numero} className="p-3 border min-w-[80px]">
                Hab {h.numero}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fechas.map((fechaStr, idx) => (
            <tr key={fechaStr}>
              <td className="p-2 border bg-gray-50 sticky left-0 z-10 font-medium">
                {fechaStr}
              </td>
              {habitaciones.map((hab) => {
                const estado =
                  hab.estadosPorDia[idx] || EstadoHabitacion.DISPONIBLE;
                return (
                  <td
                    key={`${hab.numero}-${idx}`}
                    className={`border border-legacy-inputBorder/50 transition-colors ${getCellColor(
                      estado,
                      hab.numero,
                      idx
                    )}`}
                    onClick={() => handleCellClick(hab.numero, idx, estado)}
                  ></td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

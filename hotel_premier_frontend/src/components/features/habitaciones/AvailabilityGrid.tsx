import React, { useState } from "react";
import { HabitacionDTO, EstadoHabitacion } from "@/api/types";

export interface GridSelection {
  habitacion: number;
  fechas: string[];
  startIndex: number;
  endIndex: number;
}

interface AvailabilityGridProps {
  habitaciones: HabitacionDTO[];
  fechaInicio: string;
  dias: number;
  selectable?: boolean;
  selections?: GridSelection[];
  onSelectionComplete?: (selection: GridSelection) => void;
  // NUEVA PROP: Para avisar que se quiere borrar una selección
  onSelectionRemove?: (selection: GridSelection) => void;
  onSelectionError?: (mensaje: string) => void;
}

export const AvailabilityGrid = ({
  habitaciones,
  fechaInicio,
  dias,
  selectable = false,
  selections = [],
  onSelectionComplete,
  onSelectionRemove,
  onSelectionError,
}: AvailabilityGridProps) => {
  const [tempSelection, setTempSelection] = useState<{
    room: number;
    startIndex: number;
  } | null>(null);

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

  const validateRange = (
    habitacion: HabitacionDTO,
    start: number,
    end: number
  ) => {
    const realStart = Math.min(start, end);
    const realEnd = Math.max(start, end);

    for (let i = realStart; i <= realEnd; i++) {
      const estado = habitacion.estadosPorDia[i];
      if (estado && estado !== EstadoHabitacion.DISPONIBLE) {
        return {
          valid: false,
          error: `Conflicto: El día ${fechas[i]} la habitación está ${estado}.`,
        };
      }
    }
    return { valid: true };
  };

  const handleCellClick = (hab: HabitacionDTO, index: number) => {
    if (!selectable) return;

    // 1. NUEVA LÓGICA: Verificar si se hizo clic en una selección YA CONFIRMADA (Azul)
    const existingSelection = selections.find(
      (s) =>
        s.habitacion === hab.numero &&
        index >= s.startIndex &&
        index <= s.endIndex
    );

    if (existingSelection) {
      // Si existe, pedimos al padre que la remueva
      if (onSelectionRemove) {
        onSelectionRemove(existingSelection);
        setTempSelection(null); // Cancelamos cualquier selección temporal en curso
      }
      return;
    }

    // 2. Si no es una selección existente, seguimos con la lógica de crear una nueva
    if (!tempSelection || tempSelection.room !== hab.numero) {
      if (hab.estadosPorDia[index] !== EstadoHabitacion.DISPONIBLE) {
        onSelectionError?.(
          "No puedes iniciar una reserva en una fecha ocupada."
        );
        return;
      }
      setTempSelection({ room: hab.numero, startIndex: index });
      return;
    }

    // 3. Completar rango
    const validation = validateRange(hab, tempSelection.startIndex, index);

    if (!validation.valid) {
      onSelectionError?.(validation.error || "Rango inválido");
      setTempSelection(null);
      return;
    }

    const start = Math.min(tempSelection.startIndex, index);
    const end = Math.max(tempSelection.startIndex, index);

    onSelectionComplete?.({
      habitacion: hab.numero,
      fechas: fechas.slice(start, end + 1),
      startIndex: start,
      endIndex: end,
    });

    setTempSelection(null);
  };

  const getCellColor = (
    estado: EstadoHabitacion,
    roomNumber: number,
    index: number
  ) => {
    // Si está confirmado (Azul)
    const isConfirmed = selections.some(
      (s) =>
        s.habitacion === roomNumber &&
        index >= s.startIndex &&
        index <= s.endIndex
    );
    // Agregamos hover rojo para indicar que se puede borrar
    if (isConfirmed)
      return "bg-blue-600 text-white border-blue-700 hover:bg-red-500 hover:text-white cursor-pointer";

    if (tempSelection && tempSelection.room === roomNumber) {
      if (index === tempSelection.startIndex)
        return "bg-blue-400 text-white ring-2 ring-blue-300";
    }

    const s = estado?.toString().toUpperCase() || "";
    if (s === "DISPONIBLE")
      return `bg-[#A7D8A6] ${
        selectable ? "cursor-pointer hover:brightness-95" : ""
      }`;
    if (s === "OCUPADA") return "bg-[#C4C4C4] cursor-not-allowed opacity-80";
    if (s === "RESERVADA") return "bg-[#FCA5A5] cursor-not-allowed opacity-80";
    if (s.includes("FUERA")) return "bg-gray-800 cursor-not-allowed";

    return "bg-white";
  };

  if (habitaciones.length === 0)
    return (
      <div className="p-8 text-center text-gray-500 bg-gray-50 border rounded">
        Sin resultados.
      </div>
    );

  return (
    <div className="overflow-x-auto border border-legacy-inputBorder rounded-lg shadow-sm select-none">
      <table className="w-full text-sm text-center border-collapse">
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
              <td className="p-2 border bg-gray-50 sticky left-0 z-10 font-medium text-xs">
                {fechaStr}
              </td>
              {habitaciones.map((hab) => {
                const estado =
                  hab.estadosPorDia[idx] || EstadoHabitacion.DISPONIBLE;
                return (
                  <td
                    key={`${hab.numero}-${idx}`}
                    className={`border border-legacy-inputBorder/50 transition-all ${getCellColor(
                      estado,
                      hab.numero,
                      idx
                    )}`}
                    onClick={() => handleCellClick(hab, idx)}
                    title={`Hab ${hab.numero}: ${estado}`}
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

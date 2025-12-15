import React from "react";
import { HuespedDTO } from "@/api/types";
import { DataTable, Column } from "@/components/ui/DataTable";
import { TableButton } from "@/components/ui/TableButton";

interface HuespedListProps {
  huespedes: HuespedDTO[];
  onSelect: (doc: string) => void;
  selectedDoc: string | null;
}

export const HuespedList = ({
  huespedes,
  onSelect,
  selectedDoc,
}: HuespedListProps) => {
  // Definimos las columnas en el orden visual correcto (Datos -> Botón)
  const columns: Column<HuespedDTO>[] = [
    { header: "Apellido", accessorKey: "apellido" },
    { header: "Nombre", accessorKey: "nombre" },
    // { header: "Tipo", accessorKey: "tipo_documento", width: "w-20" },
    { header: "Documento", accessorKey: "nroDocumento" },

    // La columna del botón va AL FINAL
    {
      header: "Selección",
      width: "w-24", // Ancho fijo para el botón
      cell: (huesped) => {
        const isSelected = selectedDoc === huesped.nroDocumento;
        return (
          <TableButton
            variant={isSelected ? "edit" : "action"}
            onClick={() => onSelect(huesped.nroDocumento)}
            className="w-full justify-center"
          >
            {isSelected ? "Listo" : "Elegir"}
          </TableButton>
        );
      },
    },
  ];

  return (
    <div className="mt-6 animate-in fade-in slide-in-from-bottom-4">
      <h3 className="text-center font-bold text-legacy-text mb-4">
        Huéspedes encontrados{" "}
        <span className="font-normal">({huespedes.length})</span>
      </h3>

      <DataTable
        data={huespedes}
        columns={columns}
        keyExtractor={(h) => h.nroDocumento}
      />
    </div>
  );
};

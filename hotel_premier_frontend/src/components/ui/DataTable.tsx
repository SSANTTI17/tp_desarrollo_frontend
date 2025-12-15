import React from "react";

// Definimos qué forma tiene una Columna
export interface Column<T> {
  header: string; // Título de la cabecera
  accessorKey?: keyof T; // Nombre de la propiedad en el objeto (ej: 'nombre')
  width?: string; // Ancho opcional (ej: 'w-20')
  // Función para renderizar contenido custom (botones, badges, etc.)
  cell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number; // Para la 'key' única de React
  isLoading?: boolean;
}

export const DataTable = <T,>({
  data,
  columns,
  keyExtractor,
  isLoading,
}: DataTableProps<T>) => {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-legacy-text animate-pulse">
        Cargando datos...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white border border-legacy-inputBorder rounded-md">
        No se encontraron resultados.
      </div>
    );
  }

  return (
    <div className="h-[300px] overflow-y-auto bg-white border border-legacy-inputBorder rounded-md relative shadow-sm">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="sticky top-0 bg-white shadow-sm z-10">
          <tr>
            {columns.map((col, index) => (
              <th
                key={index}
                className={`
                  p-3 font-semibold text-legacy-text bg-gray-50
                  border-b-2 border-r border-legacy-inputBorder last:border-r-0 text-center
                  ${col.width || ""}
                `}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-legacy-inputBorder">
          {data.map((row) => (
            <tr
              key={keyExtractor(row)}
              className="hover:bg-blue-50 transition-colors"
            >
              {columns.map((col, index) => (
                <td
                  key={index}
                  className="p-2 border-r border-legacy-inputBorder last:border-r-0 text-center align-middle"
                >
                  {/* Lógica: Si hay render custom (cell) úsalo, sino muestra el texto plano */}
                  {col.cell
                    ? col.cell(row)
                    : col.accessorKey
                    ? String(row[col.accessorKey] || "-")
                    : ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

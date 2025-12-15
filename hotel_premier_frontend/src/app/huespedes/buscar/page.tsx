"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MainContainer } from "@/components/ui/MainContainer";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { HuespedDTO, TipoDocumento } from "@/api/types";
import { useAlert } from "@/hooks/useAlert";

export default function BuscarHuespedPage() {
  const router = useRouter();
  const { showError } = useAlert();

  // --- ESTADOS ---
  const [filtros, setFiltros] = useState({
    nombre: "",
    apellido: "",
    documento: "",
    tipoDocumento: "",
  });

  const [huespedes, setHuespedes] = useState<HuespedDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);

  // Estado para la fila seleccionada (guardamos el documento)
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  // --- LÓGICA DE BÚSQUEDA ---
  const handleSearch = async () => {
    setLoading(true);
    setBusquedaRealizada(true);
    setSelectedDoc(null); // Limpiamos selección al buscar de nuevo

    // SIMULACIÓN (Aquí iría: await huespedService.buscar(filtros))
    setTimeout(() => {
      const mockDB: HuespedDTO[] = [
        {
          id: 1,
          nombre: "Lionel Andrés",
          apellido: "Messi",
          tipoDocumento: TipoDocumento.DNI,
          documento: "10101010",
          email: "lio@messi.com",
          telefono: "12345678",
          calle: "Miami",
          ocupacion: "Futbolista",
          nacionalidad: "Argentina",
        },
        {
          id: 2,
          nombre: "Julián",
          apellido: "Álvarez",
          tipoDocumento: TipoDocumento.DNI,
          documento: "20202020",
          email: "araña@river.com",
          telefono: "87654321",
          calle: "Manchester",
          ocupacion: "Futbolista",
          nacionalidad: "Argentina",
        },
      ];

      // Filtro local simulado
      const resultados = mockDB.filter((h) => {
        const matchNombre = filtros.nombre
          ? h.nombre.toLowerCase().includes(filtros.nombre.toLowerCase())
          : true;
        const matchApellido = filtros.apellido
          ? h.apellido.toLowerCase().includes(filtros.apellido.toLowerCase())
          : true;
        const matchDoc = filtros.documento
          ? h.documento.includes(filtros.documento)
          : true;

        // Validación segura de tipo de documento
        const matchTipo = filtros.tipoDocumento
          ? h.tipoDocumento === filtros.tipoDocumento
          : true;

        return matchNombre && matchApellido && matchDoc && matchTipo;
      });

      setHuespedes(resultados);
      setLoading(false);
    }, 500);
  };

  // --- LÓGICA DE NAVEGACIÓN ---
  const handleNext = () => {
    if (selectedDoc) {
      // Redirigimos a la ruta dinámica que creamos
      router.push(`/huespedes/editar/${selectedDoc}`);
    } else {
      showError("Debe seleccionar un huésped para continuar.");
    }
  };

  return (
    <MainContainer title="Buscar Huésped">
      {/* 1. SECCIÓN DE FILTROS (DISEÑO 2x2) */}
      <div className="bg-white p-6 rounded-lg border border-legacy-inputBorder shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <Input
            label="Nombres:"
            placeholder="Ingrese sus nombres"
            value={filtros.nombre}
            onChange={(e) => setFiltros({ ...filtros, nombre: e.target.value })}
          />
          <Input
            label="Apellido:"
            placeholder="Ingrese su apellido"
            value={filtros.apellido}
            onChange={(e) =>
              setFiltros({ ...filtros, apellido: e.target.value })
            }
          />
          <Select
            label="Tipo de documento:"
            value={filtros.tipoDocumento}
            onChange={(e) =>
              setFiltros({ ...filtros, tipoDocumento: e.target.value })
            }
            options={[
              { label: "DNI", value: TipoDocumento.DNI },
              { label: "Pasaporte", value: TipoDocumento.PASAPORTE },
            ]}
          />
          <Input
            label="Nro. de documento:"
            placeholder="Ingrese su número de documento"
            value={filtros.documento}
            onChange={(e) =>
              setFiltros({ ...filtros, documento: e.target.value })
            }
          />
        </div>

        <div className="flex justify-end mt-6 gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setFiltros({
                nombre: "",
                apellido: "",
                documento: "",
                tipoDocumento: "",
              });
              setHuespedes([]);
              setBusquedaRealizada(false);
              setSelectedDoc(null);
            }}
          >
            Limpiar
          </Button>
          <Button onClick={handleSearch} isLoading={loading} className="px-8">
            Buscar
          </Button>
        </div>
      </div>

      {/* 2. SECCIÓN DE RESULTADOS */}
      <div className="border border-legacy-inputBorder rounded-lg bg-white shadow-sm overflow-hidden flex flex-col">
        {/* Cabecera del contenedor */}
        <div className="px-4 py-3 border-b border-legacy-inputBorder bg-white">
          <h3 className="text-gray-700 font-semibold text-sm text-center md:text-left">
            Huéspedes encontrados ({huespedes.length})
          </h3>
        </div>

        {/* Tabla con scroll */}
        <div className="flex-1 min-h-[250px] max-h-[300px] overflow-y-auto">
          <table className="w-full text-sm text-center border-collapse">
            <thead className="text-xs text-gray-600 font-bold bg-white border-b border-legacy-inputBorder sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-3 border-r border-legacy-inputBorder w-1/3 text-center">
                  Nombres
                </th>
                <th className="px-6 py-3 border-r border-legacy-inputBorder w-1/3 text-center">
                  Apellido
                </th>
                <th className="px-6 py-3 w-1/3 text-center">
                  Nro. de documento
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-center py-10 text-gray-500">
                    Buscando...
                  </td>
                </tr>
              ) : huespedes.length > 0 ? (
                huespedes.map((h) => (
                  <tr
                    key={h.id}
                    onClick={() => setSelectedDoc(h.documento)}
                    className={`cursor-pointer transition-colors ${
                      selectedDoc === h.documento
                        ? "bg-blue-100 text-blue-900 font-medium"
                        : "hover:bg-blue-50"
                    }`}
                  >
                    <td className="px-6 py-3 border-r border-gray-100">
                      {h.nombre}
                    </td>
                    <td className="px-6 py-3 border-r border-gray-100">
                      {h.apellido}
                    </td>
                    <td className="px-6 py-3">
                      {h.tipoDocumento} {h.documento}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="text-center py-12 text-gray-400 italic"
                  >
                    {busquedaRealizada
                      ? "No se encontraron resultados"
                      : "Ingrese filtros arriba para comenzar la búsqueda."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer con Botón Siguiente */}
        <div className="p-4 border-t border-legacy-inputBorder flex justify-end bg-gray-50">
          <Button
            variant={selectedDoc ? "primary" : "secondary"}
            disabled={!selectedDoc}
            onClick={handleNext}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </MainContainer>
  );
}

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MainContainer } from "@/components/ui/MainContainer";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { HuespedDTO, TipoDoc } from "@/api/types";
import { huespedService } from "@/api/huespedService";
import { useAlert } from "@/hooks/useAlert";

export default function BuscarHuespedPage() {
  const router = useRouter();
  const { showError, showAlert } = useAlert();

  const [filtros, setFiltros] = useState({
    nombre: "",
    apellido: "",
    documento: "",
    tipoDocumento: "",
  });

  const [huespedes, setHuespedes] = useState<HuespedDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);

  // Estado para guardar la clave compuesta (Tipo-Numero) ---
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // Función auxiliar para generar la clave única ---
  const getUniqueKey = (h: HuespedDTO) =>
    `${h.tipo_documento}-${h.nroDocumento}`;

  const handleTextInput = (field: string, value: string) => {
    if (/^[a-zA-Z\s]*$/.test(value)) {
      setFiltros((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setBusquedaRealizada(true);
    setSelectedKey(null); // Reseteamos selección al buscar de nuevo

    try {
      const resultados = await huespedService.buscar({
        nombre: filtros.nombre,
        apellido: filtros.apellido,
        documento: filtros.documento,
        tipoDocumento: filtros.tipoDocumento,
      });
      setHuespedes(resultados);

      if (resultados.length === 0) {
        const result = await showAlert({
          title: "Sin resultados",
          text: "No se encontro huesped que coincida con los datos provistos, desea cargar uno?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Dar alta",
          cancelButtonText: "Cancelar",
          reverseButtons: true,
        });

        if (result.isConfirmed) {
          router.push("/huespedes/alta");
        }
      }
    } catch (err) {
      console.error(err);
      showError("Error al buscar huéspedes o no hay conexión.");
      setHuespedes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (selectedKey) {
      // Desarmamos la clave para obtener el número real
      const [tipo, nro] = selectedKey.split("-");

      // Enviamos también el tipo como Query Param para evitar ambigüedad en la edición
      router.push(`/huespedes/editar/${nro}?tipo=${tipo}`);
    } else {
      router.push("/huespedes/alta");
    }
  };

  const handleCancel = () => {
    router.push("/");
  };

  return (
    <MainContainer title="Buscar Huésped">
      {/* 1. FILTROS */}
      <div className="bg-white p-6 rounded-lg border border-legacy-inputBorder shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <Input
            label="Nombres:"
            placeholder="Ingrese sus nombres"
            value={filtros.nombre}
            onChange={(e) => handleTextInput("nombre", e.target.value)}
          />
          <Input
            label="Apellido:"
            placeholder="Ingrese su apellido"
            value={filtros.apellido}
            onChange={(e) => handleTextInput("apellido", e.target.value)}
          />
          <Select
            label="Tipo de documento:"
            value={filtros.tipoDocumento}
            onChange={(e) =>
              setFiltros({ ...filtros, tipoDocumento: e.target.value })
            }
            options={[
              { label: "DNI", value: TipoDoc.DNI },
              { label: "Libreta Cívica", value: TipoDoc.LC },
              { label: "Libreta Enrolamiento", value: TipoDoc.LE },
              { label: "Pasaporte", value: TipoDoc.PASAPORTE },
              { label: "Otro", value: TipoDoc.OTRO },
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
              setSelectedKey(null);
            }}
          >
            Limpiar
          </Button>
          <Button onClick={handleSearch} isLoading={loading} className="px-8">
            Buscar
          </Button>
        </div>
      </div>

      {/* 2. RESULTADOS */}
      <div className="border border-legacy-inputBorder rounded-lg bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-legacy-inputBorder bg-white">
          <h3 className="text-gray-700 font-semibold text-sm">
            Huéspedes encontrados ({huespedes.length})
          </h3>
        </div>

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
                huespedes.map((h) => {
                  // --- CAMBIO 3: Usar la clave compuesta ---
                  const uniqueKey = getUniqueKey(h);
                  const isSelected = selectedKey === uniqueKey;

                  return (
                    <tr
                      key={uniqueKey} // Key única real
                      onClick={() => setSelectedKey(uniqueKey)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
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
                        {h.tipo_documento} {h.nroDocumento}
                      </td>
                    </tr>
                  );
                })
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

        <div className="p-4 border-t border-legacy-inputBorder flex justify-between bg-gray-50">
          <Button variant="secondary" onClick={handleCancel}>
            Cancelar
          </Button>

          <Button variant="primary" onClick={handleNext}>
            Siguiente
          </Button>
        </div>
      </div>
    </MainContainer>
  );
}

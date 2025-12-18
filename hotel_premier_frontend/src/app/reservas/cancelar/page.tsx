"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MainContainer } from "@/components/ui/MainContainer";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAlert } from "@/hooks/useAlert";
import { reservaService } from "@/api/reservaService";
import { ReservaListadoDTO } from "@/api/types";

export default function CancelarReservaPage() {
  const router = useRouter();
  const { showAlert, showSuccess, showError } = useAlert();

  const [filtros, setFiltros] = useState({ apellido: "", nombre: "" });
  const [reservas, setReservas] = useState<ReservaListadoDTO[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);

  const handleSearch = async () => {
    if (!filtros.apellido.trim()) {
      showError("El campo apellido no puede estar vacío.");
      return;
    }

    setLoading(true);
    setBusquedaRealizada(true);
    setSelectedIds([]);

    try {
      const data = await reservaService.buscarPorHuesped(
        filtros.apellido,
        filtros.nombre
      );

      console.log("Datos recibidos:", data); // DEBUG: Ver en consola si vienen IDs

      const mapeados = data.map((r: any) => ({
        id: r.id, // Si esto viene undefined, fallará la selección
        habitacion:
          r.habitacionesReservadas && r.habitacionesReservadas.length > 0
            ? r.habitacionesReservadas[0].numero
            : 0,
        tipoHabitacion:
          r.habitacionesReservadas && r.habitacionesReservadas.length > 0
            ? r.habitacionesReservadas[0].tipo
            : "-",
        fechaInicio: r.fechaIngreso || "",
        fechaFin: r.fechaEgreso || "",
        huespedNombre: r.nombre,
        huespedApellido: r.apellido,
        estado: "RESERVADA",
      }));

      setReservas(mapeados);
    } catch (error) {
      console.error(error);
      showError("Error al buscar reservas.");
      setReservas([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === reservas.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(reservas.map((r) => r.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds((prev) => prev.filter((x) => x !== id));
    } else {
      setSelectedIds((prev) => [...prev, id]);
    }
  };

  const handleBulkCancel = async () => {
    if (selectedIds.length === 0) return;

    const result = await showAlert({
      title: "Cancelar Reservas",
      text: `¿Está seguro de cancelar las ${selectedIds.length} reservas seleccionadas?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "SÍ, CANCELAR",
      cancelButtonText: "VOLVER",
      confirmButtonColor: "#ef4444",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        await reservaService.cancelarMultiples(selectedIds);
        setReservas((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
        setSelectedIds([]);
        await showSuccess(
          "Operación Exitosa",
          "Reservas canceladas correctamente."
        );
      } catch (error: any) {
        showError(
          "Error al cancelar: " + (error.message || "Intente nuevamente")
        );
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <MainContainer title="Cancelar Reserva">
      <div className="bg-white p-6 rounded-lg border border-legacy-inputBorder shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <Input
            label="Apellido del Huésped:"
            placeholder="Ingrese apellido"
            value={filtros.apellido}
            onChange={(e) =>
              setFiltros({ ...filtros, apellido: e.target.value })
            }
          />
        </div>
        <div className="flex-1 w-full">
          <Input
            label="Nombre (Opcional):"
            placeholder="Ingrese nombre"
            value={filtros.nombre}
            onChange={(e) => setFiltros({ ...filtros, nombre: e.target.value })}
          />
        </div>
        <Button
          onClick={handleSearch}
          isLoading={loading}
          className="w-full md:w-auto mb-1"
        >
          Buscar
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-legacy-inputBorder shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-legacy-inputBorder flex justify-between items-center">
          <span className="font-semibold text-gray-700">
            Reservas Encontradas ({reservas.length})
          </span>
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkCancel}
              className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded transition-colors shadow-sm animate-in fade-in"
            >
              CANCELAR ({selectedIds.length}) SELECCIONADAS
            </button>
          )}
        </div>

        {loading && reservas.length === 0 ? (
          <div className="p-10 text-center text-gray-500">Buscando...</div>
        ) : reservas.length === 0 ? (
          <div className="p-10 text-center text-gray-500 italic">
            {busquedaRealizada
              ? "No se encontraron reservas."
              : "Ingrese el apellido del huésped para buscar."}
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        reservas.length > 0 &&
                        selectedIds.length === reservas.length
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3 w-16 text-center text-gray-400">
                    ID
                  </th>{" "}
                  {/* Columna Debug */}
                  <th className="px-6 py-3">Huésped</th>
                  <th className="px-6 py-3">Habitación</th>
                  <th className="px-6 py-3">Desde</th>
                  <th className="px-6 py-3">Hasta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reservas.map((r) => {
                  const isSelected = selectedIds.includes(r.id);
                  return (
                    <tr
                      key={r.id}
                      onClick={() => toggleSelectOne(r.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? "bg-red-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(r.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-4 text-center text-gray-400 font-mono text-xs">
                        {r.id}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {r.huespedApellido}, {r.huespedNombre}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-legacy-primary">
                          Hab {r.habitacion}
                        </span>
                        <span className="text-gray-400 text-xs block">
                          {r.tipoHabitacion}
                        </span>
                      </td>
                      <td className="px-6 py-4">{r.fechaInicio}</td>
                      <td className="px-6 py-4">{r.fechaFin}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="flex justify-start mt-8">
        <Button variant="secondary" onClick={() => router.push("/")}>
          Volver
        </Button>
      </div>
    </MainContainer>
  );
}

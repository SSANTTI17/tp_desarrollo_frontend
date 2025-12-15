"use client";

import React, { useState } from "react";
import { MainContainer } from "@/components/ui/MainContainer";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAlert } from "@/hooks/useAlert";
import { ReservaListadoDTO } from "@/api/types"; // Importamos el tipo nuevo

export default function CancelarReservaPage() {
  const { showAlert, showSuccess, showError } = useAlert();

  const [filtros, setFiltros] = useState({ apellido: "", nombre: "" });
  const [reservas, setReservas] = useState<ReservaListadoDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);

  const handleSearch = async () => {
    // Validación PDF: "El actor ingresa al menos el apellido" (Paso 3)
    if (!filtros.apellido.trim()) {
      showError("El campo apellido no puede estar vacío.");
      return;
    }

    setLoading(true);
    setBusquedaRealizada(true);

    try {
      // --- SIMULACIÓN MOCK (Borrar al integrar con Backend) ---
      setTimeout(() => {
        const mock: ReservaListadoDTO[] = [
          {
            id: 100,
            habitacion: 101,
            tipoHabitacion: "Individual Estándar",
            fechaInicio: "2025-05-10",
            fechaFin: "2025-05-15",
            huespedApellido: "Messi",
            huespedNombre: "Lionel",
            estado: "RESERVADA",
          },
          {
            id: 101,
            habitacion: 205,
            tipoHabitacion: "Suite Doble",
            fechaInicio: "2025-06-01",
            fechaFin: "2025-06-10",
            huespedApellido: "Messi",
            huespedNombre: "Lionel",
            estado: "RESERVADA",
          },
        ];
        // Filtro local simple para el mock
        const res = mock.filter(
          (r) =>
            r.huespedApellido
              .toLowerCase()
              .includes(filtros.apellido.toLowerCase()) &&
            (filtros.nombre
              ? r.huespedNombre
                  .toLowerCase()
                  .includes(filtros.nombre.toLowerCase())
              : true)
        );
        setReservas(res);
        setLoading(false);
      }, 600);

      // --- CÓDIGO REAL (Descomentar cuando el backend esté listo) ---
      // const data = await reservaService.buscarPorHuesped(filtros.apellido, filtros.nombre);
      // setReservas(data);
    } catch (error) {
      setLoading(false);
      showError("Error al buscar reservas.");
    }
  };

  const handleCancelar = async (reserva: ReservaListadoDTO) => {
    const result = await showAlert({
      title: "Cancelar Reserva",
      html: `
        <div class="text-left">
            <p>¿Está seguro de cancelar la siguiente reserva?</p>
            <ul class="list-disc pl-5 mt-2 text-sm bg-red-50 p-2 rounded border border-red-100 text-red-800">
                <li><b>Huésped:</b> ${reserva.huespedApellido}, ${reserva.huespedNombre}</li>
                <li><b>Habitación:</b> ${reserva.habitacion} (${reserva.tipoHabitacion})</li>
                <li><b>Fecha:</b> ${reserva.fechaInicio} al ${reserva.fechaFin}</li>
            </ul>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "SÍ, CANCELAR",
      cancelButtonText: "VOLVER",
      confirmButtonColor: "#ef4444",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        // await reservaService.cancelar(reserva.id); // Llamada al backend

        // Simulación: Quitamos de la lista visualmente
        setReservas((prev) => prev.filter((r) => r.id !== reserva.id));

        await showSuccess(
          "Reserva Cancelada",
          "La habitación ha quedado liberada y disponible."
        );
      } catch (error) {
        showError("No se pudo cancelar la reserva.");
      }
    }
  };

  return (
    <MainContainer title="Cancelar Reserva">
      {/* 1. BUSCADOR */}
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

      {/* 2. RESULTADOS (GRILLA) */}
      <div className="bg-white rounded-lg border border-legacy-inputBorder shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-legacy-inputBorder font-semibold text-gray-700">
          Reservas Encontradas ({reservas.length})
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500">Buscando...</div>
        ) : reservas.length === 0 ? (
          <div className="p-10 text-center text-gray-500 italic">
            {busquedaRealizada
              ? "No se encontraron reservas activas con esos datos."
              : "Ingrese el apellido del huésped para buscar sus reservas."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3">Huésped</th>
                  <th className="px-6 py-3">Habitación</th>
                  <th className="px-6 py-3">Desde</th>
                  <th className="px-6 py-3">Hasta</th>
                  <th className="px-6 py-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reservas.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-red-50 transition-colors group"
                  >
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
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleCancelar(r)}
                        className="text-red-600 hover:text-white border border-red-200 bg-white hover:bg-red-500 font-medium text-xs px-4 py-2 rounded transition-all shadow-sm"
                      >
                        CANCELAR
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainContainer>
  );
}

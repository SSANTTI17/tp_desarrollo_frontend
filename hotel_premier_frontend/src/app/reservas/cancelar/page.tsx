"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Importamos useRouter
import { MainContainer } from "@/components/ui/MainContainer";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAlert } from "@/hooks/useAlert";
import { reservaService } from "@/api/reservaService";
import { ReservaListadoDTO } from "@/api/types";

export default function CancelarReservaPage() {
  const router = useRouter(); // Inicializamos el router
  const { showAlert, showSuccess, showError } = useAlert();

  const [filtros, setFiltros] = useState({ apellido: "", nombre: "" });
  const [reservas, setReservas] = useState<ReservaListadoDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);

  const handleSearch = async () => {
    if (!filtros.apellido.trim()) {
      showError("El campo apellido no puede estar vacío.");
      return;
    }

    setLoading(true);
    setBusquedaRealizada(true);

    try {
      const data = await reservaService.buscarPorHuesped(
        filtros.apellido,
        filtros.nombre
      );

      const mapeados = data.map((r: any) => ({
        id: r.id,
        habitacion:
          r.habitacionesReservadas && r.habitacionesReservadas.length > 0
            ? r.habitacionesReservadas[0].numero
            : 0,
        tipoHabitacion:
          r.habitacionesReservadas && r.habitacionesReservadas.length > 0
            ? r.habitacionesReservadas[0].tipo
            : "-",
        fechaInicio: r.fechaIngreso ? r.fechaIngreso.split("T")[0] : "",
        fechaFin: r.fechaEgreso ? r.fechaEgreso.split("T")[0] : "",
        huespedNombre: r.nombre,
        huespedApellido: r.apellido,
        estado: "RESERVADA",
      }));

      setReservas(mapeados);
    } catch (error) {
      console.error(error);
      showError("Error al buscar reservas. Verifique la conexión.");
      setReservas([]);
    } finally {
      setLoading(false);
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
        await reservaService.cancelar(reserva.id);

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

      {/* --- AGREGADO: BOTÓN CANCELAR (VOLVER) A LA IZQUIERDA --- */}
      <div className="flex justify-start mt-8">
        <Button variant="secondary" onClick={() => router.push("/")}>
          Cancelar
        </Button>
      </div>
    </MainContainer>
  );
}

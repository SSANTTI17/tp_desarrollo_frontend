"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { MainContainer } from "@/components/ui/MainContainer";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { DateInput } from "@/components/ui/DateInput";
import {
  AvailabilityGrid,
  GridSelection,
} from "@/components/features/habitaciones/AvailabilityGrid";
import { useAlert } from "@/hooks/useAlert";
import { HabitacionDTO, TipoHabitacion, EstadoHabitacion } from "@/api/types";
import { habitacionService } from "@/api/habitacionService";
import { apiClient } from "@/api/apiClient";

export default function CrearReservaPage() {
  const router = useRouter();
  const { showSuccess, showError, showAlert } = useAlert();

  const [tipoHabitacion, setTipoHabitacion] = useState<TipoHabitacion | "">("");

  // Fechas
  const todayStr = new Date().toISOString().split("T")[0];
  const nextWeekStr = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [fechas, setFechas] = useState({
    desde: todayStr,
    hasta: nextWeekStr,
  });

  const [habitaciones, setHabitaciones] = useState<HabitacionDTO[]>([]);
  const [pendientes, setPendientes] = useState<GridSelection[]>([]);
  const [loading, setLoading] = useState(false);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);

  const formatFecha = (f: string) => f.split("-").reverse().join("/");

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFechas({ ...fechas, [e.target.name]: e.target.value });
  };

  const handleSearch = async () => {
    if (!tipoHabitacion) return;
    if (!fechas.desde || !fechas.hasta) {
      showError("Debe seleccionar ambas fechas.");
      return;
    }
    if (fechas.desde > fechas.hasta) {
      showError("La fecha 'Desde' no puede ser mayor a 'Hasta'.");
      return;
    }

    setHabitaciones([]);
    setPendientes([]);
    setLoading(true);
    setBusquedaRealizada(true);

    try {
      const todasLasHabitaciones = await habitacionService.getEstado(
        fechas.desde,
        fechas.hasta
      );

      const habitacionesFiltradas = todasLasHabitaciones.filter(
        (h) => h.tipo === tipoHabitacion
      );

      const hayDisponibilidad = habitacionesFiltradas.some((h) =>
        h.estadosPorDia.some((e) => e === EstadoHabitacion.DISPONIBLE)
      );

      if (hayDisponibilidad) {
        setHabitaciones(habitacionesFiltradas);
      }
    } catch (error: any) {
      console.error(error);
      showError("Error al obtener las habitaciones de la base de datos.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectionComplete = (nuevaSeleccion: GridSelection) => {
    const colision = pendientes.find(
      (p) =>
        p.habitacion === nuevaSeleccion.habitacion &&
        Math.max(p.startIndex, nuevaSeleccion.startIndex) <=
          Math.min(p.endIndex, nuevaSeleccion.endIndex)
    );

    if (colision) {
      showError(
        `Ya tienes seleccionada la Habitación ${nuevaSeleccion.habitacion} para esas fechas.`
      );
      return;
    }
    setPendientes([...pendientes, nuevaSeleccion]);
  };

  const removeSelectionByIndex = (index: number) => {
    const nuevas = [...pendientes];
    nuevas.splice(index, 1);
    setPendientes(nuevas);
  };

  const handleSelectionRemove = (s: GridSelection) => {};
  const handleSelectionError = (m: string) => showError(m);

  const handleConfirmarTodo = async () => {
    if (pendientes.length === 0) return;

    const listaHtml = pendientes
      .map(
        (p) =>
          `<li class="mb-1"><b>Hab ${p.habitacion}:</b> del ${formatFecha(
            p.fechas[0]
          )} al ${formatFecha(p.fechas[p.fechas.length - 1])}</li>`
      )
      .join("");

    const result = await showAlert({
      title: "Confirmar Reservas",
      html: `
        <div class="text-left">
            <p class="mb-3">Estás por reservar las siguientes habitaciones:</p>
            <ul class="list-disc pl-5 text-sm mb-4 bg-gray-50 p-2 rounded border">${listaHtml}</ul>
            <p class="font-bold text-right">Total: ${pendientes.length} habitaciones</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Sí, continuar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      const { value: datos } = await Swal.fire({
        title: "Datos del Titular de la Reserva",
        html: `
            <div class="flex flex-col gap-3 text-left">
              <label>Apellido <span class="text-red-500">*</span></label>
              <input id="swal-apellido" class="swal2-input m-0" placeholder="Ej: Perez">
              
              <label>Nombre <span class="text-red-500">*</span></label>
              <input id="swal-nombre" class="swal2-input m-0" placeholder="Ej: Juan">
              
              <label>Teléfono <span class="text-red-500">*</span></label>
              <input id="swal-tel" class="swal2-input m-0" placeholder="Ej: 341...">
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        preConfirm: () => {
          const apellido = (
            document.getElementById("swal-apellido") as HTMLInputElement
          ).value.trim();
          const nombre = (
            document.getElementById("swal-nombre") as HTMLInputElement
          ).value.trim();
          const telefono = (
            document.getElementById("swal-tel") as HTMLInputElement
          ).value.trim();

          if (!apellido || !nombre || !telefono) {
            Swal.showValidationMessage("Todos los campos son obligatorios");
            return false;
          }
          return { apellido, nombre, telefono };
        },
      });

      if (datos) {
        setLoading(true);
        try {
          // PROCESO DE GUARDADO:
          // Iteramos sobre las selecciones y enviamos una petición por cada selección

          for (const p of pendientes) {
            // --- CORRECCIÓN IMPORTANTE ---
            // Enviamos los datos "planos" para que el backend Java use setNumero() y setTipo()
            const habitacionPayload = {
              numero: p.habitacion,
              tipo: tipoHabitacion,
              costoNoche: 0, // Valor dummy
            };

            const bodyRequest = {
              nombre: datos.nombre,
              apellido: datos.apellido,
              telefono: datos.telefono,
              fechaInicio: p.fechas[0],
              fechaFin: p.fechas[p.fechas.length - 1],
              habitaciones: [habitacionPayload],
            };

            await apiClient.post(`/reservas/crear`, bodyRequest);
          }

          await showSuccess(
            "¡Reservas Creadas!",
            "Las habitaciones han sido reservadas con éxito en el sistema."
          );

          window.location.reload();
        } catch (error: any) {
          showError("Error al guardar la reserva: " + error.message);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  return (
    <MainContainer title="Reservar habitaciones">
      <div
        className={`grid grid-cols-1 ${
          busquedaRealizada ? "lg:grid-cols-4" : "lg:grid-cols-1"
        } gap-8 items-start transition-all duration-300`}
      >
        <div
          className={`${
            busquedaRealizada ? "lg:col-span-3" : "lg:col-span-1"
          } space-y-6 transition-all`}
        >
          <div className="bg-white p-6 rounded-lg border border-legacy-inputBorder shadow-sm flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DateInput
                label="Desde fecha:"
                name="desde"
                value={fechas.desde}
                onChange={handleDateChange}
              />
              <DateInput
                label="Hasta fecha:"
                name="hasta"
                value={fechas.hasta}
                onChange={handleDateChange}
              />
            </div>
            <div className="flex flex-col md:flex-row gap-6 items-end">
              <div className="w-full md:flex-1">
                <Select
                  label="Tipo de habitación:"
                  value={tipoHabitacion}
                  onChange={(e) =>
                    setTipoHabitacion(e.target.value as TipoHabitacion)
                  }
                  options={[
                    { label: "Individual estándar", value: TipoHabitacion.IE },
                    { label: "Doble estándar", value: TipoHabitacion.DE },
                    { label: "Doble superior", value: TipoHabitacion.DS },
                    {
                      label: "Superior Family Plan",
                      value: TipoHabitacion.SFP,
                    },
                    { label: "Suite doble", value: TipoHabitacion.SD },
                  ]}
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={!tipoHabitacion}
                isLoading={loading}
                className="w-full md:w-auto px-8 whitespace-nowrap"
              >
                Buscar Disponibilidad
              </Button>
            </div>
          </div>

          {busquedaRealizada && (
            <div className="bg-white p-4 rounded-lg border border-legacy-inputBorder shadow-sm animate-in fade-in">
              <div className="mb-4">
                <h3 className="font-semibold text-legacy-text">
                  Resultados de búsqueda
                </h3>
              </div>
              {habitaciones.length > 0 ? (
                <>
                  <p className="text-xs text-gray-500 mb-2">
                    Seleccione rangos disponibles (Verde).
                  </p>
                  <AvailabilityGrid
                    habitaciones={habitaciones}
                    fechaInicio={fechas.desde}
                    dias={
                      Math.floor(
                        (new Date(fechas.hasta).getTime() -
                          new Date(fechas.desde).getTime()) /
                          (1000 * 3600 * 24)
                      ) + 1
                    }
                    selectable={true}
                    selections={pendientes}
                    onSelectionComplete={handleSelectionComplete}
                    onSelectionRemove={handleSelectionRemove}
                    onSelectionError={handleSelectionError}
                  />
                </>
              ) : (
                <div className="p-10 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <p className="text-lg">
                    No existen habitaciones del tipo{" "}
                    <span className="font-bold text-legacy-text">
                      {tipoHabitacion}
                    </span>{" "}
                    para el rango de fechas seleccionado.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {busquedaRealizada && habitaciones.length > 0 && (
          <div className="lg:col-span-1 bg-white p-4 rounded-lg border border-legacy-inputBorder shadow-sm h-fit sticky top-4 animate-in slide-in-from-right-4 fade-in duration-500">
            <div className="flex justify-between items-center mb-4 border-b pb-2 border-legacy-inputBorder">
              <h3 className="font-bold text-legacy-text">Tu Selección</h3>
              <span className="bg-legacy-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {pendientes.length}
              </span>
            </div>
            {pendientes.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm italic">El carrito está vacío.</p>
              </div>
            ) : (
              <ul className="space-y-3 mb-6 max-h-[400px] overflow-y-auto pr-1">
                {pendientes.map((p, i) => (
                  <li
                    key={i}
                    className="text-sm bg-blue-50 p-3 rounded border border-blue-100 relative group shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-legacy-primary">
                        Hab {p.habitacion}
                      </span>
                      <button
                        onClick={() => removeSelectionByIndex(i)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-0.5"
                        title="Quitar"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="text-gray-600 text-xs mt-1 flex flex-col">
                      <span>
                        <b>Desde:</b> {formatFecha(p.fechas[0])}
                      </span>
                      <span>
                        <b>Hasta:</b>{" "}
                        {formatFecha(p.fechas[p.fechas.length - 1])}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Button
              onClick={handleConfirmarTodo}
              disabled={pendientes.length === 0}
              className="w-full text-sm"
              variant={pendientes.length === 0 ? "secondary" : "primary"}
            >
              Confirmar Reserva
            </Button>
          </div>
        )}
      </div>
      <div className="flex justify-end mt-8">
        <Button variant="secondary" onClick={() => router.push("/")}>
          Volver al Menú
        </Button>
      </div>
    </MainContainer>
  );
}

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

  const TIPO_HABITACION_LABELS: Record<string, string> = {
    [TipoHabitacion.IE]: "Individual estándar",
    [TipoHabitacion.DE]: "Doble estándar",
    [TipoHabitacion.DS]: "Doble superior",
    [TipoHabitacion.SFP]: "Superior Family Plan",
    [TipoHabitacion.SD]: "Suite doble",
  };

  const [fechas, setFechas] = useState({
    desde: "",
    hasta: "",
  });

  const [allHabitaciones, setAllHabitaciones] = useState<HabitacionDTO[]>([]);
  const [pendientes, setPendientes] = useState<GridSelection[]>([]);
  const [loading, setLoading] = useState(false);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);

  // --- HELPERS DE FECHA ---
  const parseDateSeguro = (fechaStr: string) => {
    if (!fechaStr) return null;
    let year, month, day;
    if (fechaStr.includes("/")) {
      [day, month, year] = fechaStr.split("/").map(Number);
    } else {
      [year, month, day] = fechaStr.split("-").map(Number);
    }
    return new Date(year, month - 1, day, 12, 0, 0);
  };

  const formatFechaDetallada = (fechaStr: string) => {
    const date = parseDateSeguro(fechaStr);
    if (!date || isNaN(date.getTime())) return fechaStr;
    const nombreDia = new Intl.DateTimeFormat("es-AR", {
      weekday: "long",
    }).format(date);
    const nombreDiaCap = nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1);
    return `${nombreDiaCap}, ${date.toLocaleDateString("es-AR")}`;
  };

  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const field = e.target.name;

    if (pendientes.length > 0) {
      const result = await showAlert({
        title: "¡Atención!",
        text: "Si cambias las fechas, se perderán todas las selecciones actuales. ¿Deseas continuar?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, cambiar y limpiar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#ef4444",
      });

      if (!result.isConfirmed) return;

      setPendientes([]);
      setAllHabitaciones([]);
      setBusquedaRealizada(false);
    }

    setFechas((prev) => ({ ...prev, [field]: newValue }));
    setBusquedaRealizada(false);
    setAllHabitaciones([]);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTipoHabitacion(e.target.value as TipoHabitacion);
  };

  const handleSearch = async () => {
    if (!fechas.desde || !fechas.hasta) {
      showError("Debe seleccionar ambas fechas.");
      return;
    }
    if (fechas.desde > fechas.hasta) {
      showError("La fecha 'Desde' no puede ser mayor a 'Hasta'.");
      return;
    }

    setLoading(true);

    try {
      const data = await habitacionService.getEstado(
        fechas.desde,
        fechas.hasta
      );
      setAllHabitaciones(data);
      setBusquedaRealizada(true);
    } catch (error: any) {
      console.error(error);
      showError("Error al obtener disponibilidad.");
      setAllHabitaciones([]);
    } finally {
      setLoading(false);
    }
  };

  const habitacionesVisuales = allHabitaciones.filter(
    (h) => !tipoHabitacion || h.tipo === tipoHabitacion
  );

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

  const handleSelectionRemove = (seleccionParaBorrar: GridSelection) => {
    setPendientes((prev) =>
      prev.filter(
        (p) =>
          p.habitacion !== seleccionParaBorrar.habitacion ||
          p.startIndex !== seleccionParaBorrar.startIndex
      )
    );
  };

  const removeSelectionByIndex = (index: number) => {
    const nuevas = [...pendientes];
    nuevas.splice(index, 1);
    setPendientes(nuevas);
  };

  const handleSelectionError = (m: string) => showError(m);

  const handleConfirmarTodo = async () => {
    if (pendientes.length === 0) return;

    const listaHtml = pendientes
      .map((p) => {
        const hab = allHabitaciones.find((h) => h.numero === p.habitacion);
        const tipoLabel = hab
          ? TIPO_HABITACION_LABELS[hab.tipo] || hab.tipo
          : "Desconocido";
        return `<li class="mb-1 text-left">
                  <b>Hab ${p.habitacion} (${tipoLabel}):</b><br/> 
                  Del ${p.fechas[0]} al ${p.fechas[p.fechas.length - 1]}
                </li>`;
      })
      .join("");

    const result = await showAlert({
      title: "Confirmar Reservas",
      html: `
        <div class="text-left">
            <p class="mb-3">Estás por reservar las siguientes habitaciones:</p>
            <ul class="list-disc pl-5 text-sm mb-4 bg-gray-50 p-2 rounded border max-h-40 overflow-y-auto">
              ${listaHtml}
            </ul>
            <p class="font-bold text-right">Total: ${pendientes.length} habitaciones</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Aceptar",
      cancelButtonText: "Rechazar",
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
          for (const p of pendientes) {
            const habOriginal = allHabitaciones.find(
              (h) => h.numero === p.habitacion
            );
            if (!habOriginal) continue;

            const habitacionPayload = {
              numero: p.habitacion,
              tipo: habOriginal.tipo,
              costoNoche: habOriginal.costoNoche,
            };

            const bodyRequest = {
              nombre: datos.nombre,
              apellido: datos.apellido,
              telefono: datos.telefono,
              // CORRECCIÓN 1: Nombres de claves coinciden con Backend DTO
              fechaIngreso: p.fechas[0],
              fechaEgreso: p.fechas[p.fechas.length - 1],
              habitacionesReservadas: [habitacionPayload],
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
          {/* Formulario */}
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
                  onChange={handleTypeChange}
                  placeholder="Todas las Habitaciones"
                  options={[
                    {
                      label: TIPO_HABITACION_LABELS[TipoHabitacion.IE],
                      value: TipoHabitacion.IE,
                    },
                    {
                      label: TIPO_HABITACION_LABELS[TipoHabitacion.DE],
                      value: TipoHabitacion.DE,
                    },
                    {
                      label: TIPO_HABITACION_LABELS[TipoHabitacion.DS],
                      value: TipoHabitacion.DS,
                    },
                    {
                      label: TIPO_HABITACION_LABELS[TipoHabitacion.SFP],
                      value: TipoHabitacion.SFP,
                    },
                    {
                      label: TIPO_HABITACION_LABELS[TipoHabitacion.SD],
                      value: TipoHabitacion.SD,
                    },
                  ]}
                />
              </div>
              <Button
                onClick={handleSearch}
                isLoading={loading}
                className="w-full md:w-auto px-8 whitespace-nowrap"
              >
                Buscar Disponibilidad
              </Button>
            </div>
          </div>

          {/* Grilla de Resultados */}
          {busquedaRealizada && (
            <div className="bg-white p-4 rounded-lg border border-legacy-inputBorder shadow-sm animate-in fade-in">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="font-semibold text-legacy-text">
                  Resultados de búsqueda
                </h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Mostrando:{" "}
                  {tipoHabitacion
                    ? TIPO_HABITACION_LABELS[tipoHabitacion]
                    : "Todas"}
                </span>
              </div>

              {habitacionesVisuales.length > 0 ? (
                <>
                  <p className="text-xs text-gray-500 mb-2">
                    Seleccione rangos disponibles (Verde). Haga clic en una
                    selección azul para quitarla.
                  </p>
                  <AvailabilityGrid
                    habitaciones={habitacionesVisuales}
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
                    No existen habitaciones del tipo seleccionado para el rango
                    de fechas.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Panel Lateral: Tu Selección */}
        {busquedaRealizada && (
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
                {pendientes.map((p, i) => {
                  const hab = allHabitaciones.find(
                    (h) => h.numero === p.habitacion
                  );
                  const tipoTexto = hab
                    ? TIPO_HABITACION_LABELS[hab.tipo] || hab.tipo
                    : "Cargando...";

                  return (
                    <li
                      key={i}
                      className="text-sm bg-blue-50 p-3 rounded border border-blue-100 relative group shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-lg text-legacy-primary">
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

                      <div className="text-gray-700 text-xs space-y-1">
                        <div className="flex items-center gap-1 font-semibold text-gray-900">
                          ✓ {tipoTexto}
                        </div>
                        <div className="flex items-center gap-1">
                          ✓ <span className="font-semibold">Ingreso:</span>{" "}
                          {formatFechaDetallada(p.fechas[0])}, 12:00hs.
                        </div>
                        <div className="flex items-center gap-1">
                          ✓ <span className="font-semibold">Egreso:</span>{" "}
                          {formatFechaDetallada(p.fechas[p.fechas.length - 1])},
                          10:00hs.
                        </div>
                      </div>
                    </li>
                  );
                })}
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

      <div className="flex justify-start mt-8">
        <Button variant="secondary" onClick={() => router.push("/")}>
          Cancelar
        </Button>
      </div>
    </MainContainer>
  );
}

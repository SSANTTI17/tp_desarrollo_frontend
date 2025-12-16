"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { MainContainer } from "@/components/ui/MainContainer";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import {
  AvailabilityGrid,
  GridSelection,
} from "@/components/features/habitaciones/AvailabilityGrid";
import { useAlert } from "@/hooks/useAlert";
import { HabitacionDTO, TipoHabitacion, EstadoHabitacion } from "@/api/types";
import { reservaService } from "@/api/reservaService";
import { apiClient } from "@/api/apiClient"; // Necesario para la llamada mixta (Params + Body)

export default function CrearReservaPage() {
  const router = useRouter();
  const { showAlert, showSuccess, showError } = useAlert();

  const [tipoHabitacion, setTipoHabitacion] = useState<TipoHabitacion | "">("");
  const [habitaciones, setHabitaciones] = useState<HabitacionDTO[]>([]);
  const [pendientes, setPendientes] = useState<GridSelection[]>([]);
  const [loading, setLoading] = useState(false);

  // Fechas por defecto
  const today = new Date().toISOString().split("T")[0];
  // Fecha fin calculada para la búsqueda inicial (15 días)
  const fechaFinCalculada = new Date();
  fechaFinCalculada.setDate(fechaFinCalculada.getDate() + 15);
  const fechaFinStr = fechaFinCalculada.toISOString().split("T")[0];

  const mostrarResultados = habitaciones.length > 0;

  // Helper para formatear fecha (YYYY-MM-DD a DD/MM/YYYY) para el mensaje de error
  const formatFecha = (f: string) => f.split("-").reverse().join("/");

  const handleSearch = async () => {
    if (!tipoHabitacion) return;
    setLoading(true);

    try {
      // 2. Llamamos al backend para obtener la disponibilidad
      const disponibilidad = await reservaService.buscarDisponibilidad(
        tipoHabitacion,
        today,
        fechaFinStr
      );

      // 3. Mapeo de respuesta
      const habsMapeadas: HabitacionDTO[] = [];

      if (disponibilidad.some((d) => d !== undefined)) {
        const estados1 = disponibilidad.map((d) =>
          d.sd1 ? EstadoHabitacion.DISPONIBLE : EstadoHabitacion.OCUPADA
        );
        habsMapeadas.push({
          numero: 101, // Nro ficticio visual
          tipo: tipoHabitacion,
          costoNoche: 0,
          estadosPorDia: estados1,
        });

        const estados2 = disponibilidad.map((d) =>
          d.sd2 ? EstadoHabitacion.DISPONIBLE : EstadoHabitacion.OCUPADA
        );
        habsMapeadas.push({
          numero: 102, // Nro ficticio visual
          tipo: tipoHabitacion,
          costoNoche: 0,
          estadosPorDia: estados2,
        });
      }

      // CORRECCIÓN 1: Mensaje específico si no hay resultados
      if (habsMapeadas.length === 0) {
        setHabitaciones([]);
        showError(
          `No hay habitaciones del tipo ${tipoHabitacion} disponibles para el rango de fechas ${formatFecha(
            today
          )} hasta ${formatFecha(fechaFinStr)}`
        );
      } else {
        setHabitaciones(habsMapeadas);
      }
    } catch (error) {
      console.error(error);
      showError("Error al buscar disponibilidad en el servidor.");
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

  const handleSelectionRemove = (seleccionToRemove: GridSelection) => {
    setPendientes((prev) =>
      prev.filter(
        (p) =>
          !(
            p.habitacion === seleccionToRemove.habitacion &&
            p.startIndex === seleccionToRemove.startIndex &&
            p.endIndex === seleccionToRemove.endIndex
          )
      )
    );
  };

  const handleSelectionError = (msg: string) => {
    showError(msg);
  };

  const removeSelectionByIndex = (index: number) => {
    const nuevas = [...pendientes];
    nuevas.splice(index, 1);
    setPendientes(nuevas);
  };

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
      // CORRECCIÓN 2: Modal de Datos del Titular (Apellido, Nombre, Teléfono)
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
          ).value;
          const nombre = (
            document.getElementById("swal-nombre") as HTMLInputElement
          ).value;
          const telefono = (
            document.getElementById("swal-tel") as HTMLInputElement
          ).value;

          // Validaciones requeridas
          if (!apellido || !nombre || !telefono) {
            Swal.showValidationMessage("Todos los campos son obligatorios");
            return false;
          }

          // Validación: No se permiten números en Apellido ni Nombre
          const regexTexto = /^[a-zA-Z\s]+$/;
          if (!regexTexto.test(apellido)) {
            Swal.showValidationMessage(
              "El apellido no debe contener números ni símbolos"
            );
            return false;
          }
          if (!regexTexto.test(nombre)) {
            Swal.showValidationMessage(
              "El nombre no debe contener números ni símbolos"
            );
            return false;
          }

          return { apellido, nombre, telefono };
        },
      });

      if (datos) {
        setLoading(true);
        try {
          for (const p of pendientes) {
            // CORRECCIÓN 3: Envío correcto de Params (URL) y Body (JSON)
            // Construimos la URL con los Query Params
            const queryParams = new URLSearchParams({
              tipo: tipoHabitacion,
              numero: p.habitacion.toString(),
              fechaInicio: p.fechas[0],
              fechaFin: p.fechas[p.fechas.length - 1],
            }).toString();

            // El body es el objeto titular
            const bodyTitular = {
              nombre: datos.nombre,
              apellido: datos.apellido,
              telefono: datos.telefono,
              // Enviamos campos vacíos requeridos por DTO para evitar errores
              nroDocumento: "",
              tipo_documento: "DNI", // Default técnico
            };

            // Usamos apiClient.post pasando la URL completa con query params
            await apiClient.post(`/reservas/crear?${queryParams}`, bodyTitular);
          }

          await showSuccess(
            "¡Reservas Creadas!",
            "Las habitaciones han sido reservadas con éxito en el sistema."
          );

          // CORRECCIÓN 4: Navegación al terminar
          router.push("/"); // Volver al Home
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
          mostrarResultados ? "lg:grid-cols-4" : "lg:grid-cols-1"
        } gap-8 items-start transition-all duration-300`}
      >
        {/* Columna Principal */}
        <div
          className={`${
            mostrarResultados ? "lg:col-span-3" : "lg:col-span-1"
          } space-y-6 transition-all`}
        >
          {/* Buscador */}
          <div className="bg-white p-4 rounded-lg border border-legacy-inputBorder shadow-sm flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
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
                  { label: "Superior Family Plan", value: TipoHabitacion.SFP },
                  { label: "Suite doble", value: TipoHabitacion.SD },
                ]}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={!tipoHabitacion}
              isLoading={loading}
              className="w-full md:w-auto"
            >
              Buscar Disponibilidad
            </Button>
          </div>

          {/* Grilla */}
          {mostrarResultados && (
            <div className="bg-white p-4 rounded-lg border border-legacy-inputBorder shadow-sm animate-in fade-in">
              <div className="mb-4">
                <h3 className="font-semibold text-legacy-text">
                  Resultados de búsqueda
                </h3>
                <p className="text-xs text-gray-500">
                  Seleccione rangos disponibles (Verde).
                </p>
              </div>

              <AvailabilityGrid
                habitaciones={habitaciones}
                fechaInicio={today}
                dias={15}
                selectable={true}
                selections={pendientes}
                onSelectionComplete={handleSelectionComplete}
                onSelectionRemove={handleSelectionRemove}
                onSelectionError={handleSelectionError}
              />
            </div>
          )}
        </div>

        {/* Carrito Lateral */}
        {mostrarResultados && (
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

      {/* Botón Volver al final de la página */}
      <div className="flex justify-end mt-8">
        <Button variant="secondary" onClick={() => router.push("/")}>
          Volver al Menú
        </Button>
      </div>
    </MainContainer>
  );
}

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

export default function CrearReservaPage() {
  const router = useRouter();
  const { showAlert, showSuccess, showError } = useAlert();

  const [tipoHabitacion, setTipoHabitacion] = useState<TipoHabitacion | "">("");
  const [habitaciones, setHabitaciones] = useState<HabitacionDTO[]>([]);
  const [pendientes, setPendientes] = useState<GridSelection[]>([]);
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  // Variable auxiliar para saber si mostramos la interfaz completa
  const mostrarResultados = habitaciones.length > 0;

  const handleSearch = () => {
    if (!tipoHabitacion) return;
    setLoading(true);

    setTimeout(() => {
      // MOCK DATA (Igual que antes)
      const mock: HabitacionDTO[] = [
        {
          numero: 101,
          tipo: TipoHabitacion.IE,
          costoNoche: 5000,
          estadosPorDia: [
            EstadoHabitacion.DISPONIBLE,
            EstadoHabitacion.DISPONIBLE,
            EstadoHabitacion.OCUPADA,
            EstadoHabitacion.OCUPADA,
            EstadoHabitacion.DISPONIBLE,
            EstadoHabitacion.DISPONIBLE,
            EstadoHabitacion.RESERVADA,
            EstadoHabitacion.RESERVADA,
            EstadoHabitacion.DISPONIBLE,
            EstadoHabitacion.DISPONIBLE,
            EstadoHabitacion.DISPONIBLE,
            EstadoHabitacion.DISPONIBLE,
            EstadoHabitacion.DISPONIBLE,
            EstadoHabitacion.DISPONIBLE,
            EstadoHabitacion.DISPONIBLE,
          ],
        },
        {
          numero: 102,
          tipo: TipoHabitacion.IE,
          costoNoche: 5000,
          estadosPorDia: Array(15).fill(EstadoHabitacion.DISPONIBLE),
        },
        {
          numero: 201,
          tipo: TipoHabitacion.DE,
          costoNoche: 8000,
          estadosPorDia: Array(15).fill(EstadoHabitacion.DISPONIBLE),
        },
      ];

      const filtradas = mock.filter((h) => h.tipo === tipoHabitacion);
      const dataFull = filtradas.map((h) => {
        const diasFaltantes = 15 - (h.estadosPorDia?.length || 0);
        const relleno =
          diasFaltantes > 0
            ? Array(diasFaltantes).fill(EstadoHabitacion.DISPONIBLE)
            : [];
        return {
          ...h,
          estadosPorDia: [...(h.estadosPorDia || []), ...relleno],
        };
      });

      setHabitaciones(dataFull);
      setLoading(false);
    }, 400);
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
          `<li class="mb-1"><b>Hab ${p.habitacion}:</b> del ${p.fechas[0]} al ${
            p.fechas[p.fechas.length - 1]
          }</li>`
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
      const { value: datos } = await showAlert({
        title: "Datos del Titular de la Reserva",
        html: `
            <div class="flex flex-col gap-3">
              <input id="swal-dni" class="swal2-input m-0" placeholder="DNI del titular">
              <input id="swal-nombre" class="swal2-input m-0" placeholder="Nombre completo">
              <input id="swal-tel" class="swal2-input m-0" placeholder="Teléfono de contacto">
            </div>
        `,
        focusConfirm: false,
        preConfirm: () => {
          const dni = (document.getElementById("swal-dni") as HTMLInputElement)
            .value;
          const nombre = (
            document.getElementById("swal-nombre") as HTMLInputElement
          ).value;
          if (!dni || !nombre) {
            Swal.showValidationMessage("Por favor complete DNI y Nombre");
          }
          return { dni, nombre };
        },
      });

      if (datos) {
        await showSuccess(
          "¡Reservas Creadas!",
          "Las habitaciones han sido reservadas con éxito."
        );
        setPendientes([]);
        setHabitaciones([]);
        setTipoHabitacion("");
      }
    }
  };

  return (
    <MainContainer title="Reservar habitaciones">
      {/* CAMBIO: La grilla es dinámica. Si hay resultados, son 4 columnas (3+1). Si no, es 1 columna centrada. */}
      <div
        className={`grid grid-cols-1 ${
          mostrarResultados ? "lg:grid-cols-4" : "lg:grid-cols-1"
        } gap-8 items-start transition-all duration-300`}
      >
        {/* Columna Principal: Buscador y Grilla */}
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

          {/* Grilla (Solo visible si hay resultados) */}
          {mostrarResultados && (
            <div className="bg-white p-4 rounded-lg border border-legacy-inputBorder shadow-sm animate-in fade-in">
              <div className="mb-4">
                <h3 className="font-semibold text-legacy-text">
                  Resultados de búsqueda
                </h3>
                <p className="text-xs text-gray-500">
                  Seleccione rangos disponibles. Haga clic en una selección azul
                  para borrarla.
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

        {/* Columna Lateral (Carrito) - CAMBIO: Solo se renderiza si hay resultados */}
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
                <p className="text-xs mt-2">
                  Selecciona fechas en la grilla para agregar.
                </p>
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
                        Habitación {p.habitacion}
                      </span>
                      <button
                        onClick={() => removeSelectionByIndex(i)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-0.5"
                        title="Quitar de la lista"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="text-gray-600 text-xs mt-1 flex flex-col">
                      <span>
                        <b>Desde:</b> {p.fechas[0]}
                      </span>
                      <span>
                        <b>Hasta:</b> {p.fechas[p.fechas.length - 1]}
                      </span>
                      <span className="text-gray-400 text-[10px] mt-1">
                        {p.endIndex - p.startIndex + 1} noches
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
    </MainContainer>
  );
}

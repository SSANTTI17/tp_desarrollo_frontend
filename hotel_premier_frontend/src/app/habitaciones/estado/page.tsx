"use client";

import React, { useState, useEffect } from "react";
import { MainContainer } from "@/components/ui/MainContainer";
import { DateInput } from "@/components/ui/DateInput";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { AvailabilityGrid } from "@/components/features/habitaciones/AvailabilityGrid";
import { habitacionService } from "@/api/habitacionService";
import { useAlert } from "@/hooks/useAlert";
import { HabitacionDTO, TipoHabitacion, EstadoHabitacion } from "@/api/types";

export default function EstadoHabitacionesPage() {
  const { showError } = useAlert();

  // Fechas por defecto (hoy y 15 días después)
  const today = new Date().toISOString().split("T")[0];
  const nextWeek = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [fechas, setFechas] = useState({ desde: today, hasta: nextWeek });
  const [habitaciones, setHabitaciones] = useState<HabitacionDTO[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar datos (Simulado o Real)
  const handleSearch = async () => {
    setLoading(true);
    try {
      // Llamada real al backend
      // const data = await habitacionService.getEstado(fechas.desde, fechas.hasta);
      // setHabitaciones(data);

      // --- MODO SIMULACIÓN PARA QUE VEAS LA GRILLA YA ---
      setTimeout(() => {
        const mockData: HabitacionDTO[] = [
          // Individuales
          {
            numero: 101,
            tipo: TipoHabitacion.IE,
            costoNoche: 100,
            estadosPorDia: [
              EstadoHabitacion.DISPONIBLE,
              EstadoHabitacion.OCUPADA,
              EstadoHabitacion.OCUPADA,
              EstadoHabitacion.DISPONIBLE,
            ],
          },
          {
            numero: 102,
            tipo: TipoHabitacion.IE,
            costoNoche: 100,
            estadosPorDia: [
              EstadoHabitacion.DISPONIBLE,
              EstadoHabitacion.DISPONIBLE,
              EstadoHabitacion.DISPONIBLE,
              EstadoHabitacion.DISPONIBLE,
            ],
          },
          // Dobles
          {
            numero: 201,
            tipo: TipoHabitacion.DE,
            costoNoche: 200,
            estadosPorDia: [
              EstadoHabitacion.OCUPADA,
              EstadoHabitacion.OCUPADA,
              EstadoHabitacion.DISPONIBLE,
              EstadoHabitacion.DISPONIBLE,
            ],
          },
          {
            numero: 202,
            tipo: TipoHabitacion.DE,
            costoNoche: 200,
            estadosPorDia: [
              EstadoHabitacion.RESERVADA,
              EstadoHabitacion.RESERVADA,
              EstadoHabitacion.RESERVADA,
              EstadoHabitacion.DISPONIBLE,
            ],
          },
        ];
        // Rellenamos arrays para que tengan longitud de días
        const diasDiff =
          Math.floor(
            (new Date(fechas.hasta).getTime() -
              new Date(fechas.desde).getTime()) /
              (1000 * 3600 * 24)
          ) + 1;
        const dataCompleta = mockData.map((h) => ({
          ...h,
          estadosPorDia: Array(diasDiff)
            .fill(h.estadosPorDia[0] || EstadoHabitacion.DISPONIBLE)
            .map((_, i) => h.estadosPorDia[i % h.estadosPorDia.length]),
        }));

        setHabitaciones(dataCompleta);
        setLoading(false);
      }, 500);
    } catch (error: any) {
      showError("Error al cargar estado de habitaciones");
      setLoading(false);
    }
  };

  // Cargar al inicio automáticamente
  useEffect(() => {
    handleSearch();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFechas({ ...fechas, [e.target.name]: e.target.value });
  };

  // Función para filtrar habitaciones por tipo y calcular días
  const getGridContent = (tipo: TipoHabitacion) => {
    const filtradas = habitaciones.filter((h) => h.tipo === tipo);
    const dias =
      Math.floor(
        (new Date(fechas.hasta).getTime() - new Date(fechas.desde).getTime()) /
          (1000 * 3600 * 24)
      ) + 1;

    return (
      <AvailabilityGrid
        habitaciones={filtradas}
        fechaInicio={fechas.desde}
        dias={dias > 0 ? dias : 1}
      />
    );
  };

  // Definición de las Pestañas
  const tabs = [
    {
      id: "ie",
      label: "Individual estándar",
      content: getGridContent(TipoHabitacion.IE),
    },
    {
      id: "de",
      label: "Doble estándar",
      content: getGridContent(TipoHabitacion.DE),
    },
    {
      id: "ds",
      label: "Doble superior",
      content: getGridContent(TipoHabitacion.DS),
    },
    {
      id: "sfp",
      label: "Superior Family Plan",
      content: getGridContent(TipoHabitacion.SFP),
    },
    {
      id: "sd",
      label: "Suite doble",
      content: getGridContent(TipoHabitacion.SD),
    },
  ];

  return (
    <MainContainer title="Estado de habitaciones">
      {/* Filtros Superiores */}
      <div className="flex flex-col md:flex-row gap-6 mb-8 items-end justify-between bg-white p-4 rounded-lg border border-legacy-inputBorder shadow-sm">
        <div className="flex gap-6 w-full md:w-auto">
          <DateInput
            label="Desde fecha:"
            name="desde"
            value={fechas.desde}
            onChange={handleChange}
          />
          <DateInput
            label="Hasta fecha:"
            name="hasta"
            value={fechas.hasta}
            onChange={handleChange}
          />
        </div>
        <Button onClick={handleSearch} isLoading={loading}>
          Actualizar
        </Button>
      </div>

      {/* Contenedor de Pestañas y Grilla */}
      <div className="bg-white rounded-lg shadow-sm border border-legacy-inputBorder p-4">
        <h3 className="text-sm text-gray-500 font-semibold mb-4 text-center">
          Habitaciones disponibles
        </h3>
        <Tabs tabs={tabs} />
      </div>

      {/* Botón Siguiente inferior */}
      <div className="flex justify-end mt-6">
        <Button variant="secondary">Siguiente</Button>
      </div>
    </MainContainer>
  );
}

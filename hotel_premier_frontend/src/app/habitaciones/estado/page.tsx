"use client";

import React, { useState, useEffect } from "react";
import { MainContainer } from "@/components/ui/MainContainer";
import { DateInput } from "@/components/ui/DateInput";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { AvailabilityGrid } from "@/components/features/habitaciones/AvailabilityGrid";
import { habitacionService } from "@/api/habitacionService";
import { useAlert } from "@/hooks/useAlert";
import { HabitacionDTO, TipoHabitacion } from "@/api/types";

export default function EstadoHabitacionesPage() {
  const { showError } = useAlert();

  // 1. Inicializamos con cadenas vacías
  const [fechas, setFechas] = useState({ desde: "", hasta: "" });
  const [habitaciones, setHabitaciones] = useState<HabitacionDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      // LLAMADA REAL AL BACKEND
      const data = await habitacionService.getEstado(
        fechas.desde,
        fechas.hasta
      );
      setHabitaciones(data);
    } catch (error: any) {
      showError(
        "Error al cargar estado de habitaciones. Verifique que el backend esté corriendo."
      );
    } finally {
      setLoading(false);
    }
  };
  /*
  useEffect(() => {
    handleSearch();
  }, []);
  */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFechas({ ...fechas, [e.target.name]: e.target.value });
  };

  const getGridContent = (tipo: TipoHabitacion) => {
    // Filtramos lo que vino del backend
    const filtradas = habitaciones.filter((h) => h.tipo === tipo);
    // Calculamos días para la grilla
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

  // Pestañas (Igual que antes)
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
      <div className="bg-white rounded-lg shadow-sm border border-legacy-inputBorder p-4">
        <Tabs tabs={tabs} />
      </div>
      <div className="flex justify-start mt-6">
        <Button variant="secondary" onClick={() => window.history.back()}>
          Cancelar
        </Button>
      </div>
    </MainContainer>
  );
}

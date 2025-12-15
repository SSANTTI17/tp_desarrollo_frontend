import { apiClient } from "./apiClient";
import { HabitacionDTO, OcuparDTO } from "./types";

export const habitacionService = {
  // CU05: Mostrar Estado (Grilla)
  getEstado: async (desde: string, hasta: string): Promise<HabitacionDTO[]> => {
    // desde y hasta en formato YYYY-MM-DD
    return await apiClient.get("/habitaciones/estado", { desde, hasta });
  },

  // Ocupar Habitación (Check-in)
  ocupar: async (ocupacion: OcuparDTO) => {
    return await apiClient.post("/habitaciones/ocupar", ocupacion);
  },
};

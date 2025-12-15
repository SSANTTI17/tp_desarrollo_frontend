import { apiClient } from "./apiClient";
import { HabitacionDTO, OcuparDTO } from "./types";

export const habitacionService = {
  // CU05: Mostrar Estado
  getEstado: async (desde: string, hasta: string): Promise<HabitacionDTO[]> => {
    // El back espera formato ISO YYYY-MM-DD, que es el default de los inputs type="date"
    return await apiClient.get("/habitaciones/estado", { desde, hasta });
  },

  // Ocupar (Aunque no esté en el flow principal del TP, está en el back)
  ocupar: async (ocupacion: OcuparDTO) => {
    return await apiClient.post("/habitaciones/ocupar", ocupacion);
  },
};

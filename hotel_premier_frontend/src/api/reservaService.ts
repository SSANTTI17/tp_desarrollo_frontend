import { apiClient } from "./apiClient";
import { DisponibilidadReserva } from "./types";

export const reservaService = {
  // CU04: Buscar disponibilidad para reservar
  buscarDisponibilidad: async (
    tipo: string,
    desde: string,
    hasta: string
  ): Promise<DisponibilidadReserva[]> => {
    return await apiClient.get("/reservas/buscar", { tipo, desde, hasta });
  },

  // CU04: Crear Reserva
  // Nota: El backend usa @RequestParam, por eso usamos postParams
  crear: async (
    tipo: string,
    numero: number,
    fechaInicio: string,
    fechaFin: string
  ): Promise<string> => {
    return await apiClient.postParams("/reservas/crear", {
      tipo,
      numero,
      fechaInicio,
      fechaFin,
    });
  },
};

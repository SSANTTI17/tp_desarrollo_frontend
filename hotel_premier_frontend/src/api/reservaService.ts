import { apiClient } from "./apiClient";
import { DisponibilidadReserva, ReservaListadoDTO } from "./types";

export const reservaService = {
  // CU04: Buscar disponibilidad (Grilla)
  buscarDisponibilidad: async (
    tipo: string,
    desde: string,
    hasta: string
  ): Promise<DisponibilidadReserva[]> => {
    // El back devuelve List<Map<String, Object>> con claves "fecha", "sd1", "sd2"
    return await apiClient.get("/reservas/buscar", { tipo, desde, hasta });
  },

  // CU06: Buscar Reservas por Apellido (Para Cancelar)
  buscarPorHuesped: async (
    apellido: string,
    nombre?: string
  ): Promise<any[]> => {
    // Usamos any[] porque el back devuelve Entidad Reserva completa
    return await apiClient.get("/reservas/por-huesped", { apellido, nombre });
  },

  // CU06: Cancelar Reserva
  cancelar: async (idReserva: number) => {
    return await apiClient.delete(`/reservas/cancelar/${idReserva}`, {});
  },
};

import { apiClient } from "./apiClient";
import { DisponibilidadReserva, ReservaListadoDTO } from "./types";

export const reservaService = {
  // CU04: Buscar disponibilidad
  buscarDisponibilidad: async (
    tipo: string,
    desde: string,
    hasta: string
  ): Promise<DisponibilidadReserva[]> => {
    return await apiClient.get("/reservas/buscar", { tipo, desde, hasta });
  },

  // CU06: Buscar Reservas
  buscarPorHuesped: async (
    apellido: string,
    nombre?: string
  ): Promise<ReservaListadoDTO[]> => {
    return await apiClient.get("/reservas/por-huesped", { apellido, nombre });
  },

  // CU06: Cancelar Reserva (Individual) - DEPRECADO POR EL DE ABAJO
  cancelar: async (idReserva: number) => {
    return await apiClient.delete(`/reservas/cancelar/${idReserva}`, {});
  },

  // --- NUEVO: Cancelación Múltiple ---
  // Enviamos un array de objetos { id: 1 } para que Java lo entienda como List<Reserva>
  cancelarMultiples: async (ids: number[]) => {
    const payload = ids.map((id) => ({ id })); // Convierte [1, 2] en [{id:1}, {id:2}]
    return await apiClient.post("/reservas/cancelar-reserva", payload);
  },
};

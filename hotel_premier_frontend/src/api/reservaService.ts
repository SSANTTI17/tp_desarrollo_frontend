import { apiClient } from "./apiClient";
import { DisponibilidadReserva, ReservaListadoDTO } from "./types";

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

  // --- NUEVOS MÉTODOS PARA CU06 (Cancelar) ---

  // Buscar reservas activas por apellido/nombre
  buscarPorHuesped: async (
    apellido: string,
    nombre?: string
  ): Promise<ReservaListadoDTO[]> => {
    // Endpoint sugerido: /reservas/por-huesped?apellido=...&nombre=...
    return await apiClient.get("/reservas/por-huesped", { apellido, nombre });
  },

  // Cancelar una reserva por ID
  cancelar: async (idReserva: number) => {
    // Endpoint sugerido: /reservas/cancelar/{id}
    // Usamos postParams o delete según tu backend. Asumo POST por seguridad.
    return await apiClient.postParams(`/reservas/cancelar/${idReserva}`, {});
  },
};

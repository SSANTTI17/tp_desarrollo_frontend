import { apiClient } from "./apiClient";
import { OcupanteDTO, ItemFacturaDTO } from "./types";

export const facturacionService = {
  // Paso 1: Buscar ocupantes (Endpoint Real)
  buscarOcupantes: async (
    nroHabitacion: string,
    hora: string
  ): Promise<OcupanteDTO[]> => {
    return await apiClient.get("/facturacion/ocupantes", {
      numeroHabitacion: nroHabitacion,
      horaSalida: hora,
    });
  },

  // Paso 2: Traer ítems (Endpoint Real)
  obtenerItems: async (documento: string): Promise<ItemFacturaDTO[]> => {
    // El back espera 'documentoOcupante'
    return await apiClient.get("/facturacion/pendientes", {
      documentoOcupante: documento,
    });
  },

  // Paso 3: Facturar (Endpoint Real)
  facturar: async (datos: any) => {
    return await apiClient.post("/facturacion/generar", datos);
  },
};

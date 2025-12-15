import { apiClient } from "./apiClient";
import { HuespedDTO, ContenedorAltaHuesped, TipoDoc } from "./types";

export const huespedService = {
  // CU02: Buscar Huésped (Lista)
  buscar: async (filtros: {
    nombre?: string;
    apellido?: string;
    tipoDocumento?: TipoDoc;
    documento?: string;
  }): Promise<HuespedDTO[]> => {
    return await apiClient.get("/huespedes/buscar", filtros);
  },

  // Obtener uno solo por documento (Para cargar la edición)
  obtenerPorDocumento: async (nroDocumento: string): Promise<HuespedDTO> => {
    return await apiClient.get(`/huespedes/${nroDocumento}`);
  },

  // CU09: Crear Huésped (Alta)
  crear: async (datos: ContenedorAltaHuesped) => {
    return await apiClient.post("/huespedes/crear", datos);
  },

  // CU10: Modificar Huésped
  modificar: async (huesped: HuespedDTO) => {
    return await apiClient.post("/huespedes/modificar", huesped);
  },

  // CU11: Verificar Baja (Paso previo a eliminar)
  verificarBaja: async (nroDocumento: string) => {
    // Retorna true si se puede borrar, o lanza error si tiene historial
    return await apiClient.get(`/huespedes/verificar-baja/${nroDocumento}`);
  },

  // CU11: Eliminar Huésped
  eliminar: async (nroDocumento: string) => {
    return await apiClient.delete(`/huespedes/eliminar/${nroDocumento}`, {});
  },
};

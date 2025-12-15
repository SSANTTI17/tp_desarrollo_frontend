import { apiClient } from "./apiClient";
import { HuespedDTO, ContenedorAltaHuesped, TipoDoc } from "./types";

export const huespedService = {
  // CU02: Buscar Huésped
  buscar: async (filtros: {
    nombre?: string;
    apellido?: string;
    tipoDocumento?: TipoDoc;
    documento?: string;
  }): Promise<HuespedDTO[]> => {
    return await apiClient.get("/huespedes/buscar", filtros);
  },

  // CU09: Crear Huésped (Alta)
  crear: async (datos: ContenedorAltaHuesped) => {
    // El backend espera la estructura { huesped: {...}, personaFisica: {...} }
    return await apiClient.post("/huespedes/crear", datos);
  },

  // CU11: Verificar Baja (Paso previo a eliminar)
  verificarBaja: async (huesped: HuespedDTO) => {
    return await apiClient.post("/huespedes/verificar-baja", huesped);
  },

  // CU11: Eliminar Huésped
  eliminar: async (huesped: HuespedDTO) => {
    return await apiClient.delete("/huespedes/eliminar", huesped);
  },
};

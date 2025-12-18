import { apiClient } from "./apiClient";
import { HuespedDTO, ContenedorAltaHuesped, TipoDoc } from "./types";

export const huespedService = {
  // CU02: Buscar
  buscar: async (filtros: {
    nombre?: string;
    apellido?: string;
    tipoDocumento?: string; // El back espera String en el request param
    documento?: string;
  }): Promise<HuespedDTO[]> => {
    // Mapeamos los filtros para que coincidan con los @RequestParam del back
    return await apiClient.get("/huespedes/buscar", {
      nombre: filtros.nombre,
      apellido: filtros.apellido,
      tipoDocumento: filtros.tipoDocumento, // "DNI", "PASAPORTE"
      documento: filtros.documento,
    });
  },

  // Obtener uno solo (Reutilizamos buscar ya que el back busca por filtros)
  obtenerPorDocumento: async (nroDocumento: string): Promise<HuespedDTO> => {
    const res = await apiClient.get("/huespedes/buscar", {
      documento: nroDocumento,
    });
    if (res && res.length > 0) return res[0];
    throw new Error("Huésped no encontrado");
  },

  // CU09: Alta
  crear: async (datos: ContenedorAltaHuesped) => {
    return await apiClient.post("/huespedes/crear", datos);
  },

  // CU10: Modificar
  modificar: async (huesped: HuespedDTO) => {
    // El back pide un param "modificoPK" boolean.
    // Por simplicidad enviamos false, asumiendo que no cambias el DNI en la edición por ahora.
    return await apiClient.put("/huespedes/modificar", huesped, {
      modificoPK: false,
    });
  },

  // CU11: Verificar Baja
  verificarBaja: async (nroDocumento: string, tipoDoc: string) => {
    // El back pide un HuespedDTO en el body para verificar
    const dto = { nroDocumento, tipo_documento: tipoDoc };
    return await apiClient.post("/huespedes/verificar-baja", dto);
  },

  // CU11: Eliminar
  eliminar: async (huesped: HuespedDTO) => {
    // El back pide un HuespedDTO en el body para eliminar
    const dto = huesped;
    return await apiClient.delete("/huespedes/eliminar", dto);
  },
};

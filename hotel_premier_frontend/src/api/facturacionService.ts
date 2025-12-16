import { apiClient } from "./apiClient";
import {
  HuespedDTO,
  ContenedorEstadiaYFacturaDTO,
  GenerarFacturaRequest,
  ConfirmarFacturaRequest,
} from "./types";

export const facturacionService = {
  // Paso 1: Buscar ocupantes
  // El back espera parametros: ?habitacion=TIPO+NUM (ej: IE101) & fechaSalida=yyyy-MM-dd
  buscarOcupantes: async (
    tipo: string,
    numero: string,
    fechaSalida: string
  ): Promise<HuespedDTO[]> => {
    const habitacionStr = `${tipo}${numero}`;
    return await apiClient.get("/facturacion/ocupantes", {
      habitacion: habitacionStr,
      fechaSalida: fechaSalida,
    });
  },

  // Paso 2: Generar (Pre-visualizar la factura y obtener consumos)
  generar: async (
    req: GenerarFacturaRequest
  ): Promise<ContenedorEstadiaYFacturaDTO> => {
    return await apiClient.post("/facturacion/generar", req);
  },

  // Paso 3: Confirmar (Guardar factura real)
  confirmar: async (req: ConfirmarFacturaRequest): Promise<any> => {
    return await apiClient.post("/facturacion/confirmar", req);
  },
};

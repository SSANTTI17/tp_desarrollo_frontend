import { apiClient } from "./apiClient";
import {
  HuespedDTO,
  ContenedorEstadiaYFacturaDTO,
  GenerarFacturaRequest,
  ConfirmarFacturaRequest,
  PersonaJuridicaDTO,
} from "./types";

export const facturacionService = {
  // Paso 1: Buscar ocupantes
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
  ): Promise<ContenedorEstadiaYFacturaDTO | null> => {
    // Si el back devuelve null (porque no existe el responsable), apiClient devuelve null/vacío
    return await apiClient.post("/facturacion/generar", req);
  },

  // Paso 3: Confirmar (Guardar factura real)
  confirmar: async (req: ConfirmarFacturaRequest): Promise<any> => {
    return await apiClient.post("/facturacion/confirmar", req);
  },

  // --- NUEVO: Paso Intermedio (Crear Empresa si no existe) ---
  crearResponsable: async (
    responsable: PersonaJuridicaDTO
  ): Promise<PersonaJuridicaDTO> => {
    return await apiClient.post("/facturacion/responsable", responsable);
  },
};

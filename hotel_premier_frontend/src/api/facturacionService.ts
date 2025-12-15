import { apiClient } from "./apiClient";
import { OcupanteDTO, ItemFacturaDTO } from "./types";

export const facturacionService = {
  // Paso 1: Buscar ocupantes por habitación
  buscarOcupantes: async (
    nroHabitacion: string,
    hora: string
  ): Promise<OcupanteDTO[]> => {
    // Simulamos delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            nombre: "Lionel Andrés",
            apellido: "Messi",
            documento: "10101010",
          },
          {
            id: 2,
            nombre: "Julián",
            apellido: "Álvarez",
            documento: "20202020",
          },
        ]);
      }, 500);
    });
  },

  // Paso 2: Traer ítems pendientes
  obtenerItems: async (idOcupante: number): Promise<ItemFacturaDTO[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 101, fecha: "11/04/2025", consumo: "Estadía", monto: 80000 },
          { id: 102, fecha: "10/04/2025", consumo: "Bar", monto: 30400 },
          { id: 103, fecha: "10/04/2025", consumo: "Desayuno", monto: 50800 },
          {
            id: 104,
            fecha: "09/04/2025",
            consumo: "Servicio limpieza",
            monto: 5000,
          },
        ]);
      }, 500);
    });
  },

  // Paso 3: Confirmar
  facturar: async (datos: any) => {
    // Aquí iría el POST real
    return true;
  },
};

import { apiClient } from "./apiClient";

export interface ConserjeDTO {
  usuario: string;
  contrasenia: string;
}

export const conserjeService = {
  // Crear nuevo conserje (POST /conserjes)
  crear: async (conserje: ConserjeDTO) => {
    return await apiClient.post("/conserjes", conserje);
  },
};

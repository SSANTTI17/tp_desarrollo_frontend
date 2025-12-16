import { apiClient } from "./apiClient";

export interface LoginResponse {
  token: string;
  usuario: {
    id: number;
    nombre: string;
    rol: string;
  };
}

export const authService = {
  // 1. Verificar si existen datos en la tabla CONSERJES
  verificarExistenciaConserjes: async (): Promise<boolean> => {
    try {
      // Hacemos un GET a /conserjes (o el endpoint que liste usuarios)
      // Si devuelve un array con elementos, retornamos true.
      const conserjes = await apiClient.get("/conserjes");
      return Array.isArray(conserjes) && conserjes.length > 0;
    } catch (error) {
      // Si el endpoint da 404 o error, asumimos que no hay datos o no se pueden leer
      // para habilitar el modo admin de rescate/inicio si fuera necesario.
      // Ojo: Dependerá de tu backend retornar lista vacía [] en lugar de error si no hay nadie.
      console.warn("No se pudo verificar conserjes:", error);
      return false;
    }
  },

  // 2. Login REAL contra la Base de Datos
  login: async (usuario: string, clave: string): Promise<LoginResponse> => {
    return await apiClient.post("/auth/login", { usuario, clave });
  },

  // 3. Login SIMULADO (Solo para el primer acceso 'admin/admin')
  loginMockAdmin: async (): Promise<LoginResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          token: "admin-setup-token-" + Date.now(),
          usuario: { id: 0, nombre: "Admin Inicial", rol: "ADMIN" },
        });
      }, 500);
    });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
  },
};

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
  login: async (usuario: string, clave: string): Promise<LoginResponse> => {
    // SIMULACIÓN: En un futuro aquí harás: return apiClient.post("/login", { usuario, clave });

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulamos que el usuario "admin" con clave "admin" entra
        if (usuario === "admin" && clave === "admin") {
          resolve({
            token: "fake-jwt-token-123456",
            usuario: {
              id: 1,
              nombre: "Administrador",
              rol: "ADMIN",
            },
          });
        } else {
          reject(new Error("Credenciales inválidas. Intente nuevamente."));
        }
      }, 1000);
    });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
  },
};

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
    // AHORA: Llamada real al backend
    // Nota: Asegurate de que tu backend tenga un controlador que escuche POST /api/auth/login
    // Si no tienes endpoint de login en Java, esto dará 404.

    // return await apiClient.post("/auth/login", { usuario, clave });

    // --- MANTENEMOS EL MOCK SOLO SI NO TIENES LOGIN EN EL BACKEND ---
    // (Como en los archivos de backend que subiste NO VI un Controlador de Autenticación,
    // te dejo esta versión simulada "mejorada" para que no se te rompa el acceso).

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (usuario === "admin" && clave === "admin") {
          resolve({
            token: "fake-jwt-token-123456",
            usuario: { id: 1, nombre: "Administrador", rol: "ADMIN" },
          });
        } else {
          reject(new Error("Credenciales inválidas. Intente nuevamente."));
        }
      }, 500);
    });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
  },
};

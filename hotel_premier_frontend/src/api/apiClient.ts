// Asegúrate de que apunte a tu backend Spring Boot
const API_BASE_URL = "http://localhost:8080/api";

export const apiClient = {
  get: async (endpoint: string, params?: Record<string, any>) => {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    if (params) {
      Object.keys(params).forEach((key) => {
        if (
          params[key] !== undefined &&
          params[key] !== null &&
          params[key] !== ""
        ) {
          url.searchParams.append(key, String(params[key]));
        }
      });
    }
    const response = await fetch(url.toString());
    if (!response.ok)
      throw new Error(`Error en GET ${endpoint}: ${response.statusText}`);
    return response.json();
  },

  post: async (endpoint: string, body: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    // Manejo especial porque el back a veces devuelve texto plano y a veces JSON
    const text = await response.text();
    if (!response.ok) {
      // Intentar parsear si el error viene como JSON
      try {
        const jsonError = JSON.parse(text);
        throw new Error(jsonError.error || jsonError.message || text);
      } catch (e) {
        throw new Error(text || `Error en POST ${endpoint}`);
      }
    }
    try {
      return JSON.parse(text);
    } catch (e) {
      return { message: text }; // Si devuelve texto plano (ej: "Exito"), lo envolvemos
    }
  },

  put: async (endpoint: string, body: any, params?: Record<string, any>) => {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    if (params) {
      Object.keys(params).forEach((key) =>
        url.searchParams.append(key, String(params[key]))
      );
    }
    const response = await fetch(url.toString(), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || data.message || "Error al modificar");
    }
    return response.json();
  },

  delete: async (endpoint: string, body: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`Error en DELETE ${endpoint}`);
    return response.json();
  },

  // Mantenemos postParams para las reservas si lo usas
  postParams: async (endpoint: string, params: Record<string, any>) => {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    Object.keys(params).forEach((key) =>
      url.searchParams.append(key, String(params[key]))
    );
    const response = await fetch(url.toString(), { method: "POST" });
    const text = await response.text();
    if (!response.ok) throw new Error(text);
    return text;
  },
};

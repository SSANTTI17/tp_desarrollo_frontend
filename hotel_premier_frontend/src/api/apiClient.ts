const API_BASE_URL = "http://localhost:8080/api"; // Ajustar puerto si es necesario

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
          url.searchParams.append(key, params[key]);
        }
      });
    }
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`Error en GET ${endpoint}`);
    return response.json();
  },

  post: async (endpoint: string, body: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || errorData.error || `Error en POST ${endpoint}`
      );
    }
    return response.json();
  },

  // Nota: El backend usa @RequestParam para crear reserva, simulamos form-data o query params en POST
  postParams: async (endpoint: string, params: Record<string, any>) => {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    Object.keys(params).forEach((key) =>
      url.searchParams.append(key, params[key])
    );

    const response = await fetch(url.toString(), { method: "POST" });
    // El controlador de reservas devuelve un String simple, no JSON, hay que manejarlo
    const text = await response.text();
    if (!response.ok) throw new Error(text);
    return text;
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
};

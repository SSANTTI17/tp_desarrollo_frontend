"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MainContainer } from "@/components/ui/MainContainer";
import { authService } from "@/api/authService"; // Asegúrate de importar esto si usas logout
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Verificación de Seguridad (Muy básica por ahora)
    const storedUser = localStorage.getItem("usuario");

    if (!storedUser) {
      // Si no hay usuario, ¡patearlo al login!
      router.push("/login");
    } else {
      setUser(JSON.parse(storedUser));
      setLoading(false);
    }
  }, [router]);

  // Evitar parpadeos mientras verificamos
  if (loading) return null;

  return (
    <MainContainer title={`Bienvenido, ${user?.nombre || "Usuario"}`}>
      {/* Tablero de Accesos Rápidos (Dashboard) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Tarjeta: Gestionar Huéspedes */}
        <div
          onClick={() => router.push("/huespedes/buscar")}
          className="bg-white p-6 rounded-xl border border-legacy-inputBorder shadow-sm hover:shadow-md hover:border-legacy-primary cursor-pointer transition-all group"
        >
          <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            👥
          </div>
          <h3 className="font-bold text-lg text-legacy-text mb-2">
            Gestionar Huéspedes
          </h3>
          <p className="text-sm text-gray-500">
            Buscar, dar de alta y editar datos de pasajeros.
          </p>
        </div>

        {/* Tarjeta: Reservas */}
        <div
          onClick={() => router.push("/reservas/crear")}
          className="bg-white p-6 rounded-xl border border-legacy-inputBorder shadow-sm hover:shadow-md hover:border-legacy-primary cursor-pointer transition-all group"
        >
          <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            📅
          </div>
          <h3 className="font-bold text-lg text-legacy-text mb-2">
            Nueva Reserva
          </h3>
          <p className="text-sm text-gray-500">
            Consultar disponibilidad y crear reservas futuras.
          </p>
        </div>

        {/* Tarjeta: Estado Hotel */}
        <div
          onClick={() => router.push("/habitaciones/estado")}
          className="bg-white p-6 rounded-xl border border-legacy-inputBorder shadow-sm hover:shadow-md hover:border-legacy-primary cursor-pointer transition-all group"
        >
          <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            hotel
          </div>
          <h3 className="font-bold text-lg text-legacy-text mb-2">
            Estado de Habitaciones
          </h3>
          <p className="text-sm text-gray-500">
            Ver grilla de ocupación y mantenimiento.
          </p>
        </div>

        {/* Tarjeta: Facturación (Futuro) */}
        <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-300 opacity-60 cursor-not-allowed">
          <div className="h-12 w-12 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center mb-4">
            💰
          </div>
          <h3 className="font-bold text-lg text-gray-400 mb-2">Facturación</h3>
          <p className="text-sm text-gray-400">Próximamente...</p>
        </div>
      </div>

      {/* Botón de Salir rápido */}
      <div className="mt-12 flex justify-end">
        <Button
          variant="secondary"
          onClick={() => {
            authService.logout();
            router.push("/login");
          }}
        >
          Cerrar Sesión
        </Button>
      </div>
    </MainContainer>
  );
}

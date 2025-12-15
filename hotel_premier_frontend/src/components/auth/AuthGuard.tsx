"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // 1. Verificamos si hay usuario
    const token = localStorage.getItem("token");

    // Rutas públicas que no requieren login
    const publicRoutes = ["/login"];

    // ¿Estamos en una ruta pública?
    const isPublicRoute = publicRoutes.includes(pathname);

    if (!token && !isPublicRoute) {
      // CASO A: No hay token y quieres entrar a una ruta privada -> AL LOGIN
      setAuthorized(false);
      router.push("/login");
    } else if (token && isPublicRoute) {
      // CASO B: Ya tienes token pero quieres ir al login -> AL HOME (Dashboard)
      setAuthorized(true);
      router.push("/");
    } else {
      // CASO C: Todo correcto (tienes token y vas a privada, o no tienes y vas a pública)
      setAuthorized(true);
    }
  }, [router, pathname]);

  // Mientras verifica, mostramos nada (o podrías poner un spinner de carga)
  if (!authorized) {
    return null;
  }

  // Si pasó el control, mostramos la página
  return <>{children}</>;
}

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAlert } from "@/hooks/useAlert";
import { authService } from "@/api/authService";

const loginSchema = z.object({
  usuario: z.string().min(1, "El usuario es requerido"),
  clave: z.string().min(1, "La contraseña es requerida"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { showError, showSuccess } = useAlert();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usuario: "",
      clave: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      // 1. Verificar si la BD está vacía
      const hayConserjes = await authService.verificarExistenciaConserjes();
      let response;
      let esModoInicial = false;

      if (!hayConserjes) {
        // --- MODO INICIAL (BD VACÍA) ---
        if (data.usuario === "admin" && data.clave === "admin") {
          response = await authService.loginMockAdmin();
          esModoInicial = true;
        } else {
          throw new Error(
            "El sistema está vacío. Ingrese con 'admin' / 'admin'."
          );
        }
      } else {
        // --- MODO NORMAL ---
        response = await authService.login(data.usuario, data.clave);
      }

      // Guardamos sesión
      localStorage.setItem("token", response.token);
      localStorage.setItem("usuario", JSON.stringify(response.usuario));

      // REDIRECCIÓN INTELIGENTE
      if (esModoInicial) {
        await showSuccess(
          "Bienvenido",
          "Modo de configuración inicial. Debe crear un usuario."
        );
        // Si es la primera vez, LO OBLIGAMOS a ir a crear un conserje
        router.push("/conserjes/nuevo");
      } else {
        await showSuccess(
          "¡Bienvenido!",
          `Hola de nuevo, ${response.usuario.nombre}`
        );
        router.push("/"); // Al dashboard normal
      }
    } catch (error: any) {
      console.error(error);
      const msg = error.message || "Credenciales inválidas o error de conexión";
      showError(msg);
      reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-legacy-inputBorder w-full max-w-md animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-legacy-primary mb-2">
            Hotel Premier
          </h1>
          <p className="text-gray-500 text-sm">
            Ingrese sus credenciales para acceder
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Usuario"
            {...register("usuario")}
            error={errors.usuario?.message}
            placeholder="Ingrese su usuario"
          />
          <div className="relative">
            <Input
              label="Contraseña"
              type="password"
              {...register("clave")}
              error={errors.clave?.message}
              placeholder="••••••"
            />
          </div>
          <Button
            type="submit"
            className="w-full py-3 text-lg font-semibold"
            isLoading={loading}
          >
            Ingresar
          </Button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-400">
          &copy; 2025 Sistema de Gestión Hotelera
        </div>
      </div>
    </div>
  );
}

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

// Esquema de validación simple
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
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const response = await authService.login(data.usuario, data.clave);

      // Guardamos la sesión (simple localStorage por ahora)
      localStorage.setItem("token", response.token);
      localStorage.setItem("usuario", JSON.stringify(response.usuario));

      // Feedback visual rápido
      await showSuccess(
        "¡Bienvenido!",
        `Hola de nuevo, ${response.usuario.nombre}`
      );

      // Redirigir al home (o a donde prefieras)
      router.push("/");
    } catch (error: any) {
      showError(error.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-legacy-inputBorder w-full max-w-md animate-in fade-in zoom-in duration-300">
        {/* Encabezado / Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-legacy-primary mb-2">
            Hotel Premier
          </h1>
          <p className="text-gray-500 text-sm">
            Ingrese sus credenciales para acceder
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Usuario"
            {...register("usuario")}
            error={errors.usuario?.message}
            placeholder="Ej: admin"
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

        {/* Footer simple */}
        <div className="mt-8 text-center text-xs text-gray-400">
          &copy; 2025 Sistema de Gestión Hotelera
        </div>
      </div>
    </div>
  );
}

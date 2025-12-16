"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MainContainer } from "@/components/ui/MainContainer";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAlert } from "@/hooks/useAlert";
import { conserjeService } from "@/api/conserjeService";
import { authService } from "@/api/authService";

// Validación simplificada
const conserjeSchema = z.object({
  usuario: z.string().min(4, "El usuario debe tener al menos 4 caracteres"),
  contrasenia: z
    .string()
    .min(4, "La contraseña debe tener al menos 4 caracteres"),
});

type ConserjeForm = z.infer<typeof conserjeSchema>;

export default function NuevoConserjePage() {
  const router = useRouter();
  const { showSuccess, showError } = useAlert();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConserjeForm>({
    resolver: zodResolver(conserjeSchema),
  });

  const onSubmit = async (data: ConserjeForm) => {
    setLoading(true);
    try {
      // 1. Creamos el conserje en la BD
      await conserjeService.crear(data);

      await showSuccess(
        "¡Usuario Creado!",
        "El conserje ha sido registrado correctamente. Por favor, inicie sesión."
      );

      // 2. Cerramos la sesión temporal de 'admin'
      authService.logout();

      // 3. Volvemos al login
      router.push("/login");
    } catch (error: any) {
      console.error(error);
      showError(error.message || "Error al crear el conserje.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainContainer title="Configuración Inicial: Crear Conserje">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg border border-legacy-inputBorder shadow-sm">
        <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-md text-sm border border-blue-100">
          ℹ️ Primer inicio del sistema. Defina el usuario y contraseña del
          encargado. El acceso "admin" se inhabilitará luego.
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Usuario (Login)"
            placeholder="Ej: recepcion"
            {...register("usuario")}
            error={errors.usuario?.message}
          />
          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••"
            {...register("contrasenia")}
            error={errors.contrasenia?.message}
          />

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <Button type="submit" isLoading={loading} className="w-full">
              Crear y Finalizar
            </Button>
          </div>
        </form>
      </div>
    </MainContainer>
  );
}

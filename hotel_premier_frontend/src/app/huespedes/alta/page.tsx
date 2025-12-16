"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MainContainer } from "@/components/ui/MainContainer";
import { HuespedForm } from "@/components/features/huespedes/HuespedForm";
import { HuespedFormData } from "@/components/features/huespedes/huespedSchema";
import { huespedService } from "@/api/huespedService";
import { useAlert } from "@/hooks/useAlert";
import {
  ContenedorAltaHuesped,
  HuespedDTO,
  PersonaFisicaDTO,
} from "@/api/types";

export default function AltaHuespedPage() {
  const router = useRouter();
  const { showAlert, showSuccess, showError } = useAlert();
  const [loading, setLoading] = useState(false);

  // Función auxiliar para resetear el formulario (recarga la página por ahora)
  const resetForm = () => {
    window.location.reload();
  };

  const handleCreate = async (data: HuespedFormData) => {
    setLoading(true);
    try {
      // 1. Armamos el objeto Huesped (Datos Personales)
      const nuevoHuesped: HuespedDTO = {
        nombre: data.nombre,
        apellido: data.apellido,
        tipo_documento: data.tipo_documento,
        nroDocumento: data.nroDocumento,
        fechaDeNacimiento: data.fechaDeNacimiento,
        email: data.email || undefined,
        telefono: data.telefono,
        ocupacion: data.ocupacion,
        nacionalidad: data.nacionalidad,
        direccion: data.direccion,
        alojado: false,
      };

      // 2. Armamos la Persona Física (Datos Fiscales) SOLO si se cargaron
      let datosFiscales: PersonaFisicaDTO | null = null;

      if (data.cuit || data.posicionIVA) {
        datosFiscales = {
          cuit: data.cuit || "",
          posicionIVA: data.posicionIVA || "",
          // refHuesped no se envía aquí, el backend hace la vinculación
        } as PersonaFisicaDTO;
      }

      // 3. Empaquetamos todo en el Contenedor para enviar
      const payload: ContenedorAltaHuesped = {
        huesped: nuevoHuesped,
        personaFisica: datosFiscales,
      };

      // 4. Llamada al servicio
      await huespedService.crear(payload);

      // 5. Éxito: Preguntar si carga otro
      setLoading(false);
      const result = await showAlert({
        title: `El huésped (${data.nombre} ${data.apellido}) ha sido satisfactoriamente cargado.`,
        text: "¿Desea cargar otro?",
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "SI",
        cancelButtonText: "NO",
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        window.location.reload(); // Limpiamos el formulario recargando
      } else {
        router.push("/huespedes/buscar"); // Volvemos al inicio
      }
    } catch (error: any) {
      setLoading(false);

      // Manejo de Error de Duplicado (Wireframe 9d)
      if (
        error.message?.toLowerCase().includes("existe") ||
        error.response?.status === 409
      ) {
        const result = await showAlert({
          title: "¡CUIDADO!",
          html: `El tipo y número de<br>documento ya existen en el sistema`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Aceptar igualmente",
          cancelButtonText: "Corregir",
          reverseButtons: true,
        });

        if (result.isConfirmed) {
          console.log("El usuario decidió aceptar duplicado");
          // Aquí podrías llamar a una API que permita forzar la creación si existiera
        }
      } else {
        showError(error.message || "Error al crear el huésped");
      }
    }
  };

  return (
    <MainContainer title="Alta de Huésped">
      <HuespedForm
        onSubmit={handleCreate}
        onCancel={() => router.push("/")}
        isLoading={loading}
      />
    </MainContainer>
  );
}

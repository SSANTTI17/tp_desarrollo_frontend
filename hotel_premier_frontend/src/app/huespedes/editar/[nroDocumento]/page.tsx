"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { MainContainer } from "@/components/ui/MainContainer";
import { HuespedForm } from "@/components/features/huespedes/HuespedForm";
import { HuespedFormData } from "@/components/features/huespedes/huespedSchema";
import { huespedService } from "@/api/huespedService";
import { useAlert } from "@/hooks/useAlert";
import { HuespedDTO, TipoDocumento } from "@/api/types";

export default function EditarHuespedPage() {
  const router = useRouter();
  const params = useParams();
  const { showAlert, showSuccess, showError } = useAlert();

  const nroDocumento = params.nroDocumento as string;
  const [huesped, setHuesped] = useState<HuespedDTO | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  // 1. Cargar datos del huésped al iniciar
  useEffect(() => {
    const loadData = async () => {
      // SIMULACIÓN: En realidad llamarías a huespedService.obtenerPorDocumento(nroDocumento)
      // Aquí hardcodeamos para que veas la demo
      setTimeout(() => {
        setHuesped({
          id: 1,
          nombre: "Lionel Andrés",
          apellido: "Messi",
          tipoDocumento: TipoDocumento.DNI,
          documento: nroDocumento, // Usamos el de la URL
          fechaNacimiento: "1987-06-24",
          email: "lio@messi.com",
          telefono: "12345678",
          calle: "Av. Siempre Viva 123",
          ocupacion: "Futbolista",
          nacionalidad: "Argentina",
        });
      }, 500);
    };
    loadData();
  }, [nroDocumento]);

  // CU10: Modificar
  const handleUpdate = async (data: HuespedFormData) => {
    setLoading(true);
    try {
      // Mapear form data a DTO
      const huespedActualizado: HuespedDTO = {
        ...huesped!, // Mantenemos ID original
        nombre: data.nombre,
        apellido: data.apellido,
        tipoDocumento: data.tipo_documento,
        documento: data.nroDocumento,
        telefono: data.telefono,
        email: data.email || "",
        calle: data.direccion,
        // ... resto de campos
      };

      await huespedService.modificar(huespedActualizado);

      setLoading(false);
      await showSuccess("Éxito", "La operación ha culminado con éxito");
      router.push("/huespedes/buscar");
    } catch (error: any) {
      setLoading(false);
      // Validaciones del PDF (2.B.1)
      if (error.message.includes("existe")) {
        await showAlert({
          title: "¡CUIDADO!",
          text: "El tipo y número de documento ya existen en el sistema",
          icon: "warning",
          confirmButtonText: "ACEPTAR IGUALMENTE",
          showCancelButton: true,
          cancelButtonText: "CORREGIR",
        });
        // Lógica de aceptar igualmente...
      } else {
        showError("Error al modificar el huésped");
      }
    }
  };

  // CU11: Dar Baja (Botón BORRAR)
  const handleDelete = async () => {
    try {
      // 1. Verificar historial (Mock)
      // await huespedService.verificarBaja(nroDocumento);

      // Simulación: Si se llama Messi no se puede borrar (Caso 2.A del PDF)
      if (huesped?.apellido === "Messi") {
        await showAlert({
          title: "No se puede eliminar",
          text: "El huésped no puede ser eliminado pues se ha alojado en el Hotel en alguna oportunidad.",
          icon: "error",
          confirmButtonText: "CONTINUAR",
        });
        return;
      }

      // Caso Exitoso (Paso 2 del PDF - Nunca se alojó)
      const result = await showAlert({
        title: "Confirmar eliminación",
        html: `Los datos del huésped <b>${huesped?.apellido}, ${huesped?.nombre}</b> serán eliminados del sistema.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "ELIMINAR",
        cancelButtonText: "CANCELAR",
        confirmButtonColor: "#ef4444",
      });

      if (result.isConfirmed) {
        await huespedService.eliminar(nroDocumento);
        await showSuccess(
          "Eliminado",
          "Los datos han sido eliminados del sistema."
        );
        router.push("/huespedes/buscar");
      }
    } catch (error) {
      showError("Error al intentar eliminar");
    }
  };

  if (!huesped)
    return (
      <div className="p-10 text-center">Cargando datos del huésped...</div>
    );

  return (
    <MainContainer title="Modificar Huésped">
      <HuespedForm
        initialData={huesped}
        onSubmit={handleUpdate}
        onCancel={() => router.push("/huespedes/buscar")}
        onDelete={handleDelete} // Pasamos la función para que aparezca el botón rojo
        isLoading={loading}
      />
    </MainContainer>
  );
}

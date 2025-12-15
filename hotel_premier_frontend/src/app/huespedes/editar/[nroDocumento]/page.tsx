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
    if (!huesped) return;

    try {
      // 1. Llamamos al backend para verificar si se puede eliminar
      // El controlador verifica si el huésped "isAlojado()"
      const verificacion = await huespedService.verificarBaja(
        huesped.documento,
        huesped.tipoDocumento.toString()
      );

      // 2. CASO A: No se puede eliminar (Ya tuvo estadías)
      if (!verificacion.puedeEliminar) {
        await showAlert({
          title: "No se puede eliminar",
          text: verificacion.mensaje, // Mensaje exacto del backend (wireframe 11b)
          icon: "error",
          confirmButtonText: "CONTINUAR",
        });
        return;
      }

      // 3. CASO B: Se puede eliminar (Nunca se alojó)
      // Mostramos la alerta de confirmación con el mensaje del backend (wireframe 11a)
      const result = await showAlert({
        title: "Confirmar eliminación",
        text: verificacion.mensaje,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "ELIMINAR",
        cancelButtonText: "CANCELAR",
        confirmButtonColor: "#ef4444",
        reverseButtons: true,
      });

      // 4. Ejecución de la baja
      if (result.isConfirmed) {
        const respuesta = await huespedService.eliminar(
          huesped.documento,
          huesped.tipoDocumento.toString()
        );

        // 5. Mensaje de éxito final (wireframe 11c)
        await showSuccess("Eliminado", respuesta.mensaje);
        router.push("/huespedes/buscar");
      }
    } catch (error: any) {
      showError(error.message || "Error al intentar eliminar el huésped");
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

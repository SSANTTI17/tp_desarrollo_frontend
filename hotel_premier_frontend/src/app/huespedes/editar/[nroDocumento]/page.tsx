"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { MainContainer } from "@/components/ui/MainContainer";
import { HuespedForm } from "@/components/features/huespedes/HuespedForm";
import { HuespedFormData } from "@/components/features/huespedes/huespedSchema";
import { huespedService } from "@/api/huespedService";
import { useAlert } from "@/hooks/useAlert";
import { HuespedDTO } from "@/api/types";

export default function EditarHuespedPage() {
  const router = useRouter();
  const params = useParams();
  const { showAlert, showSuccess, showError } = useAlert();

  const nroDocumento = params.nroDocumento as string;
  const [huesped, setHuesped] = useState<HuespedDTO | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  // 1. Cargar datos del huésped
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await huespedService.obtenerPorDocumento(nroDocumento);
        setHuesped(data);
      } catch (error) {
        console.error(error);
        showError("No se pudo cargar el huésped o no existe.");
        router.push("/huespedes/buscar");
      }
    };
    if (nroDocumento) loadData();
  }, [nroDocumento]);

  // CU10: Modificar
  const handleUpdate = async (data: HuespedFormData) => {
    setLoading(true);
    try {
      // Mapear form data a DTO con NOMBRES DE PROPIEDAD CORRECTOS (Java Backend)
      const huespedActualizado: HuespedDTO = {
        ...huesped!,
        nombre: data.nombre,
        apellido: data.apellido,
        tipo_documento: data.tipo_documento, // Antes tipoDocumento
        nroDocumento: data.nroDocumento, // Antes documento
        telefono: data.telefono,
        email: data.email || "",
        direccion: data.direccion, // Antes calle
        fechaDeNacimiento: data.fechaDeNacimiento,

        ocupacion: data.ocupacion,
        nacionalidad: data.nacionalidad,
        cuit: data.cuit,
        posicionIVA: data.posicionIVA,
      };

      await huespedService.modificar(huespedActualizado);

      setLoading(false);
      await showSuccess("Éxito", "La operación ha culminado con éxito");
      router.push("/huespedes/buscar");
    } catch (error: any) {
      setLoading(false);
      if (error.message && error.message.toLowerCase().includes("existe")) {
        await showAlert({
          title: "¡CUIDADO!",
          text: "El tipo y número de documento ya existen en el sistema",
          icon: "warning",
          confirmButtonText: "ACEPTAR IGUALMENTE",
          showCancelButton: true,
          cancelButtonText: "CORREGIR",
        });
      } else {
        showError(error.message || "Error al modificar el huésped");
      }
    }
  };

  // CU11: Dar Baja
  const handleDelete = async () => {
    if (!huesped) return;

    try {
      const verificacion = await huespedService.verificarBaja(
        huesped.nroDocumento, // CORREGIDO
        huesped.tipo_documento.toString() // CORREGIDO
      );

      if (!verificacion.puedeEliminar) {
        await showAlert({
          title: "No se puede eliminar",
          text: verificacion.mensaje,
          icon: "error",
          confirmButtonText: "CONTINUAR",
        });
        return;
      }

      const result = await showAlert({
        title: "Confirmar eliminación",
        html: `Los datos del huésped <b>${huesped.apellido}, ${huesped.nombre}</b> serán eliminados del sistema.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "ELIMINAR",
        cancelButtonText: "CANCELAR",
        confirmButtonColor: "#ef4444",
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        const respuesta = await huespedService.eliminar(huesped);

        await showSuccess(
          "Eliminado",
          respuesta.mensaje || "Los datos han sido eliminados."
        );
        router.push("/huespedes/buscar");
      }
    } catch (error: any) {
      showError(error.message || "Error al intentar eliminar el huésped");
    }
  };

  if (!huesped)
    return (
      <div className="p-10 text-center text-gray-500">
        Cargando datos del huésped...
      </div>
    );

  return (
    <MainContainer title="Modificar Huésped">
      <HuespedForm
        initialData={huesped}
        onSubmit={handleUpdate}
        onCancel={() => router.push("/")}
        onDelete={handleDelete}
        isLoading={loading}
      />
    </MainContainer>
  );
}

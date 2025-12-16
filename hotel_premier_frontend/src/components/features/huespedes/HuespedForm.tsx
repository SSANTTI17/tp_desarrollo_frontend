import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { huespedSchema, HuespedFormData } from "./huespedSchema";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { DateInput } from "@/components/ui/DateInput";
import { TipoDoc, HuespedDTO } from "@/api/types";
import { useAlert } from "@/hooks/useAlert";

interface HuespedFormProps {
  initialData?: HuespedDTO; // Datos para editar
  onSubmit: (data: HuespedFormData) => void;
  onCancel: () => void;
  onDelete?: () => void; // Solo se pasa si queremos mostrar el botón BORRAR
  isLoading?: boolean;
}

export const HuespedForm = ({
  initialData,
  onSubmit,
  onCancel,
  onDelete,
  isLoading,
}: HuespedFormProps) => {
  const { showAlert } = useAlert();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HuespedFormData>({
    resolver: zodResolver(huespedSchema),
    defaultValues: {
      tipo_documento: TipoDoc.DNI,
    },
  });

  // Cargar datos iniciales si es edición
  useEffect(() => {
    if (initialData) {
      reset({
        nombre: initialData.nombre,
        apellido: initialData.apellido,
        // CORREGIDO: Mapeo de propiedades nuevas
        tipo_documento: initialData.tipo_documento as TipoDoc,
        nroDocumento: initialData.nroDocumento,
        fechaDeNacimiento: initialData.fechaDeNacimiento || "",
        email: initialData.email || "",
        telefono: initialData.telefono,
        direccion: initialData.direccion || "",

        ocupacion: initialData.ocupacion || "",
        nacionalidad: initialData.nacionalidad || "",
        posicionIVA: initialData.posicionIVA || "CF",
        cuit: initialData.cuit || "",
      });
    }
  }, [initialData, reset]);

  const handleCancelClick = async () => {
    const action = initialData ? "modificación" : "alta";
    const result = await showAlert({
      title: `¿Desea cancelar la ${action} del huésped?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "SI",
      cancelButtonText: "NO",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      onCancel();
    }
  };

  const handleDeleteClick = async () => {
    if (onDelete) onDelete();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="animate-in fade-in slide-in-from-bottom-2"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mb-8 p-1">
        {/* Columna Izquierda */}
        <div className="space-y-6">
          <Input
            label="Nombres:"
            {...register("nombre")}
            error={errors.nombre?.message}
          />
          <Select
            label="Tipo de documento:"
            options={[
              { label: "DNI", value: TipoDoc.DNI },
              { label: "Pasaporte", value: TipoDoc.PASAPORTE },
              { label: "Libreta Cívica", value: "LC" },
              { label: "Libreta Enrolamiento", value: "LE" },
            ]}
            {...register("tipo_documento")}
            error={errors.tipo_documento?.message}
          />
          <Select
            label="Posición frente al IVA:"
            options={[
              { label: "Consumidor Final", value: "CF" },
              { label: "Responsable Inscripto", value: "RI" },
              { label: "Monotributista", value: "MT" },
            ]}
            {...register("posicionIVA")}
            error={errors.posicionIVA?.message}
          />
          <DateInput
            label="Fecha de nacimiento:"
            {...register("fechaDeNacimiento")}
            error={errors.fechaDeNacimiento?.message}
          />
          <Select
            label="Ocupación:"
            options={[
              { label: "Empleado", value: "empleado" },
              { label: "Independiente", value: "independiente" },
              { label: "Jubilado", value: "jubilado" },
            ]}
            {...register("ocupacion")}
            error={errors.ocupacion?.message}
          />
          <Select
            label="Nacionalidad:"
            options={[
              { label: "Argentina", value: "argentina" },
              { label: "Brasil", value: "brasil" },
            ]}
            {...register("nacionalidad")}
            error={errors.nacionalidad?.message}
          />
        </div>

        {/* Columna Derecha */}
        <div className="space-y-6">
          <Input
            label="Apellido:"
            {...register("apellido")}
            error={errors.apellido?.message}
          />
          <Input
            label="Nro. de documento:"
            {...register("nroDocumento")}
            error={errors.nroDocumento?.message}
          />
          <Input
            label="CUIT:"
            {...register("cuit")}
            error={errors.cuit?.message}
            placeholder="Opcional"
          />
          <Input
            label="Dirección:"
            {...register("direccion")}
            error={errors.direccion?.message}
          />
          <Input
            label="Email:"
            {...register("email")}
            error={errors.email?.message}
          />
          <Input
            label="Teléfono:"
            {...register("telefono")}
            error={errors.telefono?.message}
          />
        </div>
      </div>

      {/* Botonera */}
      <div className="flex justify-between items-center mt-10 border-t pt-6 border-gray-100">
        <div className="w-32">
          {onDelete && (
            <Button
              type="button"
              className="bg-red-500 hover:bg-red-600 text-white w-full"
              onClick={handleDeleteClick}
            >
              Borrar
            </Button>
          )}
        </div>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancelClick}
            className="w-32"
          >
            Cancelar
          </Button>

          <Button type="submit" isLoading={isLoading} className="w-32">
            Siguiente
          </Button>
        </div>
      </div>
    </form>
  );
};

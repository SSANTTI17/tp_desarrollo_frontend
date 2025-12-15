import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { huespedSchema, HuespedFormData } from "./huespedSchema";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { DateInput } from "@/components/ui/DateInput";
import { TipoDoc } from "@/api/types";
import { useAlert } from "@/hooks/useAlert";

interface HuespedFormProps {
  onSubmit: (data: HuespedFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const HuespedForm = ({
  onSubmit,
  onCancel,
  isLoading,
}: HuespedFormProps) => {
  const { showAlert } = useAlert();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HuespedFormData>({
    resolver: zodResolver(huespedSchema),
    defaultValues: {
      tipo_documento: TipoDoc.DNI,
    },
  });

  // Manejo del botón Cancelar con alerta (Wireframe 9e)
  const handleCancelClick = async () => {
    const result = await showAlert({
      title: "¿Desea cancelar el alta del huésped?", // Texto exacto foto 9e
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "SI",
      cancelButtonText: "NO",
      reverseButtons: true, // Para que SI quede a la derecha
    });

    if (result.isConfirmed) {
      onCancel();
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="animate-in fade-in slide-in-from-bottom-2"
    >
      {/* Contenedor Principal con Grid de 2 Columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mb-8 p-1">
        {/* Columna Izquierda */}
        <div className="space-y-6">
          <Input
            label="Nombres:"
            {...register("nombre")}
            error={errors.nombre?.message}
            placeholder="Ingrese sus nombres"
          />

          <Select
            label="Tipo de documento:"
            options={[
              { label: "DNI", value: TipoDoc.DNI },
              { label: "Pasaporte", value: TipoDoc.PASAPORTE },
              { label: "Lib. Cívica", value: TipoDoc.LC },
              { label: "Otro", value: TipoDoc.OTRO },
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
              { label: "Estudiante", value: "estudiante" },
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
              { label: "Uruguay", value: "uruguay" },
              { label: "Otro", value: "otro" },
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
            placeholder="Ingrese su apellido"
          />

          <Input
            label="Nro. de documento:"
            {...register("nroDocumento")}
            error={errors.nroDocumento?.message}
            placeholder="Ingrese número"
          />

          <Input
            label="CUIT:"
            {...register("cuit")}
            error={errors.cuit?.message}
            placeholder="Ingrese CUIT (Opcional)"
          />

          <Input
            label="Dirección:"
            {...register("direccion")}
            error={errors.direccion?.message}
            placeholder="Ingrese su dirección"
          />

          <Input
            label="Email:"
            type="email"
            {...register("email")}
            error={errors.email?.message}
            placeholder="Ingrese su email"
          />

          <Input
            label="Teléfono:"
            type="tel"
            {...register("telefono")}
            error={errors.telefono?.message}
            placeholder="Ingrese su teléfono"
          />
        </div>
      </div>

      {/* Botonera inferior (Separados como en el wireframe) */}
      <div className="flex justify-between mt-10 border-t pt-6 border-gray-100">
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
    </form>
  );
};

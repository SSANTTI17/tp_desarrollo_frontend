import { z } from "zod";
import { TipoDoc } from "@/api/types";

export const huespedSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  apellido: z.string().min(1, "El apellido es obligatorio"),

  tipo_documento: z.nativeEnum(TipoDoc, {
    errorMap: () => ({ message: "Requerido" }),
  }),
  nroDocumento: z.string().min(1, "Requerido").regex(/^\d+$/, "Solo números"),

  // Nuevos campos según Wireframes
  posicionIVA: z.string().min(1, "Requerido"),
  cuit: z.string().optional(), // Opcional según lógica (obligatorio si es Factura A, pero eso lo vemos luego)

  fechaDeNacimiento: z.string().min(1, "Requerido"),
  direccion: z.string().min(1, "La dirección es obligatoria"),

  ocupacion: z.string().min(1, "Requerido"),
  email: z.string().email("Email inválido").or(z.literal("")), // Opcional pero si hay, valida formato

  nacionalidad: z.string().min(1, "Requerido"),
  telefono: z.string().min(1, "El teléfono es obligatorio"),
});

export type HuespedFormData = z.infer<typeof huespedSchema>;

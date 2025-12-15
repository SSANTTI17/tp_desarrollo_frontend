"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MainContainer } from "@/components/ui/MainContainer";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { HuespedList } from "@/components/features/huespedes/HuespedList";
import { huespedService } from "@/api/huespedService";
import { useAlert } from "@/hooks/useAlert";
import { HuespedDTO, TipoDoc } from "@/api/types";
import { DateInput } from "@/components/ui/DateInput";
import { TableButton } from "@/components/ui/TableButton";
import { HourInput } from "@/components/ui/HourInput";
import { Tabs } from "@/components/ui/Tabs";

export default function BuscarHuespedPage() {
  const router = useRouter();
  const { showError, showSuccess } = useAlert();

  // Estado del formulario
  const [filters, setFilters] = useState({
    nombre: "",
    apellido: "",
    tipoDocumento: "" as TipoDoc | "",
    documento: "",
  });

  // Estado de resultados
  const [resultados, setResultados] = useState<HuespedDTO[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Manejadores
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = async () => {
    setLoading(true);
    setSelectedDoc(null);

    // --- MODO PRUEBA: DATOS FALSOS ---
    // Simulamos una demora de 0.5 seg para ver el loading
    setTimeout(() => {
      setResultados([
        {
          nombre: "Lionel",
          apellido: "Messi",
          tipo_documento: TipoDoc.DNI,
          nroDocumento: "10101010",
          telefono: "555-1234",
          email: "lio@campeon.com",
          fechaDeNacimiento: "",
          nacionalidad: "",
          ocupacion: "",
          alojado: false,
          direccion: "",
        },
        {
          nombre: "Julián",
          apellido: "Álvarez",
          tipo_documento: TipoDoc.PASAPORTE,
          nroDocumento: "20202020",
          telefono: "555-9999",
          fechaDeNacimiento: "",
          nacionalidad: "",
          email: "",
          ocupacion: "",
          alojado: false,
          direccion: "",
        },
        {
          nombre: "Emiliano",
          apellido: "Martínez",
          tipo_documento: TipoDoc.DNI,
          nroDocumento: "30303030",
          telefono: "555-5555",
          fechaDeNacimiento: "",
          nacionalidad: "",
          email: "",
          ocupacion: "",
          alojado: false,
          direccion: "",
        },
      ]);
      setLoading(false);
    }, 500);

    // // Validación mínima: al menos un campo lleno
    // if (
    //   !filters.nombre &&
    //   !filters.apellido &&
    //   !filters.tipoDocumento &&
    //   !filters.documento
    // ) {
    //   // Lógica del legado: Si está vacío y busca, sugiere ir al Alta
    //   router.push("/huespedes/alta");
    //   return;
    // }

    // setLoading(true);
    // setSelectedDoc(null); // Limpiar selección previa
    // try {
    //   const data = await huespedService.buscar({
    //     nombre: filters.nombre || undefined,
    //     apellido: filters.apellido || undefined,
    //     tipoDocumento: filters.tipoDocumento || undefined,
    //     documento: filters.documento || undefined,
    //   });

    //   if (data.length === 0) {
    //     showError("No se encontró el huésped. Redirigiendo a registro...").then(
    //       () => router.push("/huespedes/alta")
    //     );
    //   } else {
    //     setResultados(data);
    //   }
    // } catch (error: any) {
    //   showError(error.message || "Error al conectar con el servidor");
    // } finally {
    //   setLoading(false);
    // }
  };

  const handleNext = () => {
    if (!selectedDoc) {
      // Si no hay selección, redirige a Alta (comportamiento del legado)
      router.push("/huespedes/alta");
    } else {
      // Aquí iría la lógica de Modificar (CU10) o Seleccionar para otro proceso
      showSuccess("Huésped Seleccionado", `Documento: ${selectedDoc}`).then(
        () => {
          // TODO: Implementar navegación a Modificar o Retornar selección
          console.log("Navegar con huésped: ", selectedDoc);
        }
      );
    }
  };

  return (
    <MainContainer title="Titulo">
      {/* Formulario de Búsqueda */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 mb-8">
        <Input
          label="Nombre:"
          name="nombre"
          value={filters.nombre}
          onChange={handleChange}
          placeholder="Ingrese nombre"
        />
        <Input
          label="Apellido:"
          name="apellido"
          value={filters.apellido}
          onChange={handleChange}
          placeholder="Ingrese apellido"
        />
        <Select
          label="Tipo Documento:"
          name="tipoDocumento"
          value={filters.tipoDocumento}
          onChange={handleChange}
          options={[
            { label: "DNI", value: TipoDoc.DNI },
            { label: "LE", value: TipoDoc.LE },
            { label: "LC", value: TipoDoc.LC },
            { label: "Pasaporte", value: TipoDoc.PASAPORTE },
            { label: "Otro", value: TipoDoc.OTRO },
          ]}
        />
        <Input
          label="N° de Documento:"
          name="documento"
          type="number"
          value={filters.documento}
          onChange={handleChange}
          placeholder="Ingrese documento"
        />
      </div>

      <div className="flex justify-end mb-6">
        <Button onClick={handleSearch} isLoading={loading}>
          Buscar
        </Button>
      </div>

      {/* Tabla de Resultados */}
      <HuespedList
        huespedes={resultados}
        selectedDoc={selectedDoc}
        onSelect={setSelectedDoc}
      />

      {/* Botón Siguiente (solo aparece si hubo búsqueda exitosa, según diseño, o siempre visible al final) */}
      {resultados.length > 0 && (
        <div className="flex justify-end mt-6">
          <Button variant="secondary" onClick={handleNext}>
            Siguiente
          </Button>
        </div>
      )}

      <div className="flex gap-4">
        <DateInput label="Fecha" type="date" />
        <HourInput label="Hora" type="time" />
      </div>
      <div className="mt-4">
        <TableButton variant="delete">Eliminar</TableButton>
      </div>
      <div className="mt-8">
        <Tabs
          tabs={[
            {
              id: "ind",
              label: "Individual",
              content: <p>Contenido de Individual</p>,
            },
            { id: "dob", label: "Doble", content: <p>Contenido de Doble</p> },
            { id: "sui", label: "Suite", content: <p>Contenido de Suite</p> },
          ]}
        />
      </div>
    </MainContainer>
  );
}

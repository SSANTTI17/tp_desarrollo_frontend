"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { MainContainer } from "@/components/ui/MainContainer";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { DateInput } from "@/components/ui/DateInput";
import { DataTable, Column } from "@/components/ui/DataTable"; // Usamos tu componente de tabla
import { TableButton } from "@/components/ui/TableButton"; // Botón grande estilo lista
import { useAlert } from "@/hooks/useAlert";
import { facturacionService } from "@/api/facturacionService";
import {
  HuespedDTO,
  TipoHabitacion,
  ContenedorEstadiaYFacturaDTO,
  GenerarFacturaRequest,
  ConfirmarFacturaRequest,
} from "@/api/types";

export default function FacturarPage() {
  const router = useRouter();
  const { showError, showSuccess } = useAlert();

  // --- ESTADOS ---
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Paso 1: Búsqueda
  const [tipoHab, setTipoHab] = useState<TipoHabitacion | "">("");
  const [numHab, setNumHab] = useState("");
  // Fecha lógica (El backend buscará la reserva activa en esta fecha)
  const [fechaSalida, setFechaSalida] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Datos recuperados
  const [ocupantes, setOcupantes] = useState<HuespedDTO[]>([]);

  // Selección de responsable
  // Guardamos el NroDocumento para identificar al seleccionado en la tabla
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [selectedHuesped, setSelectedHuesped] = useState<HuespedDTO | null>(
    null
  );

  // Tercero
  const [esTercero, setEsTercero] = useState(false);
  const [terceroCuit, setTerceroCuit] = useState("");
  const [terceroRazon, setTerceroRazon] = useState("");

  // Paso 2: Facturación (Totales y Consumos)
  const [datosFactura, setDatosFactura] =
    useState<ContenedorEstadiaYFacturaDTO | null>(null);
  const [selectedConsumosIds, setSelectedConsumosIds] = useState<number[]>([]);

  // ----------------------------------------------------------------------
  // LÓGICA PASO 1: BUSCAR OCUPANTES
  // ----------------------------------------------------------------------
  const handleBuscar = async () => {
    if (!tipoHab || !numHab)
      return showError("Complete el tipo y número de habitación");
    if (!fechaSalida) return showError("Complete la fecha de corte");

    setLoading(true);
    setOcupantes([]);
    setSelectedDoc(null);
    setSelectedHuesped(null);
    setEsTercero(false);

    try {
      // El backend busca la reserva activa en 'fechaSalida' para esa habitación
      const res = await facturacionService.buscarOcupantes(
        tipoHab,
        numHab,
        fechaSalida
      );
      setOcupantes(res);
      if (res.length === 0)
        showError(
          "No se encontraron ocupantes o reserva activa para esa fecha."
        );
    } catch (error: any) {
      showError(error.message || "Error al buscar ocupantes");
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionarOcupante = (huesped: HuespedDTO) => {
    // Si ya estaba seleccionado, lo deseleccionamos (opcional, aquí forzamos selección única)
    if (selectedDoc === huesped.nroDocumento) {
      // Nada, ya está seleccionado
    } else {
      setSelectedDoc(huesped.nroDocumento);
      setSelectedHuesped(huesped);
      setEsTercero(false); // Anula selección de tercero
      setTerceroCuit("");
    }
  };

  const handleTercero = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Factura a tercero",
      html:
        '<div class="flex flex-col gap-3 text-left">' +
        '  <label class="font-bold text-gray-700">Ingrese CUIT:</label>' +
        '  <input id="swal-cuit" class="swal2-input m-0 w-full" placeholder="Ej: 20123456789">' +
        '  <label class="font-bold text-gray-700">Razón social:</label>' +
        '  <input id="swal-razon" class="swal2-input m-0 w-full" placeholder="Ej: Empresa S.A.">' +
        "</div>",
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Aceptar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return {
          cuit: (document.getElementById("swal-cuit") as HTMLInputElement)
            .value,
          razon: (document.getElementById("swal-razon") as HTMLInputElement)
            .value,
        };
      },
    });

    if (formValues && formValues.cuit) {
      setEsTercero(true);
      setTerceroCuit(formValues.cuit);
      setTerceroRazon(formValues.razon);

      // Limpiamos selección de huésped de la tabla
      setSelectedDoc(null);
      setSelectedHuesped(null);
    }
  };

  // ----------------------------------------------------------------------
  // DEFINICIÓN DE COLUMNAS PARA LA TABLA
  // ----------------------------------------------------------------------
  const columns: Column<HuespedDTO>[] = [
    { header: "Nombre", accessorKey: "nombre" },
    { header: "Apellido", accessorKey: "apellido" },
    { header: "Documento", accessorKey: "nroDocumento" }, // O puedes usar una función cell para mostrar "TIPO NRO"
    {
      header: "Selección",
      width: "w-32",
      cell: (huesped) => {
        const isSelected = selectedDoc === huesped.nroDocumento;
        return (
          <TableButton
            variant={isSelected ? "edit" : "action"} // 'edit' suele ser azul/destacado
            onClick={() => handleSeleccionarOcupante(huesped)}
            className="w-full justify-center"
          >
            {isSelected ? "Seleccionado" : "Seleccionar"}
          </TableButton>
        );
      },
    },
  ];

  // ----------------------------------------------------------------------
  // LÓGICA PASO 1 -> 2: GENERAR PRE-FACTURA
  // ----------------------------------------------------------------------
  const handleSiguiente = async () => {
    if (!esTercero && !selectedHuesped) {
      return showError(
        "Seleccione un ocupante de la lista o facture a un tercero."
      );
    }

    setLoading(true);
    try {
      const request: GenerarFacturaRequest = {
        habitacion: {
          numero: parseInt(numHab),
          tipo: tipoHab as string,
        },
        estadia: {
          fechaFin: fechaSalida,
        },
        cuit: esTercero ? terceroCuit : undefined,
        huesped: !esTercero && selectedHuesped ? selectedHuesped : undefined,
      };

      const respuesta = await facturacionService.generar(request);

      setDatosFactura(respuesta);

      // Por defecto, marcamos todos los consumos no facturados
      if (respuesta.estadia.consumos) {
        setSelectedConsumosIds(respuesta.estadia.consumos.map((c) => c.id));
      }

      setStep(2);
    } catch (error: any) {
      showError(error.message || "Error al generar la pre-factura");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------------------
  // LÓGICA PASO 2: CONFIRMAR
  // ----------------------------------------------------------------------
  const toggleConsumo = (id: number) => {
    if (selectedConsumosIds.includes(id)) {
      setSelectedConsumosIds((prev) => prev.filter((x) => x !== id));
    } else {
      setSelectedConsumosIds((prev) => [...prev, id]);
    }
  };

  const calcularTotalVisual = () => {
    if (!datosFactura) return 0;
    let total = datosFactura.factura.valorEstadia; // La estadía siempre suma

    datosFactura.estadia.consumos?.forEach((c) => {
      if (selectedConsumosIds.includes(c.id)) {
        total += c.monto;
      }
    });
    return total;
  };

  const handleConfirmar = async () => {
    if (!datosFactura) return;

    setLoading(true);
    try {
      const consumosAConfirmar =
        datosFactura.estadia.consumos?.filter((c) =>
          selectedConsumosIds.includes(c.id)
        ) || [];

      const responsableDTO = esTercero
        ? {
            CUIT: terceroCuit,
            razonSocial: terceroRazon,
            direccion: "Desconocida", // Datos dummy si es tercero rápido
            telefono: 0,
          }
        : undefined;

      const request: ConfirmarFacturaRequest = {
        idEstadia: datosFactura.estadia.id!,
        factura: {
          ...datosFactura.factura,
          totalAPagar: calcularTotalVisual(),
        },
        huesped: !esTercero && selectedHuesped ? selectedHuesped : undefined,
        responsable: responsableDTO,
        consumos: consumosAConfirmar,
      };

      await facturacionService.confirmar(request);

      await showSuccess(
        "¡Factura Generada!",
        "La factura ha sido registrada y quedó pendiente de pago."
      );
      router.push("/");
    } catch (error: any) {
      showError(error.message || "Error al confirmar la factura");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------------
  return (
    <MainContainer
      title={step === 1 ? "Generar factura" : "Pendientes a facturar"}
    >
      {/* --- PASO 1 --- */}
      {step === 1 && (
        <div className="animate-in fade-in">
          {/* Header Inputs */}
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex flex-col gap-6 mb-6 shadow-sm">
            {/* Fila 1: Tipo y Número */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Tipo de habitación:"
                value={tipoHab}
                onChange={(e) => setTipoHab(e.target.value as TipoHabitacion)}
                options={[
                  { label: "Individual estándar", value: TipoHabitacion.IE },
                  { label: "Doble estándar", value: TipoHabitacion.DE },
                  { label: "Doble superior", value: TipoHabitacion.DS },
                  { label: "Superior Family Plan", value: TipoHabitacion.SFP },
                  { label: "Suite doble", value: TipoHabitacion.SD },
                ]}
              />
              <Input
                label="Número de habitación:"
                placeholder="Ej: 101"
                value={numHab}
                onChange={(e) => setNumHab(e.target.value)}
              />
            </div>

            {/* Fila 2: Fecha y Botón */}
            <div className="flex flex-col md:flex-row gap-6 items-end">
              <div className="flex-1 w-full">
                <DateInput
                  label="Fecha de corte (en estadía):"
                  value={fechaSalida}
                  onChange={(e) => setFechaSalida(e.target.value)}
                />
              </div>
              <div className="w-full md:w-auto">
                <Button
                  onClick={handleBuscar}
                  isLoading={loading}
                  className="w-full px-10"
                >
                  Buscar
                </Button>
              </div>
            </div>
          </div>

          {/* Tabla Ocupantes */}
          <div className="border border-blue-200 rounded-xl p-6 min-h-[300px] bg-white relative shadow-sm">
            <h3 className="text-center mb-4 text-gray-700 font-semibold text-lg">
              Ocupantes de la habitación
            </h3>

            {/* Usamos el componente DataTable reutilizable */}
            <DataTable
              data={ocupantes}
              columns={columns}
              keyExtractor={(h) => h.nroDocumento}
              isLoading={loading}
            />

            {/* Indicador de Tercero Seleccionado */}
            {esTercero && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-green-800 text-center text-sm animate-in fade-in flex items-center justify-center gap-2">
                ✅ Facturando a tercero: <b>{terceroRazon}</b> (CUIT:{" "}
                {terceroCuit})
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-100">
            <Button
              variant="secondary"
              onClick={() => router.push("/")}
              className="rounded-full"
            >
              Cancelar
            </Button>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handleTercero}
                className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 rounded-full"
              >
                Facturar a nombre de un tercero
              </Button>
              <Button
                onClick={handleSiguiente}
                disabled={loading}
                className="rounded-full px-8"
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- PASO 2 --- */}
      {step === 2 && datosFactura && (
        <div className="animate-in fade-in">
          {/* Header Persona */}
          <div className="mb-6 flex flex-col md:flex-row items-center gap-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
            <label className="text-gray-700 font-bold whitespace-nowrap">
              Persona física o jurídica:
            </label>
            <div className="flex-1 bg-white border border-blue-200 rounded px-4 py-2 text-gray-700 shadow-sm w-full">
              {esTercero
                ? `${terceroRazon} (CUIT: ${terceroCuit})`
                : `${selectedHuesped?.apellido}, ${selectedHuesped?.nombre} (${selectedHuesped?.tipo_documento} ${selectedHuesped?.nroDocumento})`}
            </div>
          </div>

          {/* Tabla Items */}
          <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm mb-6">
            <table className="w-full text-sm text-center">
              <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-xs">
                <tr>
                  <th className="py-3 px-4 border-r border-gray-200">Fecha</th>
                  <th className="py-3 px-4 border-r border-gray-200">
                    Consumos
                  </th>
                  <th className="py-3 px-4 border-r border-gray-200">Monto</th>
                  <th className="py-3 px-4 w-20">Facturar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {/* Fila Fija: Estadía */}
                <tr className="bg-blue-50/40 hover:bg-blue-50 transition-colors">
                  <td className="py-3 px-4 text-gray-600">{fechaSalida}</td>
                  <td className="py-3 px-4 font-semibold text-gray-800">
                    Estadía
                  </td>
                  <td className="py-3 px-4 font-mono">
                    ${datosFactura.factura.valorEstadia}
                  </td>
                  <td className="py-3 px-4 flex justify-center items-center">
                    <input
                      type="checkbox"
                      checked
                      disabled
                      className="w-5 h-5 accent-legacy-primary cursor-not-allowed opacity-60"
                    />
                  </td>
                </tr>

                {/* Filas Dinámicas: Consumos */}
                {datosFactura.estadia.consumos?.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-gray-500">{fechaSalida}</td>
                    <td className="py-3 px-4 capitalize text-gray-700">
                      {c.tipo.toLowerCase()}
                    </td>
                    <td className="py-3 px-4 font-mono">${c.monto}</td>
                    <td className="py-3 px-4 flex justify-center items-center">
                      <input
                        type="checkbox"
                        checked={selectedConsumosIds.includes(c.id)}
                        onChange={() => toggleConsumo(c.id)}
                        className="w-5 h-5 accent-legacy-primary cursor-pointer"
                      />
                    </td>
                  </tr>
                ))}

                {/* Total */}
                <tr className="bg-gray-50 font-bold border-t-2 border-gray-200 text-gray-800 text-base">
                  <td className="py-4"></td>
                  <td className="py-4 text-right pr-4">Total a Pagar</td>
                  <td className="py-4 px-4 font-mono text-lg">
                    ${calcularTotalVisual()}
                  </td>
                  <td className="py-4 flex justify-center">
                    <input
                      type="checkbox"
                      checked
                      disabled
                      className="w-5 h-5 accent-legacy-primary opacity-50"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer Factura */}
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <label className="font-bold text-gray-700">
                Tipo de Factura:
              </label>
              <div className="bg-white px-4 py-1 border-2 border-blue-200 rounded-md font-mono font-bold text-legacy-primary text-lg shadow-sm">
                {datosFactura.factura.tipoFactura}
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="secondary" onClick={() => setStep(1)}>
                Volver
              </Button>
              <Button
                onClick={handleConfirmar}
                isLoading={loading}
                className="px-8 rounded-full shadow-md hover:shadow-lg transition-shadow"
              >
                Aceptar y Generar
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainContainer>
  );
}

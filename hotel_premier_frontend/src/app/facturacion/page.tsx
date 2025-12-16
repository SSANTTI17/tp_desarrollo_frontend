"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { MainContainer } from "@/components/ui/MainContainer";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { DateInput } from "@/components/ui/DateInput"; // Importamos DateInput
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

  // CAMBIO: Ahora usamos fechaSalida en lugar de horaSalida
  // Por defecto hoy (YYYY-MM-DD)
  const [fechaSalida, setFechaSalida] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Datos recuperados
  const [ocupantes, setOcupantes] = useState<HuespedDTO[]>([]);
  const [selectedHuespedIndex, setSelectedHuespedIndex] = useState<
    number | null
  >(null);

  // Tercero
  const [esTercero, setEsTercero] = useState(false);
  const [terceroCuit, setTerceroCuit] = useState("");
  const [terceroRazon, setTerceroRazon] = useState("");

  // Paso 2: Facturación
  const [datosFactura, setDatosFactura] =
    useState<ContenedorEstadiaYFacturaDTO | null>(null);
  const [selectedConsumosIds, setSelectedConsumosIds] = useState<number[]>([]);

  // ----------------------------------------------------------------------
  // LÓGICA PASO 1: BUSCAR OCUPANTES
  // ----------------------------------------------------------------------
  const handleBuscar = async () => {
    if (!tipoHab || !numHab)
      return showError("Complete el tipo y número de habitación");
    if (!fechaSalida) return showError("Complete la fecha de salida");

    setLoading(true);
    setOcupantes([]);
    setSelectedHuespedIndex(null);
    setEsTercero(false);

    try {
      // Enviamos la fecha seleccionada por el usuario
      const res = await facturacionService.buscarOcupantes(
        tipoHab,
        numHab,
        fechaSalida
      );
      setOcupantes(res);
      if (res.length === 0)
        showError("No hay ocupantes o la habitación no existe para esa fecha.");
    } catch (error: any) {
      showError(error.message || "Error al buscar ocupantes");
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionarOcupante = (index: number) => {
    setSelectedHuespedIndex(index);
    setEsTercero(false);
    setTerceroCuit("");
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
      setSelectedHuespedIndex(null);
    }
  };

  // ----------------------------------------------------------------------
  // LÓGICA PASO 1 -> 2: GENERAR PRE-FACTURA
  // ----------------------------------------------------------------------
  const handleSiguiente = async () => {
    if (!esTercero && selectedHuespedIndex === null) {
      return showError("Seleccione un ocupante o facture a un tercero.");
    }

    setLoading(true);
    try {
      const request: GenerarFacturaRequest = {
        habitacion: {
          numero: parseInt(numHab),
          tipo: tipoHab as string,
        },
        estadia: {
          fechaFin: fechaSalida, // Usamos la fecha del input
        },
        cuit: esTercero ? terceroCuit : undefined,
        huesped:
          !esTercero && selectedHuespedIndex !== null
            ? ocupantes[selectedHuespedIndex]
            : undefined,
      };

      const respuesta = await facturacionService.generar(request);

      setDatosFactura(respuesta);

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
    let total = datosFactura.factura.valorEstadia;

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
            direccion: "Desconocida",
            telefono: 0,
          }
        : undefined;

      const request: ConfirmarFacturaRequest = {
        idEstadia: datosFactura.estadia.id!,
        factura: {
          ...datosFactura.factura,
          totalAPagar: calcularTotalVisual(),
        },
        huesped:
          !esTercero && selectedHuespedIndex !== null
            ? ocupantes[selectedHuespedIndex]
            : undefined,
        responsable: responsableDTO,
        consumos: consumosAConfirmar,
      };

      await facturacionService.confirmar(request);

      await showSuccess(
        "¡Factura Generada!",
        "La factura ha sido registrada pendiente de pago."
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
          {/* Header Inputs - REDISEÑADO */}
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex flex-col gap-6 mb-6">
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
                  label="Fecha de salida:"
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
          <div className="border border-blue-200 rounded-xl p-6 min-h-[300px] bg-white relative">
            <h3 className="text-center mb-4 text-gray-700 font-semibold">
              Ocupantes de la habitación:
            </h3>

            <div className="border border-blue-200 rounded-lg overflow-hidden">
              <div className="grid grid-cols-4 bg-white border-b border-blue-200 font-semibold text-gray-600 text-center text-sm">
                <div className="p-3 border-r border-blue-200">Nombres</div>
                <div className="p-3 border-r border-blue-200">Apellido</div>
                <div className="p-3 border-r border-blue-200">
                  Nro. de documento
                </div>
                <div className="p-3 bg-blue-100 text-blue-800">Selección</div>
              </div>

              {ocupantes.length === 0
                ? // Placeholder vacío
                  [1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="grid grid-cols-4 border-b border-blue-100 last:border-0 h-12"
                    >
                      <div className="border-r border-blue-100"></div>
                      <div className="border-r border-blue-100"></div>
                      <div className="border-r border-blue-100"></div>
                      <div className="bg-blue-50/50"></div>
                    </div>
                  ))
                : ocupantes.map((h, i) => (
                    <div
                      key={i}
                      className={`grid grid-cols-4 border-b border-blue-100 text-sm transition-colors ${
                        selectedHuespedIndex === i ? "bg-blue-50" : "bg-white"
                      }`}
                    >
                      <div className="p-3 border-r border-blue-100 flex items-center justify-center">
                        {h.nombre}
                      </div>
                      <div className="p-3 border-r border-blue-100 flex items-center justify-center">
                        {h.apellido}
                      </div>
                      <div className="p-3 border-r border-blue-100 flex items-center justify-center">
                        {h.nroDocumento}
                      </div>
                      <div className="p-2 bg-blue-100 border-b border-blue-200 flex items-center justify-center">
                        <button
                          onClick={() => handleSeleccionarOcupante(i)}
                          className={`px-4 py-1 rounded text-xs font-bold transition-all shadow-sm ${
                            selectedHuespedIndex === i
                              ? "bg-blue-600 text-white"
                              : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"
                          }`}
                        >
                          {selectedHuespedIndex === i
                            ? "SELECCIONADO"
                            : "Seleccionar"}
                        </button>
                      </div>
                    </div>
                  ))}
            </div>

            {/* Indicador de Tercero Seleccionado */}
            {esTercero && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-green-800 text-center text-sm animate-in fade-in">
                ✅ Facturando a tercero: <b>{terceroRazon}</b> (CUIT:{" "}
                {terceroCuit})
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-6">
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
                className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 rounded-full"
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
          <div className="mb-6 flex items-center gap-4">
            <label className="text-gray-700 font-semibold">
              Persona física o jurídica:
            </label>
            <div className="flex-1 bg-white border border-gray-300 rounded px-4 py-2 text-gray-600 shadow-sm">
              {esTercero
                ? `${terceroRazon} (CUIT: ${terceroCuit})`
                : `${ocupantes[selectedHuespedIndex!]?.apellido}, ${
                    ocupantes[selectedHuespedIndex!]?.nombre
                  }`}
            </div>
          </div>

          {/* Tabla Items */}
          <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm mb-6">
            <table className="w-full text-sm text-center">
              <thead className="bg-gray-100 text-gray-700 font-semibold">
                <tr>
                  <th className="py-3 border-r border-gray-200">Fecha</th>
                  <th className="py-3 border-r border-gray-200">Consumos</th>
                  <th className="py-3 border-r border-gray-200">Monto</th>
                  <th className="py-3 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {/* Fila Fija: Estadía */}
                <tr className="bg-blue-50/30">
                  <td className="py-3">{fechaSalida}</td>
                  <td className="py-3 font-medium">Estadía</td>
                  <td className="py-3">${datosFactura.factura.valorEstadia}</td>
                  <td className="py-3 flex justify-center">
                    <input
                      type="checkbox"
                      checked
                      disabled
                      className="w-5 h-5 accent-blue-600 cursor-not-allowed"
                    />
                  </td>
                </tr>

                {/* Filas Dinámicas: Consumos */}
                {datosFactura.estadia.consumos?.map((c) => (
                  <tr key={c.id}>
                    <td className="py-3">{fechaSalida}</td>
                    <td className="py-3 capitalize">{c.tipo.toLowerCase()}</td>
                    <td className="py-3">${c.monto}</td>
                    <td className="py-3 flex justify-center">
                      <input
                        type="checkbox"
                        checked={selectedConsumosIds.includes(c.id)}
                        onChange={() => toggleConsumo(c.id)}
                        className="w-5 h-5 accent-blue-600 cursor-pointer"
                      />
                    </td>
                  </tr>
                ))}

                {/* Total */}
                <tr className="bg-gray-50 font-bold border-t border-gray-200">
                  <td className="py-4"></td>
                  <td className="py-4 text-right pr-4">Total</td>
                  <td className="py-4">${calcularTotalVisual()}</td>
                  <td className="py-4 flex justify-center">
                    <input
                      type="checkbox"
                      checked
                      disabled
                      className="w-5 h-5 accent-blue-600 opacity-50"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer Factura */}
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <label className="font-bold text-gray-700">Factura:</label>
              <div className="bg-white px-3 py-1 border border-gray-300 rounded font-mono font-bold text-blue-800">
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
                className="px-8 rounded-full"
              >
                Aceptar
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainContainer>
  );
}

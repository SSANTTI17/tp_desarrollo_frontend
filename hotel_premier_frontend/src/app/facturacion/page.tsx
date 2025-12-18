"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { MainContainer } from "@/components/ui/MainContainer";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { DateInput } from "@/components/ui/DateInput";
import { DataTable, Column } from "@/components/ui/DataTable";
import { TableButton } from "@/components/ui/TableButton";
import { useAlert } from "@/hooks/useAlert";
import { facturacionService } from "@/api/facturacionService";
import {
  HuespedDTO,
  TipoHabitacion,
  ContenedorEstadiaYFacturaDTO,
  GenerarFacturaRequest,
  ConfirmarFacturaRequest,
  PersonaJuridicaDTO,
  FormaDePagoDTO, // Importamos el tipo nuevo
} from "@/api/types";

export default function FacturarPage() {
  const router = useRouter();
  const { showError, showSuccess } = useAlert();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Paso 1
  const [tipoHab, setTipoHab] = useState<TipoHabitacion | "">("");
  const [numHab, setNumHab] = useState("");
  const [fechaSalida, setFechaSalida] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [ocupantes, setOcupantes] = useState<HuespedDTO[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [selectedHuesped, setSelectedHuesped] = useState<HuespedDTO | null>(
    null
  );
  const [esTercero, setEsTercero] = useState(false);
  const [terceroCuit, setTerceroCuit] = useState("");
  const [terceroRazon, setTerceroRazon] = useState("");

  // Paso 2
  const [datosFactura, setDatosFactura] =
    useState<ContenedorEstadiaYFacturaDTO | null>(null);
  const [selectedConsumosIds, setSelectedConsumosIds] = useState<number[]>([]);

  // --- NUEVO: ESTADO PARA EL PAGO ---
  const [metodoPago, setMetodoPago] = useState<"EFECTIVO" | "TARJETA">(
    "EFECTIVO"
  );

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
    if (selectedDoc !== huesped.nroDocumento) {
      setSelectedDoc(huesped.nroDocumento);
      setSelectedHuesped(huesped);
      setEsTercero(false);
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
      preConfirm: () => {
        const cuit = (
          document.getElementById("swal-cuit") as HTMLInputElement
        ).value.trim();
        const razon = (
          document.getElementById("swal-razon") as HTMLInputElement
        ).value.trim();
        if (!cuit || !razon) {
          Swal.showValidationMessage("Ambos campos son obligatorios");
          return false;
        }
        return { cuit, razon };
      },
    });
    if (formValues) {
      setEsTercero(true);
      setTerceroCuit(formValues.cuit);
      setTerceroRazon(formValues.razon);
      setSelectedDoc(null);
      setSelectedHuesped(null);
    }
  };

  const handleAltaEmpresa = async () => {
    const { value: datosExtra } = await Swal.fire({
      title: "Empresa no registrada",
      text: `El CUIT ${terceroCuit} no existe. Complete los datos para el alta.`,
      icon: "info",
      html:
        '<div class="flex flex-col gap-3 text-left mt-4">' +
        '  <label class="font-bold text-gray-700">Dirección:</label>' +
        '  <input id="swal-dir" class="swal2-input m-0 w-full" placeholder="Calle 123">' +
        '  <label class="font-bold text-gray-700">Teléfono:</label>' +
        '  <input id="swal-tel" class="swal2-input m-0 w-full" placeholder="341...">' +
        "</div>",
      showCancelButton: true,
      confirmButtonText: "Guardar y Continuar",
      preConfirm: () => {
        const direccion = (
          document.getElementById("swal-dir") as HTMLInputElement
        ).value.trim();
        const telefono = (
          document.getElementById("swal-tel") as HTMLInputElement
        ).value.trim();
        if (!direccion || !telefono) {
          Swal.showValidationMessage("Requeridos");
          return false;
        }
        return { direccion, telefono };
      },
    });
    if (datosExtra) {
      try {
        const nuevaEmpresa: PersonaJuridicaDTO = {
          CUIT: terceroCuit,
          razonSocial: terceroRazon,
          direccion: datosExtra.direccion,
          telefono: parseInt(datosExtra.telefono) || 0,
        };
        await facturacionService.crearResponsable(nuevaEmpresa);
        await showSuccess("Empresa registrada", "Ahora puede continuar.");
        return true;
      } catch (e: any) {
        showError("Error al crear empresa: " + e.message);
        return false;
      }
    }
    return false;
  };

  const handleSiguiente = async () => {
    if (!esTercero && !selectedHuesped)
      return showError("Seleccione un ocupante o tercero.");
    setLoading(true);
    try {
      const request: GenerarFacturaRequest = {
        habitacion: { numero: parseInt(numHab), tipo: tipoHab as string },
        estadia: { fechaFin: fechaSalida },
        cuit: esTercero ? terceroCuit : undefined,
        huesped: !esTercero && selectedHuesped ? selectedHuesped : undefined,
      };
      let respuesta = await facturacionService.generar(request);
      if (!respuesta && esTercero) {
        setLoading(false);
        const creado = await handleAltaEmpresa();
        if (creado) {
          setLoading(true);
          respuesta = await facturacionService.generar(request);
        } else return;
      }
      if (!respuesta) throw new Error("No se pudo generar la pre-factura.");
      setDatosFactura(respuesta);
      if (respuesta.estadia.consumos)
        setSelectedConsumosIds(respuesta.estadia.consumos.map((c) => c.id));
      setStep(2);
    } catch (error: any) {
      showError(error.message || "Error al generar pre-factura");
    } finally {
      setLoading(false);
    }
  };

  const toggleConsumo = (id: number) => {
    if (selectedConsumosIds.includes(id))
      setSelectedConsumosIds((prev) => prev.filter((x) => x !== id));
    else setSelectedConsumosIds((prev) => [...prev, id]);
  };

  const calcularTotalVisual = () => {
    if (!datosFactura) return 0;
    let total = datosFactura.factura.valorEstadia;
    datosFactura.estadia.consumos?.forEach((c) => {
      if (selectedConsumosIds.includes(c.id)) total += c.monto;
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
      const totalCalculado = calcularTotalVisual();

      // --- CREAR OBJETO DE PAGO ---
      const pagoDTO: FormaDePagoDTO = {
        monto: totalCalculado,
        efectivo: metodoPago === "EFECTIVO",
        tarjetaDeCredito: metodoPago === "TARJETA" ? "OTRO" : null,
        tarjetaDeDebito: null,
      };

      const request: ConfirmarFacturaRequest = {
        idEstadia: datosFactura.estadia.id!,
        factura: { ...datosFactura.factura, totalAPagar: totalCalculado },
        huesped: !esTercero && selectedHuesped ? selectedHuesped : undefined,
        responsable: responsableDTO,
        consumos: consumosAConfirmar,
        formasPago: [pagoDTO], // <--- Enviamos el pago
      };

      await facturacionService.confirmar(request);
      await showSuccess(
        "¡Factura Generada y Pagada!",
        "El cobro se registró correctamente."
      );
      router.push("/");
    } catch (error: any) {
      showError(error.message || "Error al confirmar");
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<HuespedDTO>[] = [
    { header: "Nombre", accessorKey: "nombre" },
    { header: "Apellido", accessorKey: "apellido" },
    { header: "Documento", accessorKey: "nroDocumento" },
    {
      header: "Selección",
      width: "w-32",
      cell: (huesped) => {
        const isSelected = selectedDoc === huesped.nroDocumento;
        return (
          <TableButton
            variant={isSelected ? "edit" : "action"}
            onClick={() => handleSeleccionarOcupante(huesped)}
            className="w-full justify-center"
          >
            {isSelected ? "Seleccionado" : "Seleccionar"}
          </TableButton>
        );
      },
    },
  ];

  return (
    <MainContainer
      title={step === 1 ? "Generar factura" : "Pendientes a facturar"}
    >
      {step === 1 && (
        <div className="animate-in fade-in">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex flex-col gap-6 mb-6 shadow-sm">
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
            <div className="flex flex-col md:flex-row gap-6 items-end">
              <div className="flex-1 w-full">
                <DateInput
                  label="Fecha de corte:"
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
          <div className="border border-blue-200 rounded-xl p-6 min-h-[300px] bg-white relative shadow-sm">
            <h3 className="text-center mb-4 text-gray-700 font-semibold text-lg">
              Ocupantes
            </h3>
            <DataTable
              data={ocupantes}
              columns={columns}
              keyExtractor={(h) => h.nroDocumento}
              isLoading={loading}
            />
            {esTercero && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-green-800 text-center text-sm">
                ✅ Facturando a tercero: <b>{terceroRazon}</b> ({terceroCuit})
              </div>
            )}
          </div>
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
                Facturar a tercero
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

      {step === 2 && datosFactura && (
        <div className="animate-in fade-in">
          <div className="mb-6 flex flex-col md:flex-row items-center gap-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
            <label className="text-gray-700 font-bold whitespace-nowrap">
              Responsable:
            </label>
            <div className="flex-1 bg-white border border-blue-200 rounded px-4 py-2 text-gray-700 shadow-sm w-full font-medium">
              {datosFactura.factura.nombreResponsable ||
                (esTercero
                  ? `${terceroRazon} (${terceroCuit})`
                  : `${selectedHuesped?.apellido}, ${selectedHuesped?.nombre}`)}
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm mb-6">
            <table className="w-full text-sm text-center">
              <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-xs">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Ítem</th>
                  <th className="py-3 px-4">Monto</th>
                  <th className="py-3 px-4">Incluir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                <tr className="bg-blue-50/40">
                  <td className="py-3 px-4 text-gray-600">{fechaSalida}</td>
                  <td className="py-3 px-4 font-semibold">Estadía</td>
                  <td className="py-3 px-4 font-mono">
                    ${datosFactura.factura.valorEstadia}
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked
                      disabled
                      className="w-5 h-5 opacity-60"
                    />
                  </td>
                </tr>
                {datosFactura.estadia.consumos?.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-500">{fechaSalida}</td>
                    <td className="py-3 px-4 capitalize">
                      {c.tipo.toLowerCase()}
                    </td>
                    <td className="py-3 px-4 font-mono">${c.monto}</td>
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedConsumosIds.includes(c.id)}
                        onChange={() => toggleConsumo(c.id)}
                        className="w-5 h-5 cursor-pointer"
                      />
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-bold border-t-2 text-base">
                  <td className="py-4"></td>
                  <td className="py-4 text-right pr-4">Total a Pagar</td>
                  <td className="py-4 px-4 font-mono text-lg">
                    ${calcularTotalVisual()}
                  </td>
                  <td className="py-4"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* FOOTER CON SELECTOR DE PAGO */}
          <div className="flex flex-col md:flex-row justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm gap-4">
            <div className="flex items-center gap-6 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <label className="font-bold text-gray-700 text-sm">Tipo:</label>
                <div className="bg-white px-3 py-1 border border-blue-200 rounded font-mono font-bold text-legacy-primary text-base">
                  {datosFactura.factura.tipoFactura}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-1">
                <label className="font-bold text-gray-700 text-sm whitespace-nowrap">
                  Forma de Pago:
                </label>
                <Select
                  options={[
                    { label: "Efectivo", value: "EFECTIVO" },
                    { label: "Tarjeta de Crédito", value: "TARJETA" },
                  ]}
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value as any)}
                  className="min-w-[180px]"
                />
              </div>
            </div>
            <div className="flex gap-4 w-full md:w-auto justify-end">
              <Button variant="secondary" onClick={() => setStep(1)}>
                Volver
              </Button>
              <Button
                onClick={handleConfirmar}
                isLoading={loading}
                className="px-6 rounded-full shadow-md bg-green-600 hover:bg-green-700 text-white"
              >
                Cobrar y Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainContainer>
  );
}

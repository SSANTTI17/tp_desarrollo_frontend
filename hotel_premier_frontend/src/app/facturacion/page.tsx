"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2"; // Usamos Swal directo para el modal de tercero
import { MainContainer } from "@/components/ui/MainContainer";
import { Button } from "@/components/ui/Button";
import { useAlert } from "@/hooks/useAlert";
import { facturacionService } from "@/api/facturacionService";
import { OcupanteDTO, ItemFacturaDTO } from "@/api/types";

export default function FacturarPage() {
  const router = useRouter();
  const { showError, showSuccess, showAlert } = useAlert();

  // Estados de Control
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Estados Paso 1
  const [habitacion, setHabitacion] = useState("");
  const [horaSalida, setHoraSalida] = useState("10:00"); // Default como en la imagen
  const [ocupantes, setOcupantes] = useState<OcupanteDTO[]>([]);
  const [selectedOcupanteId, setSelectedOcupanteId] = useState<number | null>(
    null
  );
  const [terceroData, setTerceroData] = useState<{
    cuit: string;
    razon: string;
  } | null>(null);

  // Estados Paso 2
  const [items, setItems] = useState<ItemFacturaDTO[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [tipoFactura, setTipoFactura] = useState("A");

  // --- LOGICA PASO 1 ---

  const handleBuscar = async () => {
    if (!habitacion) return showError("Ingrese el número de habitación");
    setLoading(true);
    try {
      const data = await facturacionService.buscarOcupantes(
        habitacion,
        horaSalida
      );
      setOcupantes(data);
    } catch (err) {
      showError("Error al buscar ocupantes");
    } finally {
      setLoading(false);
    }
  };

  const handleTercero = async () => {
    // Modal idéntico a la imagen ...d7434dde.jpg usando SweetAlert
    const { value: formValues } = await Swal.fire({
      title: "Factura a tercero",
      html:
        '<div style="display: flex; flex-direction: column; gap: 10px; text-align: left;">' +
        '  <label>Ingrese CUIT: <input id="swal-cuit" class="swal2-input" style="margin: 0; width: 100%;" placeholder="Ingrese el número de CUIT"></label>' +
        '  <label>Razón social: <input id="swal-razon" class="swal2-input" style="margin: 0; width: 100%;" placeholder="Razón social"></label>' +
        "</div>",
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Aceptar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#bfdbfe", // Color azul clarito de la imagen
      cancelButtonColor: "#bfdbfe",
      customClass: {
        popup: "border-2 border-blue-100 rounded-xl",
        confirmButton: "text-blue-900 font-bold",
        cancelButton: "text-blue-900 font-bold",
      },
      preConfirm: () => {
        return {
          cuit: (document.getElementById("swal-cuit") as HTMLInputElement)
            .value,
          razon: (document.getElementById("swal-razon") as HTMLInputElement)
            .value,
        };
      },
    });

    if (formValues && formValues.cuit && formValues.razon) {
      setTerceroData(formValues);
      setSelectedOcupanteId(-1); // ID especial para tercero
    }
  };

  const handleSiguiente = async () => {
    if (selectedOcupanteId === null) {
      // Mostrar Error como en la imagen ...35b91c7e.jpg
      return Swal.fire({
        icon: "error",
        title: "Error",
        text: "Se ha producido un error, debe seleccionar un ocupante.",
        confirmButtonText: "Siguiente",
        confirmButtonColor: "#bfdbfe",
        customClass: { confirmButton: "text-blue-900" },
      });
    }

    setLoading(true);
    try {
      const data = await facturacionService.obtenerItems(selectedOcupanteId);
      setItems(data);
      setSelectedItems(data.map((i) => i.id)); // Todos seleccionados por defecto
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGICA PASO 2 ---

  const toggleItem = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const totalCalculado = items
    .filter((i) => selectedItems.includes(i.id))
    .reduce((acc, curr) => acc + curr.monto, 0);

  const handleAceptarFinal = async () => {
    await showSuccess("Factura Generada", "La operación se realizó con éxito.");
    router.push("/");
  };

  // Nombre a mostrar en el input disabled
  const getNombrePayer = () => {
    if (terceroData) return terceroData.razon;
    const oc = ocupantes.find((o) => o.id === selectedOcupanteId);
    return oc ? `${oc.nombre} ${oc.apellido}` : "";
  };

  return (
    <MainContainer
      title={step === 1 ? "Generar factura" : "Pendientes a facturar"}
    >
      {/* ---------------- PASO 1 ---------------- */}
      {step === 1 && (
        <div className="animate-in fade-in">
          {/* Header Inputs */}
          <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
            <div className="flex items-center gap-2 flex-1">
              <label className="text-gray-700 whitespace-nowrap">
                Número de habitación:
              </label>
              <input
                type="text"
                className="border border-gray-300 rounded-full px-4 py-2 w-full outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Ingrese el número de habitación"
                value={habitacion}
                onChange={(e) => setHabitacion(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <label className="text-gray-700 whitespace-nowrap">
                Hora de salida:
              </label>
              <div className="relative w-full">
                <input
                  type="time"
                  className="border border-gray-300 rounded-full px-4 py-2 w-full outline-none focus:ring-2 focus:ring-blue-200"
                  value={horaSalida}
                  onChange={(e) => setHoraSalida(e.target.value)}
                />
              </div>
            </div>
            <Button
              onClick={handleBuscar}
              isLoading={loading}
              className="rounded-full px-8 bg-blue-200 text-blue-900 hover:bg-blue-300 border-none"
            >
              Buscar
            </Button>
          </div>

          {/* Area de Ocupantes */}
          <div className="border border-blue-200 rounded-xl p-6 min-h-[300px]">
            <h3 className="text-center mb-4 text-gray-700">
              Ocupantes de la habitación:
            </h3>

            <div className="border border-blue-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-blue-200 text-center">
                    <th className="p-3 border-r border-blue-200 font-normal">
                      Nombres
                    </th>
                    <th className="p-3 border-r border-blue-200 font-normal">
                      Apellido
                    </th>
                    <th className="p-3 border-r border-blue-200 font-normal">
                      Nro. de documento
                    </th>
                    <th className="p-3 bg-blue-100 w-40"></th>
                  </tr>
                </thead>
                <tbody>
                  {ocupantes.map((oc) => {
                    const isSelected = selectedOcupanteId === oc.id;
                    return (
                      <tr
                        key={oc.id}
                        className={isSelected ? "bg-gray-300" : "bg-white"}
                      >
                        <td className="p-3 border-r border-blue-200 border-b border-gray-100 text-center">
                          {oc.nombre}
                        </td>
                        <td className="p-3 border-r border-blue-200 border-b border-gray-100 text-center">
                          {oc.apellido}
                        </td>
                        <td className="p-3 border-r border-blue-200 border-b border-gray-100 text-center">
                          {oc.documento}
                        </td>
                        {/* Columna de Botones a la derecha */}
                        <td className="p-2 bg-blue-100 border-b border-blue-200 text-center">
                          <button
                            onClick={() => {
                              setSelectedOcupanteId(oc.id);
                              setTerceroData(null);
                            }}
                            className={`px-4 py-1 rounded text-sm transition-colors ${
                              isSelected
                                ? "bg-gray-400 text-black border border-gray-500"
                                : "hover:bg-blue-200 text-gray-700"
                            }`}
                          >
                            Seleccionar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Filas vacías para rellenar visualmente como en el wireframe */}
                  {[1, 2, 3, 4].map((i) => (
                    <tr key={`empty-${i}`}>
                      <td className="p-4 border-r border-blue-200 border-b border-gray-100"></td>
                      <td className="p-4 border-r border-blue-200 border-b border-gray-100"></td>
                      <td className="p-4 border-r border-blue-200 border-b border-gray-100"></td>
                      <td className="p-4 bg-blue-100 border-b border-blue-200 text-center">
                        <span className="text-gray-400 text-sm select-none">
                          Seleccionar
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-between items-center mt-6">
            <Button
              variant="secondary"
              onClick={() => router.push("/")}
              className="bg-blue-200 text-blue-900 rounded-full px-8"
            >
              Cancelar
            </Button>
            <div className="flex gap-4">
              <Button
                variant="secondary"
                onClick={handleTercero}
                className="bg-blue-200 text-blue-900 rounded-full px-6"
              >
                Facturar a nombre de un tercero
              </Button>
              <Button
                onClick={handleSiguiente}
                className="bg-blue-200 text-blue-900 hover:bg-blue-300 rounded-full px-8"
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- PASO 2 ---------------- */}
      {step === 2 && (
        <div className="animate-in fade-in">
          {/* Input Persona */}
          <div className="flex items-center gap-4 mb-8">
            <label className="font-medium text-gray-800">
              Persona física o jurídica:
            </label>
            <input
              type="text"
              disabled
              value={getNombrePayer()}
              className="border border-gray-300 rounded-lg px-4 py-2 w-1/3 bg-white text-gray-500"
            />
          </div>

          {/* Tabla Items */}
          <div className="border border-gray-200 rounded-sm mb-8">
            <table className="w-full">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  <th className="py-3 px-6 text-center font-normal">Fecha</th>
                  <th className="py-3 px-6 text-center font-normal">
                    Consumos
                  </th>
                  <th className="py-3 px-6 text-center font-normal">Monto</th>
                  <th className="py-3 px-6 bg-white w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id} className="text-center">
                    <td className="py-4 text-gray-700">{item.fecha}</td>
                    <td className="py-4 text-gray-700">{item.consumo}</td>
                    <td className="py-4 text-gray-700 font-medium">
                      ${item.monto}
                    </td>
                    <td className="py-4 flex justify-center border-l border-gray-100">
                      <div
                        onClick={() => toggleItem(item.id)}
                        className={`w-8 h-8 rounded cursor-pointer flex items-center justify-center transition-colors ${
                          selectedItems.includes(item.id)
                            ? "bg-blue-300"
                            : "bg-blue-50"
                        }`}
                      >
                        {selectedItems.includes(item.id) && (
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                        )}
                        {!selectedItems.includes(item.id) && (
                          <svg
                            className="w-5 h-5 text-blue-200"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {/* Fila Total */}
                <tr className="font-bold border-t border-gray-200">
                  <td className="py-6">12/04/2025</td>
                  <td className="py-6">Total</td>
                  <td className="py-6">${totalCalculado}</td>
                  <td className="py-6 flex justify-center border-l border-gray-100">
                    <div className="w-8 h-8 rounded bg-blue-300 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2">
              <label className="text-gray-800">Factura:</label>
              <select
                className="border border-gray-300 rounded px-3 py-1 outline-none w-40 bg-white"
                value={tipoFactura}
                onChange={(e) => setTipoFactura(e.target.value)}
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>

            <Button
              onClick={handleAceptarFinal}
              className="bg-blue-200 text-blue-900 hover:bg-blue-300 rounded-full px-10 py-2"
            >
              Aceptar
            </Button>
          </div>
        </div>
      )}
    </MainContainer>
  );
}

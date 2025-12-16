export enum TipoDoc {
  DNI = "DNI",
  LE = "LE",
  LC = "LC",
  PASAPORTE = "PASAPORTE",
  OTRO = "OTRO",
}

export enum TipoHabitacion {
  IE = "IE",
  DE = "DE",
  DS = "DS",
  SFP = "SFP",
  SD = "SD",
  OTRO = "OTRO",
}

export enum EstadoHabitacion {
  OCUPADA = "Ocupada",
  RESERVADA = "Reservada",
  FUERA_DE_SERVICIO = "FueraDeServicio",
  DISPONIBLE = "Disponible",
}

export interface HuespedDTO {
  nombre: string;
  apellido: string;
  tipo_documento: TipoDoc | string;
  nroDocumento: string;
  fechaDeNacimiento?: string;
  email?: string;
  telefono: string;
  direccion?: string;
  ocupacion?: string;
  nacionalidad?: string;
  alojado?: boolean;
  cuit?: string;
  posicionIVA?: string;
}

export interface PersonaFisicaDTO {
  cuit: string;
  posicionIVA: string;
  refHuesped?: HuespedDTO;
}

export interface ContenedorAltaHuesped {
  huesped: HuespedDTO;
  personaFisica: PersonaFisicaDTO | null;
}

export interface HabitacionDTO {
  tipo: TipoHabitacion;
  numero: number;
  costoNoche: number;
  estadosPorDia: EstadoHabitacion[];
}

export interface OcuparDTO {
  numeroHabitacion: number;
  tipoHabitacion: string;
  fechaInicio: string;
  fechaFin: string;
  huespedes: HuespedDTO[];
}

export interface DisponibilidadReserva {
  fecha: string;
  sd1: boolean;
  sd2: boolean;
}

export interface ReservaListadoDTO {
  id: number;
  habitacion: number;
  tipoHabitacion: string;
  fechaInicio: string;
  fechaFin: string;
  huespedNombre: string;
  huespedApellido: string;
  estado: string;
}

// --- NUEVOS DTOS PARA FACTURACIÓN (CU07) ---

export interface OcupanteDTO {
  nombre: string;
  apellido: string;
  nroDocumento: string;
  tipo_documento: string;
}

export interface ConsumoDTO {
  id: number;
  tipo: string;
  monto: number;
  moneda: string;
  facturado?: boolean;
}

export interface EstadiaDTO {
  id?: number;
  fechaInicio?: string;
  fechaFin?: string;
  precio?: number;
  consumos?: ConsumoDTO[];
}

export interface FacturaDTO {
  tipoFactura: string;
  valorEstadia: number;
  totalAPagar: number;
  vuelto: number;
  pagado: boolean;
  responsablePago?: any;
}

export interface ContenedorEstadiaYFacturaDTO {
  estadia: EstadiaDTO;
  factura: FacturaDTO;
}

export interface GenerarFacturaRequest {
  huesped?: HuespedDTO;
  cuit?: string;
  estadia: { fechaFin: string };
  habitacion: { numero: number; tipo: string };
}

export interface ConfirmarFacturaRequest {
  idEstadia: number;
  factura: any;
  huesped?: HuespedDTO;
  responsable?: {
    CUIT: string;
    razonSocial?: string;
    direccion?: string;
    telefono?: number;
  }; // Coincide con PersonaJuridicaDTO del back
  consumos: ConsumoDTO[];
}

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

// CORREGIDO: Alineado 100% con tu Backend Java (HuespedDTO.java)
export interface HuespedDTO {
  nombre: string;
  apellido: string;
  tipo_documento: TipoDoc | string; // Back envía "tipo_documento"
  nroDocumento: string; // Back envía "nroDocumento"
  fechaDeNacimiento?: string; // Back envía "fechaDeNacimiento"
  email?: string;
  telefono: string;

  // Dirección es un solo string en tu back actual
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

// Facturación
export interface OcupanteDTO {
  nombre: string;
  apellido: string;
  nroDocumento: string;
  tipo_documento: string;
  // Campos opcionales para mapeo interno
  id?: number;
  documento?: string;
}

export interface ItemFacturaDTO {
  id: number;
  fecha: string;
  consumo: string;
  monto: number;
}

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

export enum Banco {
  BNA = "BNA",
  MACRO = "Macro",
  SANTA_FE = "Santa_Fe",
  GALICIA = "Galicia",
  BBVA = "BBVA",
  SANTANDER = "Santander",
  HSBC = "HSBC",
  ICBC = "ICBC",
  OTRO = "OTRO",
}

export enum TipoDocumento {
  DNI = "DNI",
  PASAPORTE = "Pasaporte",
  LC = "Libreta Cívica",
  LE = "Libreta de Enrolamiento",
}

export interface HuespedDTO {
  id?: number;
  nombre: string;
  apellido: string;
  tipoDocumento: TipoDocumento | string;
  documento: string;
  fechaNacimiento?: string;
  email: string;
  telefono: string;
  calle?: string;
  numeroCalle?: string;
  pais?: string;
  provincia?: string;
  ciudad?: string;
  codigoPostal?: string;
  // Campos extra para el alta completa
  ocupacion?: string;
  nacionalidad?: string;
  alojado?: boolean;
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

// --- NUEVO DTO PARA CU06 ---
export interface ReservaListadoDTO {
  id: number;
  habitacion: number;
  tipoHabitacion: string;
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string;
  huespedNombre: string;
  huespedApellido: string;
  estado: string; // "RESERVADA", etc.
}

// --- NUEVO DTO PARA CU07 (Facturación) ---

// DTO para el Paso 1: Ocupantes
export interface OcupanteDTO {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
}

// DTO para el Paso 2: Items
export interface ItemFacturaDTO {
  id: number;
  fecha: string; // "11/04/2025"
  consumo: string; // "Estadía", "Bar", etc.
  monto: number;
}
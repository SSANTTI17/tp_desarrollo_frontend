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

export interface HuespedDTO {
  nombre: string;
  apellido: string;
  // Permitimos string para que no choque con el valor inicial del formulario
  tipo_documento: TipoDoc | string;
  nroDocumento: string;
  fechaDeNacimiento: string;
  nacionalidad: string;
  // IMPORTANTE: Opcional (?) porque el usuario puede no tener email
  email?: string;
  telefono: string;
  ocupacion: string;
  alojado: boolean;
  direccion: string;
}

export interface PersonaFisicaDTO {
  cuit: string;
  posicionIVA: string;
  // IMPORTANTE: Opcional (?) para evitar error circular al crear
  refHuesped?: HuespedDTO;
}

export interface ContenedorAltaHuesped {
  huesped: HuespedDTO;
  // Puede ser null si el usuario no carga datos fiscales
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

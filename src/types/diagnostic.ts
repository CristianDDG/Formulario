/**
 * Type definitions for the Diagnostic IT application
 */

export type DiagnosticStatus = "si" | "no" | null;

export interface DiagnosticFormData {
  nombreCompleto: string;
  telefono: string;
  correo: string;
  cliente: string;
  ubicacion: string;
  fecha: string;
}

export interface DiagnosticResult {
  nombreCompleto: string;
  telefono: string;
  correo: string;
  cliente: string;
  ubicacion: string;
  fecha: string;
  respuestas: DiagnosticStatus[];
  observaciones: string[];
  obsGenerales: string;
  puntos: number;
  total: number;
  porcentaje: number;
  valoracion: string;
  timestamp: string;
}

export interface SemaforoResult {
  label: string;
  colorClass: string;
  semaforo: string;
  minScore: number;
}

export interface DiagnosticReportPayload {
  contacto: {
    nombreCompleto: string;
    telefono: string;
    correo: string;
  };
  cliente: string;
  ubicacion: string;
  fecha: string;
  respuestas: Array<{
    n: number;
    pregunta: string;
    estado: "Saludable" | "Crítico";
    observacion: string;
  }>;
  observacionesGenerales: string;
  puntuacion: {
    puntos: number;
    total: number;
    porcentaje: number;
    valoracion: string;
  };
  timestamp: string;
}

export interface EmailConfig {
  internalReportEmail: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  mailFrom: string;
  resendApiKey?: string;
}

export interface SendStatus {
  sent: boolean;
  sending: boolean;
  error?: string;
  sentAt?: string;
  clientEmail?: string;
  internalEmail?: string;
}

export type DiagnosticStatus = "si" | "no" | null;
export type DiagnosticValue = string | number | boolean | null;

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
    valorExacto?: string;
    riesgoAsociado?: string;
    observacion: string;
  }>;
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
  mailFrom: string;
}

export interface SendStatus {
  sent: boolean;
  sending: boolean;
  error?: string;
  sentAt?: string;
  clientEmail?: string;
  internalEmail?: string;
}

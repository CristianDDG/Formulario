import {
  STATUS_CONFIG,
  DIAGNOSTIC_QUESTIONS,
  EMAIL_CONFIG,
  TOTAL_QUESTIONS,
} from "@/constants/diagnostics";
import type { DiagnosticReportPayload, DiagnosticStatus, SemaforoResult } from "@/types/diagnostic";

export function calculateDiagnosticScore(respuestas: DiagnosticStatus[]) {
  const puntos = respuestas.filter((r) => r === "si").length;
  const porcentaje = Math.round((puntos / TOTAL_QUESTIONS) * 100);
  return { puntos, porcentaje };
}

export function getHealthStatus(porcentaje: number): SemaforoResult {
  if (porcentaje >= STATUS_CONFIG.healthy.minScore) {
    return STATUS_CONFIG.healthy;
  }
  if (porcentaje >= STATUS_CONFIG.medium.minScore) {
    return STATUS_CONFIG.medium;
  }
  return STATUS_CONFIG.critical;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateFormData(
  nombreCompleto: string,
  telefono: string,
  correo: string,
  cliente: string,
  ubicacion: string,
  fecha: string,
  respondidas: number,
): { valid: boolean; error?: string } {
  if (!nombreCompleto.trim()) {
    return {
      valid: false,
      error: "Completa el nombre completo del contacto.",
    };
  }

  if (!telefono.trim() && !correo.trim()) {
    return {
      valid: false,
      error: "Agrega al menos un medio de contacto: teléfono o correo electrónico.",
    };
  }

  if (!cliente.trim() || !ubicacion.trim() || !fecha.trim()) {
    return {
      valid: false,
      error: "Completa los campos de Cliente, Ubicación y Fecha.",
    };
  }

  if (respondidas < TOTAL_QUESTIONS) {
    return {
      valid: false,
      error: `Debes contestar las ${TOTAL_QUESTIONS} preguntas. Faltan ${TOTAL_QUESTIONS - respondidas}.`,
    };
  }

  return { valid: true };
}

export function buildReportPayload(
  nombreCompleto: string,
  telefono: string,
  correo: string,
  cliente: string,
  ubicacion: string,
  fecha: string,
  preguntas: Array<{ text: string }>,
  respuestas: DiagnosticStatus[],
  observaciones: string[],
  puntos: number,
  porcentaje: number,
  valoracion: string,
): DiagnosticReportPayload {
  return {
    contacto: {
      nombreCompleto,
      telefono,
      correo,
    },
    cliente,
    ubicacion,
    fecha,
    respuestas: preguntas.map((p, i) => ({
      n: i + 1,
      pregunta: p.text,
      estado: respuestas[i] === "si" ? "Saludable" : "Crítico",
      observacion: observaciones[i] || "",
    })),
    puntuacion: {
      puntos,
      total: TOTAL_QUESTIONS,
      porcentaje,
      valoracion,
    },
    timestamp: new Date().toISOString(),
  };
}

interface FinalizeResult {
  success: boolean;
  error?: string;
  sendStatus?: { sent: boolean; sentAt: string; clientEmail: string; internalEmail: string };
}

interface DiagnosticPdfAttachment {
  filename: string;
  base64: string;
}

function normalizeBase64Payload(raw: string): string {
  return raw.replace(/^data:application\/pdf;base64,/i, "").trim();
}

export async function finalizeAndSendDiagnosis(
  nombreCompleto: string,
  telefono: string,
  correo: string,
  cliente: string,
  ubicacion: string,
  fecha: string,
  respuestas: DiagnosticStatus[],
  observaciones: string[],
  pdfAttachment?: DiagnosticPdfAttachment,
): Promise<FinalizeResult> {
  try {
    if (!correo || !isValidEmail(correo)) {
      return { success: false, error: "Correo electrónico del cliente inválido o faltante." };
    }

    const { puntos, porcentaje } = calculateDiagnosticScore(respuestas);
    const healthStatus = getHealthStatus(porcentaje);

    const payload = buildReportPayload(
      nombreCompleto,
      telefono,
      correo,
      cliente,
      ubicacion,
      fecha,
      DIAGNOSTIC_QUESTIONS,
      respuestas,
      observaciones,
      puntos,
      porcentaje,
      healthStatus.label,
    );

    const response = await fetch("/api/diagnostic", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        payload,
        pdfBase64: pdfAttachment ? normalizeBase64Payload(pdfAttachment.base64) : undefined,
        pdfFilename: pdfAttachment?.filename,
      }),
    });

    const responseBody = await response.json().catch(() => ({}));
    if (!response.ok || !responseBody.ok) {
      return {
        success: false,
        error:
          responseBody.error ||
          responseBody.message ||
          `Error enviando diagnóstico. Código ${response.status}`,
      };
    }

    return {
      success: true,
      sendStatus: {
        sent: true,
        sentAt: responseBody.sentAt || new Date().toISOString(),
        clientEmail: responseBody.clientEmail || correo,
        internalEmail: responseBody.internalEmail || EMAIL_CONFIG.internalReportEmail,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error finalizando diagnóstico";
    return { success: false, error: errorMessage };
  }
}

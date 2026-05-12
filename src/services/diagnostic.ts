import { STATUS_CONFIG, TOTAL_QUESTIONS } from "@/constants/diagnostics";
import type { DiagnosticStatus, SemaforoResult, DiagnosticReportPayload } from "@/types/diagnostic";

/**
 * Calculate diagnostic score and status based on responses
 */
export function calculateDiagnosticScore(respuestas: DiagnosticStatus[]) {
  const puntos = respuestas.filter((r) => r === "si").length;
  const porcentaje = Math.round((puntos / TOTAL_QUESTIONS) * 100);
  return { puntos, porcentaje };
}

/**
 * Determine health status based on score
 */
export function getHealthStatus(porcentaje: number): SemaforoResult {
  if (porcentaje >= STATUS_CONFIG.healthy.minScore) {
    return STATUS_CONFIG.healthy;
  }
  if (porcentaje >= STATUS_CONFIG.medium.minScore) {
    return STATUS_CONFIG.medium;
  }
  return STATUS_CONFIG.critical;
}

/**
 * Validate form data completeness
 */
export function validateFormData(
  cliente: string,
  ubicacion: string,
  fecha: string,
  respondidas: number,
): { valid: boolean; error?: string } {
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

/**
 * Build report payload for backend submission
 */
export function buildReportPayload(
  cliente: string,
  ubicacion: string,
  fecha: string,
  preguntas: Array<{ text: string }>,
  respuestas: DiagnosticStatus[],
  observaciones: string[],
  obsGenerales: string,
  puntos: number,
  porcentaje: number,
  valoracion: string,
): DiagnosticReportPayload {
  return {
    cliente,
    ubicacion,
    fecha,
    respuestas: preguntas.map((p, i) => ({
      n: i + 1,
      pregunta: p.text,
      estado: respuestas[i] === "si" ? "Saludable" : "Crítico",
      observacion: observaciones[i] || "",
    })),
    observacionesGenerales: obsGenerales,
    puntuacion: {
      puntos,
      total: TOTAL_QUESTIONS,
      porcentaje,
      valoracion,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Submit diagnostic report to the configured backend.
 *
 * The current implementation keeps the integration isolated so an email
 * service or API endpoint can be connected without touching the UI flow.
 */
export async function submitDiagnosticReport(
  payload: DiagnosticReportPayload,
): Promise<{ ok: boolean; error?: string }> {
  try {
    console.log("Submitting diagnostic report:", payload);

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 400));

    // Backend delivery can be connected here when the production endpoint is defined.

    return { ok: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return { ok: false, error: errorMessage };
  }
}

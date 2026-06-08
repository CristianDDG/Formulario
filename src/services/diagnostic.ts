import {
  STATUS_CONFIG,
  DIAGNOSTIC_QUESTIONS,
  EMAIL_CONFIG,
  TOTAL_QUESTIONS,
} from "@/constants/diagnostics";
import type {
  DiagnosticReportPayload,
  DiagnosticStatus,
  DiagnosticValue,
  SemaforoResult,
  DiagnosticResultsSummaryData,
  DiagnosticResultItem,
  ResultClassification,
} from "@/types/diagnostic";
import { isValidEmail } from "@/lib/utils";
import { isValidPhone } from "@/lib/utils";

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

  if (correo.trim() && !isValidEmail(correo.trim())) {
    return {
      valid: false,
      error: "Correo electrónico inválido.",
    };
  }

  if (telefono.trim() && !isValidPhone(telefono.trim())) {
    return {
      valid: false,
      error: "Teléfono inválido.",
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
  preguntas: typeof DIAGNOSTIC_QUESTIONS,
  respuestas: DiagnosticStatus[],
  valores: DiagnosticValue[],
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
    respuestas: preguntas.map((q, i) => {
      const isCritical = respuestas[i] === "no";
      return {
        n: i + 1,
        pregunta: q.text,
        estado: respuestas[i] === "si" ? "Saludable" : "Crítico",
        valorExacto:
          q.formatValue && valores[i] !== null && valores[i] !== undefined
            ? q.formatValue(valores[i])
            : undefined,
        riesgoAsociado: isCritical ? q.riskText : undefined,
        observacion: observaciones[i] || "",
      };
    }),
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
  valores: DiagnosticValue[],
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
      valores,
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

export function getSortedDiagnosticResults(
  respuestas: DiagnosticStatus[],
  observaciones: string[],
): DiagnosticResultsSummaryData {
  if (!respuestas || !observaciones) {
    return {
      items: [],
      total: 0,
      criticalCount: 0,
      observationCount: 0,
      correctCount: 0,
      hasFindings: false,
    };
  }

  const items: DiagnosticResultItem[] = DIAGNOSTIC_QUESTIONS.map((q, i) => {
    const status = respuestas[i] ?? null;
    const observation = observaciones[i]?.trim() ?? "";

    let classification: ResultClassification = "unknown";
    if (status === "no") {
      classification = "critical";
    } else if (status === "si" && observation !== "") {
      classification = "observation";
    } else if (status === "si") {
      classification = "correct";
    }

    return {
      index: i + 1,
      question: q.text,
      status,
      observation,
      classification,
    };
  });

  const criticalCount = items.filter((i) => i.classification === "critical").length;
  const observationCount = items.filter((i) => i.classification === "observation").length;
  const correctCount = items.filter((i) => i.classification === "correct").length;
  const hasFindings = criticalCount > 0 || observationCount > 0;

  const priorityMap: Record<ResultClassification, number> = {
    critical: 1,
    observation: 2,
    correct: 3,
    unknown: 4,
  };

  const sortedItems = [...items].sort(
    (a, b) => priorityMap[a.classification] - priorityMap[b.classification],
  );

  return {
    items: sortedItems,
    total: DIAGNOSTIC_QUESTIONS.length,
    criticalCount,
    observationCount,
    correctCount,
    hasFindings,
  };
}

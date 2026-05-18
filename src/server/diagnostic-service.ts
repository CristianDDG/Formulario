import { EMAIL_CONFIG, STATUS_CONFIG, TOTAL_QUESTIONS } from "@/constants/diagnostics";
import type { DiagnosticReportPayload } from "@/types/diagnostic";
import { sendDiagnosticReportEmails } from "./mailer";
import { isValidEmail } from "@/lib/utils";

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

type DiagnosticServiceEnv = {
  INTERNAL_REPORT_EMAIL?: string;
  MAIL_FROM?: string;
  RESEND_API_KEY?: string;
};

type ProcessDiagnosticResult =
  | {
      ok: true;
      status: number;
      sentAt: string;
      clientEmail: string;
      internalEmail: string;
    }
  | {
      ok: false;
      status: number;
      error: string;
    };

interface SubmissionInput {
  payload: unknown;
  pdfBase64?: string;
  pdfFilename?: string;
}

function normalizeText(raw: unknown, label: string, maxLength: number): string {
  if (typeof raw !== "string") {
    throw new Error(`${label} debe ser texto.`);
  }

  const normalized = raw.trim().replace(/\s+/g, " ");
  if (normalized.length > maxLength) {
    throw new Error(`${label} excede ${maxLength} caracteres.`);
  }

  return normalized;
}

function normalizeObservation(raw: unknown, label: string, maxLength: number): string {
  if (raw === undefined || raw === null) {
    return "";
  }

  if (typeof raw !== "string") {
    throw new Error(`${label} debe ser texto.`);
  }

  const normalized = raw.trim();
  if (normalized.length > maxLength) {
    throw new Error(`${label} excede ${maxLength} caracteres.`);
  }

  return normalized;
}

function getHealthLabel(porcentaje: number): string {
  if (porcentaje >= STATUS_CONFIG.healthy.minScore) return STATUS_CONFIG.healthy.label;
  if (porcentaje >= STATUS_CONFIG.medium.minScore) return STATUS_CONFIG.medium.label;
  return STATUS_CONFIG.critical.label;
}

function validateAndNormalizePayload(input: unknown): DiagnosticReportPayload {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Payload inválido.");
  }

  const source = input as Record<string, unknown>;
  const contactoRaw = source.contacto;
  const respuestasRaw = source.respuestas;

  if (!contactoRaw || typeof contactoRaw !== "object" || Array.isArray(contactoRaw)) {
    throw new Error("Campo contacto inválido.");
  }
  if (!Array.isArray(respuestasRaw)) {
    throw new Error("Campo respuestas inválido.");
  }

  if (respuestasRaw.length !== TOTAL_QUESTIONS) {
    throw new Error(`Se esperaban ${TOTAL_QUESTIONS} respuestas.`);
  }

  const contactoSource = contactoRaw as Record<string, unknown>;
  const cliente = normalizeText(source.cliente, "Cliente", 160);
  const ubicacion = normalizeText(source.ubicacion, "Ubicación", 160);
  const fecha = normalizeText(source.fecha, "Fecha", 40);
  const nombreCompleto = normalizeText(contactoSource.nombreCompleto, "Nombre completo", 160);
  const telefono = normalizeObservation(contactoSource.telefono, "Teléfono", 40);
  const correo = normalizeText(contactoSource.correo, "Correo", 254).toLowerCase();

  if (!isValidEmail(correo)) {
    throw new Error("Correo electrónico inválido.");
  }

  const respuestas = respuestasRaw.map((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`Respuesta ${index + 1} inválida.`);
    }

    const record = item as Record<string, unknown>;
    const estado = record.estado;
    if (estado !== "Saludable" && estado !== "Crítico") {
      throw new Error(`Estado inválido en respuesta ${index + 1}.`);
    }

    const n = typeof record.n === "number" ? record.n : index + 1;
    if (!Number.isInteger(n) || n < 1 || n > TOTAL_QUESTIONS) {
      throw new Error(`Número inválido en respuesta ${index + 1}.`);
    }

    return {
      n,
      pregunta: normalizeText(record.pregunta, `Pregunta ${index + 1}`, 220),
      estado: estado as "Saludable" | "Crítico",
      observacion: normalizeObservation(record.observacion, `Observación ${index + 1}`, 1200),
    };
  });

  const healthyPoints = respuestas.filter((item) => item.estado === "Saludable").length;
  const total = TOTAL_QUESTIONS;
  const percentage = Math.round((healthyPoints / total) * 100);
  const valoracion = getHealthLabel(percentage);

  const timestampRaw = source.timestamp;
  const timestamp =
    typeof timestampRaw === "string" && ISO_DATE_REGEX.test(timestampRaw)
      ? timestampRaw
      : new Date().toISOString();

  return {
    contacto: {
      nombreCompleto,
      telefono,
      correo,
    },
    cliente,
    ubicacion,
    fecha,
    respuestas,
    puntuacion: {
      puntos: healthyPoints,
      total,
      porcentaje: percentage,
      valoracion,
    },
    timestamp,
  };
}

function normalizeSubmissionInput(input: unknown): SubmissionInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { payload: input };
  }

  const source = input as Record<string, unknown>;
  const hasWrappedPayload = "payload" in source;

  const payload = hasWrappedPayload ? source.payload : input;
  const pdfBase64 = typeof source.pdfBase64 === "string" ? source.pdfBase64.trim() : undefined;
  const pdfFilename =
    typeof source.pdfFilename === "string" ? source.pdfFilename.trim() : undefined;

  return { payload, pdfBase64, pdfFilename };
}

function sanitizeAttachmentFilename(filename: string): string {
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]+/g, "_");
  if (sanitized.length === 0) {
    return "diagnostico.pdf";
  }
  return sanitized.toLowerCase().endsWith(".pdf") ? sanitized : `${sanitized}.pdf`;
}

function normalizePdfAttachmentBase64(base64: string): string {
  const normalized = base64.replace(/^data:application\/pdf;base64,/i, "").replace(/\s+/g, "");

  if (normalized.length === 0) {
    throw new Error("El adjunto PDF está vacío.");
  }

  if (normalized.length > 20 * 1024 * 1024) {
    throw new Error("El adjunto PDF excede el tamaño máximo permitido.");
  }

  if (!/^[A-Za-z0-9+/=]+$/.test(normalized)) {
    throw new Error("El adjunto PDF contiene caracteres inválidos.");
  }

  return normalized;
}

function getEmailConfig(env: DiagnosticServiceEnv): {
  internalReportEmail: string;
  mailFrom: string;
} {
  const internalReportEmail = (
    env.INTERNAL_REPORT_EMAIL ||
    process.env.INTERNAL_REPORT_EMAIL ||
    EMAIL_CONFIG.internalReportEmail
  ).trim();
  const mailFrom = (env.MAIL_FROM || process.env.MAIL_FROM || EMAIL_CONFIG.mailFrom).trim();

  if (!isValidEmail(internalReportEmail)) {
    throw new Error("INTERNAL_REPORT_EMAIL no es válido.");
  }

  if (!isValidEmail(mailFrom)) {
    throw new Error("MAIL_FROM no es válido.");
  }

  return { internalReportEmail, mailFrom };
}

async function generateDiagnosisPDF(payload: DiagnosticReportPayload): Promise<Blob> {
  const jsPDFModule = await import("jspdf");
  const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default || jsPDFModule;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const margin = 16;
  const lineHeight = 7;
  const pageWidth = doc.internal.pageSize.getWidth();
  let cursorY = margin;

  const addSectionTitle = (title: string) => {
    doc.setFontSize(14);
    doc.setTextColor("#082247");
    doc.setFont("helvetica", "bold");
    doc.text(title, margin, cursorY);
    cursorY += lineHeight;
    doc.setDrawColor("#082247");
    doc.setLineWidth(0.5);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += lineHeight;
  };

  const addText = (text: string, options: { fontSize?: number; bold?: boolean } = {}) => {
    doc.setFontSize(options.fontSize ?? 11);
    doc.setFont("helvetica", options.bold ? "bold" : "normal");
    const wrapped = doc.splitTextToSize(text, pageWidth - margin * 2);
    doc.text(wrapped, margin, cursorY);
    cursorY += wrapped.length * (options.fontSize ?? 11) * 0.35 + 2;
  };

  addSectionTitle("Diagnóstico de Salud de Infraestructura IT");
  addText(`Cliente: ${payload.cliente}`, { bold: true });
  addText(`Ubicación: ${payload.ubicacion}`);
  addText(`Fecha: ${payload.fecha}`);
  addText(`Responsable: ${payload.contacto.nombreCompleto}`);
  addText(`Correo: ${payload.contacto.correo}`);
  addText(`Teléfono: ${payload.contacto.telefono || "No proporcionado"}`);

  cursorY += lineHeight;
  addSectionTitle("Resultado general");
  addText(`Puntos saludables: ${payload.puntuacion.puntos} de ${payload.puntuacion.total}`);
  addText(`Porcentaje: ${payload.puntuacion.porcentaje}%`);
  addText(`Estado: ${payload.puntuacion.valoracion}`);

  cursorY += lineHeight;
  addSectionTitle("Detalle de respuestas");

  for (const respuesta of payload.respuestas) {
    const line = `${respuesta.n}. ${respuesta.pregunta} - ${respuesta.estado}`;
    const wrapped = doc.splitTextToSize(line, pageWidth - margin * 2);
    if (cursorY + wrapped.length * lineHeight > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      cursorY = margin;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(wrapped, margin, cursorY);
    cursorY += wrapped.length * 5.5;

    if (respuesta.observacion) {
      const observation = `Observación: ${respuesta.observacion}`;
      const wrappedObs = doc.splitTextToSize(observation, pageWidth - margin * 2);
      if (cursorY + wrappedObs.length * lineHeight > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        cursorY = margin;
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(wrappedObs, margin, cursorY);
      cursorY += wrappedObs.length * 5.5 + 2;
    }

    cursorY += 2;
  }

  const pdfArrayBuffer = doc.output("arraybuffer");
  return new Blob([pdfArrayBuffer], { type: "application/pdf" });
}

export async function processDiagnosticSubmission(
  input: unknown,
  env: DiagnosticServiceEnv,
): Promise<ProcessDiagnosticResult> {
  try {
    const parsedInput = normalizeSubmissionInput(input);
    const payload = validateAndNormalizePayload(parsedInput.payload);
    const config = getEmailConfig(env);

    const safeCliente = payload.cliente.replace(/[^a-zA-Z0-9_-]+/g, "_");
    const safeFecha = payload.fecha.replace(/[^a-zA-Z0-9_-]+/g, "_");
    const fallbackFilename = `Diagnostico_${safeCliente}_${safeFecha}.pdf`;

    let attachmentBase64: string;
    let attachmentFilename: string;

    if (parsedInput.pdfBase64) {
      attachmentBase64 = normalizePdfAttachmentBase64(parsedInput.pdfBase64);
      attachmentFilename = sanitizeAttachmentFilename(parsedInput.pdfFilename || fallbackFilename);
    } else {
      const pdfBlob = await generateDiagnosisPDF(payload);
      const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer());
      attachmentBase64 = pdfBuffer.toString("base64");
      attachmentFilename = fallbackFilename;
    }

    const delivery = await sendDiagnosticReportEmails(
      payload,
      { filename: attachmentFilename, base64Content: attachmentBase64 },
      {
        INTERNAL_REPORT_EMAIL: config.internalReportEmail,
        MAIL_FROM: config.mailFrom,
        RESEND_API_KEY: env.RESEND_API_KEY,
      },
    );

    return {
      ok: true,
      status: 200,
      sentAt: delivery.sentAt,
      clientEmail: delivery.clientEmail,
      internalEmail: delivery.internalEmail,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error procesando diagnóstico.";

    if (message.includes("inválido") || message.includes("debe") || message.includes("esperaban")) {
      return { ok: false, status: 400, error: message };
    }

    return { ok: false, status: 500, error: message };
  }
}

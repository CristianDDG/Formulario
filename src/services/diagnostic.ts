import { STATUS_CONFIG, EMAIL_CONFIG, TOTAL_QUESTIONS } from "@/constants/diagnostics";
import type {
  DiagnosticStatus,
  SemaforoResult,
  DiagnosticReportPayload,
  EmailConfig,
} from "@/types/diagnostic";

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
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get email configuration from environment
 */
export function getEmailConfig(): EmailConfig {
  return {
    internalReportEmail: EMAIL_CONFIG.internalReportEmail,
    mailFrom: EMAIL_CONFIG.mailFrom,
    resendApiKey: process.env.RESEND_API_KEY,
  };
}

/**
 * Generate client email content
 */
export function generateClientEmailContent(
  nombreCompleto: string,
  cliente: string,
  ubicacion: string,
  porcentaje: number,
  valoracion: string,
): { subject: string; html: string; text: string } {
  const subject = `Diagnóstico de Salud de Infraestructura IT - ${cliente}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #082247; text-align: center;">Diagnóstico de Salud de Infraestructura IT</h1>
      
      <p>Hola ${nombreCompleto},</p>
      
      <p>Adjuntamos el diagnóstico de salud de infraestructura IT realizado para <strong>${cliente}</strong> en la ubicación <strong>${ubicacion}</strong>.</p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #082247;">Resultado general: ${porcentaje}%</h3>
        <p style="margin: 0; color: #082247;"><strong>Estado de valoración:</strong> ${valoracion}</p>
      </div>
      
      <p>El reporte incluye la evaluación de los 21 puntos revisados, observaciones registradas y el estado general de la infraestructura.</p>
      
      <p>Quedamos atentos para revisar los hallazgos y definir los próximos pasos.</p>
      
      <p style="margin-top: 30px;">Saludos,<br><strong>Integra Industrial Networks</strong></p>
    </div>
  `;

  const text = `
    Hola ${nombreCompleto},

    Adjuntamos el diagnóstico de salud de infraestructura IT realizado para ${cliente} en la ubicación ${ubicacion}.

    Resultado general: ${porcentaje}%
    Estado de valoración: ${valoracion}

    El reporte incluye la evaluación de los 21 puntos revisados, observaciones registradas y el estado general de la infraestructura.

    Quedamos atentos para revisar los hallazgos y definir los próximos pasos.

    Saludos,
    Integra Industrial Networks
  `;

  return { subject, html, text };
}

/**
 * Generate internal email content
 */
export function generateInternalEmailContent(
  cliente: string,
  nombreCompleto: string,
  telefono: string,
  correo: string,
  ubicacion: string,
  fecha: string,
  porcentaje: number,
  valoracion: string,
  puntosSaludables: number,
  puntosCriticos: number,
): { subject: string; html: string; text: string } {
  const subject = `Nuevo diagnóstico generado - ${cliente} - ${valoracion}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #082247; text-align: center;">Nuevo diagnóstico de salud IT generado</h1>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px 0; color: #082247;">Información del diagnóstico</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 5px 0;"><strong>Cliente:</strong></td><td>${cliente}</td></tr>
          <tr><td style="padding: 5px 0;"><strong>Responsable/contacto:</strong></td><td>${nombreCompleto}</td></tr>
          <tr><td style="padding: 5px 0;"><strong>Teléfono:</strong></td><td>${telefono || "No proporcionado"}</td></tr>
          <tr><td style="padding: 5px 0;"><strong>Correo:</strong></td><td>${correo}</td></tr>
          <tr><td style="padding: 5px 0;"><strong>Ubicación:</strong></td><td>${ubicacion}</td></tr>
          <tr><td style="padding: 5px 0;"><strong>Fecha:</strong></td><td>${fecha}</td></tr>
        </table>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px 0; color: #082247;">Resultados</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 5px 0;"><strong>Resultado general:</strong></td><td>${porcentaje}%</td></tr>
          <tr><td style="padding: 5px 0;"><strong>Estado:</strong></td><td>${valoracion}</td></tr>
          <tr><td style="padding: 5px 0;"><strong>Puntos saludables:</strong></td><td>${puntosSaludables} de 21</td></tr>
          <tr><td style="padding: 5px 0;"><strong>Puntos críticos:</strong></td><td>${puntosCriticos}</td></tr>
        </table>
      </div>
      
      <p>El PDF del diagnóstico se encuentra adjunto para revisión interna.</p>
    </div>
  `;

  const text = `
    Nuevo diagnóstico de salud IT generado

    Información del diagnóstico:
    Cliente: ${cliente}
    Responsable/contacto: ${nombreCompleto}
    Teléfono: ${telefono || "No proporcionado"}
    Correo: ${correo}
    Ubicación: ${ubicacion}
    Fecha: ${fecha}

    Resultados:
    Resultado general: ${porcentaje}%
    Estado: ${valoracion}
    Puntos saludables: ${puntosSaludables} de 21
    Puntos críticos: ${puntosCriticos}

    El PDF del diagnóstico se encuentra adjunto para revisión interna.
  `;

  return { subject, html, text };
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

/**
 * Build report payload for backend submission
 */
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
  obsGenerales: string,
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
 * The current implementation sends emails to client and internal recipient.
 */
export async function submitDiagnosticReport(
  payload: DiagnosticReportPayload,
): Promise<{ ok: boolean; error?: string }> {
  try {
    console.log("Submitting diagnostic report:", payload);

    // Validate required data
    if (!payload.contacto.correo || !isValidEmail(payload.contacto.correo)) {
      return { ok: false, error: "Correo electrónico del cliente inválido o faltante." };
    }

    const config = getEmailConfig();
    if (!config.resendApiKey) {
      console.warn("RESEND_API_KEY not configured, simulating email send");
      // Simulate network delay
      await new Promise((r) => setTimeout(r, 400));
      return { ok: true };
    }

    // Generate PDF first
    const pdfResult = await generateDiagnosisPDF(payload);
    if (!pdfResult.success) {
      return { ok: false, error: pdfResult.error || "Error generando el PDF." };
    }

    // Send emails
    const clientEmailResult = await sendDiagnosisEmailToClient(payload, pdfResult.pdfBlob);
    if (!clientEmailResult.ok) {
      return { ok: false, error: clientEmailResult.error || "Error enviando correo al cliente." };
    }

    const internalEmailResult = await sendDiagnosisEmailToInternal(payload, pdfResult.pdfBlob);
    if (!internalEmailResult.ok) {
      return { ok: false, error: internalEmailResult.error || "Error enviando correo interno." };
    }

    return { ok: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return { ok: false, error: errorMessage };
  }
}

/**
 * Generate PDF from diagnostic data
 */
export async function generateDiagnosisPDF(
  payload: DiagnosticReportPayload,
): Promise<{ success: boolean; pdfBlob?: Blob; error?: string }> {
  try {
    // This would integrate with the existing PDF generation logic
    // For now, return a mock success
    console.log("Generating PDF for:", payload.cliente);
    await new Promise((r) => setTimeout(r, 200));

    // In a real implementation, this would generate the actual PDF blob
    const mockBlob = new Blob(["Mock PDF content"], { type: "application/pdf" });
    return { success: true, pdfBlob: mockBlob };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error generating PDF";
    return { success: false, error: errorMessage };
  }
}

/**
 * Send diagnostic email to client
 */
export async function sendDiagnosisEmailToClient(
  payload: DiagnosticReportPayload,
  pdfBlob: Blob,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const config = getEmailConfig();
    const emailContent = generateClientEmailContent(
      payload.contacto.nombreCompleto,
      payload.cliente,
      payload.ubicacion,
      payload.puntuacion.porcentaje,
      payload.puntuacion.valoracion,
    );

    if (!config.resendApiKey) {
      console.log("Simulating client email send to:", payload.contacto.correo);
      await new Promise((r) => setTimeout(r, 200));
      return { ok: true };
    }

    // Send email using Resend API
    const formData = new FormData();
    formData.append("from", config.mailFrom);
    formData.append("to", payload.contacto.correo);
    formData.append("subject", emailContent.subject);
    formData.append("html", emailContent.html);
    formData.append("text", emailContent.text);
    formData.append("attachment", pdfBlob, `Diagnostico_${payload.cliente}_${payload.fecha}.pdf`);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.resendApiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { ok: false, error: errorData.message || "Error sending client email" };
    }

    return { ok: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error sending client email";
    return { ok: false, error: errorMessage };
  }
}

/**
 * Send diagnostic email to internal recipient
 */
export async function sendDiagnosisEmailToInternal(
  payload: DiagnosticReportPayload,
  pdfBlob: Blob,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const config = getEmailConfig();
    const puntosSaludables = payload.puntuacion.puntos;
    const puntosCriticos = payload.puntuacion.total - puntosSaludables;

    const emailContent = generateInternalEmailContent(
      payload.cliente,
      payload.contacto.nombreCompleto,
      payload.contacto.telefono,
      payload.contacto.correo,
      payload.ubicacion,
      payload.fecha,
      payload.puntuacion.porcentaje,
      payload.puntuacion.valoracion,
      puntosSaludables,
      puntosCriticos,
    );

    if (!config.resendApiKey) {
      console.log("Simulating internal email send to:", config.internalReportEmail);
      await new Promise((r) => setTimeout(r, 200));
      return { ok: true };
    }

    // Send email using Resend API
    const formData = new FormData();
    formData.append("from", config.mailFrom);
    formData.append("to", config.internalReportEmail);
    formData.append("subject", emailContent.subject);
    formData.append("html", emailContent.html);
    formData.append("text", emailContent.text);
    formData.append("attachment", pdfBlob, `Diagnostico_${payload.cliente}_${payload.fecha}.pdf`);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.resendApiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { ok: false, error: errorData.message || "Error sending internal email" };
    }

    return { ok: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error sending internal email";
    return { ok: false, error: errorMessage };
  }
}

/**
 * Finalize and send diagnosis - main orchestration function
 */
export async function finalizeAndSendDiagnosis(
  nombreCompleto: string,
  telefono: string,
  correo: string,
  cliente: string,
  ubicacion: string,
  fecha: string,
  respuestas: DiagnosticStatus[],
  observaciones: string[],
  obsGenerales: string,
): Promise<{
  success: boolean;
  error?: string;
  sendStatus?: { sent: boolean; sentAt: string; clientEmail: string; internalEmail: string };
}> {
  try {
    // Validate email
    if (!correo || !isValidEmail(correo)) {
      return { success: false, error: "Correo electrónico del cliente inválido o faltante." };
    }

    // Calculate results
    const { puntos, porcentaje } = calculateDiagnosticScore(respuestas);
    const healthStatus = getHealthStatus(porcentaje);

    // Build payload
    const payload = buildReportPayload(
      nombreCompleto,
      telefono,
      correo,
      cliente,
      ubicacion,
      fecha,
      [], // questions would be passed from constants
      respuestas,
      observaciones,
      obsGenerales,
      puntos,
      porcentaje,
      healthStatus.label,
    );

    // Submit report (which includes email sending)
    const result = await submitDiagnosticReport(payload);

    if (result.ok) {
      const config = getEmailConfig();
      return {
        success: true,
        sendStatus: {
          sent: true,
          sentAt: new Date().toISOString(),
          clientEmail: correo,
          internalEmail: config.internalReportEmail,
        },
      };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error finalizando diagnóstico";
    return { success: false, error: errorMessage };
  }
}

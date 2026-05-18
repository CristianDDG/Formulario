import { render, toPlainText } from "@react-email/render";
import { createElement } from "react";
import { EMAIL_CONFIG } from "@/constants/diagnostics";
import DiagnosticReportEmail from "@/emails/DiagnosticReportEmail";
import type { DiagnosticReportPayload } from "@/types/diagnostic";
import { getResendClient } from "./resend";

interface MailerEnv {
  INTERNAL_REPORT_EMAIL?: string;
  MAIL_FROM?: string;
  RESEND_API_KEY?: string;
}

interface MailAttachment {
  filename: string;
  base64Content: string;
}

interface MailDeliveryResult {
  sentAt: string;
  clientEmail: string;
  internalEmail: string;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function resolveMailFrom(env: MailerEnv): string {
  const from = (env.MAIL_FROM || process.env.MAIL_FROM || EMAIL_CONFIG.mailFrom).trim();
  if (!isValidEmail(from)) {
    throw new Error("MAIL_FROM no es válido.");
  }
  return from;
}

function resolveInternalRecipients(env: MailerEnv): string[] {
  const rawValue =
    env.INTERNAL_REPORT_EMAIL ||
    process.env.INTERNAL_REPORT_EMAIL ||
    EMAIL_CONFIG.internalReportEmail;
  const recipients = rawValue
    .split(/[;,]/)
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (recipients.length === 0) {
    throw new Error("INTERNAL_REPORT_EMAIL no está configurado.");
  }

  const invalidRecipient = recipients.find((entry) => !isValidEmail(entry));
  if (invalidRecipient) {
    throw new Error(`INTERNAL_REPORT_EMAIL contiene un correo inválido: ${invalidRecipient}`);
  }

  return [...new Set(recipients)];
}

function formatTimestampLabel(timestamp: string): string {
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) {
    return "fecha no disponible";
  }

  return parsed.toLocaleString("es-MX", {
    dateStyle: "long",
    timeStyle: "short",
    hour12: false,
    timeZone: "America/Mexico_City",
  });
}

async function sendEmailViaResend(input: {
  env: MailerEnv;
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
  attachment: MailAttachment;
}) {
  const resend = getResendClient(input.env);

  const { error } = await resend.emails.send({
    from: input.from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
    attachments: [
      {
        filename: input.attachment.filename,
        content: input.attachment.base64Content,
      },
    ],
  });

  if (error) {
    throw new Error(error.message || "No se pudo enviar correo con Resend.");
  }
}

export async function sendDiagnosticReportEmails(
  payload: DiagnosticReportPayload,
  attachment: MailAttachment,
  env: MailerEnv,
): Promise<MailDeliveryResult> {
  const from = resolveMailFrom(env);
  const internalRecipients = resolveInternalRecipients(env);
  const clientRecipient = payload.contacto.correo.trim().toLowerCase();

  if (!isValidEmail(clientRecipient)) {
    throw new Error("Correo del cliente inválido.");
  }

  const generatedAtLabel = formatTimestampLabel(payload.timestamp);
  const emailBaseProps = {
    generatedAtLabel,
    logoUrl:
      "https://www.integraindustrialnetworks.com/wp-content/uploads/2024/11/integra-logo.png",
    websiteUrl: "https://www.integraindustrialnetworks.com",
    supportEmail: internalRecipients[0],
    supportPhone: "442 749 0997",
    clientName: payload.contacto.nombreCompleto,
    clientCompany: payload.cliente,
    contactName: payload.contacto.nombreCompleto,
    contactPhone: payload.contacto.telefono,
    contactEmail: payload.contacto.correo,
    location: payload.ubicacion,
    reportDate: payload.fecha,
    totalPoints: payload.puntuacion.total,
    healthyPoints: payload.puntuacion.puntos,
    percentage: payload.puntuacion.porcentaje,
    statusLabel: payload.puntuacion.valoracion,
  } as const;

  const clientHtml = await render(
    createElement(DiagnosticReportEmail, { ...emailBaseProps, audience: "client" }),
  );
  const clientText = toPlainText(clientHtml);

  await sendEmailViaResend({
    env,
    from,
    to: [clientRecipient],
    subject: `Diagnóstico de Salud IT - ${payload.cliente}`,
    html: clientHtml,
    text: clientText,
    attachment,
  });

  const internalHtml = await render(
    createElement(DiagnosticReportEmail, { ...emailBaseProps, audience: "internal" }),
  );
  const internalText = toPlainText(internalHtml);
  const recipientsWithoutClient = internalRecipients.filter(
    (address) => address.toLowerCase() !== clientRecipient,
  );

  if (recipientsWithoutClient.length > 0) {
    await sendEmailViaResend({
      env,
      from,
      to: recipientsWithoutClient,
      subject: `Nuevo diagnóstico generado - ${payload.cliente} (${payload.puntuacion.valoracion})`,
      html: internalHtml,
      text: internalText,
      attachment,
    });
  }

  return {
    sentAt: new Date().toISOString(),
    clientEmail: clientRecipient,
    internalEmail: internalRecipients.join(", "),
  };
}

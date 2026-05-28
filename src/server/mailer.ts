import { render, toPlainText } from "@react-email/render";
import { createElement } from "react";
import { EMAIL_CONFIG } from "@/constants/diagnostics";
import DiagnosticReportEmail from "@/emails/DiagnosticReportEmail";
import type { DiagnosticReportPayload } from "@/types/diagnostic";
import {
  EMAIL_LOGO_CID_SRC,
  getEmailInlineLogoAttachment,
  type EmailInlineLogoAttachment,
} from "./email-assets";
import { getResendClient } from "./resend";
import { isValidEmail } from "@/lib/utils";

interface MailerEnv {
  INTERNAL_REPORT_EMAIL?: string;
  MAIL_FROM?: string;
  RESEND_API_KEY?: string;
  PUBLIC_LOGO_URL?: string;
}

interface MailAttachment {
  filename: string;
  base64Content: string;
}

interface ResendAttachment {
  filename: string;
  content: string;
  contentId?: string;
  contentType?: string;
}

interface MailDeliveryResult {
  sentAt: string;
  clientEmail: string;
  internalEmail: string;
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

function resolveLogoUrl(env: MailerEnv): string {
  const url = (env.PUBLIC_LOGO_URL || process.env.PUBLIC_LOGO_URL || "").trim();
  return url || EMAIL_LOGO_CID_SRC;
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

function buildResendAttachments(
  pdfAttachment: MailAttachment,
  inlineLogo?: EmailInlineLogoAttachment,
): ResendAttachment[] {
  const attachments: ResendAttachment[] = [
    {
      filename: pdfAttachment.filename,
      content: pdfAttachment.base64Content,
      contentType: "application/pdf",
    },
  ];

  if (inlineLogo) {
    attachments.push({
      filename: inlineLogo.filename,
      content: inlineLogo.content,
      contentId: inlineLogo.contentId,
      contentType: inlineLogo.contentType,
    });
  }

  return attachments;
}

async function sendEmailViaResend(input: {
  env: MailerEnv;
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
  attachment: MailAttachment;
  inlineLogo?: EmailInlineLogoAttachment;
}) {
  const resend = getResendClient(input.env);

  const { error } = await resend.emails.send({
    from: input.from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
    attachments: buildResendAttachments(input.attachment, input.inlineLogo),
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

  // Decide whether to use absolute public logo URL or fallback inline CID logo
  const logoUrl = resolveLogoUrl(env);
  const isCidLogo = logoUrl.startsWith("cid:");
  const inlineLogo = isCidLogo ? getEmailInlineLogoAttachment() : undefined;

  const emailBaseProps = {
    generatedAtLabel,
    logoUrl,
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
    subject: `Diagnóstico Técnico IT - ${payload.cliente}`,
    html: clientHtml,
    text: clientText,
    attachment,
    inlineLogo,
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
      inlineLogo,
    });
  }

  return {
    sentAt: new Date().toISOString(),
    clientEmail: clientRecipient,
    internalEmail: internalRecipients.join(", "),
  };
}

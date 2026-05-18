import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { EmailFooter } from "./components/EmailFooter";
import { EmailHeader } from "./components/EmailHeader";
import { StatusCard } from "./components/StatusCard";
import { SummaryCard } from "./components/SummaryCard";

export interface DiagnosticReportEmailProps {
  generatedAtLabel: string;
  logoUrl: string;
  websiteUrl: string;
  supportEmail: string;
  supportPhone: string;
  audience: "client" | "internal";
  clientName: string;
  clientCompany: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  location: string;
  reportDate: string;
  totalPoints: number;
  healthyPoints: number;
  percentage: number;
  statusLabel: string;
}

export function DiagnosticReportEmail(props: DiagnosticReportEmailProps) {
  const previewText =
    props.audience === "client"
      ? `Diagnóstico IT ${props.clientCompany}: ${props.percentage}% ${props.statusLabel}`
      : `Nuevo diagnóstico IT registrado para ${props.clientCompany}`;

  const greeting =
    props.audience === "client" ? `Hola ${props.contactName},` : "Hola equipo Integra,";

  const mainMessage =
    props.audience === "client"
      ? "Se ha generado correctamente un nuevo diagnóstico de salud IT para la infraestructura evaluada."
      : "Se registró un nuevo diagnóstico de salud IT. El reporte PDF completo va adjunto para seguimiento interno.";

  return (
    <Html lang="es">
      <Head />
      <Preview>{previewText}</Preview>
      <Body
        style={{
          margin: "0",
          padding: "0",
          backgroundColor: "#f2f5fa",
          fontFamily: "Segoe UI, Arial, sans-serif",
        }}
      >
        <Container
          style={{ width: "100%", maxWidth: "920px", margin: "0 auto", padding: "24px 12px 28px" }}
        >
          <EmailHeader generatedAtLabel={props.generatedAtLabel} logoUrl={props.logoUrl} />

          <Section
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "0 0 12px 12px",
              padding: "24px 22px",
            }}
          >
            <Text
              style={{
                margin: "0 0 12px",
                color: "#082247",
                fontSize: "30px",
                lineHeight: "36px",
                fontWeight: "800",
              }}
            >
              {greeting}
            </Text>
            <Text
              style={{ margin: "0 0 8px", color: "#2f435f", fontSize: "20px", lineHeight: "30px" }}
            >
              {mainMessage}
            </Text>
            <Text style={{ margin: "0", color: "#2f435f", fontSize: "20px", lineHeight: "30px" }}>
              Adjunto encontrarás el PDF completo con el detalle de cada punto evaluado.
            </Text>
          </Section>

          <Section style={{ marginTop: "20px" }}>
            <Text
              style={{
                margin: "0 0 10px",
                color: "#082247",
                fontSize: "28px",
                lineHeight: "34px",
                fontWeight: "800",
              }}
            >
              Resumen del diagnóstico
            </Text>
            <SummaryCard
              leftItems={[
                { label: "Cliente", value: props.clientCompany },
                { label: "Contacto", value: props.contactName },
                { label: "Teléfono", value: props.contactPhone || "No proporcionado" },
                { label: "Correo", value: props.contactEmail, isLink: true },
              ]}
              rightItems={[
                { label: "Ubicación", value: props.location },
                { label: "Fecha", value: props.reportDate },
                { label: "Total de puntos evaluados", value: String(props.totalPoints) },
                { label: "Puntos en estado saludable", value: String(props.healthyPoints) },
              ]}
            />
          </Section>

          <Section style={{ marginTop: "20px" }}>
            <Text
              style={{
                margin: "0 0 10px",
                color: "#082247",
                fontSize: "28px",
                lineHeight: "34px",
                fontWeight: "800",
              }}
            >
              Resultado general
            </Text>
            <StatusCard
              percentage={props.percentage}
              statusLabel={props.statusLabel}
              healthyPoints={props.healthyPoints}
              totalPoints={props.totalPoints}
            />
          </Section>

          <Section
            style={{
              marginTop: "20px",
              border: "1px solid #d8e0ec",
              borderRadius: "12px",
              backgroundColor: "#ffffff",
              padding: "18px 20px",
            }}
          >
            <Text
              style={{
                margin: "0 0 8px",
                color: "#082247",
                fontSize: "24px",
                lineHeight: "30px",
                fontWeight: "800",
              }}
            >
              Reporte completo adjunto
            </Text>
            <Text
              style={{ margin: "0 0 16px", color: "#2f435f", fontSize: "19px", lineHeight: "28px" }}
            >
              El PDF con el detalle del diagnóstico fue adjuntado automáticamente en este correo.
            </Text>
            <Button
              href={props.websiteUrl}
              style={{
                backgroundColor: "#ff7a00",
                color: "#ffffff",
                fontWeight: "700",
                textDecoration: "none",
                padding: "12px 22px",
                borderRadius: "10px",
                fontSize: "18px",
              }}
            >
              Contactar especialista
            </Button>
            <Text
              style={{ margin: "14px 0 0", color: "#486284", fontSize: "15px", lineHeight: "22px" }}
            >
              Si deseas seguimiento técnico, responde este correo o escribe a{" "}
              <Link href={`mailto:${props.supportEmail}`} style={{ color: "#1261d7" }}>
                {props.supportEmail}
              </Link>
              .
            </Text>
          </Section>

          <EmailFooter
            websiteUrl={props.websiteUrl}
            contactEmail={props.supportEmail}
            contactPhone={props.supportPhone}
          />
        </Container>
      </Body>
    </Html>
  );
}

export default DiagnosticReportEmail;

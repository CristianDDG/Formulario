import { Column, Img, Row, Section, Text } from "@react-email/components";
import * as React from "react";

interface EmailHeaderProps {
  generatedAtLabel: string;
  logoUrl: string;
}

export function EmailHeader({ generatedAtLabel, logoUrl }: EmailHeaderProps) {
  return (
    <Section
      style={{
        backgroundColor: "#0b2a57",
        borderRadius: "14px 14px 0 0",
        overflow: "hidden",
      }}
    >
      <Text
        style={{
          color: "#d7e2f1",
          fontSize: "12px",
          lineHeight: "18px",
          textAlign: "right",
          margin: "0",
          padding: "12px 20px 0",
        }}
      >
        Diagnóstico generado el {generatedAtLabel}
      </Text>
      <Row>
        <Column style={{ width: "34%", padding: "20px 0 20px 24px", verticalAlign: "middle" }}>
          <Img src={logoUrl} alt="Integra Industrial Networks" width="164" height="164" />
        </Column>
        <Column style={{ width: "66%", padding: "20px 24px 24px", verticalAlign: "middle" }}>
          <Text
            style={{
              margin: "0 0 8px",
              color: "#ffffff",
              fontSize: "44px",
              lineHeight: "48px",
              fontWeight: "800",
            }}
          >
            Nuevo diagnóstico
          </Text>
          <Text
            style={{
              margin: "0",
              color: "#ff7a00",
              fontSize: "44px",
              lineHeight: "48px",
              fontWeight: "800",
            }}
          >
            de salud IT
          </Text>
          <Text
            style={{
              margin: "16px 0 0",
              color: "#d7e2f1",
              fontSize: "24px",
              lineHeight: "32px",
            }}
          >
            Reporte técnico corporativo
          </Text>
        </Column>
      </Row>
    </Section>
  );
}

import { Column, Link, Row, Section, Text } from "@react-email/components";
import * as React from "react";

interface EmailFooterProps {
  websiteUrl: string;
  contactEmail: string;
  contactPhone: string;
}

export function EmailFooter({ websiteUrl, contactEmail, contactPhone }: EmailFooterProps) {
  return (
    <Section
      style={{
        marginTop: "24px",
        backgroundColor: "#082247",
        borderRadius: "12px",
        padding: "22px",
      }}
    >
      <Row>
        <Column style={{ width: "40%", verticalAlign: "top" }}>
          <Text
            style={{
              margin: "0 0 8px",
              color: "#ffffff",
              fontSize: "24px",
              lineHeight: "30px",
              fontWeight: "800",
            }}
          >
            INTEGRA
          </Text>
          <Text
            style={{
              margin: "0",
              color: "#d7e2f1",
              fontSize: "16px",
              lineHeight: "22px",
              fontWeight: "600",
            }}
          >
            INDUSTRIAL NETWORKS
          </Text>
        </Column>
        <Column style={{ width: "60%", verticalAlign: "top" }}>
          <Text
            style={{ margin: "0 0 6px", color: "#d7e2f1", fontSize: "15px", lineHeight: "21px" }}
          >
            Tel: {contactPhone}
          </Text>
          <Text
            style={{ margin: "0 0 6px", color: "#d7e2f1", fontSize: "15px", lineHeight: "21px" }}
          >
            Correo: {contactEmail}
          </Text>
          <Text style={{ margin: "0", color: "#d7e2f1", fontSize: "15px", lineHeight: "21px" }}>
            Sitio:{" "}
            <Link href={websiteUrl} style={{ color: "#8ab8ff", textDecoration: "underline" }}>
              {websiteUrl}
            </Link>
          </Text>
        </Column>
      </Row>
      <Section
        style={{
          marginTop: "18px",
          paddingTop: "14px",
          borderTop: "1px solid #214777",
        }}
      >
        <Text
          style={{
            margin: "0",
            textAlign: "center",
            color: "#d7e2f1",
            fontSize: "13px",
            lineHeight: "18px",
          }}
        >
          Este correo fue generado automáticamente por Integra Industrial Networks.
        </Text>
      </Section>
    </Section>
  );
}

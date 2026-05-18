import { Column, Row, Section, Text } from "@react-email/components";
import * as React from "react";

interface StatusCardProps {
  percentage: number;
  statusLabel: string;
  healthyPoints: number;
  totalPoints: number;
}

function getStatusColor(statusLabel: string): string {
  const normalized = statusLabel.toUpperCase();
  if (normalized.includes("SALUD")) return "#33c56a";
  if (normalized.includes("MEDIO")) return "#ffd248";
  return "#ff4a4a";
}

function StatusRow(props: { color: string; text: string; active: boolean }) {
  return (
    <Section
      style={{
        border: `1px solid ${props.active ? props.color : "#345078"}`,
        borderRadius: "10px",
        padding: "10px 14px",
        marginBottom: "10px",
      }}
    >
      <Row>
        <Column style={{ width: "16px", verticalAlign: "middle", paddingRight: "10px" }}>
          <Section
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              backgroundColor: props.color,
            }}
          />
        </Column>
        <Column style={{ verticalAlign: "middle" }}>
          <Text
            style={{
              margin: "0",
              color: props.active ? "#ffffff" : "#d6e2f3",
              fontSize: "18px",
              lineHeight: "23px",
              fontWeight: "700",
            }}
          >
            {props.text}
          </Text>
        </Column>
      </Row>
    </Section>
  );
}

export function StatusCard({
  percentage,
  statusLabel,
  healthyPoints,
  totalPoints,
}: StatusCardProps) {
  const statusColor = getStatusColor(statusLabel);
  const safePercentage = Math.max(0, Math.min(100, percentage));

  return (
    <Section
      style={{
        backgroundColor: "#082247",
        borderRadius: "14px",
        padding: "20px 22px 14px",
      }}
    >
      <Row>
        <Column style={{ width: "48%", verticalAlign: "top", paddingRight: "14px" }}>
          <Text
            style={{
              margin: "0 0 12px",
              color: "#ffffff",
              fontSize: "34px",
              lineHeight: "38px",
              fontWeight: "800",
            }}
          >
            {safePercentage}%
          </Text>
          <Section
            style={{
              backgroundColor: statusColor,
              borderRadius: "999px",
              display: "inline-block",
              padding: "8px 16px",
              marginBottom: "10px",
            }}
          >
            <Text
              style={{
                margin: "0",
                color: "#ffffff",
                fontSize: "20px",
                lineHeight: "24px",
                fontWeight: "800",
              }}
            >
              {statusLabel}
            </Text>
          </Section>
          <Text
            style={{
              margin: "0",
              color: "#d7e2f1",
              fontSize: "17px",
              lineHeight: "24px",
            }}
          >
            {healthyPoints} de {totalPoints} puntos en estado saludable.
          </Text>
        </Column>
        <Column style={{ width: "52%", verticalAlign: "top" }}>
          <StatusRow color="#33c56a" text="85 - 100%  SALUDABLE" active={safePercentage >= 85} />
          <StatusRow
            color="#ffd248"
            text="70 - 84%  MEDIO"
            active={safePercentage >= 70 && safePercentage < 85}
          />
          <StatusRow color="#ff4a4a" text="< 70%  CRÍTICO" active={safePercentage < 70} />
        </Column>
      </Row>
    </Section>
  );
}

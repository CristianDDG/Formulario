import { Column, Row, Section, Text } from "@react-email/components";
import * as React from "react";

export interface SummaryItem {
  label: string;
  value: string;
  isLink?: boolean;
}

interface SummaryCardProps {
  leftItems: SummaryItem[];
  rightItems: SummaryItem[];
}

function SummaryValue({ item }: { item: SummaryItem }) {
  if (!item.isLink) {
    return (
      <Text
        style={{
          margin: "0",
          color: "#1f3659",
          fontSize: "17px",
          lineHeight: "24px",
          fontWeight: "500",
        }}
      >
        {item.value}
      </Text>
    );
  }

  return (
    <Text
      style={{
        margin: "0",
        color: "#1261d7",
        fontSize: "17px",
        lineHeight: "24px",
        fontWeight: "500",
        textDecoration: "underline",
      }}
    >
      {item.value}
    </Text>
  );
}

function SummaryColumn({ items }: { items: SummaryItem[] }) {
  return (
    <Column style={{ width: "50%", verticalAlign: "top", padding: "0 14px 0 0" }}>
      {items.map((item) => (
        <Section key={item.label} style={{ marginBottom: "14px" }}>
          <Text
            style={{
              margin: "0 0 2px",
              color: "#0b2a57",
              fontSize: "15px",
              lineHeight: "20px",
              fontWeight: "700",
            }}
          >
            {item.label}
          </Text>
          <SummaryValue item={item} />
        </Section>
      ))}
    </Column>
  );
}

export function SummaryCard({ leftItems, rightItems }: SummaryCardProps) {
  return (
    <Section
      style={{
        borderRadius: "14px",
        border: "1px solid #d8e0ec",
        backgroundColor: "#ffffff",
        padding: "20px 22px 10px",
      }}
    >
      <Row>
        <SummaryColumn items={leftItems} />
        <SummaryColumn items={rightItems} />
      </Row>
    </Section>
  );
}

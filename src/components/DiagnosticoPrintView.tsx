import React, { forwardRef } from "react";
import type { LucideIcon } from "lucide-react";
import { DIAGNOSTIC_QUESTIONS } from "@/constants/diagnostics";
import { describeArc, polarPoint } from "@/lib/gauge";
import type { DiagnosticValue } from "@/types/diagnostic";

import logo from "@/assets/integra-logo.png";
import bg from "@/assets/datacenter-bg.jpg";

type Estado = "si" | "no" | null;

export interface PrintViewProps {
  nombreCompleto: string;
  telefono: string;
  correo: string;
  cliente: string;
  ubicacion: string;
  fecha: string;
  preguntas: { text: string; icon?: LucideIcon }[];
  respuestas: Estado[];
  valores: DiagnosticValue[];
  observaciones: string[];
  porcentaje: number;
  puntos: number;
  valoracion: string;
}

/**
 * Number of table rows to show on the first page.
 * Adjust this constant if the number of questions changes
 * or if the header/score section grows or shrinks.
 */
const FIRST_PAGE_ITEM_COUNT = 12;

/* ── Design tokens ── */
const NAVY = "#082247";
const NAVY_DARK = "#061A36";
const NAVY_SOFT = "#0B315F";
const ORANGE = "#F97316";
const GREEN = "#22C55E";
const RED = "#EF4444";
const YELLOW = "#FACC15";
const BORDER = "#D7E1EE";
const TEXT = "#0F2442";

/** Shared style for every A4 page container */
const PAGE_STYLE: React.CSSProperties = {
  width: "210mm",
  height: "297mm",
  overflow: "hidden",
  background: "#FFFFFF",
  fontFamily: "Arial, Helvetica, sans-serif",
  color: TEXT,
  boxSizing: "border-box",
  position: "relative",
};

/* ────────────────────── Sub-components ────────────────────── */

function Gauge({ porcentaje }: { porcentaje: number }) {
  const cx = 120;
  const cy = 112;
  const r = 80;
  const value = Math.max(0, Math.min(100, porcentaje));
  const needle = polarPoint(cx, cy, r - 12, (value / 100) * 180);
  const ticks = [0, 25, 50, 75, 100];

  return (
    <svg
      viewBox="0 0 240 142"
      style={{ height: "95px", width: "100%", maxWidth: "230px" }}
      role="img"
      aria-label={`Puntuación total ${porcentaje}%`}
    >
      <defs>
        <filter id="printGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="printCenterBoxGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="100%" stopColor="#f8f9fa" stopOpacity="1" />
        </linearGradient>
      </defs>

      <path
        d={describeArc(cx, cy, r, 0, 124.2)}
        stroke={RED}
        strokeWidth="20"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={describeArc(cx, cy, r, 124.2, 151.2)}
        stroke={YELLOW}
        strokeWidth="20"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={describeArc(cx, cy, r, 151.2, 180)}
        stroke={GREEN}
        strokeWidth="20"
        strokeLinecap="round"
        fill="none"
      />

      {ticks.map((tick) => {
        const angle = (tick / 100) * 180;
        const outer = polarPoint(cx, cy, r + 14, angle);
        const labelDist = tick === 50 ? r + 28 : r + 34;
        const label = polarPoint(cx, cy, labelDist, angle);

        return (
          <g key={tick}>
            <circle cx={outer.x} cy={outer.y} r="2.8" fill="#ffffff" opacity="0.95" />
            <text
              x={label.x}
              y={label.y + 3}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="11"
              fontWeight="700"
              fill="#FFFFFF"
              style={{ paintOrder: "stroke", stroke: NAVY_DARK, strokeWidth: 0.5 }}
            >
              {tick}%
            </text>
          </g>
        );
      })}

      <line
        x1={cx}
        y1={cy}
        x2={needle.x}
        y2={needle.y}
        stroke="#FFFFFF"
        strokeWidth="4.5"
        strokeLinecap="round"
        filter="url(#printGlow)"
      />

      <circle cx={cx} cy={cy} r="10" fill={NAVY_DARK} stroke="#FFFFFF" strokeWidth="3.5" />
      <rect
        x="72"
        y="88"
        width="88"
        height="48"
        rx="12"
        fill="url(#printCenterBoxGradient)"
        style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}
      />
      <text x={cx} y="122" textAnchor="middle" fontSize="36" fontWeight="900" fill={NAVY}>
        {porcentaje}%
      </text>
    </svg>
  );
}

function FieldBlock({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div
      style={{
        width: "32%",
        boxSizing: "border-box",
        background: "#203A63",
        border: "1.5px solid rgba(255,255,255,0.18)",
        borderRadius: "6px",
        padding: "8px 10px",
        color: "#FFFFFF",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span
          style={{
            width: "13px",
            height: "13px",
            borderRadius: "50%",
            border: `2px solid ${ORANGE}`,
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: "8px",
              fontWeight: 700,
              color: "#C7D3E4",
              letterSpacing: "0.3px",
              textTransform: "uppercase",
            }}
          >
            {label}
          </div>
          <div
            style={{
              marginTop: "2px",
              minHeight: multiline ? "26px" : "14px",
              borderBottom: "1.5px solid rgba(255,255,255,0.7)",
              fontSize: "11px",
              fontWeight: 700,
              color: "#FFFFFF",
              whiteSpace: multiline ? "normal" : "nowrap",
              overflow: "hidden",
              textOverflow: multiline ? "clip" : "ellipsis",
              lineHeight: multiline ? 1.25 : 1.15,
              wordWrap: multiline ? "break-word" : "normal",
            }}
          >
            {value || ""}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusMark({ status }: { status: Estado }) {
  const items = [
    { key: "si", label: "✓", color: GREEN, active: status === "si" },
    { key: "no", label: "×", color: RED, active: status === "no" },
  ];

  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
      {items.map((item) => (
        <span
          key={item.key}
          style={{
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            border: `1.5px solid ${item.active ? item.color : "#B8C7DA"}`,
            background: item.active ? item.color : "#FFFFFF",
            color: item.active ? "#FFFFFF" : "#9AA9BC",
            fontSize: "12px",
            fontWeight: 800,
            lineHeight: 1,
          }}
        >
          {item.label}
        </span>
      ))}
    </div>
  );
}

function ValuationRows({ valoracion }: { valoracion: string }) {
  const rows = [
    {
      color: GREEN,
      range: "85 - 100%",
      label: "SALUDABLE",
      description: "Operación estable con riesgos bajos y continuidad de servicio controlada.",
    },
    {
      color: YELLOW,
      range: "70 - 84%",
      label: "MEDIO",
      description: "Riesgos latentes que deben corregirse para evitar interrupciones futuras.",
    },
    {
      color: RED,
      range: "< 70%",
      label: "CRÍTICO",
      description: "Alta probabilidad de falla operativa; requiere intervención técnica inmediata.",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "7px", width: "100%" }}>
      {rows.map((row) => {
        const active = row.label === valoracion;
        return (
          <div
            key={row.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: active ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)",
              border: `1.5px solid ${active ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.15)"}`,
              borderRadius: "6px",
              padding: "6px 10px",
              color: "#FFFFFF",
            }}
          >
            <span
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                background: row.color,
                border: "1px solid rgba(255,255,255,0.72)",
                boxShadow: `0 0 10px ${row.color}80`,
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "11px", fontWeight: 800 }}>{row.range}</div>
              <div style={{ marginTop: "1px", fontSize: "9px", fontWeight: 700, color: "#FFFFFF" }}>
                {row.label}
              </div>
              <div
                style={{
                  marginTop: "1px",
                  fontSize: "8px",
                  fontWeight: 600,
                  lineHeight: 1.2,
                  color: "rgba(255,255,255,0.78)",
                }}
              >
                {row.description}
              </div>
            </div>
            {active && <span style={{ fontSize: "13px", fontWeight: 800 }}>✓</span>}
          </div>
        );
      })}
    </div>
  );
}

/* ── Reusable table pieces ── */

function TableHead() {
  return (
    <thead>
      <tr style={{ background: NAVY, color: "#FFFFFF" }}>
        <th
          style={{
            width: "36px",
            padding: "7px 4px",
            borderRight: "1px solid rgba(255,255,255,0.2)",
            fontWeight: 800,
            fontSize: "9px",
            textAlign: "center",
          }}
        >
          No.
        </th>
        <th
          style={{
            width: "42%",
            padding: "7px 8px",
            borderRight: "1px solid rgba(255,255,255,0.2)",
            textAlign: "left",
            fontWeight: 800,
            fontSize: "9px",
          }}
        >
          PUNTO DE REVISIÓN
        </th>
        <th
          style={{
            width: "70px",
            padding: "7px 4px",
            borderRight: "1px solid rgba(255,255,255,0.2)",
            fontWeight: 800,
            fontSize: "9px",
            textAlign: "center",
          }}
        >
          ESTADO
        </th>
        <th
          style={{
            width: "auto",
            padding: "7px 8px",
            textAlign: "left",
            fontWeight: 800,
            fontSize: "9px",
          }}
        >
          OBSERVACIONES
        </th>
      </tr>
    </thead>
  );
}

function QuestionRow({
  question,
  index,
  respuesta,
  valor,
  observacion,
}: {
  question: { text: string; icon?: LucideIcon };
  index: number;
  respuesta: Estado;
  valor: DiagnosticValue;
  observacion: string;
}) {
  const isCritical = respuesta === "no";
  const qDef = DIAGNOSTIC_QUESTIONS[index];
  const hasValor = valor !== null && valor !== undefined && valor !== "";
  const valorFormat = hasValor && qDef.formatValue ? qDef.formatValue(valor) : null;
  const riesgo = isCritical ? qDef.riskText : null;

  return (
    <tr>
      <td
        style={{
          padding: "6px 4px",
          borderBottom: `1px solid ${BORDER}`,
          textAlign: "center",
          fontSize: "10px",
          fontWeight: 700,
          background: NAVY_SOFT,
          color: "#FFFFFF",
        }}
      >
        {index + 1}
      </td>
      <td
        style={{
          padding: "6px 8px",
          background: index % 2 === 0 ? "#F8FAFC" : "#FFFFFF",
          borderBottom: `1px solid ${BORDER}`,
          fontSize: "9px",
          lineHeight: 1.35,
        }}
      >
        <div style={{ fontWeight: 600, color: TEXT, lineHeight: 1.3 }}>{question.text}</div>
        {valorFormat && (
          <div
            style={{
              marginTop: "2px",
              fontSize: "8px",
              color: "#53657D",
              fontStyle: "italic",
            }}
          >
            Valor ingresado: <span style={{ fontWeight: 700 }}>{valorFormat}</span>
          </div>
        )}
      </td>
      <td
        style={{
          padding: "6px 4px",
          background: index % 2 === 0 ? "#F8FAFC" : "#FFFFFF",
          borderBottom: `1px solid ${BORDER}`,
          textAlign: "center",
        }}
      >
        <StatusMark status={respuesta} />
      </td>
      <td
        style={{
          padding: "6px 8px",
          background: index % 2 === 0 ? "#F8FAFC" : "#FFFFFF",
          borderBottom: `1px solid ${BORDER}`,
          color: "#53657D",
          lineHeight: 1.35,
          whiteSpace: "normal",
          wordWrap: "break-word",
          fontSize: "9px",
        }}
      >
        {riesgo && (
          <div style={{ color: "#C2410C", fontWeight: 700, marginBottom: "2px" }}>{riesgo}</div>
        )}
        {observacion && (
          <div style={{ fontWeight: 600, color: "#0F2442" }}>
            Nota: <span style={{ fontWeight: "normal", color: "#53657D" }}>{observacion}</span>
          </div>
        )}
      </td>
    </tr>
  );
}

/* ────────────────────── Main component ────────────────────── */

const DiagnosticoPrintView = forwardRef<HTMLDivElement, PrintViewProps>((p, ref) => {
  const medioContacto = [p.telefono, p.correo].filter(Boolean).join("\n");

  const page1Items = p.preguntas.slice(0, FIRST_PAGE_ITEM_COUNT);
  const page2Items = p.preguntas.slice(FIRST_PAGE_ITEM_COUNT);

  return (
    <div
      ref={ref}
      style={
        {
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact",
          colorAdjust: "exact",
        } as React.CSSProperties
      }
    >
      {/* ═══════════════════ PAGE 1 ═══════════════════ */}
      <div className="pdf-page" style={PAGE_STYLE}>
        {/* Header – compact */}
        <div
          style={{
            height: "110px",
            display: "flex",
            flexDirection: "row",
            backgroundColor: "#FFFFFF",
            backgroundImage: `linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.96) 38%, rgba(255,255,255,0.74) 58%, rgba(255,255,255,0.2) 100%), url(${bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center right",
            borderBottom: `1px solid ${BORDER}`,
          }}
        >
          <div
            style={{
              width: "200px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRight: `1px solid ${BORDER}`,
              background: "rgba(255,255,255,0.96)",
            }}
          >
            <img
              src={logo}
              alt="Integra Industrial Networks"
              style={{ width: "120px", height: "auto" }}
            />
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              paddingLeft: "24px",
              paddingRight: "24px",
            }}
          >
            <div style={{ fontSize: "24px", fontWeight: 900, lineHeight: 1.2, color: NAVY }}>
              DIAGNÓSTICO TÉCNICO
            </div>
            <div
              style={{
                marginTop: "2px",
                fontSize: "24px",
                fontWeight: 900,
                lineHeight: 1.2,
                color: ORANGE,
              }}
            >
              DE INFRAESTRUCTURA IT
            </div>
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: ORANGE,
                }}
              />
              <span
                style={{
                  width: "160px",
                  height: "2.5px",
                  borderRadius: "999px",
                  background: ORANGE,
                }}
              />
              <span
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: ORANGE,
                }}
              />
            </div>
          </div>
        </div>

        {/* Data cards */}
        <div
          style={{
            background: NAVY_DARK,
            padding: "8px 14px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            rowGap: "6px",
          }}
        >
          <FieldBlock label="CONTACTO" value={p.nombreCompleto} />
          <FieldBlock label="MEDIO DE CONTACTO" value={medioContacto} multiline />
          <FieldBlock label="FECHA" value={p.fecha} />
          <FieldBlock label="CLIENTE" value={p.cliente} />
          <FieldBlock label="UBICACIÓN" value={p.ubicacion} />
          <FieldBlock label="TOTAL DE PUNTOS" value={String(p.preguntas.length)} />
        </div>

        {/* Score & Health */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "10px",
            padding: "10px 14px",
            background: "#EEF3F8",
          }}
        >
          {/* Score */}
          <div
            style={{
              flex: 1,
              background: NAVY,
              borderRadius: "6px",
              padding: "10px",
              color: "#FFFFFF",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                marginBottom: "4px",
                fontSize: "9px",
                fontWeight: 800,
                letterSpacing: "0.5px",
              }}
            >
              PUNTUACIÓN TOTAL
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Gauge porcentaje={p.porcentaje} />
            </div>
            <div
              style={{
                marginTop: "2px",
                fontSize: "10px",
                fontWeight: 700,
                color: "#C7D3E4",
              }}
            >
              {p.puntos} de {p.preguntas.length} puntos en estado saludable
            </div>
          </div>

          {/* Health */}
          <div
            style={{
              flex: 1,
              background: NAVY,
              borderRadius: "6px",
              padding: "10px",
              color: "#FFFFFF",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                marginBottom: "4px",
                textAlign: "center",
                fontSize: "10px",
                fontWeight: 800,
                letterSpacing: "0.5px",
              }}
            >
              ESTADO DE SALUD IT
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
              <ValuationRows valoracion={p.valoracion} />
            </div>
          </div>
        </div>

        {/* Table – page 1 rows */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
            fontSize: "10px",
          }}
        >
          <TableHead />
          <tbody>
            {page1Items.map((question, idx) => (
              <QuestionRow
                key={idx}
                question={question}
                index={idx}
                respuesta={p.respuestas[idx]}
                valor={p.valores[idx]}
                observacion={p.observaciones[idx]}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* ═══════════════════ PAGE 2 ═══════════════════ */}
      <div className="pdf-page" style={{ ...PAGE_STYLE, display: "flex", flexDirection: "column" }}>
        {/* Table – page 2 rows (header repeated) */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
            fontSize: "10px",
          }}
        >
          <TableHead />
          <tbody>
            {page2Items.map((question, idx) => {
              const globalIdx = FIRST_PAGE_ITEM_COUNT + idx;
              return (
                <QuestionRow
                  key={globalIdx}
                  question={question}
                  index={globalIdx}
                  respuesta={p.respuestas[globalIdx]}
                  valor={p.valores[globalIdx]}
                  observacion={p.observaciones[globalIdx]}
                />
              );
            })}
          </tbody>
        </table>

        {/* Spacer pushes CTA + footer to the bottom */}
        <div style={{ flex: 1 }} />

        {/* CTA */}
        <div
          style={{
            padding: "14px 16px",
            background: "#FFF5F0",
            borderTop: "2px solid #FFEDD5",
            textAlign: "center",
          }}
        >
          <div
            style={{
              color: "#C2410C",
              fontSize: "15px",
              fontWeight: 900,
              marginBottom: "6px",
            }}
          >
            ¡ATENCIÓN INMEDIATA!
          </div>
          <div
            style={{
              color: "#431407",
              fontSize: "11px",
              fontWeight: 600,
              marginBottom: "10px",
              lineHeight: 1.4,
            }}
          >
            ¿Detectaste riesgos en tu diagnóstico? Obtén un 20% de descuento en la remediación si
            nos contactas en las próximas 6 horas.
          </div>
          <div
            style={{
              display: "inline-block",
              background: "#22C55E",
              color: "#FFF",
              padding: "8px 18px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            Whatsapp: 442 749 0997
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            height: "44px",
            background: NAVY,
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "30px",
            fontSize: "11px",
            fontWeight: 700,
            borderTop: `1px solid ${BORDER}`,
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: ORANGE,
                display: "inline-block",
              }}
            />
            442 749 0997
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: ORANGE,
                display: "inline-block",
              }}
            />
            www.integraindustrialnetworks.com
          </span>
        </div>
      </div>
    </div>
  );
});

DiagnosticoPrintView.displayName = "DiagnosticoPrintView";

export default DiagnosticoPrintView;

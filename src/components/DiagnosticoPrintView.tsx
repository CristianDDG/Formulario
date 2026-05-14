import React, { forwardRef } from "react";
import type { LucideIcon } from "lucide-react";

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
  observaciones: string[];
  obsGenerales: string;
  porcentaje: number;
  puntos: number;
  valoracion: string;
  semaforoColor: string;
}

const NAVY = "#082247";
const NAVY_DARK = "#061A36";
const NAVY_SOFT = "#0B315F";
const ORANGE = "#F97316";
const GREEN = "#22C55E";
const RED = "#EF4444";
const YELLOW = "#FACC15";
const BORDER = "#D7E1EE";
const TEXT = "#0F2442";

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarPoint(cx, cy, r, endAngle);
  const end = polarPoint(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function roundNumber(value: number, decimals = 4) {
  return Number(value.toFixed(decimals));
}

function polarPoint(cx: number, cy: number, r: number, angle: number) {
  const radians = ((angle - 180) * Math.PI) / 180;
  return {
    x: roundNumber(cx + r * Math.cos(radians)),
    y: roundNumber(cy + r * Math.sin(radians)),
  };
}

function Gauge({ porcentaje }: { porcentaje: number }) {
  const cx = 124;
  const cy = 118;
  const r = 86;
  const value = Math.max(0, Math.min(100, porcentaje));
  const needle = polarPoint(cx, cy, r - 12, (value / 100) * 180);
  const ticks = [0, 25, 50, 75, 100];

  return (
    <svg
      viewBox="0 0 248 152"
      className="h-[110px] w-full max-w-[250px]"
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
        strokeWidth="22"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={describeArc(cx, cy, r, 124.2, 151.2)}
        stroke={YELLOW}
        strokeWidth="22"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={describeArc(cx, cy, r, 151.2, 180)}
        stroke={GREEN}
        strokeWidth="22"
        strokeLinecap="round"
        fill="none"
      />

      {ticks.map((tick) => {
        const angle = (tick / 100) * 180;
        const outer = polarPoint(cx, cy, r + 15, angle);
        const labelDistance = tick === 50 ? r + 30 : r + 38;
        const label = polarPoint(cx, cy, labelDistance, angle);

        return (
          <g key={tick}>
            <circle cx={outer.x} cy={outer.y} r="3.2" fill="#ffffff" opacity="0.95" />
            <text
              x={label.x}
              y={label.y + 3}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="12"
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
        strokeWidth="5"
        strokeLinecap="round"
        filter="url(#printGlow)"
      />

      <circle cx={cx} cy={cy} r="11" fill={NAVY_DARK} stroke="#FFFFFF" strokeWidth="4" />
      <rect
        x="73"
        y="94"
        width="94"
        height="54"
        rx="14"
        fill="url(#printCenterBoxGradient)"
        style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))" }}
      />
      <text x={cx} y="132" textAnchor="middle" fontSize="42" fontWeight="900" fill={NAVY}>
        {porcentaje}%
      </text>
    </svg>
  );
}

function FieldBlock({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        background: "#203A63",
        border: "1.5px solid rgba(255,255,255,0.18)",
        borderRadius: "8px",
        padding: "12px 14px",
        color: "#FFFFFF",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span
          style={{
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            border: `2.5px solid ${ORANGE}`,
            display: "inline-block",
            flex: "0 0 auto",
          }}
        />
        <div style={{ minWidth: 0 }}>
          <div
            style={{ fontSize: "9px", fontWeight: 700, color: "#C7D3E4", letterSpacing: "0.3px" }}
          >
            {label}
          </div>
          <div
            style={{
              marginTop: "3px",
              minHeight: "16px",
              borderBottom: "2px solid rgba(255,255,255,0.75)",
              fontSize: "12px",
              fontWeight: 700,
              color: "#FFFFFF",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
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
    <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
      {items.map((item) => (
        <span
          key={item.key}
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            border: `1.5px solid ${item.active ? item.color : "#B8C7DA"}`,
            background: item.active ? item.color : "#FFFFFF",
            color: item.active ? "#FFFFFF" : "#9AA9BC",
            fontSize: "13px",
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
    { color: GREEN, range: "85 - 100%", label: "SALUDABLE" },
    { color: YELLOW, range: "70 - 84%", label: "MEDIO" },
    { color: RED, range: "< 70%", label: "CRÍTICO" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {rows.map((row) => {
        const active = row.label === valoracion;

        return (
          <div
            key={row.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: active ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)",
              border: `1.5px solid ${active ? "#FFFFFF" : `${row.color}55`}`,
              borderRadius: "8px",
              padding: "8px 10px",
              color: "#FFFFFF",
            }}
          >
            <span
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: row.color,
                border: "1px solid rgba(255,255,255,0.72)",
                boxShadow: `0 0 12px ${row.color}80`,
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", fontWeight: 800 }}>{row.range}</div>
              <div
                style={{ marginTop: "1px", fontSize: "10px", fontWeight: 700, color: "#D7E1EE" }}
              >
                {row.label}
              </div>
            </div>
            {active && <span style={{ fontSize: "14px", fontWeight: 800 }}>✓</span>}
          </div>
        );
      })}
    </div>
  );
}

const DiagnosticoPrintView = forwardRef<HTMLDivElement, PrintViewProps>((p, ref) => {
  const medioContacto = [p.telefono, p.correo].filter(Boolean).join(" / ");

  return (
    <div
      ref={ref}
      style={
        {
          width: "794px",
          minHeight: "1123px",
          overflow: "hidden",
          background: "#FFFFFF",
          fontFamily: "Arial, Helvetica, sans-serif",
          color: TEXT,
          padding: "0",
          boxSizing: "border-box",
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact",
          colorAdjust: "exact",
        } as React.CSSProperties
      }
    >
      {/* Header */}
      <div
        style={{
          minHeight: "150px",
          display: "grid",
          gridTemplateColumns: "240px 1fr",
          backgroundColor: "#FFFFFF",
          backgroundImage: `linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.96) 38%, rgba(255,255,255,0.74) 58%, rgba(255,255,255,0.2) 100%), url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center right",
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <div
          style={{
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
            style={{ width: "140px", height: "auto" }}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingLeft: "32px",
            paddingRight: "32px",
          }}
        >
          <div style={{ fontSize: "32px", fontWeight: 900, lineHeight: 1.05, color: NAVY }}>
            DIAGNÓSTICO DE SALUD
          </div>
          <div
            style={{
              marginTop: "4px",
              fontSize: "32px",
              fontWeight: 900,
              lineHeight: 1.05,
              color: ORANGE,
            }}
          >
            DE INFRAESTRUCTURA IT
          </div>
          <div style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{ width: "6px", height: "6px", borderRadius: "50%", background: ORANGE }}
            />
            <span
              style={{ width: "200px", height: "3px", borderRadius: "999px", background: ORANGE }}
            />
            <span
              style={{ width: "6px", height: "6px", borderRadius: "50%", background: ORANGE }}
            />
          </div>
        </div>
      </div>

      {/* Datos iniciales */}
      <div
        style={{
          background: NAVY_DARK,
          padding: "12px 20px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "10px",
        }}
      >
        <FieldBlock label="CONTACTO" value={p.nombreCompleto} />
        <FieldBlock label="MEDIO DE CONTACTO" value={medioContacto} />
        <FieldBlock label="FECHA" value={p.fecha} />
        <FieldBlock label="CLIENTE" value={p.cliente} />
        <FieldBlock label="UBICACIÓN" value={p.ubicacion} />
        <FieldBlock label="TOTAL DE PUNTOS" value={String(p.preguntas.length)} />
      </div>

      {/* Tabla de preguntas */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          tableLayout: "fixed",
          fontSize: "11px",
        }}
      >
        <thead>
          <tr style={{ background: NAVY, color: "#FFFFFF" }}>
            <th
              style={{
                width: "48px",
                padding: "10px 6px",
                borderRight: "1px solid rgba(255,255,255,0.2)",
                fontWeight: 800,
                fontSize: "10px",
                textAlign: "center",
              }}
            >
              No.
            </th>
            <th
              style={{
                flex: 1,
                padding: "10px 10px",
                borderRight: "1px solid rgba(255,255,255,0.2)",
                textAlign: "left",
                fontWeight: 800,
                fontSize: "10px",
              }}
            >
              PUNTO DE REVISIÓN
            </th>
            <th
              style={{
                width: "90px",
                padding: "10px 6px",
                borderRight: "1px solid rgba(255,255,255,0.2)",
                fontWeight: 800,
                fontSize: "10px",
                textAlign: "center",
              }}
            >
              ESTADO
            </th>
            <th
              style={{
                flex: 1,
                padding: "10px 10px",
                textAlign: "left",
                fontWeight: 800,
                fontSize: "10px",
              }}
            >
              OBSERVACIONES
            </th>
          </tr>
        </thead>
        <tbody>
          {p.preguntas.map((question, index) => {
            return (
              <tr key={question.text}>
                <td
                  style={{
                    padding: "8px 6px",
                    borderBottom: `1px solid ${BORDER}`,
                    textAlign: "center",
                    fontSize: "11px",
                    fontWeight: 700,
                    background: NAVY_SOFT,
                    color: "#FFFFFF",
                  }}
                >
                  {index + 1}
                </td>
                <td
                  style={{
                    padding: "8px 10px",
                    background: index % 2 === 0 ? "#F8FAFC" : "#FFFFFF",
                    borderBottom: `1px solid ${BORDER}`,
                    fontSize: "10px",
                  }}
                >
                  <span style={{ fontWeight: 600, color: TEXT, lineHeight: 1.2 }}>
                    {question.text}
                  </span>
                </td>
                <td
                  style={{
                    padding: "8px 6px",
                    background: index % 2 === 0 ? "#F8FAFC" : "#FFFFFF",
                    borderBottom: `1px solid ${BORDER}`,
                    textAlign: "center",
                  }}
                >
                  <StatusMark status={p.respuestas[index]} />
                </td>
                <td
                  style={{
                    padding: "8px 10px",
                    background: index % 2 === 0 ? "#F8FAFC" : "#FFFFFF",
                    borderBottom: `1px solid ${BORDER}`,
                    color: "#53657D",
                    lineHeight: 1.3,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    maxHeight: "40px",
                    overflow: "hidden",
                    fontSize: "10px",
                  }}
                >
                  {p.observaciones[index] || ""}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Sección de resultados */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "12px",
          padding: "16px",
          background: "#EEF3F8",
        }}
      >
        {/* Puntuación Total */}
        <div
          style={{
            background: NAVY,
            borderRadius: "8px",
            padding: "14px",
            color: "#FFFFFF",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              marginBottom: "10px",
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "0.5px",
            }}
          >
            PUNTUACIÓN TOTAL
          </div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Gauge porcentaje={p.porcentaje} />
          </div>
          <div style={{ marginTop: "5px", fontSize: "11px", fontWeight: 700, color: "#C7D3E4" }}>
            {p.puntos} de {p.preguntas.length} puntos en estado saludable
          </div>
        </div>

        {/* Semáforo de Valoración */}
        <div
          style={{
            background: NAVY,
            borderRadius: "8px",
            padding: "14px",
            color: "#FFFFFF",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              marginBottom: "10px",
              textAlign: "center",
              fontSize: "12px",
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

        {/* Observaciones Generales */}
        <div
          style={{
            background: NAVY,
            borderRadius: "8px",
            padding: "14px",
            color: "#FFFFFF",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              marginBottom: "10px",
              textAlign: "center",
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "0.5px",
            }}
          >
            OBSERVACIONES GENERALES
          </div>
          <div
            style={{
              flex: 1,
              background: "#FFFFFF",
              borderRadius: "6px",
              padding: "10px",
              color: "#334155",
              fontSize: "10px",
              lineHeight: 1.4,
              overflow: "hidden",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {p.obsGenerales || "(Sin observaciones)"}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          height: "40px",
          background: NAVY,
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "35px",
          fontSize: "11px",
          fontWeight: 700,
          borderTop: `1px solid ${BORDER}`,
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              width: "14px",
              height: "14px",
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
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              background: ORANGE,
              display: "inline-block",
            }}
          />
          www.integraindustrialnetworks.com
        </span>
      </div>
    </div>
  );
});

DiagnosticoPrintView.displayName = "DiagnosticoPrintView";

export default DiagnosticoPrintView;

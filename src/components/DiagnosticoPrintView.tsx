import React, { forwardRef } from "react";
import logo from "@/assets/integra-logo.png";
import bg from "@/assets/datacenter-bg.jpg";

type Estado = "si" | "no" | null;

export interface PrintViewProps {
  cliente: string;
  ubicacion: string;
  fecha: string;
  preguntas: { text: string }[];
  respuestas: Estado[];
  observaciones: string[];
  obsGenerales: string;
  porcentaje: number;
  puntos: number;
  valoracion: string;
  semaforoColor: string;
}

const NAVY = "#0B2545";
const NAVY_DARK = "#081B36";
const ORANGE = "#F28C28";
const GREEN = "#2BB673";
const RED = "#E63946";
const YELLOW = "#F4C430";

function Gauge({ porcentaje }: { porcentaje: number }) {
  // Professional semicircular gauge with clean styling
  const r = 60;
  const cx = 100;
  const cy = 100;
  const angle = (porcentaje / 100) * 180;
  const rad = (Math.PI * (180 - angle)) / 180;
  const nx = cx + r * Math.cos(rad);
  const ny = cy - r * Math.sin(rad);

  // Create arc path
  const arc = (start: number, end: number, color: string) => {
    const s = (Math.PI * (180 - start)) / 180;
    const e = (Math.PI * (180 - end)) / 180;
    const x1 = cx + r * Math.cos(s);
    const y1 = cy - r * Math.sin(s);
    const x2 = cx + r * Math.cos(e);
    const y2 = cy - r * Math.sin(e);
    const large = end - start > 90 ? 1 : 0;
    return (
      <path
        d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
        stroke={color}
        strokeWidth={16}
        fill="none"
        strokeLinecap="round"
      />
    );
  };

  // Create tick marks at 0%, 20%, 40%, 60%, 80%, 100%
  const tickMarks = [];
  for (let i = 0; i <= 5; i++) {
    const tickAngle = (i / 5) * 180;
    const tickRad = (Math.PI * (180 - tickAngle)) / 180;
    const x1 = cx + (r + 6) * Math.cos(tickRad);
    const y1 = cy - (r + 6) * Math.sin(tickRad);
    const x2 = cx + (r + 14) * Math.cos(tickRad);
    const y2 = cy - (r + 14) * Math.sin(tickRad);

    tickMarks.push(
      <line
        key={`tick-${i}`}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#1e293b"
        strokeWidth="2.5"
        strokeLinecap="round"
      />,
    );

    // Add labels
    const labelRad = (Math.PI * (180 - tickAngle)) / 180;
    const lx = cx + (r + 26) * Math.cos(labelRad);
    const ly = cy - (r + 26) * Math.sin(labelRad);
    tickMarks.push(
      <text
        key={`label-${i}`}
        x={lx}
        y={ly}
        fontSize="11"
        fontWeight="700"
        fill="#1e293b"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {i * 20}%
      </text>,
    );
  }

  return (
    <svg width="220" height="160" viewBox="0 0 220 160">
      <defs>
        <filter id="needleShadow">
          <feDropShadow dx="1" dy="1" stdDeviation="1.5" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Background circle */}
      <circle
        cx={cx}
        cy={cy}
        r={r + 1}
        fill="none"
        stroke="#cbd5e1"
        strokeWidth="1"
        opacity="0.4"
      />

      {/* Colored arcs */}
      {arc(0, 60, RED)}
      {arc(60, 120, YELLOW)}
      {arc(120, 180, GREEN)}

      {/* Tick marks and labels */}
      {tickMarks}

      {/* Needle */}
      <g filter="url(#needleShadow)">
        <line
          x1={cx}
          y1={cy}
          x2={nx}
          y2={ny}
          stroke="#0B2545"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={6} fill="#0B2545" stroke="#fff" strokeWidth="2" />
      </g>

      {/* Percentage text - larger and centered */}
      <text
        x={cx}
        y={cy + 42}
        fontSize="42"
        fontWeight="800"
        fill="#0B2545"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {porcentaje}%
      </text>
    </svg>
  );
}

const DiagnosticoPrintView = forwardRef<HTMLDivElement, PrintViewProps>((p, ref) => {
  return (
    <div
      ref={ref}
      style={
        {
          width: "794px", // A4 @ 96dpi
          background: "#fff",
          fontFamily: "Arial, Helvetica, sans-serif",
          color: "#1f2937",
          padding: "0",
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact",
          colorAdjust: "exact",
        } as React.CSSProperties
      }
    >
      {/* HEADER */}
      <div
        style={{
          position: "relative",
          height: "120px",
          backgroundColor: NAVY,
          backgroundImage: `linear-gradient(90deg, rgba(11,37,69,0.95) 0%, rgba(11,37,69,0.75) 55%, rgba(11,37,69,0.55) 100%), url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          color: "#fff",
        }}
      >
        <img
          src={logo}
          alt="Integra"
          style={{ height: "80px", width: "auto", objectFit: "contain", background: "transparent" }}
        />
        <div style={{ marginLeft: "20px" }}>
          <div
            style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "0.5px", lineHeight: 1.1 }}
          >
            DIAGNÓSTICO DE SALUD
          </div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: ORANGE,
              lineHeight: 1.1,
              marginTop: "2px",
            }}
          >
            DE INFRAESTRUCTURA IT
          </div>
          <div
            style={{
              height: "3px",
              width: "120px",
              background: ORANGE,
              marginTop: "6px",
              borderRadius: "2px",
            }}
          />
        </div>
      </div>

      {/* CLIENT BAR */}
      <div
        style={{
          background: NAVY_DARK,
          color: "#fff",
          padding: "10px 16px",
          display: "flex",
          gap: "10px",
        }}
      >
        {[
          { label: "CLIENTE", value: p.cliente },
          { label: "UBICACIÓN", value: p.ubicacion },
          { label: "FECHA", value: p.fecha },
        ].map((f) => (
          <div
            key={f.label}
            style={{
              flex: 1,
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "20px",
              padding: "6px 14px",
            }}
          >
            <div style={{ fontSize: "9px", letterSpacing: "2px", color: "#cbd5e1" }}>{f.label}</div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>{f.value || "—"}</div>
          </div>
        ))}
      </div>

      {/* TABLE */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
        <thead>
          <tr style={{ background: "#f1f5f9", color: "#334155" }}>
            <th style={{ padding: "6px", border: "1px solid #e2e8f0", width: "28px" }}>No.</th>
            <th style={{ padding: "6px", border: "1px solid #e2e8f0", textAlign: "left" }}>
              PUNTO DE REVISIÓN
            </th>
            <th style={{ padding: "6px", border: "1px solid #e2e8f0", width: "70px" }}>ESTADO</th>
            <th
              style={{
                padding: "6px",
                border: "1px solid #e2e8f0",
                width: "240px",
                textAlign: "left",
              }}
            >
              OBSERVACIONES
            </th>
          </tr>
        </thead>
        <tbody>
          {p.preguntas.map((q, i) => {
            const r = p.respuestas[i];
            return (
              <tr key={i}>
                <td
                  style={{
                    padding: "5px",
                    border: "1px solid #e2e8f0",
                    background: NAVY,
                    color: "#fff",
                    textAlign: "center",
                    fontWeight: 700,
                  }}
                >
                  {i + 1}
                </td>
                <td style={{ padding: "5px 8px", border: "1px solid #e2e8f0" }}>{q.text}</td>
                <td style={{ padding: "5px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                  {r === "si" && (
                    <span
                      style={{ color: "#16a34a", fontWeight: 900, fontSize: "18px", lineHeight: 1 }}
                    >
                      ✔
                    </span>
                  )}
                  {r === "no" && (
                    <span
                      style={{ color: "#dc2626", fontWeight: 900, fontSize: "18px", lineHeight: 1 }}
                    >
                      ✘
                    </span>
                  )}
                </td>
                <td style={{ padding: "5px 8px", border: "1px solid #e2e8f0", color: "#475569" }}>
                  {p.observaciones[i] || ""}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* BOTTOM SECTION */}
      <div style={{ display: "flex", gap: "14px", padding: "20px", background: "#f0f4f8" }}>
        {/* Gauge - Left */}
        <div
          style={{
            flex: 1.1,
            background: "linear-gradient(135deg, #0B2545 0%, #081B36 100%)",
            borderRadius: "14px",
            padding: "20px",
            color: "#fff",
            textAlign: "center",
            boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "1.8px",
              marginBottom: "12px",
              color: "#cbd5e1",
              textTransform: "uppercase",
            }}
          >
            PUNTUACIÓN TOTAL
          </div>
          <div
            style={{
              background: "#fff",
              borderRadius: "14px",
              padding: "16px",
              display: "inline-block",
              boxShadow: "inset 0 2px 6px rgba(0,0,0,0.08)",
            }}
          >
            <Gauge porcentaje={p.porcentaje} />
          </div>
        </div>

        {/* Semaforo - Middle */}
        <div
          style={{
            flex: 1,
            background: "linear-gradient(135deg, #0B2545 0%, #081B36 100%)",
            borderRadius: "14px",
            padding: "20px",
            color: "#fff",
            boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "1.8px",
              marginBottom: "14px",
              textAlign: "center",
              color: "#cbd5e1",
              textTransform: "uppercase",
            }}
          >
            SEMÁFORO DE VALORACIÓN
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              flex: 1,
              justifyContent: "center",
            }}
          >
            {[
              { c: GREEN, r: "85 - 100%", l: "SALUDABLE" },
              { c: YELLOW, r: "70 - 84%", l: "MEDIO" },
              { c: RED, r: "< 70%", l: "CRÍTICO" },
            ].map((s) => (
              <div
                key={s.l}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  background: "rgba(255,255,255,0.06)",
                  border: `1.5px solid ${s.c}50`,
                  color: "#fff",
                  borderRadius: "10px",
                  padding: "11px 14px",
                  fontSize: "11px",
                }}
              >
                <span
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: s.c,
                    display: "inline-block",
                    boxShadow: `0 0 10px ${s.c}70`,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "11px", lineHeight: "1.2" }}>{s.l}</div>
                  <div style={{ fontSize: "10px", color: "#cbd5e1", marginTop: "2px" }}>{s.r}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Obs - Right */}
        <div
          style={{
            flex: 1.1,
            background: "linear-gradient(135deg, #0B2545 0%, #081B36 100%)",
            borderRadius: "14px",
            padding: "20px",
            color: "#fff",
            boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "1.8px",
              marginBottom: "12px",
              color: "#cbd5e1",
              textTransform: "uppercase",
            }}
          >
            OBSERVACIONES GENERALES
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1.5px solid rgba(255,255,255,0.12)",
              color: "#e2e8f0",
              borderRadius: "10px",
              padding: "14px",
              fontSize: "11px",
              flex: 1,
              overflow: "hidden",
              whiteSpace: "pre-wrap",
              lineHeight: "1.5",
              textAlign: "justify",
            }}
          >
            {p.obsGenerales || ""}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div
        style={{
          background: NAVY,
          color: "#fff",
          padding: "10px 16px",
          display: "flex",
          justifyContent: "space-around",
          fontSize: "12px",
          fontWeight: 600,
        }}
      >
        <span>📞 442 749 0997</span>
        <span>🌐 www.integraindustrialnetworks.com</span>
      </div>
    </div>
  );
});
DiagnosticoPrintView.displayName = "DiagnosticoPrintView";
export default DiagnosticoPrintView;

import { useRef, useState } from "react";
import {
  AlertCircle,
  Calendar,
  Check,
  ClipboardCheck,
  Download,
  Eye,
  Globe2,
  MapPin,
  Phone,
  RotateCcw,
  Send,
  User,
  X,
} from "lucide-react";

import { DIAGNOSTIC_QUESTIONS, TOTAL_QUESTIONS } from "@/constants/diagnostics";
import { useDiagnosticForm } from "@/hooks/useDiagnosticForm";
import {
  buildReportPayload,
  calculateDiagnosticScore,
  getHealthStatus,
  submitDiagnosticReport,
  validateFormData,
} from "@/services/diagnostic";
import { generatePDFFromHTML } from "@/services/pdf";
import type { DiagnosticStatus } from "@/types/diagnostic";
import DiagnosticoPrintView from "./DiagnosticoPrintView";
import { TopField } from "./form/TopField";

import logo from "@/assets/integra-logo.png";
import datacenterBg from "@/assets/datacenter-bg.jpg";

const NAVY_DARK = "#061a36";
const GREEN = "#22c55e";
const YELLOW = "#facc15";
const RED = "#ef4444";

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

function ScoreGauge({ porcentaje }: { porcentaje: number }) {
  const cx = 124;
  const cy = 118;
  const r = 86;
  const value = Math.max(0, Math.min(100, porcentaje));
  const needle = polarPoint(cx, cy, r - 12, (value / 100) * 180);
  const ticks = [0, 25, 50, 75, 100];

  return (
    <svg
      viewBox="0 0 248 152"
      className="h-[160px] w-full max-w-[300px]"
      role="img"
      aria-label={`Puntuación total ${porcentaje}%`}
    >
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="centerBoxGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#ffffff", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#f8f9fa", stopOpacity: 1 }} />
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
              className="fill-white text-[12px] font-bold"
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
        stroke="#ffffff"
        strokeWidth="5"
        strokeLinecap="round"
        filter="url(#glow)"
      />

      <circle cx={cx} cy={cy} r="11" fill={NAVY_DARK} stroke="#ffffff" strokeWidth="4" />

      <rect
        x="73"
        y="94"
        width="94"
        height="54"
        rx="14"
        fill="url(#centerBoxGradient)"
        style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))" }}
      />
      <text x={cx} y="132" textAnchor="middle" className="fill-[#082247] text-[42px] font-black">
        {porcentaje}%
      </text>
    </svg>
  );
}

function StatusButton({
  active,
  label,
  tone,
  onClick,
}: {
  active: boolean;
  label: string;
  tone: "ok" | "critical";
  onClick: () => void;
}) {
  const Icon = tone === "ok" ? Check : X;
  const activeClass =
    tone === "ok"
      ? "border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-900/20"
      : "border-red-600 bg-red-600 text-white shadow-md shadow-red-900/20";
  const idleClass =
    tone === "ok"
      ? "border-slate-300 bg-white text-slate-400 hover:border-emerald-500 hover:text-emerald-600"
      : "border-slate-300 bg-white text-slate-400 hover:border-red-500 hover:text-red-600";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition ${active ? activeClass : idleClass}`}
    >
      <Icon className="h-4 w-4" strokeWidth={3} />
    </button>
  );
}

function SemaforoLegend({ activeLabel, isComplete }: { activeLabel: string; isComplete: boolean }) {
  const levels = [
    { label: "SALUDABLE", range: "85 - 100%", color: GREEN },
    { label: "MEDIO", range: "70 - 84%", color: YELLOW },
    { label: "CRÍTICO", range: "< 70%", color: RED },
  ];

  return (
    <div className="space-y-3">
      {levels.map((level) => {
        const active = level.label === activeLabel;

        return (
          <div
            key={level.label}
            className={`flex items-center gap-3 rounded-md border px-4 py-3 transition ${
              active && isComplete
                ? "border-white/70 bg-white/15"
                : "border-white/10 bg-white/5 opacity-85"
            }`}
          >
            <span
              className="h-8 w-8 shrink-0 rounded-full border border-white/70"
              style={{ backgroundColor: level.color, boxShadow: `0 0 18px ${level.color}80` }}
            />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-black text-white">{level.range}</div>
              <div className="text-xs font-bold text-white/70">{level.label}</div>
            </div>
            {active && isComplete && <Check className="h-5 w-5 text-white" strokeWidth={3} />}
          </div>
        );
      })}
    </div>
  );
}

export default function DiagnosticoIT() {
  const [state, actions] = useDiagnosticForm();
  const [descargando, setDescargando] = useState(false);
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const { puntos, porcentaje } = calculateDiagnosticScore(state.respuestas);
  const healthStatus = getHealthStatus(porcentaje);
  const respondidas = state.respuestas.filter((respuesta) => respuesta !== null).length;
  const faltantes = TOTAL_QUESTIONS - respondidas;
  const progress = Math.round((respondidas / TOTAL_QUESTIONS) * 100);
  const hasRequiredFields =
    state.cliente.trim() !== "" && state.ubicacion.trim() !== "" && state.fecha.trim() !== "";
  const isComplete = hasRequiredFields && respondidas === TOTAL_QUESTIONS;

  const markDirty = () => {
    if (state.enviado) actions.setEnviado(false);
    if (state.error) actions.setError("");
  };

  const ensureComplete = () => {
    const validation = validateFormData(state.cliente, state.ubicacion, state.fecha, respondidas);

    if (!validation.valid) {
      actions.setError(validation.error || "Completa el diagnóstico antes de continuar.");
      return false;
    }

    actions.setError("");
    return true;
  };

  const handleAnswer = (index: number, value: DiagnosticStatus) => {
    actions.setRespuesta(index, value);
    markDirty();
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current || !ensureComplete()) return;

    setDescargando(true);
    const result = await generatePDFFromHTML(printRef.current, {
      filename: `Diagnostico_${state.cliente}_${state.fecha}.pdf`,
    });

    if (!result.success) {
      actions.setError(result.error || "Error generando el PDF. Intenta de nuevo.");
    }

    setDescargando(false);
  };

  const handleSubmit = async () => {
    if (!ensureComplete()) return;

    actions.setEnviando(true);

    const payload = buildReportPayload(
      state.cliente,
      state.ubicacion,
      state.fecha,
      DIAGNOSTIC_QUESTIONS,
      state.respuestas,
      state.observaciones,
      state.obsGenerales,
      puntos,
      porcentaje,
      healthStatus.label,
    );

    const result = await submitDiagnosticReport(payload);

    if (!result.ok) {
      actions.setError(result.error || "Error enviando el reporte.");
      actions.setEnviando(false);
      return;
    }

    actions.setEnviado(true);
    actions.setEnviando(false);
  };

  const handleReset = () => {
    const hasContent =
      hasRequiredFields ||
      respondidas > 0 ||
      state.obsGenerales.trim() !== "" ||
      state.observaciones.some((observacion) => observacion.trim() !== "");

    if (
      hasContent &&
      !window.confirm("¿Seguro que quieres iniciar un nuevo diagnóstico? Se perderán los datos.")
    ) {
      return;
    }

    setMostrarPreview(false);
    actions.reset();
  };

  return (
    <div className="min-h-screen bg-[#07172e] px-3 py-4 text-slate-900 sm:px-5 sm:py-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-lg bg-white shadow-2xl ring-1 ring-white/10">
        <header
          className="relative overflow-hidden bg-white"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.96) 32%, rgba(255,255,255,0.78) 51%, rgba(255,255,255,0.2) 100%), url(${datacenterBg})`,
            backgroundPosition: "center right",
            backgroundSize: "cover",
          }}
        >
          <div className="grid min-h-[210px] grid-cols-1 gap-0 md:grid-cols-[260px_1fr]">
            <div className="flex items-center justify-center border-b border-slate-200 bg-white/95 p-6 md:border-b-0 md:border-r">
              <img
                src={logo}
                alt="Integra Industrial Networks"
                className="h-auto w-full max-w-[210px] object-contain"
              />
            </div>
            <div className="flex flex-col justify-center px-6 py-8 sm:px-10">
              <h1 className="max-w-3xl text-3xl font-black uppercase leading-tight text-[#082247] sm:text-5xl">
                Diagnóstico de salud
              </h1>
              <h2 className="mt-1 max-w-3xl text-3xl font-black uppercase leading-tight text-orange-500 sm:text-5xl">
                De infraestructura IT
              </h2>
              <div className="mt-5 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                <span className="h-1 w-64 max-w-[55vw] rounded-full bg-orange-500" />
                <span className="h-2 w-2 rounded-full bg-orange-500" />
              </div>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-3 bg-[#061a36] px-4 py-4 text-white md:grid-cols-3">
          <TopField
            icon={User}
            label="CLIENTE"
            value={state.cliente}
            onChange={(value) => {
              actions.setCliente(value);
              markDirty();
            }}
          />
          <TopField
            icon={MapPin}
            label="UBICACIÓN"
            value={state.ubicacion}
            onChange={(value) => {
              actions.setUbicacion(value);
              markDirty();
            }}
          />
          <TopField
            icon={Calendar}
            label="FECHA"
            type="date"
            value={state.fecha}
            onChange={(value) => {
              actions.setFecha(value);
              markDirty();
            }}
          />
        </section>

        <section className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-4 text-sm font-bold text-[#082247]">
                <span>
                  {isComplete
                    ? "Diagnóstico completo: resultado y acciones disponibles"
                    : `Avance del diagnóstico: ${respondidas} de ${TOTAL_QUESTIONS}`}
                </span>
                <span>{progress}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-orange-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-sm font-semibold">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: isComplete ? healthStatus.semaforo : "#94a3b8" }}
              />
              <span className={isComplete ? healthStatus.colorClass : "text-slate-500"}>
                {isComplete ? healthStatus.label : `Faltan ${faltantes} puntos`}
              </span>
            </div>
          </div>
        </section>

        <section className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse text-sm">
            <thead>
              <tr className="bg-[#082247] text-white">
                <th className="w-16 border-r border-white/20 px-3 py-4 text-center font-black">
                  No.
                </th>
                <th className="border-r border-white/20 px-4 py-4 text-left font-black">
                  PUNTO DE REVISIÓN
                </th>
                <th className="w-36 border-r border-white/20 px-4 py-4 text-center font-black">
                  ESTADO
                </th>
                <th className="w-[32%] px-4 py-4 text-left font-black">OBSERVACIONES</th>
              </tr>
            </thead>
            <tbody>
              {DIAGNOSTIC_QUESTIONS.map((question, index) => {
                const Icon = question.icon;
                const currentStatus = state.respuestas[index];

                return (
                  <tr
                    key={question.text}
                    className={`border-b border-slate-200 transition ${
                      currentStatus === null ? "bg-white" : "bg-slate-50/55"
                    } hover:bg-orange-50/40`}
                  >
                    <td className="bg-[#0b315f] px-3 py-3 text-center text-base font-black text-white">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 shrink-0 text-[#082247]" strokeWidth={2.4} />
                        <span className="font-semibold text-slate-800">{question.text}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-4">
                        <StatusButton
                          active={currentStatus === "si"}
                          label={`Marcar saludable el punto ${index + 1}`}
                          tone="ok"
                          onClick={() => handleAnswer(index, "si")}
                        />
                        <StatusButton
                          active={currentStatus === "no"}
                          label={`Marcar crítico el punto ${index + 1}`}
                          tone="critical"
                          onClick={() => handleAnswer(index, "no")}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={state.observaciones[index]}
                        onChange={(event) => {
                          actions.setObservacion(index, event.target.value);
                          markDirty();
                        }}
                        className="w-full border-b border-slate-300 bg-transparent px-1 py-2 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-500"
                        placeholder="Agregar observación"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section id="diagnostic-summary" className="grid gap-3 bg-[#eef3f8] p-4 md:grid-cols-3">
          <div className="flex flex-col rounded-lg bg-[#082247] p-6 text-white shadow-sm">
            <div className="mb-4 text-center text-sm font-black uppercase">Puntuación total</div>
            <div className="flex flex-1 items-center justify-center">
              <ScoreGauge porcentaje={porcentaje} />
            </div>
            <div className="mt-4 text-center text-sm font-semibold text-white/70">
              {puntos} puntos saludables de {TOTAL_QUESTIONS}
            </div>
          </div>

          <div className="flex flex-col rounded-lg bg-[#082247] p-6 text-white shadow-sm">
            <div className="mb-4 text-center text-sm font-black uppercase">
              Semáforo de valoración
            </div>
            <div className="flex flex-1 flex-col justify-center">
              <SemaforoLegend activeLabel={healthStatus.label} isComplete={isComplete} />
            </div>
            {!isComplete && (
              <div className="mt-4 flex items-start gap-2 rounded-md bg-white/10 p-3 text-xs text-white/75">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-orange-300" />
                <span>El semáforo será definitivo cuando completes los datos y los 21 puntos.</span>
              </div>
            )}
          </div>

          <div className="flex flex-col rounded-lg bg-[#082247] p-6 text-white shadow-sm">
            <label
              htmlFor="observaciones-generales"
              className="mb-4 block text-center text-sm font-black uppercase"
            >
              Observaciones generales
            </label>
            <textarea
              id="observaciones-generales"
              value={state.obsGenerales}
              onChange={(event) => {
                actions.setObsGenerales(event.target.value);
                markDirty();
              }}
              placeholder="Notas adicionales sobre el diagnóstico"
              className="flex-1 w-full resize-none rounded-md border border-white/20 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500"
            />
          </div>
        </section>

        {state.error && (
          <div className="mx-4 mt-4 flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <section className="flex flex-col gap-4 border-t border-slate-200 bg-white px-4 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3 text-sm">
            <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#082247]" />
            <div>
              <div className="font-black text-[#082247]">
                {state.enviado
                  ? "Reporte enviado al administrador"
                  : isComplete
                    ? "Reporte listo para generar"
                    : "Completa el diagnóstico para habilitar las acciones"}
              </div>
              <div className="text-slate-500">
                {isComplete
                  ? `${state.cliente || "Cliente"} · ${state.ubicacion || "Ubicación"} · ${
                      state.fecha || "Fecha"
                    }`
                  : "Llena cliente, ubicación, fecha y responde todos los puntos de revisión."}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={state.enviando || !isComplete}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#082247] px-5 py-3 text-sm font-black text-white transition hover:bg-[#0b315f] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Send className="h-4 w-4" />
              {state.enviando ? "Enviando..." : "Enviar diagnóstico"}
            </button>
            <button
              type="button"
              onClick={() => {
                if (ensureComplete()) setMostrarPreview(true);
              }}
              disabled={!isComplete}
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-[#082247] bg-white px-5 py-3 text-sm font-black text-[#082247] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Eye className="h-4 w-4" />
              Vista previa PDF
            </button>
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={descargando || !isComplete}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Download className="h-4 w-4" />
              {descargando ? "Generando..." : "Descargar PDF"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200"
            >
              <RotateCcw className="h-4 w-4" />
              Nuevo
            </button>
          </div>
        </section>

        <footer className="flex flex-col gap-3 bg-[#061a36] px-5 py-4 text-sm font-black text-white sm:flex-row sm:items-center sm:justify-center sm:gap-12">
          <span className="inline-flex items-center justify-center gap-2">
            <Phone className="h-5 w-5 text-orange-500" />
            442 749 0997
          </span>
          <span className="inline-flex items-center justify-center gap-2">
            <Globe2 className="h-5 w-5 text-orange-500" />
            www.integraindustrialnetworks.com
          </span>
        </footer>
      </div>

      {mostrarPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-3">
          <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <div className="text-sm font-black text-[#082247]">Vista previa del PDF</div>
                <div className="text-xs text-slate-500">
                  {state.cliente} · {state.ubicacion} · {state.fecha}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={descargando}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-xs font-black text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  {descargando ? "Generando..." : "Descargar"}
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarPreview(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Cerrar vista previa"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="overflow-auto bg-slate-100 p-4">
              <div className="flex min-w-[820px] justify-center">
                <div className="origin-top scale-[0.74] shadow-2xl lg:scale-[0.86]">
                  <DiagnosticoPrintView
                    cliente={state.cliente}
                    ubicacion={state.ubicacion}
                    fecha={state.fecha}
                    preguntas={DIAGNOSTIC_QUESTIONS}
                    respuestas={state.respuestas}
                    observaciones={state.observaciones}
                    obsGenerales={state.obsGenerales}
                    porcentaje={porcentaje}
                    puntos={puntos}
                    valoracion={healthStatus.label}
                    semaforoColor={healthStatus.semaforo}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          position: "fixed",
          left: "-99999px",
          top: 0,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        <DiagnosticoPrintView
          ref={printRef}
          cliente={state.cliente}
          ubicacion={state.ubicacion}
          fecha={state.fecha}
          preguntas={DIAGNOSTIC_QUESTIONS}
          respuestas={state.respuestas}
          observaciones={state.observaciones}
          obsGenerales={state.obsGenerales}
          porcentaje={porcentaje}
          puntos={puntos}
          valoracion={healthStatus.label}
          semaforoColor={healthStatus.semaforo}
        />
      </div>
    </div>
  );
}

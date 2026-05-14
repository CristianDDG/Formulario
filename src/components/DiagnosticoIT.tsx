import { useRef, useState, type InputHTMLAttributes } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  Check,
  ClipboardCheck,
  Clock3,
  Download,
  Eye,
  Globe2,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  Send,
  User,
  X,
  type LucideIcon,
} from "lucide-react";

import { DIAGNOSTIC_QUESTIONS, TOTAL_QUESTIONS } from "@/constants/diagnostics";
import { useDiagnosticForm } from "@/hooks/useDiagnosticForm";
import {
  buildReportPayload,
  calculateDiagnosticScore,
  getHealthStatus,
  submitDiagnosticReport,
  validateFormData,
  finalizeAndSendDiagnosis,
} from "@/services/diagnostic";
import { generatePDFFromHTML } from "@/services/pdf";
import type { DiagnosticStatus } from "@/types/diagnostic";
import DiagnosticoPrintView from "./DiagnosticoPrintView";

import logo from "@/assets/integra-logo.png";
import datacenterBg from "@/assets/datacenter-bg.jpg";

const NAVY_DARK = "#061a36";
const GREEN = "#22c55e";
const YELLOW = "#facc15";
const RED = "#ef4444";

type FlowStage = "intro" | "questions" | "summary";

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

function IntakeField({
  icon: Icon,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  inputMode,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-slate-300">
        <Icon className="h-4 w-4 text-orange-400" />
        {label}
        {required && <span className="text-orange-300">*</span>}
      </span>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-lg border border-white/15 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/25"
      />
    </label>
  );
}

function IntroFact({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 border-t border-slate-200 pt-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <div className="text-base font-black text-[#082247]">{value}</div>
        <div className="text-sm font-semibold text-slate-500">{label}</div>
      </div>
    </div>
  );
}

function AnswerOption({
  active,
  tone,
  title,
  description,
  onClick,
}: {
  active: boolean;
  tone: "ok" | "critical";
  title: string;
  description: string;
  onClick: () => void;
}) {
  const Icon = tone === "ok" ? Check : X;
  const activeClass =
    tone === "ok"
      ? "border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-900/15"
      : "border-red-600 bg-red-600 text-white shadow-md shadow-red-900/15";
  const idleClass =
    tone === "ok"
      ? "border-slate-200 bg-white text-slate-700 hover:border-emerald-500"
      : "border-slate-200 bg-white text-slate-700 hover:border-red-500";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex min-h-[92px] items-center gap-4 rounded-lg border-2 p-4 text-left transition ${active ? activeClass : idleClass}`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
          active ? "bg-white/20" : "bg-slate-100"
        }`}
      >
        <Icon className="h-5 w-5" strokeWidth={3} />
      </span>
      <span className="min-w-0">
        <span className="block text-base font-black">{title}</span>
        <span
          className={`mt-1 block text-sm font-semibold ${active ? "text-white/80" : "text-slate-500"}`}
        >
          {description}
        </span>
      </span>
    </button>
  );
}

export default function DiagnosticoIT() {
  const [state, actions] = useDiagnosticForm();
  const [descargando, setDescargando] = useState(false);
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const [stage, setStage] = useState<FlowStage>("intro");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const printRef = useRef<HTMLDivElement>(null);

  const { puntos, porcentaje } = calculateDiagnosticScore(state.respuestas);
  const healthStatus = getHealthStatus(porcentaje);
  const respondidas = state.respuestas.filter((respuesta) => respuesta !== null).length;
  const saludables = state.respuestas.filter((respuesta) => respuesta === "si").length;
  const criticos = state.respuestas.filter((respuesta) => respuesta === "no").length;
  const faltantes = TOTAL_QUESTIONS - respondidas;
  const currentStatus = state.respuestas[currentQuestion];
  const currentQuestionData = DIAGNOSTIC_QUESTIONS[currentQuestion];
  const CurrentQuestionIcon = currentQuestionData.icon;
  const contactComplete =
    state.nombreCompleto.trim() !== "" &&
    (state.telefono.trim() !== "" || state.correo.trim() !== "");
  const siteDetailsComplete =
    state.cliente.trim() !== "" && state.ubicacion.trim() !== "" && state.fecha.trim() !== "";
  const hasRequiredFields = contactComplete && siteDetailsComplete;
  const isComplete = hasRequiredFields && respondidas === TOTAL_QUESTIONS;
  const progress =
    stage === "intro"
      ? 0
      : stage === "summary"
        ? 100
        : Math.round((respondidas / TOTAL_QUESTIONS) * 100);
  const progressTitle =
    stage === "intro"
      ? "Inicio: datos de contacto y del sitio"
      : stage === "summary"
        ? "Diagnóstico completo"
        : `Pregunta ${currentQuestion + 1} de ${TOTAL_QUESTIONS}`;
  const progressStatus =
    stage === "intro"
      ? "Tiempo estimado: 3 min"
      : stage === "summary"
        ? healthStatus.label
        : `Faltan ${faltantes} respuestas`;
  const mediosContacto = [state.telefono, state.correo].filter(Boolean).join(" · ");

  const markDirty = () => {
    if (state.enviado) actions.setEnviado(false);
    if (state.error) actions.setError("");
  };

  const validateInitialData = () => {
    if (!state.nombreCompleto.trim()) {
      actions.setError("Completa el nombre completo del contacto.");
      return false;
    }

    if (!state.telefono.trim() && !state.correo.trim()) {
      actions.setError("Agrega al menos un medio de contacto: teléfono o correo electrónico.");
      return false;
    }

    if (!state.cliente.trim() || !state.ubicacion.trim() || !state.fecha.trim()) {
      actions.setError("Completa los campos de Cliente, Ubicación y Fecha.");
      return false;
    }

    actions.setError("");
    return true;
  };

  const ensureComplete = () => {
    const validation = validateFormData(
      state.nombreCompleto,
      state.telefono,
      state.correo,
      state.cliente,
      state.ubicacion,
      state.fecha,
      respondidas,
    );

    if (!validation.valid) {
      actions.setError(validation.error || "Completa el diagnóstico antes de continuar.");
      return false;
    }

    actions.setError("");
    return true;
  };

  const handleStart = () => {
    if (!validateInitialData()) return;

    const firstUnanswered = state.respuestas.findIndex((respuesta) => respuesta === null);
    setCurrentQuestion(firstUnanswered === -1 ? TOTAL_QUESTIONS - 1 : firstUnanswered);
    setStage(firstUnanswered === -1 ? "summary" : "questions");
  };

  const handleAnswer = (index: number, value: DiagnosticStatus) => {
    actions.setRespuesta(index, value);
    markDirty();
  };

  const handleNextQuestion = () => {
    if (currentStatus === null) {
      actions.setError("Selecciona Saludable o Crítico para continuar.");
      return;
    }

    actions.setError("");

    if (currentQuestion >= TOTAL_QUESTIONS - 1) {
      // Final question - finalize and send diagnosis
      handleFinalizeDiagnosis();
      return;
    }

    setCurrentQuestion((prev) => prev + 1);
  };

  const handlePreviousQuestion = () => {
    actions.setError("");

    if (currentQuestion === 0) {
      setStage("intro");
      return;
    }

    setCurrentQuestion((prev) => prev - 1);
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

  const handleFinalizeDiagnosis = async () => {
    if (!ensureComplete()) return;

    actions.setSendStatus({ sending: true, error: undefined });

    const result = await finalizeAndSendDiagnosis(
      state.nombreCompleto,
      state.telefono,
      state.correo,
      state.cliente,
      state.ubicacion,
      state.fecha,
      state.respuestas,
      state.observaciones,
      state.obsGenerales,
    );

    if (result.success && result.sendStatus) {
      actions.setSendStatus({
        sent: true,
        sending: false,
        sentAt: result.sendStatus.sentAt,
        clientEmail: result.sendStatus.clientEmail,
        internalEmail: result.sendStatus.internalEmail,
      });
      actions.setEnviado(true);
    } else {
      actions.setSendStatus({
        sent: false,
        sending: false,
        error: result.error,
      });
      actions.setError(result.error || "Error enviando el diagnóstico.");
    }

    setStage("summary");
  };

  const handleReset = () => {
    const hasContent =
      state.nombreCompleto.trim() !== "" ||
      state.telefono.trim() !== "" ||
      state.correo.trim() !== "" ||
      state.cliente.trim() !== "" ||
      state.ubicacion.trim() !== "" ||
      state.fecha.trim() !== "" ||
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
    setStage("intro");
    setCurrentQuestion(0);
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

        <section className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-4 text-sm font-bold text-[#082247]">
                <span>{progressTitle}</span>
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
                style={{
                  backgroundColor:
                    stage === "summary" && isComplete ? healthStatus.semaforo : "#f97316",
                }}
              />
              <span
                className={
                  stage === "summary" && isComplete ? healthStatus.colorClass : "text-slate-500"
                }
              >
                {progressStatus}
              </span>
            </div>
          </div>
        </section>

        {state.error && (
          <div className="mx-4 mt-4 flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <main className="bg-[#eef3f8] p-4 sm:p-6">
          {stage === "intro" && (
            <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_430px]">
              <div className="flex flex-col justify-center rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="text-sm font-black uppercase text-orange-500">Antes de empezar</div>
                <h3 className="mt-3 text-2xl font-black leading-tight text-[#082247] sm:text-3xl">
                  Evalúa 21 puntos críticos de tu infraestructura IT.
                </h3>
                <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-slate-600">
                  Responderás un diagnóstico breve sobre seguridad, energía, cableado, racks,
                  ambiente físico y documentación. Al terminar tendrás una valoración clara con
                  semáforo, puntuación total y un reporte listo para enviar o descargar.
                </p>
                <div className="mt-7 grid gap-4 sm:grid-cols-3">
                  <IntroFact icon={Clock3} value="3 min" label="Tiempo estimado" />
                  <IntroFact icon={ClipboardCheck} value="21 puntos" label="Revisión guiada" />
                  <IntroFact icon={Check} value="Reporte" label="Resultado accionable" />
                </div>
              </div>

              <form
                className="rounded-lg bg-[#082247] p-5 text-white shadow-sm"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleStart();
                }}
              >
                <div className="mb-5">
                  <h3 className="text-lg font-black">Datos iniciales</h3>
                  <p className="mt-1 text-sm font-semibold text-slate-300">
                    Captura el contacto y el sitio antes de iniciar el flujo.
                  </p>
                </div>

                <div className="grid gap-4">
                  <IntakeField
                    icon={User}
                    label="Nombre completo"
                    required
                    value={state.nombreCompleto}
                    placeholder="Nombre de quien responde"
                    onChange={(value) => {
                      actions.setNombreCompleto(value);
                      markDirty();
                    }}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <IntakeField
                      icon={Phone}
                      label="Teléfono"
                      value={state.telefono}
                      type="tel"
                      inputMode="tel"
                      placeholder="Teléfono"
                      onChange={(value) => {
                        actions.setTelefono(value);
                        markDirty();
                      }}
                    />
                    <IntakeField
                      icon={Mail}
                      label="Correo electrónico"
                      value={state.correo}
                      type="email"
                      inputMode="email"
                      placeholder="correo@empresa.com"
                      onChange={(value) => {
                        actions.setCorreo(value);
                        markDirty();
                      }}
                    />
                  </div>
                  <p className="-mt-2 text-xs font-semibold text-slate-400">
                    Agrega teléfono o correo. Puedes capturar ambos si están disponibles.
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <IntakeField
                      icon={Building2}
                      label="Cliente"
                      required
                      value={state.cliente}
                      placeholder="Empresa o cliente"
                      onChange={(value) => {
                        actions.setCliente(value);
                        markDirty();
                      }}
                    />
                    <IntakeField
                      icon={MapPin}
                      label="Ubicación"
                      required
                      value={state.ubicacion}
                      placeholder="Planta, ciudad o sitio"
                      onChange={(value) => {
                        actions.setUbicacion(value);
                        markDirty();
                      }}
                    />
                  </div>
                  <IntakeField
                    icon={Calendar}
                    label="Fecha"
                    required
                    type="date"
                    value={state.fecha}
                    onChange={(value) => {
                      actions.setFecha(value);
                      markDirty();
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-600"
                >
                  Iniciar diagnóstico
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </section>
          )}

          {stage === "questions" && (
            <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-sm font-black uppercase text-orange-500">
                      Pregunta {currentQuestion + 1} de {TOTAL_QUESTIONS}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-500">
                      Responde el punto actual y avanza al siguiente.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStage("intro")}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-600 transition hover:bg-slate-50"
                  >
                    <User className="h-4 w-4" />
                    Editar datos
                  </button>
                </div>

                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[#082247] text-white">
                    <CurrentQuestionIcon className="h-7 w-7" strokeWidth={2.4} />
                  </span>
                  <h3 className="text-2xl font-black leading-snug text-[#082247]">
                    {currentQuestionData.text}
                  </h3>
                </div>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <AnswerOption
                    active={currentStatus === "si"}
                    title="Saludable"
                    description="Cumple o se encuentra operativo."
                    tone="ok"
                    onClick={() => handleAnswer(currentQuestion, "si")}
                  />
                  <AnswerOption
                    active={currentStatus === "no"}
                    title="Crítico"
                    description="No cumple, presenta riesgo o requiere atención."
                    tone="critical"
                    onClick={() => handleAnswer(currentQuestion, "no")}
                  />
                </div>

                <label htmlFor="observacion-actual" className="mt-6 block">
                  <span className="mb-2 block text-sm font-black uppercase text-[#082247]">
                    Observación
                  </span>
                  <textarea
                    id="observacion-actual"
                    value={state.observaciones[currentQuestion]}
                    onChange={(event) => {
                      actions.setObservacion(currentQuestion, event.target.value);
                      markDirty();
                    }}
                    placeholder="Agrega una nota para este punto si aplica"
                    className="min-h-[120px] w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15"
                  />
                </label>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={handlePreviousQuestion}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {currentQuestion === 0 ? "Volver al inicio" : "Anterior"}
                  </button>
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#082247] px-5 py-3 text-sm font-black text-white transition hover:bg-[#0b315f]"
                  >
                    {currentQuestion === TOTAL_QUESTIONS - 1
                      ? "Finalizar diagnóstico y enviar reporte"
                      : "Siguiente"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <aside className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <div className="text-sm font-black uppercase text-[#082247]">Avance</div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-slate-100 px-2 py-3">
                    <div className="text-xl font-black text-[#082247]">{respondidas}</div>
                    <div className="text-[11px] font-bold uppercase text-slate-500">Listas</div>
                  </div>
                  <div className="rounded-lg bg-emerald-50 px-2 py-3">
                    <div className="text-xl font-black text-emerald-600">{saludables}</div>
                    <div className="text-[11px] font-bold uppercase text-slate-500">Salud</div>
                  </div>
                  <div className="rounded-lg bg-red-50 px-2 py-3">
                    <div className="text-xl font-black text-red-600">{criticos}</div>
                    <div className="text-[11px] font-bold uppercase text-slate-500">Crítico</div>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 text-xs font-black uppercase text-slate-500">
                    Mapa de respuestas
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {state.respuestas.map((respuesta, index) => (
                      <button
                        type="button"
                        key={DIAGNOSTIC_QUESTIONS[index].text}
                        onClick={() => {
                          actions.setError("");
                          setCurrentQuestion(index);
                        }}
                        aria-label={`Ir a la pregunta ${index + 1}`}
                        className={`flex h-8 items-center justify-center rounded-md text-xs font-black ${
                          index === currentQuestion
                            ? "bg-orange-500 text-white"
                            : respuesta === "si"
                              ? "bg-emerald-100 text-emerald-700"
                              : respuesta === "no"
                                ? "bg-red-100 text-red-700"
                                : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-200 pt-4 text-sm">
                  <div className="font-black text-[#082247]">{state.nombreCompleto}</div>
                  <div className="mt-1 font-semibold text-slate-500">{mediosContacto}</div>
                  <div className="mt-3 font-semibold text-slate-600">
                    {state.cliente} · {state.ubicacion}
                  </div>
                  <div className="mt-1 font-semibold text-slate-500">{state.fecha}</div>
                </div>
              </aside>
            </section>
          )}

          {stage === "summary" && (
            <section>
              <div className="mb-4 flex flex-col gap-3 rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-3">
                  <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#082247]" />
                  <div>
                    <div className="font-black text-[#082247]">
                      {isComplete
                        ? "Diagnóstico listo para generar"
                        : "Completa el diagnóstico para habilitar las acciones"}
                    </div>
                    <div className="text-sm font-semibold text-slate-500">
                      {state.nombreCompleto} · {state.cliente} · {state.ubicacion} · {state.fecha}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStage("questions");
                    setCurrentQuestion(0);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Revisar respuestas
                </button>
              </div>

              <section id="diagnostic-summary" className="grid gap-3 md:grid-cols-3">
                <div className="flex flex-col rounded-lg bg-[#082247] p-6 text-white shadow-sm">
                  <div className="mb-4 text-center text-sm font-black uppercase">
                    Puntuación total
                  </div>
                  <div className="flex flex-1 items-center justify-center">
                    <ScoreGauge porcentaje={porcentaje} />
                  </div>
                  <div className="mt-4 text-center text-sm font-semibold text-white/70">
                    {puntos} de {TOTAL_QUESTIONS} puntos en estado saludable
                  </div>
                </div>

                <div className="flex flex-col rounded-lg bg-[#082247] p-6 text-white shadow-sm">
                  <div className="mb-4 text-center text-sm font-black uppercase">
                    Estado de salud IT
                  </div>
                  <div className="flex flex-1 flex-col justify-center">
                    <SemaforoLegend activeLabel={healthStatus.label} isComplete={isComplete} />
                  </div>
                  {!isComplete && (
                    <div className="mt-4 flex items-start gap-2 rounded-md bg-white/10 p-3 text-xs text-white/75">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-orange-300" />
                      <span>
                        El semáforo será definitivo cuando completes los datos y los 21 puntos.
                      </span>
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
                    placeholder="Agrega recomendaciones, hallazgos críticos o próximos pasos para el cliente."
                    className="flex-1 w-full resize-none rounded-md border border-white/20 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500"
                  />
                </div>
              </section>

              <section className="mt-4 flex flex-col gap-4 rounded-lg border border-slate-200 bg-white px-4 py-5">
                {/* Estado de envío */}
                <div className="flex items-center justify-center">
                  {state.sendStatus.sending ? (
                    <div className="flex items-center gap-3 rounded-lg bg-blue-50 px-6 py-4 text-blue-700">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                      <span className="font-semibold">Enviando diagnóstico...</span>
                    </div>
                  ) : state.sendStatus.sent ? (
                    <div className="flex items-center gap-3 rounded-lg bg-green-50 px-6 py-4 text-green-700">
                      <Check className="h-5 w-5" />
                      <div>
                        <div className="font-semibold">Diagnóstico enviado correctamente</div>
                        <div className="text-sm text-green-600">
                          Cliente: {state.sendStatus.clientEmail} · Copia interna:{" "}
                          {state.sendStatus.internalEmail}
                          {state.sendStatus.sentAt &&
                            ` · ${new Date(state.sendStatus.sentAt).toLocaleString()}`}
                        </div>
                      </div>
                    </div>
                  ) : state.sendStatus.error ? (
                    <div className="flex items-center gap-3 rounded-lg bg-red-50 px-6 py-4 text-red-700">
                      <AlertCircle className="h-5 w-5" />
                      <div>
                        <div className="font-semibold">No se pudo enviar el diagnóstico</div>
                        <div className="text-sm text-red-600">{state.sendStatus.error}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-6 py-4 text-slate-700">
                      <Mail className="h-5 w-5" />
                      <div>
                        <div className="font-semibold">Reporte listo para enviar</div>
                        <div className="text-sm text-slate-600">
                          Cliente: {state.correo} · Copia interna:
                          diagnosticos@integraindustrialnetworks.com
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botones principales y secundarios */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    {/* Botón principal */}
                    {!state.sendStatus.sent && !state.sendStatus.sending && (
                      <button
                        type="button"
                        onClick={handleFinalizeDiagnosis}
                        disabled={!isComplete || state.sendStatus.sending}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#082247] px-6 py-3 text-sm font-black text-white transition hover:bg-[#0b315f] disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        <Send className="h-4 w-4" />
                        {state.sendStatus.sending ? "Enviando..." : "Enviar diagnóstico"}
                      </button>
                    )}

                    {/* Botón de reintento en caso de error */}
                    {state.sendStatus.error && !state.sendStatus.sending && (
                      <button
                        type="button"
                        onClick={handleFinalizeDiagnosis}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-sm font-black text-white transition hover:bg-orange-600"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Reintentar envío
                      </button>
                    )}
                  </div>

                  {/* Acciones secundarias */}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (ensureComplete()) setMostrarPreview(true);
                      }}
                      disabled={!isComplete}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <Eye className="h-4 w-4" />
                      Ver PDF
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadPDF}
                      disabled={descargando || !isComplete}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <Download className="h-4 w-4" />
                      {descargando ? "Generando..." : "Descargar PDF"}
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Nuevo diagnóstico
                    </button>
                  </div>
                </div>
              </section>
            </section>
          )}
        </main>

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
                    nombreCompleto={state.nombreCompleto}
                    telefono={state.telefono}
                    correo={state.correo}
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
          nombreCompleto={state.nombreCompleto}
          telefono={state.telefono}
          correo={state.correo}
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

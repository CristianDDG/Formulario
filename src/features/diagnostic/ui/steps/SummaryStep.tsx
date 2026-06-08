import { useMemo } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ClipboardCheck,
  Download,
  Eye,
  MessageCircle,
  RotateCcw,
} from "lucide-react";
import { TOTAL_QUESTIONS } from "@/constants/diagnostics";
import { ScoreGauge } from "@/features/diagnostic/ui/ScoreGauge";
import { SemaforoLegend } from "@/features/diagnostic/ui/SemaforoLegend";
import { DiagnosticResultsSummary } from "@/features/diagnostic/ui/DiagnosticResultsSummary";
import { getSortedDiagnosticResults } from "@/services/diagnostic";
import type { SendStatus, DiagnosticStatus } from "@/types/diagnostic";

interface SummaryStepProps {
  isComplete: boolean;
  criticos: number;
  puntos: number;
  porcentaje: number;
  valoracion: string;
  nombreCompleto: string;
  cliente: string;
  ubicacion: string;
  fecha: string;
  sendStatus: SendStatus;
  descargando: boolean;
  whatsappUrl: string;
  respuestas: DiagnosticStatus[];
  observaciones: string[];
  onReviewAnswers: () => void;
  onShowPreview: () => void;
  onDownloadPDF: () => void;
  onReset: () => void;
}

export function SummaryStep({
  isComplete,
  criticos,
  puntos,
  porcentaje,
  valoracion,
  nombreCompleto,
  cliente,
  ubicacion,
  fecha,
  sendStatus,
  descargando,
  whatsappUrl,
  respuestas,
  observaciones,
  onReviewAnswers,
  onShowPreview,
  onDownloadPDF,
  onReset,
}: SummaryStepProps) {
  const summaryData = useMemo(() => {
    return getSortedDiagnosticResults(respuestas, observaciones);
  }, [respuestas, observaciones]);

  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#082247]" />
          <div>
            <div className="font-black text-[#082247]">Resumen del diagnóstico</div>
            <div className="text-sm font-semibold text-slate-500">
              {nombreCompleto} · {cliente} · {ubicacion} · {fecha}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onReviewAnswers}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Revisar respuestas
        </button>
      </div>

      <section id="diagnostic-summary" className="grid gap-3 md:grid-cols-2">
        <div className="flex flex-col rounded-lg bg-[#082247] p-6 text-white shadow-sm">
          <div className="mb-4 text-center text-sm font-black uppercase tracking-widest">
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
          <div className="mb-4 text-center text-sm font-black uppercase tracking-widest">
            Estado de salud IT
          </div>
          <div className="flex flex-1 flex-col justify-center">
            <SemaforoLegend activeLabel={valoracion} />
          </div>
          {!isComplete && (
            <div className="mt-4 flex items-start gap-2 rounded-md bg-white/10 p-3 text-xs text-white/75">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-orange-300" />
              <span>El semáforo será definitivo cuando completes los datos y los 21 puntos.</span>
            </div>
          )}
        </div>
      </section>

      <div className="relative mt-4 overflow-hidden rounded-xl bg-gradient-to-r from-[#082247] via-[#0b3163] to-[#082247] p-1 shadow-xl ring-1 ring-orange-500/40">
        <div className="relative rounded-xl bg-gradient-to-br from-[#0b2d54] to-[#061a36] px-6 py-5">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-500/20 blur-2xl"
          />
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-white/80">
                <MessageCircle className="h-3.5 w-3.5" />
                Contacto directo con soporte
              </span>
              <h3 className="mt-3 text-xl font-black leading-tight text-white">
                {criticos > 0
                  ? `Se detectaron ${criticos} ${criticos === 1 ? "punto crítico" : "puntos críticos"}`
                  : "¿Deseas apoyo para mantenimiento preventivo?"}
              </h3>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-white/65">
                {criticos > 0
                  ? "Solicita asistencia inmediata por WhatsApp y recibe una propuesta de remediación priorizada."
                  : "Agenda por WhatsApp una revisión técnica y plan anual de continuidad operativa."}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-center gap-2">
              <a
                id="whatsapp-cta-summary"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-3 rounded-xl bg-[#25D366] px-7 py-4 text-base font-black text-white shadow-lg shadow-green-900/30 transition hover:scale-105 hover:bg-[#1ebe5a] active:scale-100"
              >
                <MessageCircle className="h-6 w-6 transition group-hover:rotate-6" />
                Contactar por WhatsApp
              </a>
              <span className="text-[11px] font-bold text-white/40">
                Ing. Jaaziel N. Flores Garcia · 442 749 0997
              </span>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-4 flex flex-col gap-4 rounded-lg border border-slate-200 bg-white px-4 py-5">
        {sendStatus.sent ? (
          <div className="flex flex-col gap-6 w-full">
            <div className="w-full flex items-start gap-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-6 text-green-900 shadow-sm border border-green-200">
              <div className="flex-shrink-0 rounded-full bg-green-200 p-2">
                <Check className="h-6 w-6 text-green-700" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg">Reporte enviado correctamente</div>
                <div className="text-sm font-medium text-green-700 mt-1">
                  ✓ Cliente: {sendStatus.clientEmail}
                </div>
                {sendStatus.sentAt && (
                  <div className="text-xs text-green-600 mt-2">
                    {new Date(sendStatus.sentAt).toLocaleString("es-MX")}
                  </div>
                )}
              </div>
            </div>

            {isComplete && <DiagnosticResultsSummary data={summaryData} />}
          </div>
        ) : sendStatus.error ? (
          <div className="w-full flex items-start gap-3 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 px-6 py-6 text-red-900 shadow-sm border border-red-200">
            <div className="flex-shrink-0 rounded-full bg-red-200 p-2">
              <AlertCircle className="h-6 w-6 text-red-700" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg">No se pudo enviar el reporte</div>
              <div className="text-sm font-medium text-red-700 mt-1">{sendStatus.error}</div>
              <div className="text-xs text-red-600 mt-2">
                Por favor, revisa tus respuestas e intenta nuevamente.
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-black text-white transition hover:bg-green-700 active:scale-95"
          >
            <RotateCcw className="h-4 w-4" />
            Nuevo diagnóstico
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onShowPreview}
              disabled={!isComplete}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Eye className="h-4 w-4" />
              Ver PDF
            </button>
            <button
              type="button"
              onClick={onDownloadPDF}
              disabled={descargando || !isComplete}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Download className="h-4 w-4" />
              {descargando ? "Generando..." : "Descargar PDF"}
            </button>
            {sendStatus.error && (
              <button
                type="button"
                onClick={onReviewAnswers}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-100"
              >
                <ArrowLeft className="h-4 w-4" />
                Revisar respuestas
              </button>
            )}
          </div>
        </div>
      </section>
    </section>
  );
}

import {
  AlertCircle,
  ArrowLeft,
  Check,
  ClipboardCheck,
  Download,
  Eye,
  Mail,
  MessageCircle,
  RotateCcw,
  Send,
} from "lucide-react";
import { EMAIL_CONFIG, TOTAL_QUESTIONS } from "@/constants/diagnostics";
import { ScoreGauge } from "@/features/diagnostic/ui/ScoreGauge";
import { SemaforoLegend } from "@/features/diagnostic/ui/SemaforoLegend";
import type { SendStatus } from "@/types/diagnostic";

interface SummaryStepProps {
  isSendable: boolean;
  isComplete: boolean;
  criticos: number;
  puntos: number;
  porcentaje: number;
  valoracion: string;
  nombreCompleto: string;
  cliente: string;
  ubicacion: string;
  fecha: string;
  correo: string;
  sendStatus: SendStatus;
  descargando: boolean;
  whatsappUrl: string;
  onReviewAnswers: () => void;
  onFinalizeDiagnosis: () => void;
  onShowPreview: () => void;
  onDownloadPDF: () => void;
  onReset: () => void;
}

export function SummaryStep({
  isSendable,
  isComplete,
  criticos,
  puntos,
  porcentaje,
  valoracion,
  nombreCompleto,
  cliente,
  ubicacion,
  fecha,
  correo,
  sendStatus,
  descargando,
  whatsappUrl,
  onReviewAnswers,
  onFinalizeDiagnosis,
  onShowPreview,
  onDownloadPDF,
  onReset,
}: SummaryStepProps) {
  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#082247]" />
          <div>
            <div className="font-black text-[#082247]">
              {isSendable
                ? "Reporte listo para enviar"
                : "Completa el diagnóstico y el correo para habilitar el envío"}
            </div>
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
              <span className="text-[11px] font-bold text-white/40">Jaaziel · 442 749 0997</span>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-4 flex flex-col gap-4 rounded-lg border border-slate-200 bg-white px-4 py-5">
        <div className="flex items-center justify-center">
          {sendStatus.sending ? (
            <div className="flex items-center gap-3 rounded-lg bg-blue-50 px-6 py-4 text-blue-700">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
              <span className="font-semibold">Enviando diagnóstico...</span>
            </div>
          ) : sendStatus.sent ? (
            <div className="flex items-center gap-3 rounded-lg bg-green-50 px-6 py-4 text-green-700">
              <Check className="h-5 w-5" />
              <div>
                <div className="font-semibold">Diagnóstico enviado correctamente</div>
                <div className="text-sm text-green-600">
                  Cliente: {sendStatus.clientEmail} · Copia interna: {sendStatus.internalEmail}
                  {sendStatus.sentAt && ` · ${new Date(sendStatus.sentAt).toLocaleString()}`}
                </div>
              </div>
            </div>
          ) : sendStatus.error ? (
            <div className="flex items-center gap-3 rounded-lg bg-red-50 px-6 py-4 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <div>
                <div className="font-semibold">No se pudo enviar el diagnóstico</div>
                <div className="text-sm text-red-600">{sendStatus.error}</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-6 py-4 text-slate-700">
              <Mail className="h-5 w-5" />
              <div>
                <div className="font-semibold">Reporte listo para enviar</div>
                <div className="text-sm text-slate-600">
                  Cliente: {correo} · Copia interna: {EMAIL_CONFIG.internalReportEmail}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row">
            {!sendStatus.sent && !sendStatus.sending && (
              <button
                type="button"
                onClick={onFinalizeDiagnosis}
                disabled={!isSendable || sendStatus.sending}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#082247] px-6 py-3 text-sm font-black text-white transition hover:bg-[#0b315f] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Send className="h-4 w-4" />
                {sendStatus.sending ? "Enviando..." : "Enviar diagnóstico"}
              </button>
            )}

            {sendStatus.error && !sendStatus.sending && (
              <button
                type="button"
                onClick={onFinalizeDiagnosis}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-sm font-black text-white transition hover:bg-orange-600"
              >
                <RotateCcw className="h-4 w-4" />
                Reintentar envío
              </button>
            )}
          </div>

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
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <RotateCcw className="h-4 w-4" />
              Nuevo diagnóstico
            </button>
          </div>
        </div>
      </section>
    </section>
  );
}

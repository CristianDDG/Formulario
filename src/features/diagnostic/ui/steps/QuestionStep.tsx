import { ArrowLeft, ArrowRight, Info, User, X, Check } from "lucide-react";
import { DIAGNOSTIC_QUESTIONS, TOTAL_QUESTIONS } from "@/constants/diagnostics";
import type { DiagnosticStatus, DiagnosticValue } from "@/types/diagnostic";

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

interface QuestionStepProps {
  currentQuestion: number;
  respuestas: DiagnosticStatus[];
  valores: DiagnosticValue[];
  observaciones: string[];
  respondidas: number;
  saludables: number;
  criticos: number;
  mediosContacto: string;
  nombreCompleto: string;
  cliente: string;
  ubicacion: string;
  fecha: string;
  onEditContact: () => void;
  onSetCurrentQuestion: (index: number) => void;
  onSetObservation: (index: number, value: string) => void;
  onParametricAnswer: (value: DiagnosticValue) => void;
  onPrevious: () => void;
  onNext: () => void;
  onClearError: () => void;
  markDirty: () => void;
}

export function QuestionStep({
  currentQuestion,
  respuestas,
  valores,
  observaciones,
  respondidas,
  saludables,
  criticos,
  mediosContacto,
  nombreCompleto,
  cliente,
  ubicacion,
  fecha,
  onEditContact,
  onSetCurrentQuestion,
  onSetObservation,
  onParametricAnswer,
  onPrevious,
  onNext,
  onClearError,
  markDirty,
}: QuestionStepProps) {
  const currentQuestionData = DIAGNOSTIC_QUESTIONS[currentQuestion];
  const CurrentQuestionIcon = currentQuestionData.icon;
  const currentNumberValue =
    typeof valores[currentQuestion] === "number" ? valores[currentQuestion] : "";

  return (
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
            onClick={onEditContact}
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

        <div className="mt-7">
          {currentQuestionData.tooltip && (
            <div className="mb-6 flex items-start gap-3 rounded-md border border-blue-100 bg-blue-50 p-4 text-sm font-semibold text-blue-800">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
              <span>{currentQuestionData.tooltip}</span>
            </div>
          )}

          {currentQuestionData.inputType === "boolean" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <AnswerOption
                active={valores[currentQuestion] === true}
                title={
                  currentQuestionData.formatValue
                    ? currentQuestionData.formatValue(true).split(",")[0]
                    : "Sí"
                }
                description="Cumple o se encuentra operativo."
                tone="ok"
                onClick={() => onParametricAnswer(true)}
              />
              <AnswerOption
                active={valores[currentQuestion] === false}
                title={
                  currentQuestionData.formatValue
                    ? currentQuestionData.formatValue(false).split(",")[0]
                    : "No"
                }
                description="Requiere atención o presenta riesgo."
                tone="critical"
                onClick={() => onParametricAnswer(false)}
              />
            </div>
          )}

          {currentQuestionData.inputType === "select" && (
            <div className="flex flex-col gap-3">
              {currentQuestionData.options?.map((opt) => {
                const isSelected = valores[currentQuestion] === opt.value;
                const evaluatedStatus = currentQuestionData.evaluate(opt.value);
                return (
                  <AnswerOption
                    key={opt.value}
                    active={isSelected}
                    title={opt.label}
                    description=""
                    tone={evaluatedStatus === "si" ? "ok" : "critical"}
                    onClick={() => onParametricAnswer(opt.value)}
                  />
                );
              })}
            </div>
          )}

          {currentQuestionData.inputType === "number" && (
            <div className="flex items-center gap-4 rounded-lg bg-slate-50 p-6 ring-1 ring-slate-200">
              <input
                type="number"
                value={currentNumberValue}
                onChange={(e) =>
                  onParametricAnswer(e.target.value === "" ? null : Number(e.target.value))
                }
                className="w-40 rounded-lg border border-slate-300 px-4 py-3 text-lg font-black text-[#082247] outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                placeholder="Ej. 24"
              />
              {currentQuestionData.inputSuffix && (
                <span className="text-xl font-bold text-slate-500">
                  {currentQuestionData.inputSuffix}
                </span>
              )}
            </div>
          )}
        </div>

        <label htmlFor="observacion-actual" className="mt-6 block">
          <span className="mb-2 block text-sm font-black uppercase text-[#082247]">
            Observación
          </span>
          <textarea
            id="observacion-actual"
            value={observaciones[currentQuestion]}
            onChange={(event) => {
              onSetObservation(currentQuestion, event.target.value);
              markDirty();
            }}
            placeholder="Agrega una nota para este punto si aplica"
            className="min-h-[120px] w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15"
          />
        </label>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onPrevious}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
            {currentQuestion === 0 ? "Volver al inicio" : "Anterior"}
          </button>
          <button
            type="button"
            onClick={onNext}
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
          <div className="mb-2 text-xs font-black uppercase text-slate-500">Mapa de respuestas</div>
          <div className="grid grid-cols-7 gap-2">
            {respuestas.map((respuesta, index) => (
              <button
                type="button"
                key={DIAGNOSTIC_QUESTIONS[index].text}
                onClick={() => {
                  onClearError();
                  onSetCurrentQuestion(index);
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
          <div className="font-black text-[#082247]">{nombreCompleto}</div>
          <div className="mt-1 font-semibold text-slate-500">{mediosContacto}</div>
          <div className="mt-3 font-semibold text-slate-600">
            {cliente} · {ubicacion}
          </div>
          <div className="mt-1 font-semibold text-slate-500">{fecha}</div>
        </div>
      </aside>
    </section>
  );
}

import { AlertCircle, Check } from "lucide-react";
import type { DiagnosticResultsSummaryData } from "@/types/diagnostic";

export function DiagnosticResultsSummary({ data }: { data: DiagnosticResultsSummaryData }) {
  if (!data || data.items.length === 0) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-center">
        <div className="flex justify-center mb-2">
          <div className="rounded-full bg-slate-100 p-3 text-slate-400">
            <AlertCircle className="h-6 w-6" />
          </div>
        </div>
        <h3 className="text-lg font-black text-[#082247]">No hay resultados disponibles</h3>
        <p className="text-sm font-semibold text-slate-600">
          El reporte fue enviado correctamente, pero no se encontraron puntos de revisión para
          mostrar en este diagnóstico.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-lg font-black text-[#082247]">Resumen de hallazgos</h3>
        <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold text-slate-600">
          <div className="flex items-center gap-1.5 rounded-md bg-slate-100 px-3 py-1">
            <span className="text-slate-800">Total revisados:</span> {data.total}
          </div>
          <div className="flex items-center gap-1.5 rounded-md bg-orange-50 px-3 py-1">
            <span className="text-orange-700">Con hallazgos:</span>{" "}
            {data.criticalCount + data.observationCount}
          </div>
          <div className="flex items-center gap-1.5 rounded-md bg-emerald-50 px-3 py-1">
            <span className="text-emerald-700">Correctos:</span> {data.correctCount}
          </div>
        </div>
      </div>

      <div
        className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2"
        role="list"
        aria-label="Resultados del reporte ordenados por prioridad"
      >
        {data.items.map((item) => (
          <div
            key={item.index}
            role="listitem"
            className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4 shadow-sm transition hover:bg-slate-100"
          >
            <div className="shrink-0 mt-0.5" aria-hidden="true">
              {item.classification === "critical" ? (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-red-600 ring-1 ring-red-200">
                  <AlertCircle className="h-4 w-4" />
                </div>
              ) : item.classification === "observation" ? (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-orange-600 ring-1 ring-orange-200">
                  <AlertCircle className="h-4 w-4" />
                </div>
              ) : item.classification === "correct" ? (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-1 ring-emerald-200">
                  <Check className="h-4 w-4" />
                </div>
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 ring-1 ring-slate-200">
                  <span className="text-xs font-bold">?</span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-500">#{item.index}</span>
                {item.classification === "critical" ? (
                  <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-700 ring-1 ring-inset ring-red-600/20 uppercase tracking-wider">
                    Hallazgo Crítico
                  </span>
                ) : item.classification === "observation" ? (
                  <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-0.5 text-[11px] font-bold text-orange-700 ring-1 ring-inset ring-orange-600/20 uppercase tracking-wider">
                    Observación
                  </span>
                ) : item.classification === "correct" ? (
                  <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 uppercase tracking-wider">
                    Correcto
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 ring-1 ring-inset ring-slate-300 uppercase tracking-wider">
                    Sin clasificar
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-sm font-semibold text-slate-700 leading-snug">
                {item.question}
              </p>
              {item.observation && (
                <div className="mt-2 text-sm text-slate-600 border-l-2 border-orange-300 bg-orange-50/50 p-2 pl-3 italic rounded-r-md">
                  {item.observation}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

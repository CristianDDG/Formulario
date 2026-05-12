import { useRef, useState } from "react";
import { Check, X, User, MapPin, Calendar } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

import { DIAGNOSTIC_QUESTIONS } from "@/constants/diagnostics";
import { useDiagnosticForm } from "@/hooks/useDiagnosticForm";
import {
  calculateDiagnosticScore,
  getHealthStatus,
  validateFormData,
  buildReportPayload,
  submitDiagnosticReport,
} from "@/services/diagnostic";
import { generatePDFFromHTML } from "@/services/pdf";
import DiagnosticoPrintView from "./DiagnosticoPrintView";
import { TopField } from "./form/TopField";
import { ResultsActions } from "./results/ResultsActions";
import { DiagnosticScoreDisplay } from "./results/DiagnosticScoreDisplay";

import logo from "@/assets/integra-logo.png";
import datacenterBg from "@/assets/datacenter-bg.jpg";

/**
 * Main diagnostic form component
 * Manages the IT infrastructure health check assessment
 */
export default function DiagnosticoIT() {
  const [state, actions] = useDiagnosticForm();
  const [descargando, setDescargando] = useState(false);
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const { puntos, porcentaje } = calculateDiagnosticScore(state.respuestas);
  const healthStatus = getHealthStatus(porcentaje);

  // Count answered questions
  const respondidas = state.respuestas.filter((r) => r !== null).length;

  // Handle PDF download
  const handleDownloadPDF = async () => {
    if (!printRef.current) return;

    setDescargando(true);
    const result = await generatePDFFromHTML(printRef.current, {
      filename: `Diagnostico_${state.cliente}_${state.fecha}.pdf`,
    });

    if (!result.success) {
      actions.setError(result.error || "Error generando el PDF. Intenta de nuevo.");
    }

    setDescargando(false);
  };

  // Handle form submission
  const handleSubmit = async () => {
    actions.setError("");

    const validation = validateFormData(state.cliente, state.ubicacion, state.fecha, respondidas);

    if (!validation.valid) {
      actions.setError(validation.error!);
      return;
    }

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

  // Results view
  if (state.enviado) {
    const chartData = [
      { name: "score", value: porcentaje, fill: healthStatus.semaforo },
      { name: "remaining", value: 100 - porcentaje, fill: "hsl(220 15% 25%)" },
    ];

    return (
      <div className="min-h-screen bg-[hsl(220_45%_10%)] py-10 px-4 flex items-center justify-center">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-[hsl(220_60%_18%)] text-white p-8 text-center">
            <h1 className="text-3xl font-bold">Resultado del Diagnóstico</h1>
            <p className="text-sm text-white/70 mt-1">
              {state.cliente} · {state.ubicacion} · {state.fecha}
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Chart */}
            <div className="relative h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="90%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={110}
                    outerRadius={170}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((item, index) => (
                      <Cell key={`cell-${index}`} fill={item.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Score display */}
            <DiagnosticScoreDisplay
              porcentaje={porcentaje}
              puntos={puntos}
              total={21}
              label={healthStatus.label}
              colorClass={healthStatus.colorClass}
              semaforo={healthStatus.semaforo}
            />

            {/* Observations */}
            {state.obsGenerales && (
              <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                <div className="text-xs uppercase font-semibold text-slate-500">
                  Observaciones Generales
                </div>
                <p className="mt-1 text-slate-700 text-sm">{state.obsGenerales}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-8">
              <ResultsActions
                onDownloadPDF={handleDownloadPDF}
                onTogglePreview={() => setMostrarPreview((v) => !v)}
                onReset={actions.reset}
                isDownloading={descargando}
                showingPreview={mostrarPreview}
              />
            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              📧 Reporte enviado al administrador
            </p>

            {/* Preview */}
            {mostrarPreview && (
              <div className="mt-8 border-2 border-dashed border-slate-300 rounded-xl p-3 sm:p-5 bg-slate-100">
                <div className="text-center text-xs uppercase tracking-widest text-slate-500 font-semibold mb-3">
                  Vista previa · Así se verá tu PDF
                </div>
                <div className="overflow-auto flex justify-center">
                  <div
                    style={{
                      transform: "scale(var(--pdf-scale, 0.85))",
                      transformOrigin: "top center",
                      width: "794px",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                    }}
                    className="[--pdf-scale:0.45] sm:[--pdf-scale:0.7] lg:[--pdf-scale:0.85]"
                  >
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
            )}
          </div>
        </div>

        {/* Hidden print reference for PDF generation */}
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

  // Form view
  return (
    <div className="min-h-screen bg-[hsl(220_45%_10%)] py-6 px-3 sm:px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div
          className="relative p-6 sm:p-10 text-white overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(90deg, hsla(220,60%,12%,0.95) 0%, hsla(220,60%,18%,0.85) 50%, hsla(220,55%,25%,0.55) 100%), url(${datacenterBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="flex w-full min-h-[140px] gap-4 md:gap-8">
            {/* Logo */}
            <div className="w-[30%] flex items-center justify-center p-4 md:p-6 shrink-0">
              <img
                src={logo}
                alt="Integra Industrial Networks"
                className="w-full max-w-[160px] md:max-w-[200px] h-auto object-contain"
              />
            </div>

            {/* Title */}
            <div className="w-[70%] flex flex-col justify-center px-6 md:px-12 relative overflow-hidden">
              <div className="relative z-10 flex flex-col items-start">
                <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-wide uppercase">
                  Diagnóstico de salud
                </h1>
                <h2 className="text-xl md:text-3xl font-bold text-[#f97316] mt-1 uppercase">
                  De infraestructura IT
                </h2>
                <div className="h-2 w-36 bg-[#f97316] mt-6 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Form inputs */}
        <div className="bg-[hsl(220_60%_18%)] px-4 sm:px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
          <TopField
            icon={User}
            label="CLIENTE"
            value={state.cliente}
            onChange={actions.setCliente}
          />
          <TopField
            icon={MapPin}
            label="UBICACIÓN"
            value={state.ubicacion}
            onChange={actions.setUbicacion}
          />
          <TopField
            icon={Calendar}
            label="FECHA"
            type="date"
            value={state.fecha}
            onChange={actions.setFecha}
          />
        </div>

        {/* Diagnostic questions table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-3 text-left w-12">No.</th>
                <th className="px-3 py-3 text-left">PUNTO DE REVISIÓN</th>
                <th className="px-3 py-3 text-center w-32">ESTADO</th>
                <th className="px-3 py-3 text-left w-1/3">OBSERVACIONES</th>
              </tr>
            </thead>
            <tbody>
              {DIAGNOSTIC_QUESTIONS.map((question, index) => {
                const Icon = question.icon;
                const currentStatus = state.respuestas[index];

                return (
                  <tr key={index} className="border-t border-slate-100 hover:bg-slate-50/60">
                    <td className="px-3 py-2 text-center bg-[hsl(220_60%_18%)] text-white font-semibold">
                      {index + 1}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-[hsl(220_60%_28%)] shrink-0" />
                        <span className="text-slate-700">{question.text}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => actions.setRespuesta(index, "si")}
                          aria-label="Mark as healthy"
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition border-2 ${
                            currentStatus === "si"
                              ? "bg-emerald-500 border-emerald-500 text-white scale-110 shadow"
                              : "bg-white border-slate-300 text-slate-300 hover:border-emerald-400"
                          }`}
                        >
                          <Check className="w-4 h-4" strokeWidth={3} />
                        </button>
                        <button
                          type="button"
                          onClick={() => actions.setRespuesta(index, "no")}
                          aria-label="Mark as critical"
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition border-2 ${
                            currentStatus === "no"
                              ? "bg-red-500 border-red-500 text-white scale-110 shadow"
                              : "bg-white border-slate-300 text-slate-300 hover:border-red-400"
                          }`}
                        >
                          <X className="w-4 h-4" strokeWidth={3} />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={state.observaciones[index]}
                        onChange={(e) => actions.setObservacion(index, e.target.value)}
                        className="w-full bg-transparent border-b border-slate-200 focus:border-[hsl(220_60%_28%)] outline-none py-1 text-slate-700"
                        placeholder="—"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* General observations */}
        <div className="border-t border-slate-200 px-4 sm:px-6 py-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            OBSERVACIONES GENERALES
          </label>
          <textarea
            value={state.obsGenerales}
            onChange={(e) => actions.setObsGenerales(e.target.value)}
            placeholder="Notas adicionales sobre el diagnóstico..."
            className="w-full p-3 border border-slate-300 rounded-lg text-sm text-slate-700 focus:border-[hsl(220_60%_28%)] outline-none resize-none"
            rows={4}
          />
        </div>

        {/* Error message */}
        {state.error && (
          <div className="mx-4 sm:mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{state.error}</p>
          </div>
        )}

        {/* Submit button */}
        <div className="px-4 sm:px-6 py-6 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={handleSubmit}
            disabled={state.enviando}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[hsl(220_60%_18%)] hover:bg-[hsl(220_60%_24%)] disabled:opacity-60 text-white rounded-lg font-semibold transition shadow-lg"
          >
            <span>{state.enviando ? "Procesando..." : "Enviar Diagnóstico"}</span>
          </button>
        </div>

        {/* Progress indicator */}
        <div className="px-4 sm:px-6 py-3 bg-slate-100 text-center text-xs text-slate-600">
          {respondidas} de {DIAGNOSTIC_QUESTIONS.length} preguntas respondidas
        </div>
      </div>
    </div>
  );
}

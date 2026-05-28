import { useCallback, useRef, useState } from "react";
import { AlertCircle, Globe2, Phone } from "lucide-react";

import { DIAGNOSTIC_QUESTIONS, TOTAL_QUESTIONS } from "@/constants/diagnostics";
import { useDiagnosticForm } from "@/hooks/useDiagnosticForm";
import {
  calculateDiagnosticScore,
  getHealthStatus,
  validateFormData,
  finalizeAndSendDiagnosis,
} from "@/services/diagnostic";
import { generatePDFFromHTML, generatePDFBlobFromHTML } from "@/services/pdf";
import { isValidEmail } from "@/lib/utils";
import type { DiagnosticStatus, DiagnosticValue } from "@/types/diagnostic";
import DiagnosticoPrintView from "./DiagnosticoPrintView";
import { useGeolocation } from "@/features/diagnostic/hooks/useGeolocation";
import { usePreviewModal } from "@/features/diagnostic/hooks/usePreviewModal";
import { DiagnosticPreviewModal } from "@/features/diagnostic/ui/DiagnosticPreviewModal";
import { IntroStep } from "@/features/diagnostic/ui/steps/IntroStep";
import { QuestionStep } from "@/features/diagnostic/ui/steps/QuestionStep";
import { SummaryStep } from "@/features/diagnostic/ui/steps/SummaryStep";
import type { FlowStage } from "@/features/diagnostic/model/types";

import logo from "@/assets/integra-logo.png";
import datacenterBg from "@/assets/datacenter-bg.jpg";

async function blobToBase64(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const chunkSize = 0x8000;
  let binary = "";

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.subarray(offset, Math.min(offset + chunkSize, bytes.length));
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

const WHATSAPP_NUMBER = "524427490997";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola Jaaziel, acabo de completar el Diagnóstico Técnico de Infraestructura IT de Integra y me gustaría recibir asistencia técnica para resolver las incidencias detectadas.")}`;
export default function DiagnosticoIT() {
  const [state, actions] = useDiagnosticForm();
  const [descargando, setDescargando] = useState(false);
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const [stage, setStage] = useState<FlowStage>("intro");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const printRef = useRef<HTMLDivElement>(null);
  const previewPrintRef = useRef<HTMLDivElement>(null);
  const closePreview = useCallback(() => setMostrarPreview(false), []);
  const { geoStatus, detectLocation } = useGeolocation({ setUbicacion: actions.setUbicacion });
  const { previewTitleId, modalCloseRef } = usePreviewModal({
    open: mostrarPreview,
    onClose: closePreview,
  });

  const { puntos, porcentaje } = calculateDiagnosticScore(state.respuestas);
  const healthStatus = getHealthStatus(porcentaje);
  const respondidas = state.respuestas.filter((respuesta) => respuesta !== null).length;
  const saludables = state.respuestas.filter((respuesta) => respuesta === "si").length;
  const criticos = state.respuestas.filter((respuesta) => respuesta === "no").length;
  const faltantes = TOTAL_QUESTIONS - respondidas;
  const currentStatus = state.respuestas[currentQuestion];
  const contactComplete =
    state.nombreCompleto.trim() !== "" &&
    (state.telefono.trim() !== "" || state.correo.trim() !== "");
  const hasClientEmail = state.correo.trim() !== "";
  const siteDetailsComplete = state.cliente.trim() !== "" && state.ubicacion.trim() !== "";
  const hasRequiredFields = contactComplete && siteDetailsComplete;
  const isComplete = hasRequiredFields && respondidas === TOTAL_QUESTIONS;
  const isSendable = isComplete && hasClientEmail && isValidEmail(state.correo.trim());
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
  const printViewProps = {
    nombreCompleto: state.nombreCompleto,
    telefono: state.telefono,
    correo: state.correo,
    cliente: state.cliente,
    ubicacion: state.ubicacion,
    fecha: state.fecha,
    preguntas: DIAGNOSTIC_QUESTIONS,
    respuestas: state.respuestas,
    valores: state.valores,
    observaciones: state.observaciones,
    porcentaje,
    puntos,
    valoracion: healthStatus.label,
  };

  const markDirty = () => {
    if (state.error) actions.setError("");
    if (state.sendStatus.sent || state.sendStatus.error) {
      actions.setSendStatus({
        sent: false,
        sending: false,
        error: undefined,
        sentAt: undefined,
        clientEmail: undefined,
        internalEmail: undefined,
      });
    }
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

    if (!state.cliente.trim() || !state.ubicacion.trim()) {
      actions.setError("Completa los campos de Cliente y Ubicación.");
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

  const handleParametricAnswer = (val: DiagnosticValue) => {
    const q = DIAGNOSTIC_QUESTIONS[currentQuestion];
    actions.setValor(currentQuestion, val);
    const evaluatedStatus: DiagnosticStatus = val !== null && val !== "" ? q.evaluate(val) : null;
    actions.setRespuesta(currentQuestion, evaluatedStatus);
    markDirty();
  };

  const handleNextQuestion = () => {
    if (currentStatus === null) {
      actions.setError("Por favor responde o selecciona una opción para continuar.");
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

  const getActivePrintElement = () => previewPrintRef.current ?? printRef.current;

  const handleDownloadPDF = async () => {
    const printElement = getActivePrintElement();
    if (!printElement || !ensureComplete()) return;

    setDescargando(true);
    const result = await generatePDFFromHTML(printElement, {
      filename: `Diagnostico_${state.cliente}_${state.fecha}.pdf`,
    });

    if (!result.success) {
      actions.setError(result.error || "Error generando el PDF. Intenta de nuevo.");
    }

    setDescargando(false);
  };

  const handleFinalizeDiagnosis = async () => {
    if (!ensureComplete()) return;
    if (!hasClientEmail) {
      actions.setError("Captura el correo del cliente para enviar el diagnóstico.");
      return;
    }
    if (!isValidEmail(state.correo.trim())) {
      actions.setError("El correo del cliente no tiene un formato válido.");
      return;
    }

    const printElement = getActivePrintElement();
    if (!printElement) {
      actions.setError("No se pudo preparar la vista previa para generar el PDF.");
      return;
    }

    actions.setSendStatus({ sending: true, error: undefined });

    const visualPdfResult = await generatePDFBlobFromHTML(printElement, {
      filename: `Diagnostico_${state.cliente}_${state.fecha}.pdf`,
    });

    if (!visualPdfResult.success || !visualPdfResult.pdfBlob) {
      const generationError =
        visualPdfResult.error || "No se pudo generar el PDF visual para el correo.";
      actions.setSendStatus({
        sent: false,
        sending: false,
        error: generationError,
      });
      actions.setError(generationError);
      return;
    }

    const pdfBase64 = await blobToBase64(visualPdfResult.pdfBlob);

    const result = await finalizeAndSendDiagnosis(
      state.nombreCompleto,
      state.telefono,
      state.correo,
      state.cliente,
      state.ubicacion,
      state.fecha,
      state.respuestas,
      state.valores,
      state.observaciones,
      {
        filename: `Diagnostico_${state.cliente}_${state.fecha}.pdf`,
        base64: pdfBase64,
      },
    );

    if (result.success && result.sendStatus) {
      actions.setSendStatus({
        sent: true,
        sending: false,
        sentAt: result.sendStatus.sentAt,
        clientEmail: result.sendStatus.clientEmail,
        internalEmail: result.sendStatus.internalEmail,
      });
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
                Diagnóstico técnico
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
            <IntroStep
              state={state}
              actions={actions}
              geoStatus={geoStatus}
              detectLocation={detectLocation}
              markDirty={markDirty}
              onStart={handleStart}
            />
          )}

          {stage === "questions" && (
            <QuestionStep
              currentQuestion={currentQuestion}
              respuestas={state.respuestas}
              valores={state.valores}
              observaciones={state.observaciones}
              respondidas={respondidas}
              saludables={saludables}
              criticos={criticos}
              mediosContacto={mediosContacto}
              nombreCompleto={state.nombreCompleto}
              cliente={state.cliente}
              ubicacion={state.ubicacion}
              fecha={state.fecha}
              onEditContact={() => setStage("intro")}
              onSetCurrentQuestion={setCurrentQuestion}
              onSetObservation={actions.setObservacion}
              onParametricAnswer={handleParametricAnswer}
              onPrevious={handlePreviousQuestion}
              onNext={handleNextQuestion}
              onClearError={() => actions.setError("")}
              markDirty={markDirty}
            />
          )}

          {stage === "summary" && (
            <SummaryStep
              isSendable={isSendable}
              isComplete={isComplete}
              criticos={criticos}
              puntos={puntos}
              porcentaje={porcentaje}
              valoracion={healthStatus.label}
              nombreCompleto={state.nombreCompleto}
              cliente={state.cliente}
              ubicacion={state.ubicacion}
              fecha={state.fecha}
              correo={state.correo}
              sendStatus={state.sendStatus}
              descargando={descargando}
              whatsappUrl={WHATSAPP_URL}
              onReviewAnswers={() => {
                setStage("questions");
                setCurrentQuestion(0);
              }}
              onFinalizeDiagnosis={() => void handleFinalizeDiagnosis()}
              onShowPreview={() => {
                if (ensureComplete()) setMostrarPreview(true);
              }}
              onDownloadPDF={() => void handleDownloadPDF()}
              onReset={handleReset}
            />
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

      <DiagnosticPreviewModal
        open={mostrarPreview}
        titleId={previewTitleId}
        closeRef={modalCloseRef}
        printRef={previewPrintRef}
        printProps={printViewProps}
        subtitle={`${state.cliente} · ${state.ubicacion} · ${state.fecha}`}
        downloading={descargando}
        onClose={closePreview}
        onDownload={handleDownloadPDF}
      />

      {!mostrarPreview && stage !== "intro" && (
        <div
          style={{
            position: "fixed",
            left: "-99999px",
            top: 0,
            pointerEvents: "none",
          }}
          aria-hidden="true"
        >
          <DiagnosticoPrintView ref={printRef} {...printViewProps} />
        </div>
      )}
    </div>
  );
}

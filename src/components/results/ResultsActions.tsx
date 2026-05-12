import { Download, Eye, RotateCcw } from "lucide-react";

interface ResultsActionsProps {
  onDownloadPDF: () => void;
  onTogglePreview: () => void;
  onReset: () => void;
  isDownloading: boolean;
  showingPreview: boolean;
}

/**
 * Action buttons for results page
 */
export function ResultsActions({
  onDownloadPDF,
  onTogglePreview,
  onReset,
  isDownloading,
  showingPreview,
}: ResultsActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
      <button
        onClick={onDownloadPDF}
        disabled={isDownloading}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-lg font-semibold transition shadow-lg"
      >
        <Download className="w-5 h-5" />
        {isDownloading ? "Generando PDF..." : "Descargar Diagnóstico en PDF"}
      </button>

      <button
        onClick={onTogglePreview}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-[hsl(220_60%_18%)] text-[hsl(220_60%_18%)] hover:bg-slate-50 rounded-lg font-semibold transition"
      >
        <Eye className="w-5 h-5" />
        {showingPreview ? "Ocultar vista previa" : "Vista previa del PDF"}
      </button>

      <button
        onClick={onReset}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[hsl(220_60%_18%)] hover:bg-[hsl(220_60%_24%)] text-white rounded-lg font-medium transition"
      >
        <RotateCcw className="w-4 h-4" />
        Nuevo diagnóstico
      </button>
    </div>
  );
}

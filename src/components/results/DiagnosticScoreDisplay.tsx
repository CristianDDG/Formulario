interface DiagnosticScoreDisplayProps {
  porcentaje: number;
  puntos: number;
  total: number;
  label: string;
  colorClass: string;
  semaforo: string;
}

/**
 * Display score and status badge
 */
export function DiagnosticScoreDisplay({
  porcentaje,
  puntos,
  label,
  colorClass,
  semaforo,
}: DiagnosticScoreDisplayProps) {
  return (
    <div className="mt-6 flex flex-col items-center gap-4">
      {/* Score percentage and points */}
      <div className="text-center">
        <div className="text-5xl font-extrabold text-slate-800">{porcentaje}%</div>
        <div className="text-sm text-slate-500 mt-1">{puntos} puntos de 21</div>
      </div>

      {/* Status badge */}
      <div
        className="inline-flex items-center gap-3 px-6 py-3 rounded-full"
        style={{ backgroundColor: semaforo + "22" }}
      >
        <span className="w-4 h-4 rounded-full" style={{ backgroundColor: semaforo }} />
        <span className={`text-2xl font-bold ${colorClass}`}>{label}</span>
      </div>
    </div>
  );
}

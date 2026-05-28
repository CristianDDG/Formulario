import { Check } from "lucide-react";

const GREEN = "#22c55e";
const YELLOW = "#facc15";
const RED = "#ef4444";

export function SemaforoLegend({ activeLabel }: { activeLabel: string }) {
  const levels = [
    {
      label: "SALUDABLE",
      range: "85 – 100%",
      color: GREEN,
      description:
        "Infraestructura operativa y bien gestionada. Los hallazgos detectados no comprometen la continuidad del servicio en el corto plazo.",
    },
    {
      label: "MEDIO",
      range: "70 – 84%",
      color: YELLOW,
      description:
        "Existen riesgos latentes que requieren atención preventiva. Sin corrección, podrían escalar a fallas operativas en los próximos meses.",
    },
    {
      label: "CRÍTICO",
      range: "< 70%",
      color: RED,
      description:
        "Riesgo inminente de interrupción operativa. Se detectaron vulnerabilidades graves que requieren intervención técnica inmediata.",
    },
  ];

  return (
    <div className="space-y-3">
      {levels.map((level) => {
        const active = level.label === activeLabel;

        return (
          <div
            key={level.label}
            className={`rounded-md border p-4 transition ${
              active ? "border-white/70 bg-white/15" : "border-white/10 bg-white/5 opacity-85"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className="h-7 w-7 shrink-0 rounded-full border border-white/70"
                style={{ backgroundColor: level.color, boxShadow: `0 0 14px ${level.color}80` }}
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-black text-white">
                  {level.range} <span className="font-bold text-white/60">— {level.label}</span>
                </div>
              </div>
              {active && <Check className="h-5 w-5 shrink-0 text-white" strokeWidth={3} />}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-white/75">{level.description}</p>
          </div>
        );
      })}
    </div>
  );
}

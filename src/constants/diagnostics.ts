import {
  Shield,
  Zap,
  BatteryCharging,
  Bolt,
  LayoutGrid,
  Tag,
  Cable,
  Server,
  Plug,
  Network,
  Boxes,
  ClipboardList,
  Thermometer,
  Fan,
  Sparkles,
  Lock,
  Archive,
  Camera,
  Flame,
  AlertTriangle,
  Radio,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface DiagnosticQuestion {
  icon: LucideIcon;
  text: string;
}

/**
 * Health check diagnostic questions for IT infrastructure
 * 21 critical infrastructure assessment points
 */
export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    icon: Shield,
    text: "Ciberseguridad (Firewall, antivirus, accesos, parches)",
  },
  { icon: Zap, text: "¿Resistencia de tierra física menor a 10 ohms?" },
  { icon: BatteryCharging, text: "UPS operativo" },
  { icon: Bolt, text: "Circuito eléctrico exclusivo para MDF e IDFs" },
  { icon: LayoutGrid, text: "Separación física energía/datos" },
  { icon: Tag, text: "Etiquetado nodos" },
  { icon: Cable, text: "Orden cableado" },
  { icon: Server, text: "Patch panels bien rematados y etiquetados" },
  { icon: Plug, text: "Categoría cable" },
  { icon: Network, text: "Planos red" },
  { icon: Boxes, text: "IDF/MDF identificados" },
  { icon: ClipboardList, text: "Inventario de activos" },
  { icon: Thermometer, text: "Temperatura adecuada" },
  { icon: Fan, text: "Flujo de aire óptimo" },
  { icon: Sparkles, text: "Limpieza" },
  { icon: Lock, text: "Acceso controlado al MDF" },
  { icon: Archive, text: "Racks cerrados" },
  { icon: Camera, text: "CCTV" },
  { icon: Flame, text: "Extintor adecuado" },
  { icon: AlertTriangle, text: "Riesgos físicos" },
  { icon: Radio, text: "Fibra óptica identificada" },
];

export const TOTAL_QUESTIONS = DIAGNOSTIC_QUESTIONS.length;

export const COLOR_SCHEME = {
  primary: "hsl(220 60% 18%)",
  accent: "hsl(45 95% 55%)",
  success: "hsl(145 65% 45%)",
  warning: "hsl(45 95% 55%)",
  error: "hsl(0 80% 55%)",
  background: "hsl(220 45% 10%)",
  surface: "#ffffff",
};

export const STATUS_CONFIG = {
  healthy: {
    label: "SALUDABLE",
    colorClass: "text-emerald-500",
    semaforo: COLOR_SCHEME.success,
    minScore: 85,
  },
  medium: {
    label: "MEDIO",
    colorClass: "text-amber-400",
    semaforo: COLOR_SCHEME.warning,
    minScore: 70,
  },
  critical: {
    label: "CRÍTICO",
    colorClass: "text-red-500",
    semaforo: COLOR_SCHEME.error,
    minScore: 0,
  },
};

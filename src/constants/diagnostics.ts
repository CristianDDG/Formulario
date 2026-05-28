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
  id: string;
  icon: LucideIcon;
  text: string;
  tooltip: string;
  riskText: string;
  inputType: "boolean" | "number" | "select";
  inputSuffix?: string;
  options?: { value: string; label: string }[];
  evaluate: (value: unknown) => "si" | "no";
  formatValue?: (value: unknown) => string;
}

/**
 * Health check diagnostic questions for IT infrastructure
 * 21 critical infrastructure assessment points based on TIA-942, ISO 27001, ASHRAE
 */
export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: "ciberseguridad",
    icon: Shield,
    text: "Ciberseguridad (Firewall, antivirus, accesos, parches)",
    tooltip:
      "Gestión activa de amenazas (Zero Trust / Firewall Next-Gen). No solo tener un módem casero.",
    riskText:
      "Riesgo: Exposición inminente a ransomware, robo de información confidencial y posible paralización completa de las operaciones de la empresa.",
    inputType: "select",
    options: [
      { value: "completa", label: "Completa y gestionada" },
      { value: "basica", label: "Básica o parcial" },
      { value: "nula", label: "Nula" },
    ],
    evaluate: (val) => (val === "completa" ? "si" : "no"),
    formatValue: (val) =>
      val === "completa" ? "Completa y gestionada" : val === "basica" ? "Básica o parcial" : "Nula",
  },
  {
    id: "tierra_fisica",
    icon: Zap,
    text: "Resistencia de tierra física",
    tooltip:
      "La norma NOM-001-SEDE e IEEE 1100 exigen valores menores a 5 Ohms para centros de datos, aunque 10 Ohms es el límite aceptable para infraestructura de red.",
    riskText:
      "Riesgo: Probabilidad muy alta de daño físico e irreversible en tarjetas madre y equipos activos por descargas electrostáticas o variaciones climáticas, perdiendo además la garantía de los fabricantes.",
    inputType: "number",
    inputSuffix: "Ohms",
    evaluate: (val) => (typeof val === "number" && val <= 10 ? "si" : "no"),
    formatValue: (val) => `${val} Ohms`,
  },
  {
    id: "ups",
    icon: BatteryCharging,
    text: "Antigüedad de baterías del UPS",
    tooltip:
      "Las baterías VRLA de los UPS pierden su capacidad de retención. Su vida útil confiable es de 3 años como máximo.",
    riskText:
      "Riesgo: Interrupción abrupta de la red y bases de datos ante fallos eléctricos. Apagones 'en caliente' corrompen la información de servidores, parando la operación.",
    inputType: "number",
    inputSuffix: "Años",
    evaluate: (val) => (typeof val === "number" && val <= 3 ? "si" : "no"),
    formatValue: (val) => `${val} años`,
  },
  {
    id: "circuito_electrico",
    icon: Bolt,
    text: "Circuito eléctrico exclusivo para MDF e IDFs",
    tooltip:
      "El cuarto de servidores debe tener un tablero/breakers dedicado, sin compartir con aires acondicionados, alumbrado o contactos de oficinas.",
    riskText:
      "Riesgo: Disparos accidentales de pastillas eléctricas (breakers) por sobrecarga de aparatos de terceros, causando caídas de red masivas e inexplicables.",
    inputType: "boolean",
    evaluate: (val) => (val === true ? "si" : "no"),
    formatValue: (val) => (val === true ? "Sí, exclusivo" : "No, compartido"),
  },
  {
    id: "separacion_energia_datos",
    icon: LayoutGrid,
    text: "Separación física de energía y datos",
    tooltip:
      "Norma TIA-569: Los cables UTP/Fibra deben correr por charolas independientes de los cables eléctricos.",
    riskText:
      "Riesgo: Interferencia electromagnética (EMI) constante que produce lentitud en la red, pérdida de paquetes de datos y llamadas de VoIP o videollamadas entrecortadas.",
    inputType: "boolean",
    evaluate: (val) => (val === true ? "si" : "no"),
    formatValue: (val) => (val === true ? "Sí, separados" : "No, mezclados"),
  },
  {
    id: "etiquetado_nodos",
    icon: Tag,
    text: "Etiquetado de nodos (TIA-606)",
    tooltip:
      "El estándar exige nomenclatura única cruzada: La etiqueta del escritorio debe coincidir matemáticamente con la etiqueta en el patch panel del site.",
    riskText:
      "Riesgo: Tiempos de inactividad de red extremadamente prolongados al intentar resolver fallas simples, impactando directamente en la productividad del usuario afectado.",
    inputType: "boolean",
    evaluate: (val) => (val === true ? "si" : "no"),
    formatValue: (val) => (val === true ? "Sí, etiquetado" : "No, sin etiquetar o deficiente"),
  },
  {
    id: "orden_cableado",
    icon: Cable,
    text: "Orden de cableado (Uso de organizadores y velcro)",
    tooltip:
      "Se deben usar organizadores horizontales/verticales y velcro para agrupar. No usar cinchos de plástico rígidos.",
    riskText:
      "Riesgo: Alto riesgo de desconexiones accidentales al maniobrar en el gabinete, y daño estructural al cobre del cable por estrangulamiento y tensión física.",
    inputType: "boolean",
    evaluate: (val) => (val === true ? "si" : "no"),
    formatValue: (val) => (val === true ? "Sí, ordenado" : "No, 'espagueti'"),
  },
  {
    id: "patch_panels",
    icon: Server,
    text: "Patch panels bien rematados y etiquetados",
    tooltip:
      "Sin pares destrenzados en exceso por la parte trasera, y puertos claramente enumerados al frente.",
    riskText:
      "Riesgo: Atenuación de señal y diafonía (crosstalk). Los equipos negociarán velocidades de conexión lentas (10/100) en lugar de Gigabit, generando quejas por red lenta.",
    inputType: "boolean",
    evaluate: (val) => (val === true ? "si" : "no"),
    formatValue: (val) => (val === true ? "Correctos" : "Incorrectos"),
  },
  {
    id: "categoria_cable",
    icon: Plug,
    text: "Categoría del cableado UTP",
    tooltip:
      "Para redes modernas de Gigabit (1000 Mbps), WiFi 6 y cámaras PoE, el estándar TIA-568 recomienda usar mínimo Categoría 6.",
    riskText:
      "Riesgo: Cuello de botella irreversible en toda la infraestructura. El hardware moderno (switches/APs) funcionará muy por debajo de su capacidad debido a la restricción del cobre.",
    inputType: "select",
    options: [
      { value: "cat6a", label: "Categoría 6A" },
      { value: "cat6", label: "Categoría 6" },
      { value: "cat5e", label: "Categoría 5e o inferior" },
    ],
    evaluate: (val) => (val === "cat6a" || val === "cat6" ? "si" : "no"),
    formatValue: (val) =>
      val === "cat6a" ? "Categoría 6A" : val === "cat6" ? "Categoría 6" : "Categoría 5e o inferior",
  },
  {
    id: "planos_red",
    icon: Network,
    text: "Planos y topología de red documentados",
    tooltip:
      "Documentación de topología lógica (IPs, VLANs) y física (rutas de canalización en planta).",
    riskText:
      "Riesgo: Dependencia absoluta de la memoria de un solo ingeniero. Escalabilidad muy lenta, costos ocultos por retrabajos y retraso inmenso en resolución de contingencias de red.",
    inputType: "boolean",
    evaluate: (val) => (val === true ? "si" : "no"),
    formatValue: (val) => (val === true ? "Sí, existen" : "No hay documentación"),
  },
  {
    id: "identificacion_idf_mdf",
    icon: Boxes,
    text: "IDF y MDF identificados y rotulados",
    tooltip:
      "MDF (Main Distribution Frame) es el site principal. IDF (Intermediate Distribution Frame) son los gabinetes secundarios en pisos o naves de producción.",
    riskText:
      "Riesgo: Retrasos críticos para soporte externo o bomberos al no poder aislar o encontrar el origen de un segmento de red en una emergencia.",
    inputType: "boolean",
    evaluate: (val) => (val === true ? "si" : "no"),
    formatValue: (val) => (val === true ? "Identificados" : "No identificados"),
  },
  {
    id: "inventario_activos",
    icon: ClipboardList,
    text: "Inventario de activos IT (Switches, APs, Firewalls)",
    tooltip:
      "Base de datos con marca, modelo, número de serie y vigencia de licencias/soporte de cada equipo.",
    riskText:
      "Riesgo: Pérdida masiva por hardware obsoleto que llega a su fin de vida (End-of-Life) sin reemplazo planificado, causando paros operativos no presupuestados.",
    inputType: "boolean",
    evaluate: (val) => (val === true ? "si" : "no"),
    formatValue: (val) => (val === true ? "Exhaustivo" : "Deficiente o nulo"),
  },
  {
    id: "temperatura",
    icon: Thermometer,
    text: "Temperatura promedio del MDF",
    tooltip:
      "El estándar ASHRAE indica que la temperatura de entrada frontal de equipos IT debe mantenerse idealmente entre 21°C y 24°C.",
    riskText:
      "Riesgo: Reducción de la vida útil del equipo en un 50% por cada 10°C de exceso. Posibilidad de apagado térmico repentino de servidores críticos y alto peligro de incendio.",
    inputType: "number",
    inputSuffix: "°C",
    evaluate: (val) => (typeof val === "number" && val >= 18 && val <= 25 ? "si" : "no"),
    formatValue: (val) => `${val} °C`,
  },
  {
    id: "flujo_aire",
    icon: Fan,
    text: "Flujo de aire y confinamiento",
    tooltip:
      "Concepto de pasillos. Los switches/servidores respiran aire frío por el frente y expulsan aire caliente por atrás. El Cuarto de IT no debe atrapar aire caliente al frente.",
    riskText:
      "Riesgo: Fatiga prematura de ventiladores internos de servidores y desperdicio eléctrico masivo (los climas trabajan al doble sin lograr enfriar el equipo).",
    inputType: "boolean",
    evaluate: (val) => (val === true ? "si" : "no"),
    formatValue: (val) => (val === true ? "Correcto" : "Recirculación detectada"),
  },
  {
    id: "limpieza",
    icon: Sparkles,
    text: "Limpieza del site (Libre de cajas y polvo)",
    tooltip:
      "El site debe estar libre de materiales de empaque (cartones), polvo espeso o material de intendencia.",
    riskText:
      "Riesgo: El polvo es conductivo y produce descargas de estática en tarjetas madre (daño irreparable). Además, los empaques incrementan severamente el riesgo de incendio.",
    inputType: "boolean",
    evaluate: (val) => (val === true ? "si" : "no"),
    formatValue: (val) => (val === true ? "Limpio" : "Bodega / Polvo"),
  },
  {
    id: "acceso_mdf",
    icon: Lock,
    text: "Control de acceso al MDF",
    tooltip:
      "El ingreso al site debe limitarse exclusivamente a personal de TI y estar bajo llave (preferentemente control de acceso auditable).",
    riskText:
      "Riesgo: Sabotaje intencional o caída accidental del sistema central por entrada de personal de intendencia o empleados no autorizados.",
    inputType: "select",
    options: [
      { value: "biometrico", label: "Biométrico / Tarjeta" },
      { value: "llave", label: "Llave Exclusiva" },
      { value: "abierto", label: "Puerta Abierta / Sin seguro" },
    ],
    evaluate: (val) => (val === "biometrico" || val === "llave" ? "si" : "no"),
    formatValue: (val) =>
      val === "biometrico"
        ? "Biométrico / Tarjeta"
        : val === "llave"
          ? "Llave Exclusiva"
          : "Puerta Abierta",
  },
  {
    id: "racks_cerrados",
    icon: Archive,
    text: "Racks y gabinetes cerrados con llave",
    tooltip:
      "Especialmente importante para los gabinetes (IDFs) que se encuentran en naves de producción o pasillos públicos de oficinas.",
    riskText:
      "Riesgo: Manipulación no autorizada (empleados conectando switches caseros o desconectando cables), creando 'bucles' en la red que paralizan toda la planta.",
    inputType: "boolean",
    evaluate: (val) => (val === true ? "si" : "no"),
    formatValue: (val) => (val === true ? "Cerrados" : "Abiertos / Sin llave"),
  },
  {
    id: "cctv",
    icon: Camera,
    text: "Monitoreo CCTV del site",
    tooltip:
      "Debe haber al menos una cámara documentando los ingresos y egresos al cuarto de comunicaciones principal.",
    riskText:
      "Riesgo: Imposibilidad de realizar auditorías o deslindar responsabilidades legales en caso de sabotaje, extracción de información confidencial o robo de equipo activo.",
    inputType: "boolean",
    evaluate: (val) => (val === true ? "si" : "no"),
    formatValue: (val) => (val === true ? "Con cobertura" : "Nula"),
  },
  {
    id: "extintor",
    icon: Flame,
    text: "Extintor adecuado para electrónica",
    tooltip:
      "Los cuartos IT requieren extinción por gases limpios (HFC-227, Novec 1230 o CO2) que ahogan el fuego sin dejar residuos físicos.",
    riskText:
      "Riesgo: Usar extintores comunes de polvo (PQS) apagará el fuego, pero destruirá corrosivamente todos los servidores y switches, garantizando la pérdida total del hardware.",
    inputType: "select",
    options: [
      { value: "gas", label: "Gas Limpio (CO2, HFC)" },
      { value: "polvo", label: "Polvo Químico (PQS)" },
      { value: "nulo", label: "No hay extintor" },
    ],
    evaluate: (val) => (val === "gas" ? "si" : "no"),
    formatValue: (val) =>
      val === "gas" ? "Gas Limpio" : val === "polvo" ? "Polvo Químico" : "No hay extintor",
  },
  {
    id: "riesgos_fisicos",
    icon: AlertTriangle,
    text: "Ausencia de riesgos hídricos / físicos",
    tooltip:
      "El cuarto no debe estar debajo de baños, sin goteras en techo, ni tuberías de agua atravesando directamente por encima del rack.",
    riskText:
      "Riesgo: Una ruptura de tubería o gotera causará un cortocircuito masivo e inmediato, destruyendo infraestructura de telecomunicaciones costosa que la garantía no cubre.",
    inputType: "boolean",
    evaluate: (val) => (val === true ? "si" : "no"),
    formatValue: (val) => (val === true ? "Ausencia de riesgos" : "Riesgos detectados"),
  },
  {
    id: "fibra_optica",
    icon: Radio,
    text: "Fibra óptica identificada y protegida",
    tooltip:
      "Los tendidos (backbone) de fibra deben indicar su origen y destino claramente, y no estar colgados o tensos sin protección.",
    riskText:
      "Riesgo: Ante una ruptura de un hilo de fibra, el tiempo para encontrar las puntas correctas y realizar un empalme (splicing) será un desastre total, deteniendo la producción.",
    inputType: "boolean",
    evaluate: (val) => (val === true ? "si" : "no"),
    formatValue: (val) => (val === true ? "Sí, protegida" : "Expuesta o no identificada"),
  },
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

export const EMAIL_CONFIG = {
  internalReportEmail: "contacto@integra.red",
  mailFrom: "contacto@integra.red",
};

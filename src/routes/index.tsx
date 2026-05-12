import { createFileRoute } from "@tanstack/react-router";
import DiagnosticoIT from "@/components/DiagnosticoIT";

export const Route = createFileRoute("/")({
  component: DiagnosticoIT,
  head: () => ({
    meta: [
      { title: "Diagnóstico de Salud de Infraestructura IT | Integra Industrial Networks" },
      {
        name: "description",
        content:
          "Formulario interactivo de diagnóstico de salud de infraestructura IT con 21 puntos de revisión y reporte automático.",
      },
    ],
  }),
});

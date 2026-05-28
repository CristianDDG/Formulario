import { describe, expect, it } from "vitest";
import { calculateDiagnosticScore, getHealthStatus, validateFormData } from "@/services/diagnostic";
import { TOTAL_QUESTIONS } from "@/constants/diagnostics";

describe("diagnostic service", () => {
  it("calculates score and percentage", () => {
    const respuestas = Array.from({ length: TOTAL_QUESTIONS }, (_, index) =>
      index < 10 ? "si" : "no",
    ) as Array<"si" | "no">;
    const result = calculateDiagnosticScore(respuestas);

    expect(result.puntos).toBe(10);
    expect(result.porcentaje).toBe(Math.round((10 / TOTAL_QUESTIONS) * 100));
  });

  it("returns health status by threshold", () => {
    expect(getHealthStatus(90).label).toBe("SALUDABLE");
    expect(getHealthStatus(75).label).toBe("MEDIO");
    expect(getHealthStatus(65).label).toBe("CRÍTICO");
  });

  it("validates required fields and completion", () => {
    expect(
      validateFormData(
        "Ana",
        "4421234567",
        "ana@acme.com",
        "ACME",
        "Querétaro",
        "hoy",
        TOTAL_QUESTIONS,
      ),
    ).toEqual({ valid: true });

    expect(
      validateFormData(
        "",
        "4421234567",
        "ana@acme.com",
        "ACME",
        "Querétaro",
        "hoy",
        TOTAL_QUESTIONS,
      ),
    ).toMatchObject({ valid: false });

    expect(
      validateFormData("Ana", "", "", "ACME", "Querétaro", "hoy", TOTAL_QUESTIONS),
    ).toMatchObject({ valid: false });

    expect(
      validateFormData(
        "Ana",
        "4421234567",
        "ana@acme.com",
        "ACME",
        "Querétaro",
        "hoy",
        TOTAL_QUESTIONS - 1,
      ),
    ).toMatchObject({ valid: false });
  });
});

import { useState, useCallback } from "react";
import { TOTAL_QUESTIONS } from "@/constants/diagnostics";
import type { DiagnosticStatus, DiagnosticValue } from "@/types/diagnostic";

export interface UseDiagnosticFormState {
  nombreCompleto: string;
  telefono: string;
  correo: string;
  cliente: string;
  ubicacion: string;
  fecha: string;
  respuestas: DiagnosticStatus[];
  valores: DiagnosticValue[];
  observaciones: string[];
  error: string;
  sendStatus: {
    sent: boolean;
    sending: boolean;
    error?: string;
    sentAt?: string;
    clientEmail?: string;
    internalEmail?: string;
  };
}

export interface UseDiagnosticFormActions {
  setNombreCompleto: (value: string) => void;
  setTelefono: (value: string) => void;
  setCorreo: (value: string) => void;
  setCliente: (value: string) => void;
  setUbicacion: (value: string) => void;
  setRespuesta: (index: number, value: DiagnosticStatus) => void;
  setValor: (index: number, value: DiagnosticValue) => void;
  setObservacion: (index: number, value: string) => void;
  setError: (value: string) => void;
  setSendStatus: (status: Partial<UseDiagnosticFormState["sendStatus"]>) => void;
  reset: () => void;
}

const createInitialState = (): UseDiagnosticFormState => ({
  nombreCompleto: "",
  telefono: "",
  correo: "",
  cliente: "",
  ubicacion: "",
  fecha: new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" }),
  respuestas: Array(TOTAL_QUESTIONS).fill(null),
  valores: Array(TOTAL_QUESTIONS).fill(null),
  observaciones: Array(TOTAL_QUESTIONS).fill(""),
  error: "",
  sendStatus: {
    sent: false,
    sending: false,
  },
});

/**
 * Hook for managing diagnostic form state and actions
 */
export function useDiagnosticForm(): [UseDiagnosticFormState, UseDiagnosticFormActions] {
  const [state, setState] = useState<UseDiagnosticFormState>(createInitialState);

  const setNombreCompleto = useCallback(
    (value: string) => setState((prev) => ({ ...prev, nombreCompleto: value })),
    [],
  );

  const setTelefono = useCallback(
    (value: string) => setState((prev) => ({ ...prev, telefono: value })),
    [],
  );

  const setCorreo = useCallback(
    (value: string) => setState((prev) => ({ ...prev, correo: value })),
    [],
  );

  const setCliente = useCallback(
    (value: string) => setState((prev) => ({ ...prev, cliente: value })),
    [],
  );

  const setUbicacion = useCallback(
    (value: string) => setState((prev) => ({ ...prev, ubicacion: value })),
    [],
  );

  const setRespuesta = useCallback((index: number, value: DiagnosticStatus) => {
    setState((prev) => {
      const next = [...prev.respuestas];
      next[index] = value;
      return { ...prev, respuestas: next };
    });
  }, []);

  const setValor = useCallback((index: number, value: DiagnosticValue) => {
    setState((prev) => {
      const next = [...prev.valores];
      next[index] = value;
      return { ...prev, valores: next };
    });
  }, []);

  const setObservacion = useCallback((index: number, value: string) => {
    setState((prev) => {
      const next = [...prev.observaciones];
      next[index] = value;
      return { ...prev, observaciones: next };
    });
  }, []);

  const setError = useCallback(
    (value: string) => setState((prev) => ({ ...prev, error: value })),
    [],
  );

  const setSendStatus = useCallback((status: Partial<UseDiagnosticFormState["sendStatus"]>) => {
    setState((prev) => ({
      ...prev,
      sendStatus: { ...prev.sendStatus, ...status },
    }));
  }, []);

  const reset = useCallback(() => {
    setState(createInitialState());
  }, []);

  return [
    state,
    {
      setNombreCompleto,
      setTelefono,
      setCorreo,
      setCliente,
      setUbicacion,
      setRespuesta,
      setValor,
      setObservacion,
      setError,
      setSendStatus,
      reset,
    },
  ];
}

import { useState, useCallback } from "react";
import type { DiagnosticStatus } from "@/types/diagnostic";

export interface UseDiagnosticFormState {
  cliente: string;
  ubicacion: string;
  fecha: string;
  respuestas: DiagnosticStatus[];
  observaciones: string[];
  obsGenerales: string;
  enviado: boolean;
  enviando: boolean;
  error: string;
}

export interface UseDiagnosticFormActions {
  setCliente: (value: string) => void;
  setUbicacion: (value: string) => void;
  setFecha: (value: string) => void;
  setRespuesta: (index: number, value: DiagnosticStatus) => void;
  setObservacion: (index: number, value: string) => void;
  setObsGenerales: (value: string) => void;
  setEnviado: (value: boolean) => void;
  setEnviando: (value: boolean) => void;
  setError: (value: string) => void;
  reset: () => void;
}

const initialState: UseDiagnosticFormState = {
  cliente: "",
  ubicacion: "",
  fecha: "",
  respuestas: Array(21).fill(null),
  observaciones: Array(21).fill(""),
  obsGenerales: "",
  enviado: false,
  enviando: false,
  error: "",
};

/**
 * Hook for managing diagnostic form state and actions
 */
export function useDiagnosticForm(): [UseDiagnosticFormState, UseDiagnosticFormActions] {
  const [state, setState] = useState<UseDiagnosticFormState>(initialState);

  const setCliente = useCallback(
    (value: string) => setState((prev) => ({ ...prev, cliente: value })),
    [],
  );

  const setUbicacion = useCallback(
    (value: string) => setState((prev) => ({ ...prev, ubicacion: value })),
    [],
  );

  const setFecha = useCallback(
    (value: string) => setState((prev) => ({ ...prev, fecha: value })),
    [],
  );

  const setRespuesta = useCallback((index: number, value: DiagnosticStatus) => {
    setState((prev) => {
      const next = [...prev.respuestas];
      next[index] = value;
      return { ...prev, respuestas: next };
    });
  }, []);

  const setObservacion = useCallback((index: number, value: string) => {
    setState((prev) => {
      const next = [...prev.observaciones];
      next[index] = value;
      return { ...prev, observaciones: next };
    });
  }, []);

  const setObsGenerales = useCallback(
    (value: string) => setState((prev) => ({ ...prev, obsGenerales: value })),
    [],
  );

  const setEnviado = useCallback(
    (value: boolean) => setState((prev) => ({ ...prev, enviado: value })),
    [],
  );

  const setEnviando = useCallback(
    (value: boolean) => setState((prev) => ({ ...prev, enviando: value })),
    [],
  );

  const setError = useCallback(
    (value: string) => setState((prev) => ({ ...prev, error: value })),
    [],
  );

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return [
    state,
    {
      setCliente,
      setUbicacion,
      setFecha,
      setRespuesta,
      setObservacion,
      setObsGenerales,
      setEnviado,
      setEnviando,
      setError,
      reset,
    },
  ];
}

import { useState, useCallback } from "react";
import type { DiagnosticStatus } from "@/types/diagnostic";

export interface UseDiagnosticFormState {
  nombreCompleto: string;
  telefono: string;
  correo: string;
  cliente: string;
  ubicacion: string;
  fecha: string;
  respuestas: DiagnosticStatus[];
  observaciones: string[];
  obsGenerales: string;
  enviado: boolean;
  enviando: boolean;
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
  setFecha: (value: string) => void;
  setRespuesta: (index: number, value: DiagnosticStatus) => void;
  setObservacion: (index: number, value: string) => void;
  setObsGenerales: (value: string) => void;
  setEnviado: (value: boolean) => void;
  setEnviando: (value: boolean) => void;
  setError: (value: string) => void;
  setSendStatus: (status: Partial<UseDiagnosticFormState["sendStatus"]>) => void;
  reset: () => void;
}

const initialState: UseDiagnosticFormState = {
  nombreCompleto: "",
  telefono: "",
  correo: "",
  cliente: "",
  ubicacion: "",
  fecha: "",
  respuestas: Array(21).fill(null),
  observaciones: Array(21).fill(""),
  obsGenerales: "",
  enviado: false,
  enviando: false,
  error: "",
  sendStatus: {
    sent: false,
    sending: false,
  },
};

/**
 * Hook for managing diagnostic form state and actions
 */
export function useDiagnosticForm(): [UseDiagnosticFormState, UseDiagnosticFormActions] {
  const [state, setState] = useState<UseDiagnosticFormState>(initialState);

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

  const setSendStatus = useCallback((status: Partial<UseDiagnosticFormState["sendStatus"]>) => {
    setState((prev) => ({
      ...prev,
      sendStatus: { ...prev.sendStatus, ...status },
    }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return [
    state,
    {
      setNombreCompleto,
      setTelefono,
      setCorreo,
      setCliente,
      setUbicacion,
      setFecha,
      setRespuesta,
      setObservacion,
      setObsGenerales,
      setEnviado,
      setEnviando,
      setError,
      setSendStatus,
      reset,
    },
  ];
}

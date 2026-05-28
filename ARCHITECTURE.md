# Architecture Documentation

## Overview

Formulario Integra sigue una arquitectura por capas con separación entre frontend, dominio cliente y backend de envío de reportes.

## Layers

```text
UI Layer
  - src/components/*
  - src/features/diagnostic/ui/*
  - src/routes/*

Client Domain Layer
  - src/features/diagnostic/hooks/*
  - src/features/diagnostic/model/*
  - src/services/diagnostic.ts
  - src/hooks/useDiagnosticForm.ts
  - src/constants/diagnostics.ts
  - src/types/diagnostic.ts
  - src/lib/gauge.ts

Server Application Layer
  - src/server.ts
  - src/server/diagnostic-service.ts
```

## Responsibilities

- `DiagnosticoIT.tsx`: orquestador principal de flujo.
- `features/diagnostic/hooks/*`: geolocalización y comportamiento de modal.
- `features/diagnostic/ui/DiagnosticPreviewModal.tsx`: modal de vista previa de PDF.
- `DiagnosticoPrintView.tsx`: vista printable para exportación y adjunto.
- `services/diagnostic.ts`: cálculo de score, validación de formulario y submit al backend.
- `server.ts`: entrypoint SSR + routing de API interna `/api/diagnostic`.
- `server/diagnostic-service.ts`: validación estricta, PDF backend y envío de correos.

## Backend Processing Pipeline

1. Recibir payload (`POST /api/diagnostic`).
2. Validar estructura/tipos y normalizar campos.
3. Recalcular puntuación y estado en servidor.
4. Generar PDF del diagnóstico.
5. Enviar correo al cliente y correo interno.
6. Responder estado final al frontend.

## Security Controls

- Validación de email y longitudes máximas por campo.
- Sanitización HTML para plantillas de correo.
- Rate limiting por IP en `/api/diagnostic`.
- API key opcional para endpoint (`x-diagnostic-api-key`).
- Rechazo de payload incompleto o inconsistente (`400`).
- Rechazo de configuración crítica faltante (`500`).

## Production Readiness Checklist

- `npm run lint` sin errores.
- `npm run typecheck` sin errores.
- `npm run test` sin fallos.
- `npm run build` exitoso (client + SSR).
- `npm run validate` exitoso (lint estricto + typecheck + test + build).
- Variables de entorno de correo configuradas en runtime.
- Monitoreo de errores de envío SMTP/API.

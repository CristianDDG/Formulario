# Formulario Integra

Aplicación web para diagnóstico de infraestructura IT con flujo completo de captura, evaluación, generación de PDF y envío de reportes por correo.

## Funcionalidad

- Captura de contacto, cliente, ubicación y fecha.
- Evaluación de 21 puntos técnicos con estado `Saludable`/`Crítico`.
- Observaciones por punto de revisión.
- Cálculo automático de puntuación y semáforo de salud.
- Generación y descarga de PDF.
- Envío de reporte al cliente y copia interna por correo con Resend + React Email.

## Stack

- React 19
- TanStack Start + TanStack Router
- Vite
- Tailwind CSS
- jsPDF + html2canvas-pro

## Arquitectura

```text
src/
├── components/
│   ├── DiagnosticoIT.tsx
│   └── DiagnosticoPrintView.tsx
├── features/
│   └── diagnostic/
│       ├── hooks/
│       │   ├── useGeolocation.ts
│       │   └── usePreviewModal.ts
│       ├── model/
│       │   └── types.ts
│       └── ui/
│           └── DiagnosticPreviewModal.tsx
├── constants/diagnostics.ts
├── emails/
│   ├── DiagnosticReportEmail.tsx
│   └── components/
│       ├── EmailFooter.tsx
│       ├── EmailHeader.tsx
│       ├── StatusCard.tsx
│       └── SummaryCard.tsx
├── hooks/useDiagnosticForm.ts
├── lib/gauge.ts
├── server/
│   ├── diagnostic-service.ts
│   ├── mailer.ts
│   └── resend.ts
├── services/
│   ├── diagnostic.ts        # Cliente: validación/cálculo/submit API
│   └── pdf.ts               # Generación PDF en navegador
├── types/diagnostic.ts
├── routes/
├── router.tsx
├── server.ts                # API /api/diagnostic
└── start.ts
```

## Variables de entorno

Crea un `.env` basado en `.env.example`:

```bash
INTERNAL_REPORT_EMAIL=tu_correo_interno
MAIL_FROM=tu_correo_para_enviar
RESEND_API_KEY=tu_api_key_resend
```

## Desarrollo

```bash
npm install
npm run dev
```

App local:

```text
http://localhost:3000
```

## Build de producción

```bash
npm run lint:strict
npm run typecheck
npm run test
npm run build
npm run preview
```

Validación integral (CI/local):

```bash
npm run validate
```

## API interna

Endpoint: `POST /api/diagnostic`

Controles aplicados en backend:

- Validación estricta del payload.
- Normalización y límites de longitud de campos.
- Re-cálculo server-side de puntuación/valoración.
- Escape de contenido en HTML de correo.
- Render de correo HTML con templates React Email.
- Rate limiting básico por IP (`429`).
- API key opcional por header `x-diagnostic-api-key` (`401`).
- Manejo de errores con códigos HTTP consistentes.

## Licencia

Proprietary - Integra Industrial Networks

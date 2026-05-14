# Formulario Integra

Formulario Integra es una aplicación web para realizar diagnósticos de infraestructura IT. El proyecto concentra un formulario de 21 puntos de revisión, calcula el estado general del diagnóstico y genera un reporte PDF con la identidad visual de Integra Industrial Networks.

## Funcionalidad

- Captura de cliente, ubicación y fecha del diagnóstico.
- Evaluación de 21 puntos técnicos de infraestructura.
- Observaciones por punto de revisión y observaciones generales.
- Cálculo automático de puntuación y valoración del estado de salud.
- Vista de resultados con gráfica y acciones de reporte.
- Generación de PDF con formato profesional.
- Preparación del payload para integración posterior con backend o servicio de envío.

## Stack

- React 19
- TanStack Start y TanStack Router
- TanStack React Query
- Vite
- Tailwind CSS
- Recharts
- Lucide React
- jsPDF y html2canvas-pro
- Cloudflare Workers / Wrangler

## Estructura

```text
src/
├── assets/                    # Logotipo e imagen de fondo
├── components/
│   ├── form/                  # Campos superiores del formulario
│   ├── results/               # Acciones y visualización de resultados
│   ├── DiagnosticoIT.tsx      # Formulario principal
│   └── DiagnosticoPrintView.tsx
├── constants/
│   └── diagnostics.ts         # Preguntas, umbrales y configuración visual
├── hooks/
│   └── useDiagnosticForm.ts   # Estado del formulario
├── routes/                    # Rutas TanStack
├── services/
│   ├── diagnostic.ts          # Validación, cálculo y payload
│   └── pdf.ts                 # Generación de PDF
├── types/
│   └── diagnostic.ts          # Tipos del dominio
├── router.tsx
├── server.ts
├── start.ts
└── styles.css
```

## Desarrollo

Instalar dependencias:

```bash
npm install
```

Levantar el servidor local:

```bash
npm run dev
```

La aplicación queda disponible en:

```text
http://localhost:3000
```

Levantar la aplicación para usarla mediante Cloudflare Tunnel:

```bash
npm run dev:tunnel
```

Con la ruta publicada del túnel apuntando a `http://localhost:3000`, la aplicación queda disponible en:

```text
https://app-procedures.dev-integra.com
```

Para correr una versión más parecida a producción detrás del túnel:

```bash
npm run start:tunnel
```

La ruta `api-procedures.dev-integra.com` debe apuntar a un backend separado escuchando en `http://localhost:8000`. Este repositorio sólo contiene la aplicación web.

Crear build de producción:

```bash
npm run build
```

Previsualizar el build:

```bash
npm run preview
```

## Calidad

```bash
npm run lint
npm run format
```

## Integración

La función `submitDiagnosticReport` en `src/services/diagnostic.ts` centraliza el punto de integración para un backend, API propia o servicio de envío. La UI no depende de una implementación específica, por lo que la conexión puede añadirse sin modificar el flujo visual del formulario.

## Despliegue

El proyecto está configurado para Vite, TanStack Start y Cloudflare Workers mediante `wrangler.jsonc`. El build genera los artefactos necesarios dentro de `dist/`.

## Licencia

Proprietary - Integra Industrial Networks

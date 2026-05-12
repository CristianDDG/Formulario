# Architecture Documentation

## Overview

This document describes the architecture of Formulario Integra, a custom application for IT infrastructure diagnostics.

## Architectural Principles

### 1. Separation of Concerns

- **Components**: UI rendering only
- **Services**: Business logic and external integrations
- **Hooks**: State management and reusable logic
- **Constants**: Static configuration and questions
- **Types**: Type definitions and interfaces

### 2. Scalability

- Modular component structure
- Easy to add new features
- Service layer for business logic
- Type-safe development

### 3. Maintainability

- Clear file organization
- Self-documenting code with comments
- Consistent naming conventions
- Reusable utilities and hooks

## Layer Architecture

```
┌─────────────────────────────────────┐
│      UI Layer (Components)          │
│  - DiagnosticoIT.tsx               │
│  - DiagnosticoPrintView.tsx         │
│  - Form, Results Components         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    State Management Layer           │
│  - useDiagnosticForm Hook          │
│  - Local Component State           │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     Business Logic Layer            │
│  - services/diagnostic.ts          │
│  - services/pdf.ts                │
│  - Score calculation               │
│  - Report generation               │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Configuration & Constants Layer   │
│  - constants/diagnostics.ts        │
│  - types/diagnostic.ts             │
│  - Questions and settings          │
└─────────────────────────────────────┘
```

## Component Hierarchy

```
App
└── Root Layout (__root.tsx)
    └── Index Route (index.tsx)
        └── DiagnosticoIT
            ├── Form View
            │   ├── TopField (x3)
            │   └── Question Table
            │       └── Question Row (x21)
            └── Results View
                ├── Score Chart
                ├── DiagnosticScoreDisplay
                ├── ResultsActions
                │   ├── Download PDF Button
                │   ├── Preview Button
                │   └── Reset Button
                └── PDF Preview (DiagnosticoPrintView)
```

## Data Flow

### Form Submission Flow

```
User Input
    ↓
useDiagnosticForm Hook (State Management)
    ↓
validateFormData (Business Logic)
    ↓
buildReportPayload (Data Transformation)
    ↓
submitDiagnosticReport (API/Email Integration)
    ↓
Results Display
```

### PDF Generation Flow

```
Print Reference Div
    ↓
generatePDFFromHTML Service
    ↓
html2canvas (Canvas Conversion)
    ↓
jsPDF (PDF Creation)
    ↓
Download File
```

## Services Deep Dive

### `services/diagnostic.ts`

**Responsibility**: Core business logic for diagnostics

**Functions**:

- `calculateDiagnosticScore()` - Score computation
- `getHealthStatus()` - Status determination
- `validateFormData()` - Input validation
- `buildReportPayload()` - Payload construction
- `submitDiagnosticReport()` - Backend integration

**Integration Point**:

```typescript
export async function submitDiagnosticReport(payload) {
  // Backend delivery is connected here when the production endpoint is defined.
}
```

### `services/pdf.ts`

**Responsibility**: PDF generation and download

**Functions**:

- `generatePDFFromHTML()` - Main PDF generation function

**Parameters**:

- `element`: HTML element to convert
- `options.filename`: PDF filename
- `options.scale`: Canvas scale factor
- `options.quality`: JPEG quality

**Error Handling**:

- Graceful error messages
- Console logging for debugging
- Try-catch blocks for safety

## State Management Strategy

### Form State Hook: `useDiagnosticForm`

**State Structure**:

```typescript
{
  cliente: string,
  ubicacion: string,
  fecha: string,
  respuestas: DiagnosticStatus[],
  observaciones: string[],
  obsGenerales: string,
  enviado: boolean,
  enviando: boolean,
  error: string
}
```

**Actions Provided**:

- Individual setters for form fields
- Batch update capabilities
- Reset functionality
- Error state management

**Usage Pattern**:

```typescript
const [state, actions] = useDiagnosticForm();
// Use state.cliente, actions.setCliente(), etc.
```

## Type Safety

### Key Type Definitions

```typescript
// Status types
type DiagnosticStatus = "si" | "no" | null;

// Form data
interface DiagnosticFormData {
  cliente: string;
  ubicacion: string;
  fecha: string;
}

// Results
interface DiagnosticResult {
  puntos: number;
  porcentaje: number;
  valoracion: string;
  // ... more fields
}

// API payload
interface DiagnosticReportPayload {
  // Complete structure
}
```

## Constants Organization

### `constants/diagnostics.ts`

**Contains**:

- 21 diagnostic questions with icons
- Color scheme definitions
- Status thresholds (85%, 70%)
- UI constants

**Benefits**:

- Easy to modify questions
- Centralized configuration
- No magic numbers in code

## Component Patterns

### Smart vs Presentation Components

**Smart Components** (Connected):

- `DiagnosticoIT.tsx` - Main orchestrator
- Handles state, side effects, data fetching

**Presentation Components** (Dumb):

- `TopField.tsx` - Simple input field
- `DiagnosticScoreDisplay.tsx` - Display only
- `ResultsActions.tsx` - UI only

## Performance Optimizations

### 1. Code Splitting

- TanStack Router handles route-based splitting
- Lazy loading of image assets

### 2. State Management

- Custom hook reduces re-renders
- UseCallback for event handlers
- Efficient state updates

### 3. PDF Generation

- Image preloading before conversion
- Async/await for non-blocking operations
- Error handling with fallbacks

## Error Handling Strategy

### Form Level

```typescript
validateFormData() → { valid, error }
// Return error message to display
```

### Service Level

```typescript
try {
  // Operation
} catch (error) {
  // Return { ok: false, error: message }
}
```

### Component Level

```typescript
{state.error && <ErrorMessage />}
// Display error to user
```

## Extensibility Points

### 1. Add New Questions

```typescript
// In constants/diagnostics.ts
export const DIAGNOSTIC_QUESTIONS = [
  // Add new question with icon
];
```

### 2. Integrate Backend Delivery

```typescript
// In services/diagnostic.ts
export async function submitDiagnosticReport(payload) {
  // Connect the selected backend or delivery service here.
}
```

### 3. Custom Report Sections

```typescript
// Create new component in components/results/
// Add to DiagnosticoIT results view
```

### 4. Modify Health Status Rules

```typescript
// In constants/diagnostics.ts
export const STATUS_CONFIG = {
  // Adjust thresholds as needed
};
```

## Best Practices Applied

### 1. Component Organization

- One component per file
- Clear responsibility
- Proper prop types
- Meaningful names

### 2. Code Quality

- Full TypeScript coverage
- Proper error handling
- Meaningful comments
- DRY principle

### 3. Performance

- Efficient rendering
- Proper memoization
- Lazy loading where applicable

### 4. Maintainability

- Clear file structure
- Separation of concerns
- Reusable utilities
- Consistent patterns

## Testing Considerations

### Unit Tests

- Test service functions with various inputs
- Test validation logic
- Test state hook behaviors

### Integration Tests

- Test component interactions
- Test form submission flow
- Test PDF generation

### E2E Tests

- Test complete user workflows
- Test PDF download functionality
- Test error scenarios

## Future Enhancements

### 1. Advanced Features

- Multiple report formats (Word, Excel)
- Report scheduling and automation
- Historical comparison
- Analytics dashboard

### 2. Integrations

- CRM/ERP system integration
- Email service automation
- Cloud storage (S3, OneDrive)
- Analytics platforms

### 3. Optimizations

- Server-side rendering (SSR)
- Caching strategies
- Progressive Web App (PWA) support
- Offline mode

## Deployment Considerations

### Build Output

```bash
npm run build
# Creates dist/ folder with production build
```

### Hosting Options

- Vercel
- Netlify
- Cloud Run
- Cloudflare Workers

## Monitoring and Logging

### Application Logging

- Console logs for development
- Error boundaries for React errors
- Service error handling

### Recommended Services

- Sentry for error tracking
- Datadog for monitoring
- LogRocket for session replay

---

**Last Updated**: May 12, 2026
**Version**: 1.0.0
**Status**: Production Ready

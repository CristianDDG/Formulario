import {
  ArrowRight,
  Building2,
  Check,
  ClipboardCheck,
  Clock3,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import type { InputHTMLAttributes } from "react";
import type { UseDiagnosticFormActions, UseDiagnosticFormState } from "@/hooks/useDiagnosticForm";
import type { GeoStatus } from "@/features/diagnostic/hooks/useGeolocation";

function IntakeField({
  icon: Icon,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  inputMode,
}: {
  icon: typeof User;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-slate-300">
        <Icon className="h-4 w-4 text-orange-400" />
        {label}
        {required && <span className="text-orange-300">*</span>}
      </span>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-lg border border-white/15 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/25"
      />
    </label>
  );
}

function IntroFact({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Clock3;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 border-t border-slate-200 pt-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <div className="text-base font-black text-[#082247]">{value}</div>
        <div className="text-sm font-semibold text-slate-500">{label}</div>
      </div>
    </div>
  );
}

interface IntroStepProps {
  state: UseDiagnosticFormState;
  actions: Pick<
    UseDiagnosticFormActions,
    "setNombreCompleto" | "setTelefono" | "setCorreo" | "setCliente" | "setUbicacion"
  >;
  geoStatus: GeoStatus;
  detectLocation: () => Promise<void>;
  markDirty: () => void;
  onStart: () => void;
}

export function IntroStep({
  state,
  actions,
  geoStatus,
  detectLocation,
  markDirty,
  onStart,
}: IntroStepProps) {
  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_430px]">
      <div className="flex flex-col justify-center rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="text-sm font-black uppercase text-orange-500">Antes de empezar</div>
        <h3 className="mt-3 text-2xl font-black leading-tight text-[#082247] sm:text-3xl">
          Evalúa 21 puntos críticos de tu infraestructura IT.
        </h3>
        <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-slate-600">
          Responderás un diagnóstico breve sobre seguridad, energía, cableado, racks, ambiente
          físico y documentación. Al terminar tendrás una valoración clara con semáforo, puntuación
          total y un reporte listo para enviar o descargar.
        </p>
        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          <IntroFact icon={Clock3} value="3 min" label="Tiempo estimado" />
          <IntroFact icon={ClipboardCheck} value="21 puntos" label="Revisión guiada" />
          <IntroFact icon={Check} value="Reporte" label="Resultado accionable" />
        </div>
      </div>

      <form
        className="rounded-lg bg-[#082247] p-5 text-white shadow-sm"
        onSubmit={(event) => {
          event.preventDefault();
          onStart();
        }}
      >
        <div className="mb-5">
          <h3 className="text-lg font-black">Datos iniciales</h3>
          <p className="mt-1 text-sm font-semibold text-slate-300">
            Captura el contacto y el sitio antes de iniciar el flujo.
          </p>
        </div>

        <div className="grid gap-4">
          <IntakeField
            icon={User}
            label="Nombre completo"
            required
            value={state.nombreCompleto}
            placeholder="Nombre de quien responde"
            onChange={(value) => {
              actions.setNombreCompleto(value);
              markDirty();
            }}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <IntakeField
              icon={Phone}
              label="Teléfono"
              value={state.telefono}
              type="tel"
              inputMode="tel"
              placeholder="Teléfono"
              onChange={(value) => {
                actions.setTelefono(value);
                markDirty();
              }}
            />
            <IntakeField
              icon={Mail}
              label="Correo electrónico"
              value={state.correo}
              type="email"
              inputMode="email"
              placeholder="correo@empresa.com"
              onChange={(value) => {
                actions.setCorreo(value);
                markDirty();
              }}
            />
          </div>
          <p className="-mt-2 text-xs font-semibold text-slate-400">
            Agrega teléfono o correo. Puedes capturar ambos si están disponibles.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <IntakeField
              icon={Building2}
              label="Cliente"
              required
              value={state.cliente}
              placeholder="Empresa o cliente"
              onChange={(value) => {
                actions.setCliente(value);
                markDirty();
              }}
            />
            <div className="block">
              <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-slate-300">
                <MapPin className="h-4 w-4 text-orange-400" />
                Ubicación
                <span className="text-orange-300">*</span>
                {geoStatus === "loading" && (
                  <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-slate-400">
                    <span className="h-2 w-2 animate-spin rounded-full border border-orange-400 border-t-transparent" />
                    Detectando...
                  </span>
                )}
                {geoStatus === "done" && (
                  <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                    <Check className="h-3 w-3" />
                    Detectado
                  </span>
                )}
                {geoStatus === "error" && (
                  <span className="ml-auto text-[10px] font-bold text-red-300">
                    Sin permiso de ubicación
                  </span>
                )}
              </span>
              <input
                type="text"
                value={state.ubicacion}
                onChange={(event) => {
                  actions.setUbicacion(event.target.value);
                  markDirty();
                }}
                placeholder={
                  geoStatus === "loading"
                    ? "Obteniendo ubicación..."
                    : "Ubicación manual o automática"
                }
                className="h-12 w-full rounded-lg border border-white/15 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/25"
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-slate-400">
                  Puedes capturar la ubicación manualmente o detectarla automáticamente.
                </p>
                <button
                  type="button"
                  onClick={() => void detectLocation()}
                  disabled={geoStatus === "loading"}
                  className="inline-flex shrink-0 items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-slate-200 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  Detectar ubicación
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-600"
        >
          Iniciar diagnóstico
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    </section>
  );
}

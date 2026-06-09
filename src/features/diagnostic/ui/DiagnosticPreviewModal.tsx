import type { RefObject } from "react";
import { X } from "lucide-react";
import DiagnosticoPrintView, { type PrintViewProps } from "@/components/DiagnosticoPrintView";

interface DiagnosticPreviewModalProps {
  open: boolean;
  titleId: string;
  closeRef: RefObject<HTMLButtonElement | null>;
  printRef: RefObject<HTMLDivElement | null>;
  printProps: PrintViewProps;
  subtitle: string;
  downloading: boolean;
  onClose: () => void;
  onDownload: () => void;
}

export function DiagnosticPreviewModal({
  open,
  titleId,
  closeRef,
  printProps,
  subtitle,
  onClose,
}: DiagnosticPreviewModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-3"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <div id={titleId} className="text-sm font-black text-[#082247]">
              Vista previa del PDF
            </div>
            <div className="text-xs text-slate-500">{subtitle}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Cerrar vista previa"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="overflow-auto bg-slate-100 p-4">
          <div className="flex min-w-[820px] justify-center">
            <div className="origin-top scale-[0.74] lg:scale-[0.86]">
              <DiagnosticoPrintView {...printProps} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

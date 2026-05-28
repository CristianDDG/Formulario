import { useEffect, useId, useRef } from "react";

interface UsePreviewModalParams {
  open: boolean;
  onClose: () => void;
}

export function usePreviewModal({ open, onClose }: UsePreviewModalParams) {
  const previewTitleId = useId();
  const modalCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modalCloseRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return { previewTitleId, modalCloseRef };
}

/**
 * PDF generation utilities using html2canvas-pro and jsPDF.
 *
 * Supports two rendering strategies:
 * 1. **Per-page** (preferred): If the source element contains children
 *    with class `.pdf-page`, each child is captured individually and
 *    placed on its own A4 page. This guarantees no content is ever
 *    sliced across page boundaries.
 * 2. **Legacy single-canvas**: Falls back to capturing the entire
 *    element and slicing it into pages when `.pdf-page` children
 *    are not found.
 */

export interface PDFGenerationOptions {
  filename?: string;
  scale?: number;
  quality?: number;
  marginMm?: number;
}

const DEFAULT_OPTIONS: PDFGenerationOptions = {
  filename: "Diagnostico_Infraestructura_IT.pdf",
  scale: 3,
  quality: 1,
  marginMm: 0,
};

/**
 * Wait for every <img> inside `root` to finish loading.
 */
async function waitForImages(root: HTMLElement): Promise<void> {
  const images = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    images.map((img) =>
      img.complete && img.naturalWidth > 0
        ? Promise.resolve()
        : new Promise((resolve) => {
            img.onload = img.onerror = () => resolve(null);
          }),
    ),
  );
}

/**
 * Capture a single HTML element to a canvas via html2canvas-pro.
 */
async function captureElement(
  element: HTMLElement,
  renderScale: number,
): Promise<HTMLCanvasElement> {
  const { default: html2canvas } = await import("html2canvas-pro");

  const rect = element.getBoundingClientRect();
  const w = Math.max(element.scrollWidth, element.offsetWidth, Math.ceil(rect.width));
  const h = Math.max(element.scrollHeight, element.offsetHeight, Math.ceil(rect.height));

  if (w <= 0 || h <= 0) {
    throw new Error("No se pudo calcular el tamaño del contenido para exportar el PDF.");
  }

  return html2canvas(element, {
    scale: renderScale,
    width: w,
    height: h,
    windowWidth: w,
    windowHeight: h,
    backgroundColor: "#ffffff",
    useCORS: true,
    allowTaint: true,
    foreignObjectRendering: false,
    imageTimeout: 15000,
    removeContainer: true,
    logging: false,
    scrollX: 0,
    scrollY: 0,
  });
}

/**
 * Core: build a PDF Blob from an HTML element.
 */
async function buildPDFBlobFromHTMLElement(
  element: HTMLElement,
  options: PDFGenerationOptions = {},
): Promise<Blob> {
  const finalOptions = { ...DEFAULT_OPTIONS, ...options };
  const { default: jsPDF } = await import("jspdf");

  await waitForImages(element);

  const renderScale = Math.max(
    2,
    Math.min(4, finalOptions.scale ?? Math.ceil((window.devicePixelRatio || 1) * 2)),
  );

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
    putOnlyUsedFonts: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  /* ── Strategy 1: Explicit .pdf-page children ── */
  const pages = Array.from(element.querySelectorAll<HTMLElement>(".pdf-page"));

  if (pages.length > 0) {
    for (let i = 0; i < pages.length; i++) {
      const canvas = await captureElement(pages[i], renderScale);
      const imgData = canvas.toDataURL("image/png", finalOptions.quality);

      if (i > 0) {
        pdf.addPage("a4", "portrait");
      }

      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight, undefined, "FAST");
    }

    return pdf.output("blob");
  }

  /* ── Strategy 2: Legacy single-canvas slice ── */
  const marginMm = Math.max(0, finalOptions.marginMm ?? DEFAULT_OPTIONS.marginMm ?? 0);
  const contentWidthMm = pageWidth - marginMm * 2;
  const contentHeightMm = pageHeight - marginMm * 2;

  const canvas = await captureElement(element, renderScale);
  const fullWidthHeightMm = (canvas.height * contentWidthMm) / canvas.width;
  const imgData = canvas.toDataURL("image/png", finalOptions.quality);

  if (fullWidthHeightMm <= contentHeightMm) {
    const yMm = marginMm + (contentHeightMm - fullWidthHeightMm) / 2;
    pdf.addImage(
      imgData,
      "PNG",
      marginMm,
      yMm,
      contentWidthMm,
      fullWidthHeightMm,
      undefined,
      "FAST",
    );
  } else {
    const pxPerMm = canvas.width / contentWidthMm;
    const pageHeightPx = Math.round(contentHeightMm * pxPerMm);
    const overlapPx = 4;

    let offsetY = 0;
    let pageIndex = 0;

    while (offsetY < canvas.height) {
      const remainingPx = canvas.height - offsetY;
      const sliceHeightPx = Math.min(pageHeightPx, remainingPx);

      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeightPx;

      const pageCtx = pageCanvas.getContext("2d");
      if (!pageCtx) {
        throw new Error("No se pudo crear el contexto de canvas para la exportación PDF.");
      }

      pageCtx.drawImage(
        canvas,
        0,
        offsetY,
        canvas.width,
        sliceHeightPx,
        0,
        0,
        canvas.width,
        sliceHeightPx,
      );

      if (pageIndex > 0) {
        pdf.addPage("a4", "portrait");
      }

      const sliceHeightMm = sliceHeightPx / pxPerMm;
      const pageImgData = pageCanvas.toDataURL("image/png", finalOptions.quality);
      pdf.addImage(
        pageImgData,
        "PNG",
        marginMm,
        marginMm,
        contentWidthMm,
        sliceHeightMm,
        undefined,
        "FAST",
      );

      if (offsetY + sliceHeightPx >= canvas.height) {
        offsetY += sliceHeightPx;
      } else {
        offsetY += Math.max(1, sliceHeightPx - overlapPx);
      }
      pageIndex += 1;
    }
  }

  return pdf.output("blob");
}

export async function generatePDFBlobFromHTML(
  element: HTMLElement,
  options: PDFGenerationOptions = {},
): Promise<{ success: boolean; pdfBlob?: Blob; error?: string }> {
  try {
    const pdfBlob = await buildPDFBlobFromHTMLElement(element, options);
    return { success: true, pdfBlob };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("❌ PDF generation failed:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Generate and download PDF from HTML element
 */
export async function generatePDFFromHTML(
  element: HTMLElement,
  options: PDFGenerationOptions = {},
): Promise<{ success: boolean; error?: string }> {
  const finalOptions = { ...DEFAULT_OPTIONS, ...options };

  try {
    const pdfBlob = await buildPDFBlobFromHTMLElement(element, finalOptions);
    const objectUrl = URL.createObjectURL(pdfBlob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = finalOptions.filename || DEFAULT_OPTIONS.filename!;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("❌ PDF generation failed:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

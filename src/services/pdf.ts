/**
 * PDF generation utilities using html2canvas and jsPDF
 */

export interface PDFGenerationOptions {
  filename?: string;
  scale?: number;
  quality?: number;
}

const DEFAULT_OPTIONS: PDFGenerationOptions = {
  filename: "Diagnostico_Infraestructura_IT.pdf",
  scale: 2,
  quality: 0.95,
};

/**
 * Generate and download PDF from HTML element
 */
export async function generatePDFFromHTML(
  element: HTMLElement,
  options: PDFGenerationOptions = {},
): Promise<{ success: boolean; error?: string }> {
  const finalOptions = { ...DEFAULT_OPTIONS, ...options };

  try {
    const { default: html2canvas } = await import("html2canvas-pro");
    const { default: jsPDF } = await import("jspdf");

    // Wait for all images to load
    const images = Array.from(element.querySelectorAll("img"));
    await Promise.all(
      images.map((img) =>
        img.complete && img.naturalWidth > 0
          ? Promise.resolve()
          : new Promise((resolve) => {
              img.onload = img.onerror = () => resolve(null);
            }),
      ),
    );

    // Convert HTML to canvas
    const canvas = await html2canvas(element, {
      scale: finalOptions.scale,
      backgroundColor: "#ffffff",
      useCORS: true,
      allowTaint: true,
      logging: false,
    });

    // Create PDF with proper dimensions
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const canvasRatio = canvas.width / canvas.height;

    let pdfWidth = pageWidth;
    let pdfHeight = pageWidth / canvasRatio;

    if (pdfHeight > pageHeight) {
      pdfHeight = pageHeight;
      pdfWidth = pageHeight * canvasRatio;
    }

    const xPosition = (pageWidth - pdfWidth) / 2;
    const yPosition = (pageHeight - pdfHeight) / 2;

    pdf.addImage(imgData, "PNG", xPosition, yPosition, pdfWidth, pdfHeight);
    pdf.save(finalOptions.filename || DEFAULT_OPTIONS.filename!);

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("❌ PDF generation failed:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

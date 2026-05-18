import fs from "fs";
import path from "path";
import integraLogoBase64 from "@/assets/integra-logo.png?inline";

/** Content-ID referenced in HTML as `cid:integra-logo` (Resend inline attachment). */
export const EMAIL_LOGO_CONTENT_ID = "integra-logo";

export const EMAIL_LOGO_CID_SRC = `cid:${EMAIL_LOGO_CONTENT_ID}`;

export interface EmailInlineLogoAttachment {
  filename: string;
  content: string;
  contentId: string;
  contentType: string;
}

let cachedInlineLogo: EmailInlineLogoAttachment | null = null;

export function getEmailInlineLogoAttachment(): EmailInlineLogoAttachment {
  if (cachedInlineLogo) {
    return cachedInlineLogo;
  }

  let content = "";

  // Attempt to read the physical file from the workspace to get real binary base64
  try {
    const possiblePaths = [
      path.join(process.cwd(), "src/assets/integra-logo.png"),
      path.join(process.cwd(), "assets/integra-logo.png"),
      path.join(process.cwd(), "dist/client/assets/integra-logo.png"),
    ];

    let fileBytes: Buffer | null = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        fileBytes = fs.readFileSync(p);
        break;
      }
    }

    if (fileBytes) {
      content = fileBytes.toString("base64");
    }
  } catch (err) {
    console.error("Error reading logo file from filesystem in getEmailInlineLogoAttachment:", err);
  }

  // Fallback to inlined bundler string if file system read failed
  if (!content) {
    if (integraLogoBase64 && integraLogoBase64.startsWith("data:image")) {
      content = integraLogoBase64.replace(/^data:image\/png;base64,/i, "");
    }
  }

  if (!content) {
    throw new Error("El logo del correo no pudo cargarse en base64 ni del sistema de archivos.");
  }

  cachedInlineLogo = {
    filename: "integra-logo.png",
    content,
    contentId: EMAIL_LOGO_CONTENT_ID,
    contentType: "image/png",
  };

  return cachedInlineLogo;
}

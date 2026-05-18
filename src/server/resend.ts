import { Resend } from "resend";

type ResendEnv = {
  RESEND_API_KEY?: string;
};

let cachedApiKey = "";
let cachedClient: Resend | null = null;

export function getResendClient(env: ResendEnv): Resend {
  const apiKey = (env.RESEND_API_KEY || process.env.RESEND_API_KEY || "").trim();

  if (!apiKey) {
    throw new Error("RESEND_API_KEY no está configurado.");
  }

  if (!cachedClient || cachedApiKey !== apiKey) {
    cachedApiKey = apiKey;
    cachedClient = new Resend(apiKey);
  }

  return cachedClient;
}

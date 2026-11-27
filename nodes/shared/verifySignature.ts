import crypto from "crypto";

/**
 * Verifica o header X-ZapAPI-Signature-256 (formato `sha256=<hexhmac>`),
 * HMAC-SHA256 do corpo cru com o secret registrado. Comparação timing-safe.
 */
export function verifySignature(
  rawBody: string,
  secret: string,
  signatureHeader: string | undefined
): boolean {
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) return false;
  const provided = signatureHeader.slice("sha256=".length);
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(provided, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

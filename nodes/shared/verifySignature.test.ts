import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { verifySignature } from "./verifySignature";

function sign(body: string, secret: string): string {
  return "sha256=" + crypto.createHmac("sha256", secret).update(body).digest("hex");
}

describe("verifySignature", () => {
  const secret = "s3cr3t";
  const body = JSON.stringify({ event: "message.received", data: { x: 1 } });

  it("aceita assinatura válida", () => {
    expect(verifySignature(body, secret, sign(body, secret))).toBe(true);
  });

  it("rejeita assinatura inválida", () => {
    expect(verifySignature(body, secret, sign(body, "outro"))).toBe(false);
  });

  it("rejeita header ausente/undefined", () => {
    expect(verifySignature(body, secret, undefined)).toBe(false);
    expect(verifySignature(body, secret, "")).toBe(false);
  });

  it("rejeita formato sem prefixo sha256=", () => {
    const hex = crypto.createHmac("sha256", secret).update(body).digest("hex");
    expect(verifySignature(body, secret, hex)).toBe(false);
  });

  it("não lança com comprimentos diferentes (timingSafe guard)", () => {
    expect(verifySignature(body, secret, "sha256=abc")).toBe(false);
  });
});

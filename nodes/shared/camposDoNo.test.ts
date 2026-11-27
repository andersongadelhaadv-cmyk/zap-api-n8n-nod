import { describe, expect, it } from "vitest";
import { ZapApi } from "../ZapApi/ZapApi.node";
import { rotuloDaInstancia } from "./loadOptions";

const campo = (nome: string) => new ZapApi().description.properties.find((p) => p.name === nome)!;

describe("nó ZAP-API: o n8n barra o envio vazio antes de chamar a API", () => {
  it("Text é obrigatório (a API devolvia 400 'body é obrigatório')", () => {
    expect(campo("text").required).toBe(true);
  });
  it("Media URL é obrigatório nos tipos de mídia", () => {
    expect(campo("mediaUrl").required).toBe(true);
  });
  it("Phone explica o formato", () => {
    expect(campo("phone").description).toMatch(/DDI/);
  });
});

describe("lista de instâncias", () => {
  it("mostra o nome e avisa suspensa/cancelada", () => {
    expect(rotuloDaInstancia({ instanceId: "inst_1", displayName: "Escritório", status: "active" })).toBe("Escritório");
    expect(rotuloDaInstancia({ instanceId: "inst_1", displayName: "Escritório", status: "suspended" })).toBe("Escritório (suspensa)");
    expect(rotuloDaInstancia({ instanceId: "inst_1", status: "cancelled" })).toBe("inst_1 (cancelada)");
  });
});

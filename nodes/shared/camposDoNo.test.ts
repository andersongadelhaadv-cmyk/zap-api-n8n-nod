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

describe("lista de instâncias sem credencial (primeira abertura do nó)", () => {
  it("devolve a orientação em vez de erro", async () => {
    const { getInstances, AVISO_SEM_CREDENCIAL } = await import("./loadOptions");
    const ctx = {
      getCredentials: async () => {
        throw new Error("Node does not have any credentials set");
      },
    };
    const r = await getInstances.call(ctx as never);
    expect(r).toEqual([AVISO_SEM_CREDENCIAL]);
  });

  it("com credencial, erro da API continua aparecendo (não é engolido)", async () => {
    const { getInstances } = await import("./loadOptions");
    const ctx = {
      getCredentials: async () => ({ baseUrl: "https://api.zap-api.tech/v1" }),
      helpers: {
        httpRequestWithAuthentication: {
          call: async () => {
            throw new Error("401");
          },
        },
      },
    };
    await expect(getInstances.call(ctx as never)).rejects.toThrow("401");
  });
});

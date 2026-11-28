import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  Icon,
  INodeProperties,
} from "n8n-workflow";

export class ZapApiApi implements ICredentialType {
  name = "zapApiApi";

  displayName = "ZAP-API API";

  icon: Icon = { light: "file:../nodes/ZapApi/zapapi.svg", dark: "file:../nodes/ZapApi/zapapi.svg" };

  // Página pública (a de docs do painel exige login: quem ainda não tem conta
  // batia numa tela fechada). UTM mede quantos cadastros vêm do nó.
  documentationUrl = "https://zap-api.tech/integracoes/n8n?utm_source=n8n&utm_medium=node&utm_campaign=credencial";

  properties: INodeProperties[] = [
    {
      displayName: "Base URL",
      name: "baseUrl",
      type: "string",
      default: "https://api.zap-api.tech/v1",
      description: "URL base da API (inclui /v1)",
    },
    {
      displayName: "API Token",
      name: "apiToken",
      type: "string",
      typeOptions: { password: true },
      default: "",
      required: true,
      description:
        "Token da instância (tk_...), em Painel ZAP-API → Instâncias. Cada token vale para UMA instância: é ela que aparece na lista do nó. Para usar outro número, crie outra credencial com o token dele. Ainda não tem conta? <a href=\"https://zap-api.tech/integracoes/n8n?utm_source=n8n&utm_medium=node&utm_campaign=token\">Teste 7 dias grátis</a>.",
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: "generic",
    properties: {
      headers: { Authorization: "=Bearer {{$credentials.apiToken}}" },
    },
  };

  // Valida a chave ao salvar: GET /instances deve responder 2xx.
  test: ICredentialTestRequest = {
    request: {
      baseURL: "={{$credentials.baseUrl}}",
      url: "/instances",
    },
  };
}

import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from "n8n-workflow";

export class ZapApiApi implements ICredentialType {
  name = "zapApiApi";

  displayName = "ZAP-API API";

  documentationUrl = "https://zap-api.tech/dashboard/docs";

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
      description: "Token da instância (tk_...). Painel ZAP-API → Instâncias.",
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

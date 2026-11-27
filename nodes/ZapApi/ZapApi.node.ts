import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from "n8n-workflow";
import { getInstances } from "../shared/loadOptions";

export class ZapApi implements INodeType {
  description: INodeTypeDescription = {
    displayName: "ZAP-API",
    name: "zapApi",
    icon: { light: "file:zapapi.svg", dark: "file:zapapi.svg" },
    group: ["output"],
    version: 1,
    subtitle: '={{"Enviar para " + $parameter["phone"]}}',
    description: "Enviar mensagens WhatsApp via ZAP-API",
    defaults: { name: "ZAP-API" },
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    usableAsTool: true,
    credentials: [{ name: "zapApiApi", required: true }],
    requestDefaults: {
      baseURL: "={{$credentials.baseUrl}}",
      headers: { "Content-Type": "application/json" }
    },
    properties: [
      { displayName: "Resource", name: "resource", type: "hidden", default: "message" },
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        options: [
          {
            name: "Send",
            value: "send",
            action: "Send a message",
            routing: {
              request: {
                method: "POST",
                url: "=/instances/{{$parameter.instanceId}}/send"
              }
            }
          }
        ],
        default: "send"
      },
      {
        displayName: "Instance Name or ID",
        name: "instanceId",
        type: "options",
        typeOptions: { loadOptionsMethod: "getInstances" },
        default: "",
        required: true,
        description:
          "Escolha a instância. Choose from the list, or specify an ID using an <a href=\"https://docs.n8n.io/code/expressions/\">expression</a>."
      },
      {
        displayName: "Phone",
        name: "phone",
        type: "string",
        default: "",
        required: true,
        placeholder: "5511999999999",
        description:
          "Número de destino com DDI e DDD, só dígitos (ex.: 5511999999999). Para grupo, use o ID terminado em @g.us",
        routing: { send: { type: "body", property: "phone" } }
      },
      {
        displayName: "Type",
        name: "type",
        type: "options",
        options: [
          { name: "Audio", value: "audio" },
          { name: "Document", value: "document" },
          { name: "Image", value: "image" },
          { name: "Text", value: "text" },
          { name: "Video", value: "video" }
        ],
        default: "text",
        routing: { send: { type: "body", property: "type" } }
      },
      {
        displayName: "Text",
        name: "text",
        type: "string",
        typeOptions: { rows: 3 },
        default: "",
        required: true,
        description: "Texto da mensagem",
        displayOptions: { show: { type: ["text"] } },
        // O campo do wire chama-se `body` — a API rejeita `text` com 400
        // ("body é obrigatório para type=text"). O `name` interno segue "text"
        // de propósito: renomear apagaria o valor salvo em workflows existentes.
        routing: { send: { type: "body", property: "body" } }
      },
      {
        displayName: "Media URL",
        name: "mediaUrl",
        type: "string",
        default: "",
        required: true,
        placeholder: "https://exemplo.com/arquivo.pdf",
        description: "Link público (https) do arquivo. Precisa abrir sem login",
        displayOptions: { show: { type: ["image", "audio", "video", "document"] } },
        routing: { send: { type: "body", property: "mediaUrl" } }
      },
      {
        displayName: "Caption",
        name: "caption",
        type: "string",
        default: "",
        displayOptions: { show: { type: ["image", "video", "document"] } },
        routing: { send: { type: "body", property: "caption" } }
      },
      {
        displayName: "File Name",
        name: "fileName",
        type: "string",
        default: "",
        displayOptions: { show: { type: ["document"] } },
        routing: { send: { type: "body", property: "fileName" } }
      }
    ]
  };

  methods = {
    loadOptions: { getInstances }
  };
}

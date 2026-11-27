import type { INodeType, INodeTypeDescription } from "n8n-workflow";
import { getInstances } from "../shared/loadOptions";

export class ZapApi implements INodeType {
  description: INodeTypeDescription = {
    displayName: "ZAP-API",
    name: "zapApi",
    icon: "file:zapapi.svg",
    group: ["output"],
    version: 1,
    subtitle: '={{"Enviar para " + $parameter["phone"]}}',
    description: "Enviar mensagens WhatsApp via ZAP-API",
    defaults: { name: "ZAP-API" },
    inputs: ["main"],
    outputs: ["main"],
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
          "Escolha a instância. Choose from the list, or specify an ID using an expression."
      },
      {
        displayName: "Phone",
        name: "phone",
        type: "string",
        default: "",
        required: true,
        placeholder: "5511999999999",
        routing: { send: { type: "body", property: "phone" } }
      },
      {
        displayName: "Type",
        name: "type",
        type: "options",
        options: [
          { name: "Text", value: "text" },
          { name: "Image", value: "image" },
          { name: "Audio", value: "audio" },
          { name: "Video", value: "video" },
          { name: "Document", value: "document" }
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
        placeholder: "https://exemplo.com/arquivo.pdf",
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

import {
  NodeApiError,
  NodeConnectionTypes,
  NodeOperationError,
  type IDataObject,
  type IHookFunctions,
  type INodeType,
  type INodeTypeDescription,
  type IWebhookFunctions,
  type IWebhookResponseData,
  type JsonObject,
} from "n8n-workflow";
import { getInstances } from "../shared/loadOptions";
import { verifySignature } from "../shared/verifySignature";

const EVENT_OPTIONS = [
  "call.received",
  "call.rejected",
  "contact.update",
  "group.join",
  "group.leave",
  "group.update",
  "instance.connected",
  "instance.disconnected",
  "instance.qrcode",
  "instance.test",
  "label.update",
  "message.deleted",
  "message.edited",
  "message.read",
  "message.reaction",
  "message.received",
  "message.sent",
  "message.status",
  "newsletter.update",
  "presence.update",
  "status.viewed",
].map((e) => ({ name: e, value: e }));

export class ZapApiTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: "ZAP-API Trigger",
    name: "zapApiTrigger",
    icon: { light: "file:zapapi.svg", dark: "file:zapapi.svg" },
    group: ["trigger"],
    version: 1,
    subtitle: '={{"Eventos: " + $parameter["events"].join(", ")}}',
    description: "Inicia o workflow em eventos do WhatsApp (ZAP-API)",
    defaults: { name: "ZAP-API Trigger" },
    inputs: [],
    outputs: [NodeConnectionTypes.Main],
    credentials: [{ name: "zapApiApi", required: true }],
    webhooks: [
      {
        name: "default",
        httpMethod: "POST",
        responseMode: "onReceived",
        path: "webhook",
      },
    ],
    properties: [
      {
        displayName:
          "Ativar este trigger SOBRESCREVE o webhook configurado na instância (uma URL por instância). Ao desativar, o webhook é limpo.",
        name: "overwriteNotice",
        type: "notice",
        default: "",
      },
      {
        displayName: "Instance Name or ID",
        name: "instanceId",
        type: "options",
        typeOptions: { loadOptionsMethod: "getInstances" },
        default: "",
        required: true,
        description:
          "Escolha a instância. Choose from the list, or specify an ID using an <a href=\"https://docs.n8n.io/code/expressions/\">expression</a>.",
      },
      {
        displayName: "Events",
        name: "events",
        type: "multiOptions",
        options: EVENT_OPTIONS,
        default: ["message.received"],
        required: true,
        description: "Quais eventos disparam o workflow",
      },
      {
        displayName: "Verify Signature",
        name: "verifySignature",
        type: "boolean",
        default: true,
        // eslint-disable-next-line n8n-nodes-base/node-param-description-boolean-without-whether
        description:
          "Whether to verify the X-ZapAPI-Signature-256 HMAC of each incoming webhook",
      },
      {
        displayName:
          "Com a verificação desligada, qualquer um que souber a URL do webhook pode disparar este fluxo. Mantenha ligada em produção.",
        name: "noVerifyNotice",
        type: "notice",
        default: "",
        displayOptions: { show: { verifySignature: [false] } },
      },
    ],
  };

  methods = {
    loadOptions: { getInstances },
  };

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        // Always (re)create on activation — PUT is idempotent (overwrites the URL).
        return false;
      },

      async create(this: IHookFunctions): Promise<boolean> {
        const webhookUrl = this.getNodeWebhookUrl("default") as string;
        const instanceId = this.getNodeParameter("instanceId") as string;
        const events = this.getNodeParameter("events") as string[];
        const creds = await this.getCredentials("zapApiApi");

        let response: { webhookSecret?: string };
        try {
          response = (await this.helpers.httpRequestWithAuthentication.call(this, "zapApiApi", {
            method: "PUT",
            baseURL: creds.baseUrl as string,
            url: `/instances/${instanceId}/webhook`,
            // secret: true → a ZAP-API gera um secret novo e o RETORNA na resposta.
            body: { url: webhookUrl, events, secret: true },
            json: true,
          })) as { webhookSecret?: string };
        } catch (error) {
          throw new NodeApiError(this.getNode(), error as JsonObject, {
            message: `Falha ao registrar o webhook na instância ${instanceId} (verifique o token, o ID da instância e se a URL do n8n é pública HTTPS)`,
          });
        }

        if (!response?.webhookSecret) {
          throw new NodeOperationError(
            this.getNode(),
            "A ZAP-API não retornou o webhookSecret ao registrar — não é possível verificar a assinatura. Verifique a versão da API.",
          );
        }
        this.getWorkflowStaticData("node").secret = response.webhookSecret;
        return true;
      },

      async delete(this: IHookFunctions): Promise<boolean> {
        const instanceId = this.getNodeParameter("instanceId") as string;
        const creds = await this.getCredentials("zapApiApi");
        try {
          await this.helpers.httpRequestWithAuthentication.call(this, "zapApiApi", {
            method: "DELETE",
            baseURL: creds.baseUrl as string,
            url: `/instances/${instanceId}/webhook`,
            json: true,
          });
        } catch (error) {
          // Best-effort: a instância pode já não existir. Registra e segue —
          // desativar o workflow não pode falhar por causa disso.
          this.logger.warn(
            `ZAP-API: não foi possível limpar o webhook da instância ${instanceId}: ${(error as Error).message}`,
          );
        }
        const staticData = this.getWorkflowStaticData("node");
        delete staticData.secret;
        return true;
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const shouldVerify = this.getNodeParameter("verifySignature") as boolean;
    const body = this.getBodyData();

    if (shouldVerify) {
      const staticData = this.getWorkflowStaticData("node");
      const secret = staticData.secret as string | undefined;
      const headers = this.getHeaderData();
      // headers são lowercased pelo Node.js; "X-ZapAPI-Signature-256" chega assim:
      const sig = headers["x-zapapi-signature-256"] as string | undefined;

      // Prefer raw body (n8n populates req.rawBody); fallback to deterministic
      // re-serialisation (our payload is a plain object, JSON.stringify is stable).
      const req = this.getRequestObject() as unknown as { rawBody?: Buffer };
      const raw = req.rawBody ? req.rawBody.toString("utf8") : JSON.stringify(body);

      if (!secret || !verifySignature(raw, secret, sig)) {
        const res = this.getResponseObject();
        res.status(401).send("invalid signature");
        return { noWebhookResponse: true };
      }
    }

    return {
      workflowData: [this.helpers.returnJsonArray([body as IDataObject])],
    };
  }
}

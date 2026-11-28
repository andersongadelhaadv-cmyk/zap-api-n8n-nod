import type { ILoadOptionsFunctions, INodePropertyOptions } from "n8n-workflow";

/**
 * Popula o dropdown de instâncias chamando GET {baseUrl}/instances com a
 * credential. Compartilhado pelos nodes ZapApi e ZapApiTrigger.
 *
 * A API responde { instances: [{ id, instanceId, displayName, ... }] }. O
 * `value` é o `instanceId` público (inst_...) — é o `:id` que as rotas
 * /instances/:id/* esperam.
 */
export const AVISO_SEM_CREDENCIAL: INodePropertyOptions = {
  name: "Select a Credential Above, Then Close and Reopen This Node",
  value: "",
};

export async function getInstances(
  this: ILoadOptionsFunctions
): Promise<INodePropertyOptions[]> {
  // Ao adicionar o nó, o n8n pede a lista ANTES de pôr a credencial no nó e não
  // pede de novo quando ela entra (getCredentials lança "Node does not have any
  // credentials set" e a tela só mostra "Error fetching options"). Em vez do erro
  // mudo, a lista explica o que fazer.
  let creds;
  try {
    creds = await this.getCredentials("zapApiApi");
  } catch {
    return [AVISO_SEM_CREDENCIAL];
  }
  const res = (await this.helpers.httpRequestWithAuthentication.call(this, "zapApiApi", {
    method: "GET",
    baseURL: creds.baseUrl as string,
    url: "/instances",
    json: true,
  })) as unknown;

  // Cobre array direto, { instances: [...] } e { data: [...] }.
  const list = (
    Array.isArray(res)
      ? res
      : ((res as { instances?: unknown[]; data?: unknown[] })?.instances ??
        (res as { data?: unknown[] })?.data ??
        [])
  ) as Array<{ instanceId?: string; id?: string; displayName?: string; status?: string }>;

  return list.map((i) => ({
    name: rotuloDaInstancia(i),
    value: (i.instanceId || i.id) as string,
  }));
}

/** Nome na lista; instância suspensa ou cancelada avisa no próprio nome (o envio por ela falha). */
export function rotuloDaInstancia(i: { instanceId?: string; id?: string; displayName?: string; status?: string }): string {
  const nome = (i.displayName || i.instanceId || i.id || "") as string;
  if (i.status === "suspended") return `${nome} (suspensa)`;
  if (i.status === "cancelled") return `${nome} (cancelada)`;
  return nome;
}

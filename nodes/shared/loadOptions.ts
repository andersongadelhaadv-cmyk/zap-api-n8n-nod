import type { ILoadOptionsFunctions, INodePropertyOptions } from "n8n-workflow";

/**
 * Popula o dropdown de instâncias chamando GET {baseUrl}/instances com a
 * credential. Compartilhado pelos nodes ZapApi e ZapApiTrigger.
 *
 * A API responde { instances: [{ id, instanceId, displayName, ... }] }. O
 * `value` é o `instanceId` público (inst_...) — é o `:id` que as rotas
 * /instances/:id/* esperam.
 */
export async function getInstances(
  this: ILoadOptionsFunctions
): Promise<INodePropertyOptions[]> {
  const creds = await this.getCredentials("zapApiApi");
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
  ) as Array<{ instanceId?: string; id?: string; displayName?: string }>;

  return list.map((i) => ({
    name: (i.displayName || i.instanceId || i.id) as string,
    value: (i.instanceId || i.id) as string,
  }));
}

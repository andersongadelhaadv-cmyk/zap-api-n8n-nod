# n8n-nodes-zap-api

Community node da [ZAP-API](https://zap-api.tech/integracoes/n8n?utm_source=n8n&utm_medium=readme) (WhatsApp) para o [n8n](https://n8n.io).

## Instalação

n8n → **Settings → Community Nodes → Install** → `n8n-nodes-zap-api`.

## Credential

Crie uma credential **ZAP-API API**: `Base URL` (default `https://api.zap-api.tech/v1`)
e seu **API Token** (`tk_...`, do painel → Instâncias). Ao salvar, a credential é
validada com um `GET /instances`.

## Nodes

- **ZAP-API** (ação): operação *Send* — envia texto / imagem / áudio / vídeo / documento
  (`type` + `mediaUrl`).
- **ZAP-API Trigger**: inicia o workflow em eventos (ex: `message.received`,
  `message.status`, `instance.connected`, ...). Ao **ativar**, registra o webhook da
  instância na URL do n8n e guarda o secret HMAC; ao **desativar**, limpa o webhook.
  Cada evento recebido é verificado via `X-ZapAPI-Signature-256` (HMAC) — pode desligar
  em *Verify Signature*, mas não é recomendado em produção.

### Requisitos do Trigger

- A instância precisa de uma **URL pública HTTPS** (n8n Cloud ou self-hosted com ingress
  público) — webhooks **não** são entregues a IP privado/localhost (proteção anti-SSRF).
- **Atenção:** ativar o trigger **sobrescreve** um webhook já configurado na instância
  (uma URL por instância).

## Publicação (mantenedor)

```bash
cd n8n-node && npm run build && npm publish --access public
```
Requer `npm login` com permissão no pacote.

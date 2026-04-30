import type { Response } from "express";

type SseClient = {
  id: string;
  res: Response;
};

const clients = new Set<SseClient>();

export function addSseClient(res: Response): SseClient {
  const client: SseClient = { id: Math.random().toString(36).slice(2), res };
  clients.add(client);
  res.on("close", () => clients.delete(client));
  return client;
}

export type SseEventName =
  | "order_created"
  | "order_updated"
  | "inventory_updated"
  | "heartbeat";

export function broadcastEvent(event: SseEventName, data: unknown = {}) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    try {
      client.res.write(payload);
    } catch {
      clients.delete(client);
    }
  }
}

// Send a heartbeat every 20 seconds to keep connections alive through proxies
setInterval(() => broadcastEvent("heartbeat", { ts: Date.now() }), 20_000);

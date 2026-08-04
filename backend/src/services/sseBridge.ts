import { Request, Response } from 'express';

const clients = new Set<Response>();

// 承接前端 EventSource 发起的 SSE 长连接
export default function sseBridge(req: Request, res: Response) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  res.write(': connected\n\n');

  clients.add(res);

  res.on('close', () => {
    clients.delete(res);
  });
}

export function sendSseToAll(eventName: string, data: {
  deviceid: string;
  params: Record<string, any>;
} | { cloudSideConnect: boolean;ihostConnect: boolean }) {
  const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;

  for (const client of clients) {

    client.write(payload);
  }
}

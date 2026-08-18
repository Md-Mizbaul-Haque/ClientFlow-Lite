import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { getRealtimeHub } from "@/lib/realtime";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();
  const hub = getRealtimeHub();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (data: string) => {
        try {
          controller.enqueue(encoder.encode(data));
        } catch {
          /* stream closed */
        }
      };

      const heartbeat = setInterval(() => {
        send(`: ping\n\n`);
      }, 25_000);

      const unsubscribe = hub.subscribe((event) => {
        send(`event: ${event.type}\ndata: ${JSON.stringify({ id: event.id, payload: event.payload })}\n\n`);
      });

      send(`event: connected\ndata: ${JSON.stringify({ ok: true })}\n\n`);

      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
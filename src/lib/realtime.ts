import "server-only";

export interface RealtimeEvent {
  type: string;
  id: string;
  payload?: Record<string, unknown>;
}

type Listener = (event: RealtimeEvent) => void;

/**
 * In-process SSE hub. Single-instance deployments get true realtime;
 * multi-instance deployments fall back to client-side refetching.
 */
class RealtimeHub {
  private listeners = new Set<Listener>();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  publish(event: RealtimeEvent) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch {
        /* ignore listener errors */
      }
    });
  }
}

declare global {
  var __cflRealtimeHub: RealtimeHub | undefined;
}

export function getRealtimeHub() {
  if (!globalThis.__cflRealtimeHub) {
    globalThis.__cflRealtimeHub = new RealtimeHub();
  }
  return globalThis.__cflRealtimeHub;
}

export function broadcast(type: string, id: string, payload?: Record<string, unknown>) {
  getRealtimeHub().publish({ type, id, payload });
}
"use client";

import { useEffect, useRef } from "react";
import type { ServerMessage } from "@repo/shared";
import { store } from "./store";

function getWsUrl(): string {
  if (process.env.NEXT_PUBLIC_WS_URL) return process.env.NEXT_PUBLIC_WS_URL;
  if (typeof window === "undefined") return "ws://localhost:3001/ws";
  // Auto-detect: use current host with ws/wss protocol
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${window.location.host}/ws`;
}
const WS_URL = getWsUrl();
const RECONNECT_MS = 2000;

/**
 * Connects to the server WebSocket. Reconnects automatically.
 * Must be mounted once at the app root.
 */
export function useSocket(): void {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function connect() {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        store.setConnected(true);
      };

      ws.onmessage = (e) => {
        try {
          const msg: ServerMessage = JSON.parse(e.data as string);
          store.handleMessage(msg);
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        store.setConnected(false);
        reconnectTimer.current = setTimeout(connect, RECONNECT_MS);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, []);
}

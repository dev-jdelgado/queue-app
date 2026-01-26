// src/lib/socket.js
import { io } from "socket.io-client";
import { getToken } from "./auth";

const SERVER_URL =
  import.meta.env.VITE_QUEUE_SERVER_URL || "http://localhost:5050";

export const socket = io(SERVER_URL, {
  transports: ["websocket"],
  auth: {
    token: getToken() || undefined,
  },
});

// Call this after login/logout to refresh auth
export function refreshSocketAuth() {
  socket.auth = { token: getToken() || undefined };

  // Disconnect and reconnect so the server receives the new token
  if (socket.connected) socket.disconnect();
  socket.connect();
}

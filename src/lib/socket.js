import { io } from "socket.io-client";

// ✅ CHANGE THIS to your PC LAN IP when staff uses phones/laptops.
// Example: "http://192.168.1.10:5050"
const SERVER_URL = import.meta.env.VITE_QUEUE_SERVER_URL || "http://localhost:5050";

export const socket = io(SERVER_URL, {
  transports: ["websocket"],
});

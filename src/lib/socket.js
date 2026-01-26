import { io } from "socket.io-client";

const SERVER_URL =
  import.meta.env.VITE_QUEUE_SERVER_URL || "http://localhost:5050";

export const socket = io(SERVER_URL, {
  transports: ["websocket"],
});

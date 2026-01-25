import { io } from "socket.io-client";

// Set on Vercel as VITE_QUEUE_SERVER_URL = https://your-render-service.onrender.com
const SERVER_URL = import.meta.env.VITE_QUEUE_SERVER_URL;

export const socket = io(SERVER_URL, { transports: ["websocket"] });

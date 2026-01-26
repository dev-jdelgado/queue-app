import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import authRouter, { verifyToken } from "./routes/auth.js";

const app = express();

// ✅ ALLOWED_ORIGIN should be your Vercel frontend domain (example)
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());

app.use("/api/auth", authRouter);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGIN,
    methods: ["GET", "POST"],
  },
});

// --- Shared state ---
let state = {
  nextTicket: 1,
  counters: { counter1: null, counter2: null, counter3: null },
  lastCall: null,
};

function broadcast() {
  io.emit("queue:state", state);
}

// ✅ Socket auth middleware (token in handshake)
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    socket.data.user = null; // unauthenticated (Display is allowed)
    return next();
  }

  const payload = verifyToken(token);
  if (!payload) return next(new Error("Unauthorized"));

  socket.data.user = payload; // { role: "staff", iat, exp }
  next();
});

function isStaff(socket) {
  return socket.data.user?.role === "staff";
}

io.on("connection", (socket) => {
  socket.emit("queue:state", state);

  // ✅ Staff-only actions
  socket.on("queue:next", ({ counterId }) => {
    if (!isStaff(socket)) return;

    const validCounters = ["counter1", "counter2", "counter3"];
    if (!validCounters.includes(counterId)) return;

    const ticket = state.nextTicket;
    state.nextTicket += 1;
    state.counters[counterId] = ticket;
    state.lastCall = { ticket, counterId, at: Date.now() };
    broadcast();
  });

  socket.on("queue:reset", () => {
    if (!isStaff(socket)) return;

    state = {
      nextTicket: 1,
      counters: { counter1: null, counter2: null, counter3: null },
      lastCall: null,
    };
    broadcast();
  });

  socket.on("queue:setStart", ({ startNumber }) => {
    if (!isStaff(socket)) return;

    const n = Number(startNumber);
    if (!Number.isFinite(n) || n < 1) return;
    state.nextTicket = Math.floor(n);
    broadcast();
  });
});

app.get("/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5050;
httpServer.listen(PORT, () => console.log(`Server running on :${PORT}`));

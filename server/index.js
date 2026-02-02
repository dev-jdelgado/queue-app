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

/**
 * Multi-TV Queue State
 * - TV_A: existing (3 tables)
 * - TV_B: new (6 tables)
 */
function makeGroup(countersShape) {
  return {
    nextTicket: 1,
    counters: { ...countersShape },
    lastCall: null,
  };
}

const DEFAULT_STATE = {
  groups: {
    TV_A: makeGroup({ counter1: null, counter2: null, counter3: null }),
    TV_B: makeGroup({
      table1: null,
      table2: null,
      table3: null,
      table4: null,
      table5: null,
      table6: null,
    }),
  },
};

let state = JSON.parse(JSON.stringify(DEFAULT_STATE));

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

function normalizeTvId(tvId) {
  return tvId === "TV_B" ? "TV_B" : "TV_A";
}

io.on("connection", (socket) => {
  socket.emit("queue:state", state);

  // ✅ Staff-only actions
  socket.on("queue:next", ({ tvId, counterId } = {}) => {
    if (!isStaff(socket)) return;

    const groupId = normalizeTvId(tvId);
    const group = state.groups[groupId];
    if (!group) return;

    const validCounters = Object.keys(group.counters || {});
    if (!validCounters.includes(counterId)) return;

    const ticket = group.nextTicket;
    group.nextTicket += 1;
    group.counters[counterId] = ticket;

    group.lastCall = { tvId: groupId, ticket, counterId, at: Date.now() };
    broadcast();
  });

  socket.on("queue:reset", ({ tvId } = {}) => {
    if (!isStaff(socket)) return;

    const groupId = normalizeTvId(tvId);
    state.groups[groupId] = JSON.parse(JSON.stringify(DEFAULT_STATE.groups[groupId]));
    broadcast();
  });

  socket.on("queue:setStart", ({ tvId, startNumber } = {}) => {
    if (!isStaff(socket)) return;

    const groupId = normalizeTvId(tvId);
    const group = state.groups[groupId];
    if (!group) return;

    const n = Number(startNumber);
    if (!Number.isFinite(n) || n < 1) return;

    group.nextTicket = Math.floor(n);
    broadcast();
  });
});

app.get("/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5050;
httpServer.listen(PORT, () => console.log(`Server running on :${PORT}`));

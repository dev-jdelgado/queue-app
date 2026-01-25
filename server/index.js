import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();

// ✅ Put your Vercel URL here via env var (e.g. https://school-queue.vercel.app)
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGIN,
    methods: ["GET", "POST"],
  },
});

// Shared state
let state = {
  nextTicket: 1,
  counters: { counter1: null, counter2: null, counter3: null },
  lastCall: null, // { ticket, counterId, at }
};

function broadcast() {
  io.emit("queue:state", state);
}

io.on("connection", (socket) => {
  socket.emit("queue:state", state);

  socket.on("queue:next", ({ counterId }) => {
    if (!state.counters[counterId] && !["counter1","counter2","counter3"].includes(counterId)) return;

    const ticket = state.nextTicket;
    state.nextTicket += 1;
    state.counters[counterId] = ticket;
    state.lastCall = { ticket, counterId, at: Date.now() };
    broadcast();
  });

  socket.on("queue:reset", () => {
    state = {
      nextTicket: 1,
      counters: { counter1: null, counter2: null, counter3: null },
      lastCall: null,
    };
    broadcast();
  });

  socket.on("queue:setStart", ({ startNumber }) => {
    const n = Number(startNumber);
    if (!Number.isFinite(n) || n < 1) return;
    state.nextTicket = Math.floor(n);
    broadcast();
  });
});

app.get("/health", (_req, res) => res.json({ ok: true }));

// ✅ Render supplies PORT at runtime
const PORT = process.env.PORT || 5050;
httpServer.listen(PORT, () => console.log(`Server running on :${PORT}`));

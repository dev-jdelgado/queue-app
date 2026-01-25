import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { socket } from "../lib/socket";

const COUNTERS = [
  { id: "counter1", label: "Counter 1" },
  { id: "counter2", label: "Counter 2" },
  { id: "counter3", label: "Counter 3" },
];

const pad = (n) => (n == null ? "—" : String(n).padStart(3, "0"));

export default function StaffHome() {
  const [state, setState] = useState({
    nextTicket: 1,
    counters: { counter1: null, counter2: null, counter3: null },
    lastCall: null,
  });

  const [connected, setConnected] = useState(socket.connected);
  const [startAt, setStartAt] = useState("");

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onState = (s) => setState(s);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("queue:state", onState);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("queue:state", onState);
    };
  }, []);

  function handleSetStart() {
    const n = Number(startAt);
    if (!Number.isFinite(n) || n < 1) {
      alert("Please enter a valid Start At number (1 and above).");
      return;
    }
    socket.emit("queue:setStart", { startNumber: n });
    setStartAt("");
  }

  function handleReset() {
    const ok = confirm("Reset the queue? This will clear NOW SERVING for all counters and set Next Ticket back to 1.");
    if (!ok) return;
    socket.emit("queue:reset");
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-3xl px-3 sm:px-6 py-10">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Staff</h1>
            <p className="mt-1 text-sm text-gray-600">
              Choose your assigned counter. Status:{" "}
              <span className={connected ? "font-semibold text-emerald-700" : "font-semibold text-rose-700"}>
                {connected ? "Connected" : "Disconnected"}
              </span>
            </p>
          </div>

          <Link
            to="/display"
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-gray-50"
          >
            TV Display →
          </Link>
        </div>

        {/* Counters */}
        <div className="mt-6 grid grid-cols-1 gap-3">
          {COUNTERS.map((c) => (
            <Link
              key={c.id}
              to={`/staff/${c.id}`}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">{c.label}</div>
                  <div className="text-sm text-gray-600">Open control page</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold tracking-widest text-gray-500">NOW</div>
                  <div className="text-2xl font-semibold tabular-nums">{pad(state.counters[c.id])}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Controls: Start At + Reset */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold tracking-widest text-gray-500">QUEUE CONTROLS</p>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-semibold">Next Ticket</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">{pad(state.nextTicket)}</p>
              <p className="mt-1 text-xs text-gray-600">
                This is the next paper number that will be called by any counter.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-semibold">Start At</p>
              <div className="mt-2 flex gap-2">
                <input
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  inputMode="numeric"
                  placeholder="e.g. 101"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                />
                <button
                  onClick={handleSetStart}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Set
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-600">
                Use this if your paper tickets start at a specific number.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={handleReset}
              className="w-full rounded-2xl bg-rose-600 px-5 py-4 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 active:scale-[0.99]"
            >
              Reset Queue
            </button>
            <p className="mt-2 text-xs text-gray-600">
              Reset clears Now Serving for all counters and sets next ticket back to 1.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-900">TV Display</p>
          <p className="mt-1 text-sm text-emerald-900/90">
            Open this on the PC connected to the TV: <span className="font-semibold">/display</span>
          </p>
        </div>
      </div>
    </div>
  );
}

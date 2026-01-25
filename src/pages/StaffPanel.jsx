import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { socket } from "../lib/socket";

const COUNTERS = [
  { id: "counter1", name: "Counter 1" },
  { id: "counter2", name: "Counter 2" },
  { id: "counter3", name: "Counter 3" },
];

function pad(n) {
  if (n == null) return "—";
  return String(n).padStart(3, "0");
}

export default function StaffPanel() {
  const [state, setState] = useState({
    nextTicket: 1,
    counters: { counter1: null, counter2: null, counter3: null },
    lastCall: null,
  });

  const [startNumber, setStartNumber] = useState("1");
  const [connected, setConnected] = useState(socket.connected);

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

  const nextTicketDisplay = useMemo(() => pad(state.nextTicket), [state.nextTicket]);

  function next(counterId) {
    socket.emit("queue:next", { counterId });
  }

  function reset() {
    socket.emit("queue:reset");
  }

  function setStart() {
    socket.emit("queue:setStart", { startNumber: startNumber.trim() });
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Staff Queue Panel
            </h1>
            <p className="text-sm text-gray-600">
              Shared queue • Realtime sync • Status:{" "}
              <span className={connected ? "font-semibold text-emerald-700" : "font-semibold text-rose-700"}>
                {connected ? "Connected" : "Disconnected"}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/display"
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-gray-50"
            >
              Open TV Display →
            </Link>
            <button
              onClick={reset}
              className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="sm:col-span-1 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold tracking-widest text-gray-500">NEXT TICKET</p>
            <p className="mt-2 text-5xl font-semibold tabular-nums">{nextTicketDisplay}</p>

            <div className="mt-4">
              <label className="text-xs font-semibold tracking-widest text-gray-500">SET START</label>
              <div className="mt-2 flex gap-2">
                <input
                  value={startNumber}
                  onChange={(e) => setStartNumber(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                  placeholder="e.g. 101"
                  inputMode="numeric"
                />
                <button
                  onClick={setStart}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Set
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-600">Use if your paper tickets start at a specific number.</p>
            </div>
          </div>

          <div className="sm:col-span-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold tracking-widest text-gray-500">COUNTERS</p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {COUNTERS.map((c) => (
                <div key={c.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{c.name}</p>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600 border border-gray-200">
                      NOW
                    </span>
                  </div>

                  <div className="mt-3 rounded-2xl bg-white border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">Now Serving</p>
                    <p className="mt-1 text-4xl font-semibold tabular-nums">
                      {pad(state.counters[c.id])}
                    </p>
                  </div>

                  <button
                    onClick={() => next(c.id)}
                    className="mt-3 w-full rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 active:scale-[0.99]"
                  >
                    Next
                  </button>

                  <p className="mt-2 text-xs text-gray-600">
                    Assigns <span className="font-semibold">{nextTicketDisplay}</span> to {c.name}.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-900">Staff links</p>
          <ul className="mt-2 space-y-1 text-sm text-emerald-900/90">
            <li className="flex gap-2">
              <span className="mt-2 h-2 w-2 rounded-full bg-emerald-600" />
              Staff page: <span className="font-semibold">/staff</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-2 h-2 w-2 rounded-full bg-emerald-600" />
              TV page: <span className="font-semibold">/display</span> (fullscreen on PC)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

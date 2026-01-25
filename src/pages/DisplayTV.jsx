import { useEffect, useState } from "react";
import { socket } from "../lib/socket";

const COUNTERS = [
  { id: "counter1", name: "Counter 1" },
  { id: "counter2", name: "Counter 2" },
  { id: "counter3", name: "Counter 3" },
];

const pad = (n) => (n == null ? "—" : String(n).padStart(3, "0"));

export default function DisplayTV() {
  const [state, setState] = useState({
    nextTicket: 1,
    counters: { counter1: null, counter2: null, counter3: null },
    lastCall: null,
  });

  useEffect(() => {
    const onState = (s) => setState(s);
    socket.on("queue:state", onState);
    return () => socket.off("queue:state", onState);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-sm text-white/70">School Registration</p>
            <h1 className="text-3xl sm:text-6xl font-semibold tracking-tight">
              NOW SERVING
            </h1>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/60">NEXT TICKET</p>
            <p className="text-2xl sm:text-4xl font-semibold tabular-nums">
              {pad(state.nextTicket)}
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {COUNTERS.map((c) => (
            <div key={c.id} className="rounded-3xl bg-white/5 border border-white/10 p-6">
              <p className="text-lg sm:text-2xl font-semibold text-white/90">{c.name}</p>
              <div className="mt-6 rounded-3xl bg-black/30 border border-white/10 p-6">
                <p className="text-sm text-white/60">Now Serving</p>
                <p className="mt-2 text-6xl sm:text-8xl font-semibold tabular-nums">
                  {pad(state.counters[c.id])}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-sm text-white/60">
          Tip: Press <span className="font-semibold text-white">F11</span> for fullscreen on the PC.
        </p>
      </div>
    </div>
  );
}

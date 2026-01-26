import { useEffect, useMemo, useState } from "react";
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
    lastCall: null, // best if shape includes: { counterId: "counter1", ticket: 12 }
  });

  useEffect(() => {
    const onState = (s) => setState(s);
    socket.on("queue:state", onState);
    return () => socket.off("queue:state", onState);
  }, []);

  // Derive "current serving + counter" for the big display
  const current = useMemo(() => {
    const counterId =
      state.lastCall?.counterId ||
      state.lastCall?.counter ||
      state.lastCall?.counter_id;

    const ticket =
      state.lastCall?.ticket ??
      state.lastCall?.number ??
      (counterId ? state.counters?.[counterId] : null);

    const meta = COUNTERS.find((c) => c.id === counterId);

    if (counterId && meta) {
      return { ticket, counterName: meta.name, counterId };
    }

    // fallback: first counter that has a value
    const active = COUNTERS.find((c) => state.counters?.[c.id] != null);
    if (active) {
      return {
        ticket: state.counters[active.id],
        counterName: active.name,
        counterId: active.id,
      };
    }

    return { ticket: null, counterName: "—", counterId: null };
  }, [state.counters, state.lastCall]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Center everything on the TV */}
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full px-20 py-10">
          {/* Header */}
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight">
                NOW SERVING
              </h1>
            </div>

            <div className="text-right">
              <p className="text-xl sm:text-2xl text-slate-500">NEXT TICKET</p>
              <p className="text-5xl sm:text-7xl font-semibold tabular-nums">
                {pad(state.nextTicket)}
              </p>
            </div>
          </div>

          {/* BIG Current Serving + Counter (same old box style) */}
          <div className="mt-7 rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="">
                <p className="text-base sm:text-xl font-semibold text-slate-700">
                  Current Serving
                </p>

                <p className="mt-3 text-[5.5rem] sm:text-[7.5rem] md:text-[15rem] leading-none font-semibold tabular-nums text-slate-900">
                  {pad(current.ticket)}
                </p>
              </div>
              

              {/* Inner box (old style) */}
              <div className="mt-5 w-full max-w-2xl rounded-3xl bg-slate-50 border border-slate-200 p-6 sm:p-7">
                <p className="text-xl sm:text-3xl text-slate-600">
                  Please proceed to
                </p>
                <p className="mt-2 text-4xl sm:text-7xl font-semibold text-slate-900">
                  {current.counterName}
                </p>
              </div>
            </div>
          </div>

          {/* Counter boxes (retain old design) */}
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {COUNTERS.map((c) => (
              <div
                key={c.id}
                className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 shadow-sm"
              >
                <p className="text-2xl sm:text-3xl font-semibold text-slate-900">
                  {c.name}
                </p>

                <div className="mt-6 rounded-3xl bg-slate-50 border border-slate-200 p-6 sm:p-7">
                  <p className="text-xl sm:text-2xl text-slate-600">
                    Now Serving
                  </p>
                  <p className="mt-2 text-6xl sm:text-7xl md:text-9xl font-semibold tabular-nums text-slate-900 leading-none">
                    {pad(state.counters[c.id])}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

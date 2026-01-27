import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { socket } from "../lib/socket";

const COUNTER_NAME = {
  counter1: "Table 1",
  counter2: "Table 2",
  counter3: "Table 3",
};

const pad = (n) => (n == null ? "—" : String(n).padStart(3, "0"));

export default function StaffCounter() {
  const { counterId } = useParams();

  const valid = ["counter1", "counter2", "counter3"].includes(counterId);
  const title = COUNTER_NAME[counterId] || "Unknown Counter";

  const [state, setState] = useState({
    nextTicket: 1,
    counters: { counter1: null, counter2: null, counter3: null },
    lastCall: null,
  });

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

  const nowServing = useMemo(() => state.counters[counterId], [state, counterId]);

  if (!valid) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm max-w-md w-full">
          <p className="text-lg font-semibold">Invalid Table</p>
          <p className="mt-1 text-sm text-gray-600">Go back and select a table number.</p>
          <Link to="/staff" className="mt-4 inline-block font-semibold text-emerald-700 hover:text-emerald-800">
            ← Back
          </Link>
        </div>
      </div>
    );
  }

  function next() {
    socket.emit("queue:next", { counterId });
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-xl px-3 sm:px-6 py-10">
        <div className="flex items-end justify-between gap-3">
          <div>
            <Link to="/staff" className="text-lg font-semibold text-emerald-700 hover:text-emerald-800">
              ← Go back home
            </Link>
            <h1 className="mt-10 text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-gray-600">
              Status:{" "}
              <span className={connected ? "font-semibold text-emerald-700" : "font-semibold text-rose-700"}>
                {connected ? "Connected" : "Disconnected"}
              </span>
            </p>
          </div>

          <Link
            to="/display"
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-gray-50"
          >
            TV →
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold tracking-widest text-gray-500">NOW SERVING</p>
          <p className="mt-1 text-7xl font-semibold tabular-nums">{pad(nowServing)}</p>

          <p className="mt-5 text-xs font-semibold tracking-widest text-gray-500">NEXT TICKET</p>
          <p className="text-4xl font-semibold tabular-nums text-black/70">{pad(state.nextTicket)}</p>

          <button
            onClick={next}
            className="mt-5 w-full rounded-2xl bg-emerald-600 px-6 py-5 text-lg font-semibold text-white shadow-sm hover:bg-emerald-700 active:scale-[0.99]"
          >
            Next
          </button>

          <p className="mt-3 text-sm text-gray-600">
            Pressing Next will call the next paper number for <span className="font-semibold">{title}</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

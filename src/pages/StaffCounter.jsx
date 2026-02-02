import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { socket } from "../lib/socket";

const pad = (n) => (n == null ? "—" : String(n).padStart(3, "0"));

function getCounterName(tvId) {
  if (tvId === "TV_B") {
    return {
      table1: "Table 1",
      table2: "Table 2",
      table3: "Table 3",
      table4: "Table 4",
      table5: "Table 5",
      table6: "Table 6",
    };
  }

  return {
    counter1: "Table 1",
    counter2: "Table 2",
    counter3: "Table 3",
  };
}

function getValidCounters(tvId) {
  return tvId === "TV_B"
    ? ["table1", "table2", "table3", "table4", "table5", "table6"]
    : ["counter1", "counter2", "counter3"];
}

function defaultGroup(tvId) {
  const counters = {};
  for (const id of getValidCounters(tvId)) counters[id] = null;
  return { nextTicket: 1, counters, lastCall: null };
}

export default function StaffCounter({ tvId = "TV_A" }) {
  const { counterId } = useParams();

  const VALID = useMemo(() => getValidCounters(tvId), [tvId]);
  const NAMES = useMemo(() => getCounterName(tvId), [tvId]);

  const valid = VALID.includes(counterId);
  const title = NAMES[counterId] || "Unknown Table";

  const [rootState, setRootState] = useState(() => ({
    groups: { TV_A: defaultGroup("TV_A"), TV_B: defaultGroup("TV_B") },
  }));

  const state = rootState.groups?.[tvId] ?? defaultGroup(tvId);
  const [connected, setConnected] = useState(socket.connected);

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onState = (s) => setRootState(s);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("queue:state", onState);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("queue:state", onState);
    };
  }, []);

  const nowServing = useMemo(
    () => (counterId ? state.counters?.[counterId] : null),
    [state, counterId]
  );

  const tvRoute = tvId === "TV_B" ? "/display-b" : "/display";
  const homeRoute = tvId === "TV_B" ? "/staff-b" : "/staff-a";

  if (!valid) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm max-w-md w-full">
          <p className="text-lg font-semibold">Invalid Table</p>
          <p className="mt-1 text-sm text-gray-600">
            Go back and select a valid table number.
          </p>
          <Link
            to={homeRoute}
            className="mt-4 inline-block font-semibold text-emerald-700 hover:text-emerald-800"
          >
            ← Back
          </Link>
        </div>
      </div>
    );
  }

  function next() {
    socket.emit("queue:next", { tvId, counterId });
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-xl px-3 sm:px-6 py-10">
        <div className="flex items-end justify-between gap-3">
          <div>
            <Link
              to={homeRoute}
              className="text-lg font-semibold text-emerald-700 hover:text-emerald-800"
            >
              ← Go back home
            </Link>

            <div className="mt-6 inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700">
              {tvId === "TV_B" ? "TV B" : "TV A"}
            </div>

            <h1 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-tight">
              {title}
            </h1>

            <p className="text-sm text-gray-600">
              Status:{" "}
              <span
                className={
                  connected
                    ? "font-semibold text-emerald-700"
                    : "font-semibold text-rose-700"
                }
              >
                {connected ? "Connected" : "Disconnected"}
              </span>
            </p>
          </div>

          <Link
            to={tvRoute}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-gray-50"
          >
            TV →
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold tracking-widest text-gray-500">
            NOW SERVING
          </p>
          <p className="mt-1 text-7xl font-semibold tabular-nums">
            {pad(nowServing)}
          </p>

          <p className="mt-5 text-xs font-semibold tracking-widest text-gray-500">
            NEXT TICKET
          </p>
          <p className="text-4xl font-semibold tabular-nums text-black/70">
            {pad(state.nextTicket)}
          </p>

          <button
            onClick={next}
            className="mt-5 w-full rounded-2xl bg-emerald-600 px-6 py-5 text-lg font-semibold text-white shadow-sm hover:bg-emerald-700 active:scale-[0.99]"
          >
            Next
          </button>

          <p className="mt-3 text-sm text-gray-600">
            Pressing Next will call the next paper number for{" "}
            <span className="font-semibold">{title}</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

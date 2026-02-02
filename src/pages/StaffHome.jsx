import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { socket, refreshSocketAuth } from "../lib/socket";
import { clearToken } from "../lib/auth";

const pad = (n) => (n == null ? "—" : String(n).padStart(3, "0"));

function getCounters(tvId) {
  if (tvId === "TV_B") {
    return [
      { id: "table1", label: "Table 1" },
      { id: "table2", label: "Table 2" },
      { id: "table3", label: "Table 3" },
      { id: "table4", label: "Table 4" },
      { id: "table5", label: "Table 5" },
      { id: "table6", label: "Table 6" },
    ];
  }

  return [
    { id: "counter1", label: "Table 1" },
    { id: "counter2", label: "Table 2" },
    { id: "counter3", label: "Table 3" },
  ];
}

function defaultGroup(tvId) {
  const counters = {};
  for (const c of getCounters(tvId)) counters[c.id] = null;
  return { nextTicket: 1, counters, lastCall: null };
}

export default function StaffHome({ tvId = "TV_A" }) {
  const COUNTERS = useMemo(() => getCounters(tvId), [tvId]);

  const [rootState, setRootState] = useState(() => ({
    groups: { TV_A: defaultGroup("TV_A"), TV_B: defaultGroup("TV_B") },
  }));

  const state = rootState.groups?.[tvId] ?? defaultGroup(tvId);

  const [connected, setConnected] = useState(socket.connected);
  const [startAt, setStartAt] = useState("");
  const navigate = useNavigate();

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

  function handleSetStart() {
    const n = Number(startAt);
    if (!Number.isFinite(n) || n < 1) {
      alert("Please enter a valid Start At number (1 and above).");
      return;
    }
    socket.emit("queue:setStart", { tvId, startNumber: n });
    setStartAt("");
  }

  function handleReset() {
    const ok = confirm(
      "Reset the queue? This will clear NOW SERVING for all tables and set Next Ticket back to 1."
    );
    if (!ok) return;
    socket.emit("queue:reset", { tvId });
  }

  function handleLogout() {
    const ok = confirm("Log out from staff access?");
    if (!ok) return;

    clearToken();
    refreshSocketAuth();
    navigate("/staff/login", { replace: true });
  }

  const tvRoute = tvId === "TV_B" ? "/display-b" : "/display";
  const counterBaseRoute = tvId === "TV_B" ? "/staff-b" : "/staff-a";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-3xl px-3 sm:px-6 py-10">
        <div className="flex items-end justify-between gap-3">
          <div>
            <Link
              to="/staff"
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              ← Back to staff selection
            </Link>

            <div className="mt-5 inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700">
              {tvId === "TV_B" ? "Staff — 6 Tables (TV B)" : "Staff — 3 Tables (TV A)"}
            </div>

            <h1 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-tight">
              Staff Home
            </h1>

            <p className="mt-1 text-sm text-gray-600">
              Choose your assigned table. Status:{" "}
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

          <div className="flex gap-2">
            <Link
              to={tvRoute}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-gray-50"
            >
              TV Display →
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm hover:bg-rose-100"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Counters */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {COUNTERS.map((c) => (
            <Link
              key={c.id}
              to={`${counterBaseRoute}/${c.id}`}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">{c.label}</div>
                  <div className="text-sm text-gray-600">Open control page</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold tracking-widest text-gray-500">
                    NOW
                  </div>
                  <div className="text-2xl font-semibold tabular-nums">
                    {pad(state.counters?.[c.id])}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Controls */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold tracking-widest text-gray-500">
            QUEUE CONTROLS
          </p>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-semibold">Next Ticket</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">
                {pad(state.nextTicket)}
              </p>
              <p className="mt-1 text-xs text-gray-600">
                This is the next paper number that will be called by any table in this TV group.
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
              Reset clears Now Serving for all tables in this TV group and sets next ticket back to 1.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-900">TV Display</p>
          <p className="mt-1 text-sm text-emerald-900/90">
            Open this on the PC connected to the TV:{" "}
            <span className="font-semibold">{tvRoute}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

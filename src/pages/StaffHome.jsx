import { Link } from "react-router-dom";

const COUNTERS = [
  { id: "counter1", label: "Counter 1" },
  { id: "counter2", label: "Counter 2" },
  { id: "counter3", label: "Counter 3" },
];

export default function StaffHome() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-3xl px-3 sm:px-6 py-10">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Staff</h1>
        <p className="mt-1 text-sm text-gray-600">
          Choose your assigned counter. (Bookmark your counter page.)
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3">
          {COUNTERS.map((c) => (
            <Link
              key={c.id}
              to={`/staff/${c.id}`}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:bg-gray-50"
            >
              <div className="text-lg font-semibold">{c.label}</div>
              <div className="text-sm text-gray-600">Open control page</div>
            </Link>
          ))}
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

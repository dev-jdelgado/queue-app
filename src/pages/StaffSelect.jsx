import { Link } from "react-router-dom";

export default function StaffSelect() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center">
        <div className="mx-auto max-w-xl px-3 sm:px-6 py-10">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold tracking-widest text-gray-500">
            STAFF MODE
          </p>

          <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">
            Select Staff Group
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Choose which staff counter group you belong to.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3">
            <Link
              to="/staff-a"
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:bg-gray-50"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">3-Table Staff</div>
                  <div className="text-sm text-gray-600">
                    TV A • Tables 1–3
                  </div>
                </div>
                <div className="text-sm font-semibold text-emerald-700">
                  Select →
                </div>
              </div>
            </Link>

            <Link
              to="/staff-b"
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:bg-gray-50"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">6-Table Staff</div>
                  <div className="text-sm text-gray-600">
                    TV B • Tables 1–6
                  </div>
                </div>
                <div className="text-sm font-semibold text-emerald-700">
                  Select →
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Tip: Bookmark this page as your staff entry point:{" "}
          <span className="font-semibold">/staff</span>
        </div>
      </div>
    </div>
  );
}

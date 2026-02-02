// src/pages/StaffLogin.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { setToken } from "../lib/auth";
import { refreshSocketAuth } from "../lib/socket";

const SERVER_URL =
  import.meta.env.VITE_QUEUE_SERVER_URL || "http://localhost:5050";

  console.log("SERVER_URL:", SERVER_URL);

export default function StaffLogin() {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    if (!pin.trim()) {
      setError("Please enter the staff PIN.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok || !data?.token) {
        setError(data?.message || "Invalid PIN.");
        setLoading(false);
        return;
      }

      setToken(data.token);
      refreshSocketAuth();
      navigate("/staff", { replace: true });
    } catch (err) {
      setError("Cannot reach server. Check internet or server URL.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center">
      <div className="w-full max-w-md px-3 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight">Staff Login</h1>
          <p className="mt-1 text-sm text-gray-600">
            Enter the staff PIN to access queue controls.
          </p>

          <form onSubmit={handleLogin} className="mt-5 space-y-3">
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              inputMode="numeric"
              placeholder="Enter PIN"
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
            />

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                {error}
              </div>
            )}

            <button
              disabled={loading}
              className="w-full rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <div className="mt-4 space-y-2">
            <Link
              to="/display"
              className="block text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              View TV Display (3 Tables) →
            </Link>

            <Link
              to="/display-b"
              className="block text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              View TV Display (6 Tables) →
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

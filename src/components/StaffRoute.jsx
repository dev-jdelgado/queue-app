// src/components/StaffRoute.jsx
import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../lib/auth";

export default function StaffRoute({ children }) {
  if (!isLoggedIn()) return <Navigate to="/staff/login" replace />;
  return children;
}

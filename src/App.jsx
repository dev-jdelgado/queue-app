import { Navigate, Route, Routes } from "react-router-dom";
import DisplayTV from "./pages/DisplayTV";
import StaffHome from "./pages/StaffHome";
import StaffCounter from "./pages/StaffCounter";
import StaffLogin from "./pages/StaffLogin";
import StaffRoute from "./components/StaffRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/staff" replace />} />
      <Route path="/display" element={<DisplayTV />} />

      <Route path="/staff/login" element={<StaffLogin />} />
      <Route path="/staff" element={<StaffRoute><StaffHome /></StaffRoute>} />
      <Route path="/staff/:counterId" element={<StaffRoute><StaffCounter /></StaffRoute>} />

      <Route path="*" element={<Navigate to="/staff" replace />} />
    </Routes>
  );
}

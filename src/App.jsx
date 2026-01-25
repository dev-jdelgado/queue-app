import { Navigate, Route, Routes } from "react-router-dom";
import DisplayTV from "./pages/DisplayTV";
import StaffHome from "./pages/StaffHome";
import StaffCounter from "./pages/StaffCounter";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/staff" replace />} />
      <Route path="/display" element={<DisplayTV />} />

      <Route path="/staff" element={<StaffHome />} />
      <Route path="/staff/:counterId" element={<StaffCounter />} />

      <Route path="*" element={<Navigate to="/staff" replace />} />
    </Routes>
  );
}

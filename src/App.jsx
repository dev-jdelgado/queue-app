import { Navigate, Route, Routes } from "react-router-dom";
import StaffPanel from "./pages/StaffPanel";
import DisplayTV from "./pages/DisplayTV";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/staff" replace />} />
      <Route path="/staff" element={<StaffPanel />} />
      <Route path="/display" element={<DisplayTV />} />
      <Route path="*" element={<Navigate to="/staff" replace />} />
    </Routes>
  );
}

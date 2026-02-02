import { Navigate, Route, Routes } from "react-router-dom";
import DisplayTV from "./pages/DisplayTV";
import StaffHome from "./pages/StaffHome";
import StaffCounter from "./pages/StaffCounter";
import StaffLogin from "./pages/StaffLogin";
import StaffRoute from "./components/StaffRoute";
import StaffSelect from "./pages/StaffSelect";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/staff" replace />} />

      {/* TV Displays */}
      <Route path="/display" element={<DisplayTV tvId="TV_A" />} />
      <Route path="/display-b" element={<DisplayTV tvId="TV_B" />} />

      {/* Staff Auth */}
      <Route path="/staff/login" element={<StaffLogin />} />

      {/* Staff Landing: 2-button selection */}
      <Route
        path="/staff"
        element={
          <StaffRoute>
            <StaffSelect />
          </StaffRoute>
        }
      />

      {/* Staff - TV A (3 tables) */}
      <Route
        path="/staff-a"
        element={
          <StaffRoute>
            <StaffHome tvId="TV_A" />
          </StaffRoute>
        }
      />
      <Route
        path="/staff-a/:counterId"
        element={
          <StaffRoute>
            <StaffCounter tvId="TV_A" />
          </StaffRoute>
        }
      />

      {/* Staff - TV B (6 tables) */}
      <Route
        path="/staff-b"
        element={
          <StaffRoute>
            <StaffHome tvId="TV_B" />
          </StaffRoute>
        }
      />
      <Route
        path="/staff-b/:counterId"
        element={
          <StaffRoute>
            <StaffCounter tvId="TV_B" />
          </StaffRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/staff" replace />} />
    </Routes>
  );
}

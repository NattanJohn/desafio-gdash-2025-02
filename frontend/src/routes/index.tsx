import { Routes, Route } from "react-router-dom";
import Login from "@/pages/Login";
import { PrivateRoute } from "./PrivateRoute";
import Dashboard from "@/pages/Dashboard";
import ExplorePage from "@/pages/Explore";


export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/external-api"
        element={
          <PrivateRoute>
            <ExplorePage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

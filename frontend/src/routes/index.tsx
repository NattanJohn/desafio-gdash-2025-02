import { Routes, Route } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";
import Dashboard from "@/pages/DashboardPage";
import ExplorePage from "@/pages/ExplorePage";
import UsersPage from "@/pages/UserPage";
import { LoginPage } from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";


export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

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

      <Route
        path="/users"
        element={
          <PrivateRoute>
            <UsersPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

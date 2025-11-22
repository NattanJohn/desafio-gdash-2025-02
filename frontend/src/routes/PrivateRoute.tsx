import { Navigate } from "react-router-dom";
import type { JSX } from "react";
import { useAuth } from "@/contexts/UseAuth";

export function PrivateRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

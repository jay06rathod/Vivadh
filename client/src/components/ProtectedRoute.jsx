import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  // If there is no user in the global React state, kick them back to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
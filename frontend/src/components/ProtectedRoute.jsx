import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function ProtectedRoute({ children }) {
  const { user, loading, initialized } = useAuth();
  const location = useLocation();

  if (!initialized || loading) {
    return <div>Loading…</div>;
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
}

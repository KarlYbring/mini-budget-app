import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ isLoggedIn, children }: any) {
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
}
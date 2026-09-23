import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const admin = JSON.parse(
    localStorage.getItem("admin") || "{}"
  );

  return admin?.adminemail
    ? children
    : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
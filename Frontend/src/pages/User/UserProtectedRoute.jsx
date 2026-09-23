import { Navigate } from "react-router-dom";

function UserProtectedRoute({ children }) {
  const user = localStorage.getItem("user");

  return user ? children : <Navigate to="/login" replace />;
}

export default UserProtectedRoute;
import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated, getUserRole } from "../utils/auth";

// ProtectedRoute untuk autentikasi dan role
const ProtectedRoute = ({ allowedRoles }) => {
  const auth = isAuthenticated();
  const role = getUserRole();

  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

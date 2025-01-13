import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const accessToken = localStorage.getItem("accessToken");
  const userRole = localStorage.getItem("userRole");

  if (accessToken && userRole) {
    // Redirect sesuai role
    if (userRole === "admin") {
      return <Navigate to="/dashboard" replace />;
    } else if (userRole === "admin_lapangan") {
      return <Navigate to="/lapangan" replace />;
    }
  }

  return <Outlet />; // Jika belum login, tetap di halaman public (Login/Register)
};

export default PublicRoute;

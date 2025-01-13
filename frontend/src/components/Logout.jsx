import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  return (
    <button onClick={handleLogout} className="btn btn-error btn-sm">
      Logout
    </button>
  );
};

export default LogoutButton;

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../utils/api";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await apiRequest("/auth/login", "POST", { username, password });

      // Simpan tokens
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      
      // Simpan data user
      const userData = {
        id: response.user.id,
        username: response.user.username,
        role: response.user.role,
      };
      localStorage.setItem("userData", JSON.stringify(userData));
      localStorage.setItem("userRole", response.user.role);

      // Navigasi berdasarkan role
      switch (response.user.role) {
        case "admin":
          navigate("/dashboard");
          break;
        case "lapangan":
          navigate("/lapangan");
          break;
        default:
          navigate("/dashboard");
      }
    } catch (error) {
      setError(error.message || "Login gagal. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold justify-center mb-6">Login</h2>

          {error && (
            <div className="alert alert-error mb-6">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Username</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input input-bordered w-full"
                placeholder="Masukkan username"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-bordered w-full"
                placeholder="Masukkan password"
                required
              />
            </div>

            <div className="form-control mt-6">
              <button
                type="submit"
                className={`btn btn-primary w-full ${isLoading ? "loading" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Login"}
              </button>
            </div>
          </form>

          <div className="text-center mt-6 text-sm">
            <span className="text-base-content/70">Belum punya akun? </span>
            <Link to="/register" className="link link-primary font-medium">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
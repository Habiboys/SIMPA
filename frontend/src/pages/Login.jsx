import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../utils/api";
import Swal from "sweetalert2"; // Import SweetAlert

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

      if (response.success) {
        // Menyimpan tokens dan user data di localStorage
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);

        const userData = {
          id: response.user.id,
          username: response.user.username,
          role: response.user.role,
        };
        localStorage.setItem("userData", JSON.stringify(userData));
        localStorage.setItem("userRole", response.user.role);

        // Cek apakah role adalah admin
        if (response.user.role !== 'admin') {
          Swal.fire({
            title: 'Akses Dilarang!',
            text: 'Hanya admin yang dapat login.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
          return;
        }

        // Menampilkan SweetAlert sukses dan langsung ke dashboard
        Swal.fire({
          title: 'Login Berhasil!',
          text: response.message,
          icon: 'success',
          showConfirmButton: false, // Menyembunyikan tombol OK
          timer: 500, // Menunggu 2 detik
        }).then(() => {
          // Navigasi ke dashboard
          navigate("/dashboard");
        });
      } else {
        // Menampilkan SweetAlert error
        Swal.fire({
          title: 'Gagal!',
          text: response.message || 'Login gagal. Silakan coba lagi.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Gagal!',
        text: error.message || 'Terjadi kesalahan, silakan coba lagi.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')", // Gambar latar belakang
      }}
    >
      <div className="card w-full max-w-md bg-base-100 shadow-xl border border-gray-300">
        <div className="card-body">
          {/* Judul dan Deskripsi */}
          <h2 className="card-title text-3xl font-bold justify-center mb-2 text-primary">SIMPA - Suralaya Teknik</h2>
          <p className="text-center text-base-content/80 mb-6">
            Silakan login untuk melanjutkan.
          </p>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-error mb-6">
              <span>{error}</span>
            </div>
          )}

          {/* Form Login */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content/80">Username</span>
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
                <span className="label-text font-medium text-base-content/80">Password</span>
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

          {/* Register Link */}
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
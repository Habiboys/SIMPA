import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../utils/api";
import Swal from "sweetalert2"; // Import SweetAlert
import withReactContent from "sweetalert2-react-content";
const MySwal = withReactContent(Swal);

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Cek jika user sudah login
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (e) => {
    setFormData({
      ...formData,
      role: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok");
      setIsLoading(false);
      return;
    }

    try {
      // Tampilkan SweetAlert loading
      Swal.fire({
        title: "Loading...",
        text: "Proses registrasi sedang berlangsung...",
        didOpen: () => {
          Swal.showLoading();
        },
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
      });

      const response = await apiRequest("/auth/register", "POST", {
        username: formData.username,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
      });

      console.log("Response from backend:", response); // Debugging line

      if (response.success) {
        Swal.fire({
          title: "Register Berhasil!",
          text: response.message,
          icon: "success",
          showConfirmButton: false, // Menyembunyikan tombol OK
          timer: 1000, // Menunggu 1 detik
        }).then(() => {
          navigate("/login");
        });
      } else {
        Swal.fire({
          title: "Gagal!",
          text: response.message,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Gagal!",
        text: "Terjadi kesalahan, silakan coba lagi.",
        icon: "error",
        confirmButtonText: "OK",
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
          <h2 className="card-title text-3xl font-bold justify-center mb-2 text-primary">Suralaya Register</h2>
          <p className="text-center text-base-content/80 mb-6">
            Silakan isi data untuk membuat akun baru.
          </p>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-error mb-6">
              <span>{error}</span>
            </div>
          )}

          {/* Form Register */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content/80">Username</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input input-bordered w-full"
                placeholder="Masukkan password"
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content/80">Konfirmasi Password</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input input-bordered w-full"
                placeholder="Konfirmasi password"
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content/80">Pilih Role</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={formData.role === "admin"}
                    onChange={handleRoleChange}
                    className="radio radio-primary"
                  />
                  <span>Admin</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    value="lapangan"
                    checked={formData.role === "lapangan"}
                    onChange={handleRoleChange}
                    className="radio radio-primary"
                  />
                  <span>Lapangan</span>
                </label>
              </div>
            </div>
            <div className="form-control mt-6">
              <button
                type="submit"
                className={`btn btn-primary w-full ${isLoading ? "loading" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Register"}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6 text-sm">
            Sudah punya akun?{" "}
            <Link to="/login" className="link link-primary font-medium">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
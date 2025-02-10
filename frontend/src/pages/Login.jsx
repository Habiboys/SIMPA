import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../utils/api";
import Swal from "sweetalert2"; // Import SweetAlert
import Particles from "react-particles"; // Import Particles
import { loadFull } from "tsparticles"; // Load full functionality of tsParticles

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fungsi untuk inisialisasi partikel
  const particlesInit = async (main) => {
    await loadFull(main);
  };

  // Konfigurasi partikel
  const particlesOptions = {
    background: {
      color: "#0D47A1", // Warna latar belakang partikel (biru tua)
    },
    fpsLimit: 60, // Batas frame per detik
    interactivity: {
      events: {
        onClick: {
          enable: true,
          mode: "push", // Mode interaksi saat klik
        },
        onHover: {
          enable: true,
          mode: "repulse", // Mode interaksi saat hover
        },
        resize: true,
      },
      modes: {
        push: {
          quantity: 4, // Jumlah partikel yang ditambahkan saat klik
        },
        repulse: {
          distance: 200, // Jarak partikel menjauh saat hover
          duration: 0.4,
        },
      },
    },
    particles: {
      color: {
        value: "#BBDEFB", // Warna partikel (biru muda)
      },
      links: {
        color: "#BBDEFB",
        distance: 150, // Jarak antar partikel
        enable: true,
        opacity: 0.5,
        width: 1,
      },
      collisions: {
        enable: true, // Aktifkan tabrakan antar partikel
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "bounce", // Partikel akan memantul saat mencapai batas
        },
        random: false,
        speed: 2, // Kecepatan partikel
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 800, // Kepadatan partikel
        },
        value: 80, // Jumlah partikel
      },
      opacity: {
        value: 0.5,
      },
      shape: {
        type: "circle", // Bentuk partikel (opsi lain: square, triangle, dll.)
      },
      size: {
        value: { min: 1, max: 5 }, // Ukuran partikel
      },
    },
    detectRetina: true, // Deteksi retina untuk tampilan lebih tajam
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await apiRequest("/auth/login", "POST", { username, password });
      if (response.success) {
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);
        const userData = {
          id: response.user.id,
          username: response.user.username,
          role: response.user.role,
        };
        localStorage.setItem("userData", JSON.stringify(userData));
        localStorage.setItem("userRole", response.user.role);
        if (response.user.role !== 'admin') {
          Swal.fire({
            title: 'Akses Dilarang!',
            text: 'Hanya admin yang dapat login.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
          return;
        }
        Swal.fire({
          title: 'Login Berhasil!',
          text: response.message,
          icon: 'success',
          showConfirmButton: false,
          timer: 500,
        }).then(() => {
          navigate("/dashboard");
        });
      } else {
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
    <div className="min-h-screen relative flex items-center justify-center">
      {/* Partikel Background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particlesOptions}
        className="absolute inset-0 z-0"
      />
      {/* Konten Login */}
      <div className="card w-full max-w-md bg-base-100 shadow-xl border border-gray-300 z-10">
        <div className="card-body">
          <h2 className="card-title text-3xl font-bold justify-center mb-2 text-primary">SIMPA - Suralaya Teknik</h2>
          <p className="text-center text-base-content/80 mb-6">Silakan login untuk melanjutkan.</p>
          {error && (
            <div className="alert alert-error mb-6">
              <span>{error}</span>
            </div>
          )}
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
{/*          <div className="text-center mt-6 text-sm">
            <span className="text-base-content/70">Belum punya akun? </span>
            <Link to="/register" className="link link-primary font-medium">
              Register
            </Link>
          </div>*/}
        </div>
      </div>
    </div>
  );
};

export default Login;
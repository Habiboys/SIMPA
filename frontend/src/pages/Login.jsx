import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../utils/api";
import Swal from "sweetalert2";
import Particles from "react-particles";
import { loadFull } from "tsparticles";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const particlesInit = async (main) => {
    await loadFull(main);
  };

  // Updated particle configuration with blue theme
  const particlesOptions = {
    background: {
      color: "#1e3a8a", // Deep blue background
    },
    fpsLimit: 60,
    interactivity: {
      events: {
        onClick: {
          enable: true,
          mode: "push",
        },
        onHover: {
          enable: true,
          mode: "grab",
          parallax: {
            enable: true,
            force: 60,
            smooth: 10
          }
        },
        resize: true,
      },
      modes: {
        push: {
          quantity: 4,
        },
        grab: {
          distance: 140,
          links: {
            opacity: 0.5
          }
        }
      },
    },
    particles: {
      color: {
        value: "#93c5fd", // Light blue particles
      },
      links: {
        color: "#93c5fd",
        distance: 150,
        enable: true,
        opacity: 0.5,
        width: 1,
      },
      collisions: {
        enable: false,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "bounce",
        },
        random: false,
        speed: 1.2,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 1000,
        },
        value: 70,
      },
      opacity: {
        value: 0.5,
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 1, max: 3 },
      },
      glow: {
        enable: true,
        color: "#bfdbfe",
        frequency: 0.5,
      },
    },
    detectRetina: true,
  };

  const handleLogin = async (e) => {
    e.preventDefault();
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
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-800">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particlesOptions}
        className="absolute inset-0 z-0"
      />
      
      <div className="w-full max-w-md px-8 py-10 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl z-10">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-white">SIMPA</h1>
            <h2 className="text-lg font-small text-blue-100">Sistem Informasi Manajemen Pemeliharaan AC</h2>
            <h2 className="text-lg font-medium text-blue-200">CV. Suralaya Teknik</h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-blue-300/30 focus:border-blue-300 focus:ring-2 focus:ring-blue-300/20 transition-all outline-none text-white placeholder:text-blue-200"
                  placeholder="Username"
                  required
                />
              </div>
              
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-blue-300/30 focus:border-blue-300 focus:ring-2 focus:ring-blue-300/20 transition-all outline-none text-white placeholder:text-blue-200"
                  placeholder="Password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
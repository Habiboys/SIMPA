import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
// import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Cek jika user sudah login
    const token = localStorage.getItem('token');
    if (token) {
      // Validasi token
      const validateToken = async () => {
        try {
          await axiosInstance.get('/auth/validate', {
            headers: { Authorization: `Bearer ${token}` }
          });
          navigate('/dashboard');
        } catch (err) {
          // Jika token tidak valid, hapus dari localStorage
          console.log(err);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        }
      };
      validateToken();
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/auth/login', formData);
      
      // Perhatikan disini, backend mengirim accessToken bukan token
      if (response.data?.accessToken) {
        localStorage.setItem('token', response.data.accessToken); // simpan accessToken
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }

        // Setelah login sukses, validasi dan dapatkan role user
        const validateResponse = await axiosInstance.get('/auth/validate');
        if (validateResponse.data?.role === 'admin') {
          navigate('/dashboard');
        } else {
          navigate('/pemeliharaan');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Username atau password salah');
    } finally {
      setIsLoading(false);
    }
};


  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center mb-4">Login</h2>
          
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Username</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="input input-bordered"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input input-bordered"
                required
              />
            </div>

            <div className="form-control mt-6">
              <button 
                type="submit" 
                className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Login'}
              </button>
            </div>
          </form>

          <div className="text-center mt-4">
            Belum punya akun?{' '}
            <Link to="/register" className="link link-primary">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
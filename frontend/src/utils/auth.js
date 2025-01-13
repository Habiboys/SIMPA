// Ambil token dari localStorage
export const getToken = () => localStorage.getItem("accessToken");

// Ambil role dari localStorage
export const getUserRole = () => localStorage.getItem("userRole");

// Cek apakah user sudah login
export const isAuthenticated = () => !!getToken();

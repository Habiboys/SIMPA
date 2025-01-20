const BASE_URL = "https://backend-593079612074.asia-southeast1.run.app";

// Fungsi umum untuk fetch
export const apiRequest = async (endpoint, method = "GET", body = null, isProtected = false) => {
  const headers = { "Content-Type": "application/json" };

  // Tambahkan Authorization jika perlu
  if (isProtected) {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const config = {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    // Auto-refresh token jika 401 (Unauthorized)
    if (response.status === 401 && isProtected) {
      const refreshed = await refreshToken();
      if (refreshed) {
        return apiRequest(endpoint, method, body, isProtected);
      } else {
        throw new Error("Session expired. Silakan login ulang.");
      }
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Terjadi kesalahan.");
    }

    return data;

  } catch (error) {
    throw error;
  }
};

// Fungsi untuk refresh token
const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("accessToken", data.accessToken);
      return true;
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      return false;
    }
  } catch (error) {
    console.error("Gagal refresh token:", error);
    return false;
  }
};

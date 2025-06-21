import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Helper untuk ambil CSRF cookie
const getCsrfCookie = async () => {
  try {
    await axios.get(`${BACKEND_URL}/csrf-cookie`, { withCredentials: true });
  } catch (err) {
    // Tidak perlu throw, biarkan error ditangani di fungsi pemanggil
  }
};

export const loginSSO = async () => {
  try {
    // Ambil CSRF cookie dulu
    await getCsrfCookie();
    const res = await axios.post(`${BACKEND_URL}/auth/login`, {}, { withCredentials: true });
    const loginUrl = res.data.data;
    window.location.href = loginUrl;
  } catch (err) {
    alert("Gagal mendapatkan link login SSO");
  }
};

export const getUser = async () => {
  try {
    // Ambil CSRF cookie dulu
    await getCsrfCookie();
    const res = await axios.get(`${BACKEND_URL}/auth/user`, { withCredentials: true });
    return res.data.data;
  } catch (err) {
    return null;
  }
}; 
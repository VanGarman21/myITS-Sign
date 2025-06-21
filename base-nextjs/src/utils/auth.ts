import axios from "axios";
import Cookies from "js-cookie";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Helper untuk ambil CSRF cookie
const getCsrfCookie = async () => {
  try {
    await axios.get(`${BACKEND_URL}/csrf-cookie`, { withCredentials: true });
  } catch (err) {
    // Tidak perlu throw, biarkan error ditangani di fungsi pemanggil
  }
};

// Helper untuk ambil token dari cookie
const getCsrfTokenFromCookie = () => Cookies.get("CSRF-TOKEN");

export const loginSSO = async () => {
  try {
    await getCsrfCookie();
    const csrfToken = getCsrfTokenFromCookie();
    const res = await axios.post(
      `${BACKEND_URL}/auth/login`,
      {},
      {
        withCredentials: true,
        headers: {
          "X-CSRF-TOKEN": csrfToken,
        },
      }
    );
    const loginUrl = res.data.data;
    window.location.href = loginUrl;
  } catch (err) {
    alert("Gagal mendapatkan link login SSO");
  }
};

export const getUser = async () => {
  try {
    await getCsrfCookie();
    const csrfToken = getCsrfTokenFromCookie();
    const res = await axios.get(`${BACKEND_URL}/auth/user`, {
      withCredentials: true,
      headers: {
        "X-CSRF-TOKEN": csrfToken,
      },
    });
    return res.data.data;
  } catch (err) {
    return null;
  }
}; 
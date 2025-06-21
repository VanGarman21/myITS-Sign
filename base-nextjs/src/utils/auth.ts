import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const loginSSO = async () => {
  try {
    const res = await axios.post(`${BACKEND_URL}/auth/login`, {}, { withCredentials: true });
    const loginUrl = res.data.data;
    window.location.href = loginUrl;
  } catch (err) {
    alert("Gagal mendapatkan link login SSO");
  }
};

export const getUser = async () => {
  try {
    const res = await axios.get(`${BACKEND_URL}/auth/user`, { withCredentials: true });
    return res.data.data;
  } catch (err) {
    return null;
  }
}; 
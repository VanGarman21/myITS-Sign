import axios from "axios";

export const loginSSO = async () => {
  try {
    const res = await axios.post("http://localhost:8080/auth/login", {}, { withCredentials: true });
    const loginUrl = res.data.data;
    window.location.href = loginUrl;
  } catch (err) {
    alert("Gagal mendapatkan link login SSO");
  }
};

export const getUser = async () => {
  try {
    const res = await axios.get("http://localhost:8080/auth/user", { withCredentials: true });
    return res.data.data;
  } catch (err) {
    return null;
  }
}; 
import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import Cookies from "cookies";

// Ambil BASE URL API dari env, atau berikan nilai default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Hanya mengizinkan metode GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Metode tidak diizinkan" });
  }

  try {
    // Dapatkan CSRF token dari backend
    const response = await axios.get(`${API_BASE_URL}/csrf-token`, {
      withCredentials: true, // Penting untuk menyertakan cookies
    });

    // Token biasanya diatur sebagai cookie langsung dari backend
    // Tetapi jika backend tidak menyetel cookie secara otomatis,
    // kita bisa mengatur cookie melalui response API
    if (response.data && response.data.token) {
      const cookies = new Cookies(req, res);
      cookies.set("csrf_token", response.data.token, {
        httpOnly: false, // Biarkan JavaScript mengakses cookie ini
        sameSite: "strict",
        path: "/",
      });
    }

    // Kirim respons sukses
    return res.status(200).json({ message: "CSRF token berhasil diambil" });
  } catch (error) {
    console.error("Error mendapatkan CSRF token:", error);
    
    // Handle error dari backend
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      const data = error.response.data;
      console.log(`Response error dengan status ${status}:`, data);
      return res.status(status).json(data);
    }
    
    // Jika error lain terjadi
    return res.status(500).json({ error: "Gagal mendapatkan token CSRF" });
  }
} 
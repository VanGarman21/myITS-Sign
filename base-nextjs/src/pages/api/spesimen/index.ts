import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import Cookies from "cookies";

// Ambil BASE URL API dari env, atau berikan nilai default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Hanya memperbolehkan metode POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metode tidak diizinkan" });
  }

  try {
    const { id_sdm, data, updater } = req.body;

    // Validasi input
    if (!id_sdm || !data) {
      return res.status(400).json({ error: "ID SDM dan data tanda tangan diperlukan" });
    }

    // Ambil CSRF token dari cookie
    const cookies = new Cookies(req, res);
    const csrfToken = cookies.get("csrf_token");

    if (!csrfToken) {
      console.error("CSRF token tidak ditemukan dalam cookies");
      return res.status(403).json({ error: "CSRF token tidak tersedia" });
    }

    // Log untuk debugging
    console.log("Mencoba POST ke:", `${API_BASE_URL}/spesimen`);
    console.log("X-CSRF-Token:", csrfToken);
    
    // Teruskan request ke backend Go dengan CSRF token
    const response = await axios.post(
      `${API_BASE_URL}/spesimen`, 
      {
        id_sdm,
        data,
        updater
      },
      {
        headers: {
          "X-CSRF-Token": csrfToken,
          "Content-Type": "application/json",
        },
        withCredentials: true // Sertakan kredensial/cookie dalam request
      }
    );

    // Kirim response dari backend ke klien
    return res.status(201).json(response.data);
  } catch (error) {
    console.error("Error creating specimen:", error);
    
    // Jika error berasal dari axios, ambil status dan data error dari response
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      const data = error.response.data;
      console.log(`Response error dengan status ${status}:`, data);
      return res.status(status).json(data);
    }
    
    // Jika bukan error dari axios, kirim generic error 500
    return res.status(500).json({ error: "Terjadi kesalahan saat membuat spesimen tanda tangan" });
  }
} 
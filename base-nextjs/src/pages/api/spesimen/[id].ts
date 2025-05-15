import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import Cookies from "cookies";

// Ambil BASE URL API dari env, atau berikan nilai default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: "ID spesimen tidak valid" });
  }

  try {
    // Ambil CSRF token jika diperlukan (untuk PUT, DELETE)
    const cookies = new Cookies(req, res);
    const csrfToken = cookies.get("csrf_token");
    const needsCsrf = req.method === "PUT" || req.method === "DELETE";
    
    if (needsCsrf && !csrfToken) {
      console.error("CSRF token tidak ditemukan dalam cookies");
      return res.status(403).json({ error: "CSRF token tidak tersedia" });
    }
    
    // Buat konfigurasi header jika diperlukan
    const config = needsCsrf ? {
      headers: {
        "X-CSRF-Token": csrfToken,
        "Content-Type": "application/json",
      },
      withCredentials: true
    } : {};
    
    // Log untuk debugging
    console.log(`Mencoba ${req.method} ke: ${API_BASE_URL}/spesimen/${id}`);
    if (needsCsrf) {
      console.log("X-CSRF-Token:", csrfToken);
    }

    // Tangani berbagai metode HTTP
    switch (req.method) {
      case "GET": {
        // Ambil spesimen berdasarkan ID
        const response = await axios.get(`${API_BASE_URL}/spesimen/${id}`);
        return res.status(200).json(response.data);
      }
      
      case "PUT": {
        // Validasi data update
        const { data, updater } = req.body;
        if (!data || !updater) {
          return res.status(400).json({ error: "Data dan updater diperlukan" });
        }
        
        // Update spesimen
        const response = await axios.put(
          `${API_BASE_URL}/spesimen/${id}`, 
          { data, updater },
          config
        );
        return res.status(200).json(response.data);
      }
      
      case "DELETE": {
        // Hapus spesimen
        const response = await axios.delete(`${API_BASE_URL}/spesimen/${id}`, config);
        return res.status(200).json(response.data);
      }
      
      default:
        return res.status(405).json({ error: "Metode tidak diizinkan" });
    }
  } catch (error) {
    console.error(`Error handling specimen with ID ${id}:`, error);
    
    // Handle respons error dari backend
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      const data = error.response.data;
      console.log(`Response error dengan status ${status}:`, data);
      return res.status(status).json(data);
    }
    
    return res.status(500).json({ error: "Terjadi kesalahan saat memproses permintaan" });
  }
} 
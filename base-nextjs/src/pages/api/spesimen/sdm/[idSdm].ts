import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

// Ambil BASE URL API dari env, atau berikan nilai default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { idSdm } = req.query;
  
  if (!idSdm || Array.isArray(idSdm)) {
    return res.status(400).json({ error: "ID SDM tidak valid" });
  }

  // Hanya menangani metode GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Metode tidak diizinkan" });
  }

  try {
    // Log untuk debug
    console.log(`Mencoba mengakses: ${API_BASE_URL}/spesimen/sdm/${idSdm}`);
    
    // Ambil spesimen berdasarkan ID SDM
    // Note: Pastikan path API sudah sesuai dengan endpoint backend
    // Jika endpoint backend berbeda, sesuaikan dengan path yang benar
    const response = await axios.get(`${API_BASE_URL}/spesimen/sdm/${idSdm}`);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error(`Error fetching specimen for SDM ID ${idSdm}:`, error);
    
    // Handle respons error dari backend
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      const data = error.response.data;
      console.log(`Response error dengan status ${status}:`, data);
      return res.status(status).json(data);
    }
    
    return res.status(500).json({ error: "Terjadi kesalahan saat mengambil data spesimen" });
  }
} 
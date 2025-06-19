import axios from 'axios';

export interface SignatureTableRow {
  judul: string;
  signature_type: string;
  signature_date: string;
  signature_status: string;
  is_bulk_sign: boolean;
  id_penandatanganan: string;
  can_delete: boolean;
}

export interface SignatureTableResponse {
  draw: number;
  iTotalRecords: number;
  iTotalDisplayRecords: number;
  aaData: SignatureTableRow[];
}

export interface SignatureDetail {
  id_penandatanganan: string;
  judul: string;
  type: number;
  is_footer_exist: boolean;
  tag: string | null;
  is_bulk_sign: boolean;
  insert_footer_page: string | null;
  created_at: string;
  updated_at: string;
  updater: string | null;
  id_sdm: string;
  pembuat: {
    id_sdm: string;
    nama: string;
  };
  dokumen: {
    id_dokumen: string;
    nama_file: string;
    ukuran: number;
    mime: string;
    public_uri: string;
    is_signed: boolean;
  };
  anggota: Array<{
    id_anggota_penandatangan: number;
    id_sdm: string;
    nama: string;
    is_sign: boolean;
    urutan: number;
  }>;
}

export async function fetchSignatureTable({
  id_sdm,
  search = '',
  status = 1,
  page = 1,
  limit = 10,
}: {
  id_sdm: string;
  search?: string;
  status?: number;
  page?: number;
  limit?: number;
}): Promise<SignatureTableResponse> {
  const res = await axios.get<SignatureTableResponse>(
    '/signature/table',
    {
      baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
      params: { id_sdm, search, status, page, limit },
      withCredentials: true,
    }
  );
  return res.data;
}

export async function fetchSignatureDetail(id_penandatanganan: string): Promise<SignatureDetail> {
  const res = await axios.get<SignatureDetail>(
    `/api/penandatanganan/${id_penandatanganan}`,
    {
      baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
      withCredentials: true,
    }
  );
  return res.data;
}

export function downloadDokumen(fileName: string) {
  return `${process.env.NEXT_PUBLIC_BACKEND_URL}/public/pdf/${fileName}`;
}

export async function deleteDokumen(id_dokumen: string) {
  return axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/dokumen/${id_dokumen}`);
}

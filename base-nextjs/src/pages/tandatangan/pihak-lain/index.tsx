import { useState } from "react";
import axios from "axios";
import PageTransition from "@/components/PageLayout";
import { Box, Alert, IconButton, Text } from "@chakra-ui/react";
import SignatureContextInput from "@/components/signature/SignatureContextInput";
import SignatureFileUpload from "@/components/signature/SignatureFileUpload";
import SignatureTypeSelector from "@/components/signature/SignatureTypeSelector";
import SignatureFooterSettings from "@/components/signature/SignatureFooterSettings";
import SignatureActionButtons from "@/components/signature/SignatureActionButtons";
import AnggotaPenandatanganSelector from "@/components/signature/AnggotaPenandatanganSelector";

type FooterColor = "hitam" | "purple";
type SignatureType = "invisible" | "visible";
type Language = "id" | "en";
type SDMOption = { id_sdm: string; nama: string };

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

const PihakLainPage = () => {
  // State management
  const [context, setContext] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [signatureType, setSignatureType] =
    useState<SignatureType>("invisible");
  const [language, setLanguage] = useState<Language>("id");
  const [footerColor, setFooterColor] = useState<FooterColor>("hitam");
  const [footerShowMode, setFooterShowMode] = useState("all");
  const [footerPages, setFooterPages] = useState("");
  const [ikutkanSaya, setIkutkanSaya] = useState(false);
  const [anggotaLain, setAnggotaLain] = useState<SDMOption[]>([]);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<SDMOption[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handler file upload
  const handleFileUpload = (files: File | File[] | null) => {
    if (Array.isArray(files)) {
      setSelectedFile(files[0]);
    } else if (files instanceof File) {
      setSelectedFile(files);
    } else {
      setSelectedFile(null);
    }
  };

  // Handler pencarian SDM
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    if (value.length > 1) {
      try {
        const res = await axios.get(
          `${API_URL}/sdm/search?nama=${encodeURIComponent(value)}`
        );
        setOptions(res.data);
        setShowDropdown(true);
      } catch (err) {
        setOptions([]);
        setShowDropdown(false);
      }
    } else {
      setOptions([]);
      setShowDropdown(false);
    }
  };

  // Handler pilih anggota
  const handleSelect = (opt: SDMOption) => {
    if (!anggotaLain.find((a) => a.id_sdm === opt.id_sdm)) {
      setAnggotaLain([...anggotaLain, opt]);
    }
    setSearch("");
    setOptions([]);
    setShowDropdown(false);
  };

  // Handler hapus anggota
  const handleRemove = (id_sdm: string) => {
    setAnggotaLain(anggotaLain.filter((a) => a.id_sdm !== id_sdm));
  };

  // Helper CSRF
  function getCsrfToken() {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; CSRF-TOKEN=`);
    if (parts.length === 2) {
      const tokenPart = parts.pop();
      if (tokenPart) {
        const token = tokenPart.split(";").shift();
        if (typeof token === "string") {
          return token;
        }
      }
    }
    return null;
  }

  const isValidUUID = (uuid: string) =>
    /^[0-9a-fA-F-]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      uuid
    );

  // Submit
  const handleSubmit = async () => {
    if (!context || !selectedFile) {
      setError("Lengkapi semua data!");
      return;
    }
    setError(null);
    setLoading(true);
    let csrfToken = getCsrfToken();
    if (!csrfToken) {
      await fetch("/csrf-cookie", { credentials: "include" });
      csrfToken = getCsrfToken();
    }
    const idSdmUser = localStorage.getItem("id_sdm") || "";
    if (!isValidUUID(idSdmUser)) {
      setError("ID SDM user login tidak valid! Harus UUID.");
      setLoading(false);
      return;
    }
    const anggotaList: { id_sdm: string; urutan: number }[] = [];
    let urutan = 1;
    if (ikutkanSaya === true) {
      anggotaList.push({ id_sdm: idSdmUser, urutan });
      urutan++;
    }
    anggotaLain.forEach((anggota, idx) => {
      anggotaList.push({ id_sdm: anggota.id_sdm, urutan: urutan + idx });
    });
    if (anggotaList.length === 0) {
      setError("Minimal harus ada satu anggota penandatangan!");
      setLoading(false);
      return;
    }
    for (const anggota of anggotaList) {
      if (!isValidUUID(anggota.id_sdm)) {
        setError(`ID SDM anggota tidak valid: ${anggota.id_sdm}`);
        setLoading(false);
        return;
      }
    }
    const formData = new FormData();
    formData.append("judul", context);
    formData.append("type", signatureType === "invisible" ? "1" : "2");
    formData.append("footer_bahasa", language);
    formData.append("footer_color", footerColor);
    formData.append("dokumen", selectedFile);
    formData.append("id_sdm", idSdmUser);
    formData.append("updater", idSdmUser);
    formData.append("is_footer_exist", "true");
    formData.append("is_bulk_sign", "false");
    if (footerShowMode === "all") {
      formData.append("insert_footer_page", "all");
    } else if (footerShowMode === "custom" && footerPages.trim() !== "") {
      formData.append("insert_footer_page", footerPages);
    }
    try {
      // 1. Create penandatanganan utama
      const res = await axios.post(`${API_URL}/api/penandatanganan`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "x-csrf-token": csrfToken || "",
        },
        withCredentials: true,
      });
      const idPenandatanganan =
        res.data.penandatanganan?.id_penandatanganan ||
        res.data.id_penandatanganan;
      // 2. Insert anggota penandatanganan
      for (const anggota of anggotaList) {
        await axios.post(
          `${API_URL}/api/penandatanganan/${idPenandatanganan}/anggota`,
          {
            id_sdm: anggota.id_sdm,
            urutan: anggota.urutan,
            is_sign: false,
            updater: idSdmUser,
          },
          {
            headers: { "x-csrf-token": csrfToken || "" },
            withCredentials: true,
          }
        );
      }
      window.location.href = `/tandatangan/detail/${idPenandatanganan}`;
    } catch (err) {
      setError("Gagal membuat penandatanganan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition pageTitle="Buat Tanda Tangan Dengan Pihak Lain">
      <Box
        maxW="900px"
        mx="auto"
        bg="white"
        borderRadius="2xl"
        boxShadow="md"
        p={{ base: 4, md: 10 }}
        marginBottom="50px"
      >
        {error && (
          <Alert status="error" mb={4}>
            {error}
          </Alert>
        )}
        <Box display="flex" alignItems="center" mb={6}>
          <IconButton
            aria-label="Kembali"
            icon={<span style={{ fontSize: 20 }}>←</span>}
            variant="ghost"
            onClick={() => (window.location.href = "/tandatangan")}
            mr={2}
          />
          <Box as="h1" fontSize={{ base: "xl", md: "2xl" }} fontWeight={700}>
            Buat Tanda Tangan Dengan Pihak Lain
          </Box>
        </Box>

        <Box mb={8}>
          <SignatureContextInput
            value={context}
            onChange={setContext}
            error={!context ? "Konteks wajib diisi" : null}
          />
        </Box>

        <Box mb={8}>
          <SignatureFileUpload
            file={selectedFile}
            onFileChange={handleFileUpload}
            error={!selectedFile ? "File PDF wajib diunggah" : null}
          />
        </Box>

        <Box mb={8}>
          <SignatureTypeSelector
            value={signatureType}
            onChange={(v) => setSignatureType(v as any)}
          />
        </Box>

        <Box mb={8}>
          <SignatureFooterSettings
            language={language}
            setLanguage={(v) => setLanguage(v as any)}
            footerColor={footerColor}
            setFooterColor={(v) => setFooterColor(v as any)}
            footerShowMode={footerShowMode}
            setFooterShowMode={setFooterShowMode}
            footerPages={footerPages}
            setFooterPages={setFooterPages}
          />
        </Box>

        <AnggotaPenandatanganSelector
          ikutkanSaya={ikutkanSaya}
          setIkutkanSaya={setIkutkanSaya}
          anggotaLain={anggotaLain}
          setAnggotaLain={setAnggotaLain}
          search={search}
          setSearch={setSearch}
          options={options}
          setOptions={setOptions}
          showDropdown={showDropdown}
          setShowDropdown={setShowDropdown}
          onSearch={handleSearch}
          onSelect={handleSelect}
          onRemove={handleRemove}
        />

        <SignatureActionButtons
          onSave={() => {}}
          onSubmit={handleSubmit}
          loading={loading}
          disabled={loading}
        />
      </Box>
    </PageTransition>
  );
};

export default PihakLainPage;

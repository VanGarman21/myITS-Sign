import { useState, useEffect } from "react";
import axios from "axios";
import { Alert, Box, IconButton, Text } from "@chakra-ui/react";
import PageTransition from "@/components/PageLayout";
import SignatureContextInput from "@/components/signature/SignatureContextInput";
import SignatureFileUpload from "@/components/signature/SignatureFileUpload";
import SignatureTypeSelector from "@/components/signature/SignatureTypeSelector";
import SignatureFooterSettings from "@/components/signature/SignatureFooterSettings";
import SignatureActionButtons from "@/components/signature/SignatureActionButtons";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

type FooterColor = "hitam" | "putih";
type SignatureType = "invisible" | "visible";
type Language = "id" | "en";

const SendiriPage = () => {
  // State management
  const [context, setContext] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [signatureType, setSignatureType] =
    useState<SignatureType>("invisible");
  const [language, setLanguage] = useState<Language>("id");
  const [footerColor, setFooterColor] = useState<FooterColor>("hitam");
  const [footerShowMode, setFooterShowMode] = useState(
    localStorage.getItem("footerShowMode") || "all"
  );
  const [footerPages, setFooterPages] = useState(
    localStorage.getItem("footerPages") || ""
  );
  const [insertFooterPage, setInsertFooterPage] = useState("");
  const [idSdm, setIdSdm] = useState<string>("");
  const [userLoading, setUserLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [sdmData, setSdmData] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      setUserLoading(true);
      try {
        const user = await axios.get(`${API_URL}/auth/user`, {
          withCredentials: true,
        });
        const ssoUserId = user.data.data.sso_user_id || user.data.data.sub;
        const sdm = await axios.get(`${API_URL}/sdm/by-sso-id/${ssoUserId}`, {
          withCredentials: true,
        });
        const idSdmVal =
          sdm.data.id_sdm || (sdm.data.data && sdm.data.data.id_sdm);
        setIdSdm(idSdmVal);
        setUserData(user.data.data);
        setSdmData(sdm.data.data || sdm.data);
        localStorage.setItem("id_sdm", idSdmVal);
        setError(null);
      } catch (err) {
        setIdSdm("");
        setError(
          "Gagal mengambil data user/SDM. Pastikan Anda sudah login dan backend berjalan."
        );
      } finally {
        setUserLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      alert("Hanya file PDF yang didukung!");
    }
  };

  // Tambahkan fungsi handleSave
  const handleSave = async () => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        // Ambil setting halaman
        const showMode = localStorage.getItem("footerShowMode") || "all";
        const pages = (localStorage.getItem("footerPages") || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

        // Simpan ke localStorage (base64)
        const blob = new Blob([arrayBuffer], { type: "application/pdf" });
        const fileReader = new FileReader();
        fileReader.onload = (ev) => {
          localStorage.setItem("currentDocument", ev.target?.result as string);
          localStorage.setItem("documentName", selectedFile.name);
          window.location.href = "/tandatangan/sendiri/editor";
        };
        fileReader.readAsDataURL(blob);
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  // Tambahkan helper untuk ambil CSRF token dari cookie
  function getCsrfToken() {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; CSRF-TOKEN=`);
    if (parts.length === 2) {
      const tokenPart = parts.pop();
      if (tokenPart) {
        const token = tokenPart.split(";").shift();
        if (token !== undefined) {
          return token;
        }
      }
    }
    return null;
  }

  const handleSubmit = async () => {
    if (!context || !selectedFile) {
      alert("Lengkapi semua data!");
      return;
    }
    if (!idSdm) {
      alert("Data user belum siap, silakan tunggu sebentar.");
      return;
    }
    // Ambil CSRF token dari cookie
    let csrfToken = getCsrfToken();
    // Jika belum ada, fetch ke /csrf-cookie
    if (!csrfToken) {
      await fetch("/csrf-cookie", { credentials: "include" });
      csrfToken = getCsrfToken();
    }
    const formData = new FormData();
    formData.append("judul", context);
    formData.append("type", signatureType === "invisible" ? "1" : "2");
    formData.append("is_footer_exist", JSON.stringify(true));
    formData.append("tag", "");
    formData.append("is_bulk_sign", JSON.stringify(false));
    formData.append("footer_bahasa", language);
    formData.append("footer_color", footerColor);
    formData.append("dokumen", selectedFile);
    formData.append("updater", idSdm);
    formData.append("id_sdm", idSdm);
    if (footerShowMode === "all") {
      formData.append("insert_footer_page", "all");
    } else if (footerShowMode === "custom" && footerPages.trim() !== "") {
      formData.append("insert_footer_page", footerPages);
    }
    try {
      const response = await axios.post(
        `${API_URL}/api/penandatanganan`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "x-csrf-token": csrfToken || "",
          },
          withCredentials: true,
        }
      );
      // Jika berhasil, POST anggota ke endpoint khusus
      if (response.data && response.data.id_penandatanganan) {
        const idPenandatanganan = response.data.id_penandatanganan;
        // POST anggota
        await axios.post(
          `${API_URL}/api/penandatanganan/${idPenandatanganan}/anggota`,
          {
            id_sdm: idSdm,
            is_sign: false,
            updater: idSdm,
          },
          {
            headers: { "x-csrf-token": csrfToken || "" },
            withCredentials: true,
          }
        );
        window.location.href = `/tandatangan/detail/${idPenandatanganan}`;
      } else {
        window.location.href = "/tandatangan/sendiri/editor";
      }
    } catch (err) {
      alert("Gagal membuat penandatanganan");
    }
  };

  return (
    <PageTransition pageTitle="Buat Tanda Tangan Sendiri">
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
          <Text as="span" fontWeight="bold" fontSize="xl">
            Buat Tanda Tangan Sendiri
          </Text>
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
            onFileChange={(file) => setSelectedFile(file as File)}
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

        <SignatureActionButtons
          onSave={handleSave}
          onSubmit={handleSubmit}
          loading={userLoading}
          disabled={userLoading || !idSdm || !userData || !sdmData}
        />
        {!idSdm && !userLoading && (
          <Text color="red.500" fontSize="sm" mt={2}>
            ID SDM tidak ditemukan, silakan login ulang atau hubungi admin.
          </Text>
        )}
      </Box>
    </PageTransition>
  );
};

export default SendiriPage;

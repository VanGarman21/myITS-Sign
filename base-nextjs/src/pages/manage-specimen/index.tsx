import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  VStack,
  Text,
  SimpleGrid,
  Center,
  Spinner,
  Container,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import PageTransition from "@/components/PageLayout";
import SpecimenStatusAlert from "@/components/specimen/SpecimenStatusAlert";
import SpecimenUpload from "@/components/specimen/SpecimenUpload";
import SpecimenCanvas from "@/components/specimen/SpecimenCanvas";
import SpecimenPreview from "@/components/specimen/SpecimenPreview";
import SpecimenActions from "@/components/specimen/SpecimenActions";
import SpecimenFooter from "@/components/specimen/SpecimenFooter";

interface SpesimenData {
  id_spesimen: string;
  id_sdm: string;
  data: string;
  created_at: string;
  updated_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

const SpecimenPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [spesimen, setSpesimen] = useState<SpesimenData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const [userIdSDM, setUserIdSDM] = useState<string | null>(null);
  const [updaterId, setUpdaterId] = useState<string | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  function getCookie(name: string) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
  }

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
      const idSdm = sdm.data.id_sdm || (sdm.data.data && sdm.data.data.id_sdm);
      setUserIdSDM(idSdm);
      setUpdaterId(idSdm);
    } catch (err: any) {
      setUserIdSDM(null);
      setUpdaterId(null);
      setError("Gagal mengambil data user. Silakan coba lagi.");
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchUser();
    };
    init();
  }, []);

  useEffect(() => {
    if (userIdSDM) {
      fetchSpesimen();
    }
  }, [userIdSDM]);

  const fetchSpesimen = async () => {
    if (!userIdSDM) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/spesimen/sdm/${userIdSDM}`, {
        withCredentials: true,
      });
      if (!response.data || !response.data.id_spesimen) {
        setSpesimen(null);
        setSelectedImage(null);
      } else {
        setSpesimen(response.data);
        if (response.data.data) {
          setSelectedImage(response.data.data);
        }
      }
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setSpesimen(null);
          setSelectedImage(null);
        } else if (err.response?.status === 400) {
          setError(
            "ID SDM tidak valid atau permintaan tidak sesuai format. Silakan cek kembali format ID SDM."
          );
        } else {
          setError("Gagal mengambil data spesimen. Silakan coba lagi.");
        }
      } else {
        setError("Gagal mengambil data spesimen. Silakan coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Ukuran file terlalu besar",
          description: "Ukuran file tidak boleh lebih dari 2MB",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000000";
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const endDrawing = () => setIsDrawing(false);

  const getSignatureFromCanvas = (): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let isBlank = true;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] !== 0) {
        isBlank = false;
        break;
      }
    }
    if (isBlank) return null;
    return canvas.toDataURL("image/png");
  };

  const resetAll = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    setSelectedImage(null);
    setUploadedFile(null);
  };

  const handleResetCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleSaveFromCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png");
      if (dataUrl) {
        setSelectedImage(dataUrl);
        toast({
          title: "Berhasil",
          description: "Tanda tangan manual disimpan ke pratinjau!",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      }
    }
  };

  const saveSignature = async () => {
    if (!userIdSDM || userIdSDM === "string") {
      toast({
        title: "Tidak dapat menyimpan",
        description: "User belum login atau id_sdm tidak valid.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setLoading(true);
    try {
      await axios.get(`${API_URL}/csrf-cookie`, {
        withCredentials: true,
      });
      const csrfToken = getCookie("CSRF-TOKEN");
      let dataUrl: string | null = null;
      if (uploadedFile) {
        dataUrl = await new Promise<string | null>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(uploadedFile);
        });
      } else {
        dataUrl = getSignatureFromCanvas();
      }
      if (!dataUrl) {
        toast({
          title: "Tanda tangan kosong",
          description:
            "Silakan gambar tanda tangan atau unggah gambar terlebih dahulu",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setLoading(false);
        return;
      }
      const payload = {
        id_sdm: userIdSDM,
        data: dataUrl,
        updater: userIdSDM,
      };
      if (spesimen && spesimen.id_spesimen) {
        await axios.put(
          `${API_URL}/spesimen/${spesimen.id_spesimen}`,
          payload,
          {
            withCredentials: true,
            headers: {
              "x-csrf-token": csrfToken,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        await axios.post(`${API_URL}/spesimen`, payload, {
          withCredentials: true,
          headers: {
            "x-csrf-token": csrfToken,
            "Content-Type": "application/json",
          },
        });
      }
      toast({
        title: "Berhasil",
        description: "Tanda tangan berhasil disimpan!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setUploadedFile(null);
      await fetchSpesimen();
    } catch (err) {
      toast({
        title: "Gagal menyimpan",
        description:
          "Terjadi kesalahan saat menyimpan tanda tangan. Silakan coba lagi.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteSpesimen = async () => {
    if (!spesimen || !spesimen.id_spesimen || !userIdSDM || !updaterId) {
      toast({
        title: "Tidak ada spesimen",
        description:
          "Tidak ada tanda tangan yang tersimpan untuk dihapus atau user belum login",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setLoading(true);
    try {
      await axios.get(`${API_URL}/csrf-cookie`, {
        withCredentials: true,
      });
      const csrfToken = getCookie("CSRF-TOKEN");
      await axios.delete(`${API_URL}/spesimen/${spesimen.id_spesimen}`, {
        withCredentials: true,
        headers: { "x-csrf-token": csrfToken },
      });
      toast({
        title: "Berhasil",
        description: "Tanda tangan berhasil dihapus!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setSpesimen(null);
      setSelectedImage(null);
    } catch (err) {
      toast({
        title: "Gagal menghapus",
        description:
          "Terjadi kesalahan saat menghapus tanda tangan. Silakan coba lagi.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition pageTitle="Kelola Spesimen">
      <Box minH="100vh" bg="gray.50" p={6}>
        <Container maxW="3xl" bg="white" borderRadius="lg" p={6} boxShadow="md">
          {userLoading ? (
            <Center p={8}>
              <VStack spacing={4}>
                <Spinner size="xl" color="blue.500" />
                <Text>Memuat data user...</Text>
              </VStack>
            </Center>
          ) : error ? (
            <Center p={8}>
              <VStack spacing={4}>
                <Text color="red.500">{error}</Text>
              </VStack>
            </Center>
          ) : (
            <>
              <SpecimenStatusAlert spesimen={spesimen} />
              <SpecimenUpload onImageUpload={handleImageUpload} />
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <SpecimenCanvas
                  canvasRef={canvasRef}
                  startDrawing={startDrawing}
                  draw={draw}
                  endDrawing={endDrawing}
                  onReset={handleResetCanvas}
                  onSave={handleSaveFromCanvas}
                  loading={loading}
                />
                <SpecimenPreview
                  selectedImage={selectedImage}
                  spesimen={spesimen}
                />
              </SimpleGrid>
              <SpecimenActions
                onReset={resetAll}
                onDelete={deleteSpesimen}
                onSave={saveSignature}
                loading={loading}
                spesimen={spesimen}
              />
            </>
          )}
          <SpecimenFooter />
        </Container>
      </Box>
    </PageTransition>
  );
};

export default SpecimenPage;

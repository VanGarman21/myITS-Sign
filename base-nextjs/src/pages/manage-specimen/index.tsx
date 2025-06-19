import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  SimpleGrid,
  AspectRatio,
  Center,
  Heading,
  HStack,
  Button,
  Alert,
  AlertDescription,
  Link,
  Container,
  Icon,
  Image,
  useToast,
  Spinner,
  AlertTitle,
  AlertIcon,
} from "@chakra-ui/react";
import { FiUpload, FiTrash2, FiSave, FiCheckCircle } from "react-icons/fi";
import axios from "axios";
import PageTransition from "@/components/PageLayout";
// import Cookies from "js-cookie";

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

  // Helper untuk ambil cookie (jika tidak pakai js-cookie, gunakan fungsi getCookie manual)
  function getCookie(name: string) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
  }

  // Ambil data user login dan id_sdm dari backend
  const fetchUser = async () => {
    setUserLoading(true);
    try {
      // 1. Ambil user SSO yang sedang login
      const user = await axios.get("http://localhost:8080/auth/user", {
        withCredentials: true,
      });
      const ssoUserId = user.data.data.sso_user_id || user.data.data.sub;

      // 2. Ambil data SDM berdasarkan sso_user_id
      const sdm = await axios.get(
        `http://localhost:8080/sdm/by-sso-id/${ssoUserId}`,
        { withCredentials: true }
      );
      console.log("Response dari /sdm/by-sso-id:", sdm.data);
      const idSdm = sdm.data.id_sdm || (sdm.data.data && sdm.data.data.id_sdm);
      console.log("id_sdm FE:", idSdm);
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

  // Inisialisasi: ambil user login, lalu fetch spesimen
  useEffect(() => {
    const init = async () => {
      await fetchUser();
    };
    init();
  }, []);

  // Fetch spesimen setelah userIdSDM tersedia
  useEffect(() => {
    if (userIdSDM) {
      fetchSpesimen();
    }
  }, [userIdSDM]);

  // Fungsi untuk mengambil data spesimen berdasarkan ID SDM
  const fetchSpesimen = async () => {
    if (!userIdSDM) return;
    setIsLoading(true);
    setError(null);
    try {
      console.log("id_sdm yang dikirim ke backend:", userIdSDM);
      const response = await axios.get(
        `${API_URL}/spesimen/sdm/${userIdSDM}`,
        { withCredentials: true }
      );
      // Jika respons kosong atau id_spesimen kosong, treat as null
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
          console.error("AxiosError 400 detail:", err.response?.data);
        } else {
          setError("Gagal mengambil data spesimen. Silakan coba lagi.");
          console.error("Error fetching specimen:", err);
        }
      } else {
        setError("Gagal mengambil data spesimen. Silakan coba lagi.");
        console.error("Error fetching specimen:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle image upload
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

  // Canvas drawing logic
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Tambahkan konfigurasi garis
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

  // Mengambil data tanda tangan dari canvas
  const getSignatureFromCanvas = (): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    // Pastikan canvas tidak kosong dengan memeriksa piksel
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Periksa apakah canvas kosong (semua piksel transparan)
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

  // Helper: convert canvas ke Blob
  const getBlobFromCanvas = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas) return resolve(null);
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/png");
    });
  };

  // Reset all
  const resetAll = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    setSelectedImage(null);
    setUploadedFile(null);
  };

  // Menyimpan tanda tangan
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
        // Convert uploaded file to base64 string
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
      // Prepare JSON payload
      const payload = {
        id_sdm: userIdSDM,
        data: dataUrl,
        updater: userIdSDM,
      };
      if (spesimen && spesimen.id_spesimen) {
        // Update spesimen
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
        // Buat spesimen baru
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
      console.error("Error saving signature:", err);
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

  // Menghapus spesimen
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
      // Ambil CSRF token dulu
      await axios.get(`${API_URL}/csrf-cookie`, {
        withCredentials: true,
      });
      const csrfToken = getCookie("CSRF-TOKEN");
      await axios.delete(
        `${API_URL}/spesimen/${spesimen.id_spesimen}`,
        {
          withCredentials: true,
          headers: { "x-csrf-token": csrfToken },
        }
      );
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
      console.error("Error deleting signature:", err);
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
          {/* Header Section */}

          {userLoading ? (
            <Center p={8}>
              <VStack spacing={4}>
                <Spinner size="xl" color="blue.500" />
                <Text>Memuat data user...</Text>
              </VStack>
            </Center>
          ) : error ? (
            <Alert status="error" mb={6}>
              <AlertIcon />
              <AlertTitle>Error!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Status spesimen */}
              {spesimen && spesimen.id_spesimen ? (
                <Alert status="info" mb={6} borderRadius="md">
                  <AlertIcon />
                  <VStack align="start" spacing={0}>
                    <AlertTitle>Spesimen tanda tangan tersedia</AlertTitle>
                  </VStack>
                </Alert>
              ) : (
                <Alert status="warning" mb={6} borderRadius="md">
                  <AlertIcon />
                  <AlertDescription>
                    Anda belum memiliki spesimen tanda tangan. Silakan gambar
                    atau unggah tanda tangan.
                  </AlertDescription>
                </Alert>
              )}

              {/* Upload Section */}
              <Box mb={8}>
                <FormControl>
                  <FormLabel fontSize="lg" fontWeight="semibold" mb={4}>
                    Unggah Tanda Tangan
                  </FormLabel>
                  <Box
                    border="2px dashed"
                    borderColor="gray.300"
                    borderRadius="lg"
                    p={4}
                    _hover={{ borderColor: "blue.300" }}
                  >
                    <Input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleImageUpload}
                      display="none"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <VStack spacing={3} cursor="pointer">
                        <Icon
                          as={FiUpload}
                          w={8}
                          h={8}
                          color="blue.500"
                          p={2}
                          bg="blue.50"
                          borderRadius="full"
                        />
                        <Text fontSize="sm" color="gray.600" textAlign="center">
                          Pilih file gambar tanda tangan
                          <br />
                          (JPG/JPEG/PNG maks 2MB)
                        </Text>
                      </VStack>
                    </label>
                  </Box>
                </FormControl>
              </Box>

              {/* Signature Panels */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {/* Canvas Panel */}
                <Box>
                  <Heading as="h3" fontSize="lg" mb={4} color="gray.700">
                    Tanda Tangan Manual
                  </Heading>
                  <Box
                    border="2px dashed"
                    borderColor="gray.300"
                    borderRadius="lg"
                    p={2}
                  >
                    <canvas
                      ref={canvasRef}
                      width={400}
                      height={200}
                      className="w-full cursor-crosshair bg-white"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={endDrawing}
                      onMouseLeave={endDrawing}
                      style={{
                        touchAction: "none",
                        background: "white",
                        borderRadius: "8px",
                      }}
                    />
                  </Box>
                  <HStack mt={2} spacing={2}>
                    <Button
                      onClick={() => {
                        const canvas = canvasRef.current;
                        if (canvas) {
                          const ctx = canvas.getContext("2d");
                          ctx?.clearRect(0, 0, canvas.width, canvas.height);
                        }
                      }}
                      colorScheme="red"
                      size="sm"
                      leftIcon={<FiTrash2 />}
                    >
                      Reset Canvas
                    </Button>
                    <Button
                      onClick={() => {
                        const canvas = canvasRef.current;
                        if (canvas) {
                          const dataUrl = canvas.toDataURL("image/png");
                          if (dataUrl) {
                            setSelectedImage(dataUrl);
                            toast({
                              title: "Berhasil",
                              description:
                                "Tanda tangan manual disimpan ke pratinjau!",
                              status: "success",
                              duration: 2000,
                              isClosable: true,
                            });
                          }
                        }
                      }}
                      colorScheme="blue"
                      size="sm"
                      leftIcon={<FiSave />}
                    >
                      Simpan dari Canvas
                    </Button>
                  </HStack>
                </Box>

                {/* Preview Panel */}
                <Box>
                  <Heading as="h3" fontSize="lg" mb={4} color="gray.700">
                    Tanda Tangan
                  </Heading>
                  <AspectRatio ratio={4 / 3}>
                    <Box
                      border="2px dashed"
                      borderColor="gray.300"
                      borderRadius="lg"
                      bg="gray.50"
                      p={2}
                    >
                      {selectedImage ? (
                        <Image
                          src={selectedImage}
                          alt="Preview Tanda Tangan"
                          objectFit="contain"
                          w="full"
                          h="full"
                        />
                      ) : spesimen && spesimen.data ? (
                        <Image
                          src={spesimen.data}
                          alt="Preview Tanda Tangan"
                          objectFit="contain"
                          w="full"
                          h="full"
                        />
                      ) : (
                        <Center>
                          <Text color="gray.500">Belum ada tanda tangan</Text>
                        </Center>
                      )}
                    </Box>
                  </AspectRatio>
                </Box>
              </SimpleGrid>

              {/* Action Buttons */}
              <HStack mt={6} spacing={4}>
                <Button
                  onClick={resetAll}
                  colorScheme="red"
                  flex={1}
                  leftIcon={<FiTrash2 />}
                  isLoading={loading}
                >
                  Reset
                </Button>
                {spesimen && spesimen.id_spesimen && (
                  <Button
                    onClick={deleteSpesimen}
                    colorScheme="orange"
                    flex={1}
                    leftIcon={<FiTrash2 />}
                    isLoading={loading}
                  >
                    Hapus Tersimpan
                  </Button>
                )}
                <Button
                  onClick={saveSignature}
                  colorScheme="blue"
                  flex={1}
                  leftIcon={<FiSave />}
                  isLoading={loading}
                >
                  Simpan Tanda Tangan
                </Button>
              </HStack>
            </>
          )}

          {/* Footer */}
          <VStack mt={8} pt={4} borderTopWidth={1} spacing={1}>
            <Text fontSize="sm" color="gray.500">
              Copyright © 2025
            </Text>
            <Link
              href="https://www.its.ac.id"
              isExternal
              color="blue.500"
              fontSize="sm"
            >
              Institut Teknologi Sepuluh Nopember
            </Link>
          </VStack>
        </Container>
      </Box>
    </PageTransition>
  );
};

export default SpecimenPage;

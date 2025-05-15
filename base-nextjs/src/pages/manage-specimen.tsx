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

interface SpesimenData {
  id_spesimen: string;
  id_sdm: string;
  data: string;
  created_at: string;
  updated_at: string;
}

const SpecimenPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [spesimen, setSpesimen] = useState<SpesimenData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  // Ganti dengan ID SDM yang sebenarnya, misalnya dari konteks autentikasi
  // Ini hanya contoh, pada implementasi sebenarnya ID SDM harus diambil dari data user yang login
  const userIdSDM = "e89b9f8b-4447-4c12-8e6e-7d4045f4c3ff";

  // ID updater (user yang melakukan update)
  const updaterId = "e89b9f8b-4447-4c12-8e6e-7d4045f4c3ff";

  // Mengambil data spesimen dan CSRF token saat komponen dimuat
  useEffect(() => {
    // Ambil CSRF token dari cookie atau dari endpoint khusus jika diperlukan
    const getCsrfToken = async () => {
      try {
        // Jika backend menyediakan endpoint untuk mendapatkan token CSRF
        const response = await axios.get("/api/csrf-token");

        // CSRF token biasanya disimpan dalam cookie secara otomatis
        console.log("CSRF token diperoleh dari server");
      } catch (err) {
        console.error("Error mendapatkan CSRF token:", err);
      }
    };

    const init = async () => {
      try {
        // Pertama dapatkan CSRF token jika diperlukan
        await getCsrfToken();

        // Kemudian ambil data spesimen
        await fetchSpesimen();
      } catch (err) {
        console.error("Error saat inisialisasi:", err);
        setError("Gagal melakukan inisialisasi halaman. Silakan muat ulang.");
      }
    };

    init();
  }, []);

  // Fungsi untuk mengambil data spesimen berdasarkan ID SDM
  const fetchSpesimen = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(`Mencoba GET /api/spesimen/sdm/${userIdSDM}`);
      const response = await axios.get(`/api/spesimen/sdm/${userIdSDM}`);
      setSpesimen(response.data);

      // Jika data spesimen ada, tampilkan gambar
      if (response.data && response.data.data) {
        setSelectedImage(response.data.data);
      }
    } catch (err) {
      // Jika error 404, berarti belum ada spesimen untuk SDM tersebut
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        // Tidak perlu menampilkan error karena itu normal jika belum ada spesimen
        console.log("Belum ada spesimen terdaftar untuk user ini");
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

  // Reset all
  const resetAll = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    setSelectedImage(null);
  };

  // Menyimpan tanda tangan
  const saveSignature = async () => {
    let signatureData = selectedImage;

    // Jika tidak ada gambar yang diunggah, coba ambil dari canvas
    if (!signatureData) {
      signatureData = getSignatureFromCanvas();
    }

    if (!signatureData) {
      toast({
        title: "Tanda tangan kosong",
        description:
          "Silakan gambar tanda tangan atau unggah gambar terlebih dahulu",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        id_sdm: userIdSDM,
        data: signatureData,
        updater: updaterId,
      };

      console.log("Mencoba menyimpan spesimen tanda tangan");

      // Jika sudah ada spesimen, update. Jika belum, buat baru
      if (spesimen) {
        console.log(`PUT /api/spesimen/${spesimen.id_spesimen}`);
        await axios.put(`/api/spesimen/${spesimen.id_spesimen}`, {
          data: signatureData,
          updater: updaterId,
        });
      } else {
        console.log("POST /api/spesimen");
        await axios.post("/api/spesimen", payload);
      }

      toast({
        title: "Berhasil",
        description: "Tanda tangan berhasil disimpan!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Refresh data
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
    if (!spesimen) {
      toast({
        title: "Tidak ada spesimen",
        description: "Tidak ada tanda tangan yang tersimpan untuk dihapus",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      console.log(`DELETE /api/spesimen/${spesimen.id_spesimen}`);
      await axios.delete(`/api/spesimen/${spesimen.id_spesimen}`);

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
    <Box minH="100vh" bg="gray.50" p={6}>
      <Container maxW="3xl" bg="white" borderRadius="lg" p={6} boxShadow="md">
        {/* Header Section */}
        <Heading as="h1" fontSize="2xl" mb={8} color="gray.700">
          Manajemen Spesimen Tanda Tangan
        </Heading>

        {isLoading ? (
          <Center p={8}>
            <VStack spacing={4}>
              <Spinner size="xl" color="blue.500" />
              <Text>Memuat data spesimen...</Text>
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
            {spesimen ? (
              <Alert status="info" mb={6} borderRadius="md">
                <AlertIcon />
                <VStack align="start" spacing={0}>
                  <AlertTitle>Spesimen tanda tangan tersedia</AlertTitle>
                  <AlertDescription>
                    Terakhir diperbarui:{" "}
                    {new Date(spesimen.updated_at).toLocaleString("id-ID")}
                  </AlertDescription>
                </VStack>
              </Alert>
            ) : (
              <Alert status="warning" mb={6} borderRadius="md">
                <AlertIcon />
                <AlertDescription>
                  Anda belum memiliki spesimen tanda tangan. Silakan gambar atau
                  unggah tanda tangan.
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
              </Box>

              {/* Preview Panel */}
              <Box>
                <Heading as="h3" fontSize="lg" mb={4} color="gray.700">
                  Pratinjau Tanda Tangan
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
              {spesimen && (
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
  );
};

export default SpecimenPage;

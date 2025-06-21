import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import {
  fetchSignatureDetail,
  SignatureDetail,
  getDownloadUrlForDokumen,
} from "@/services/signature";
import PageTransition from "@/components/PageLayout";
import {
  Box,
  Button,
  Center,
  Spinner,
  Alert,
  AlertIcon,
  Table,
  Tbody,
  Tr,
  Td,
  Thead,
  Th,
  VStack,
  Text,
  Link,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Input,
  Checkbox,
  useDisclosure,
  useToast,
  FormControl,
  FormLabel,
  InputGroup,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { PDFDocument } from "pdf-lib";
import { useRef } from "react";
import PdfViewer from "@/components/signature/PdfViewer";
import { getCookie } from "@/utils/common/CookieParser";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

// Helper: konversi base64 ke Blob (pindahkan ke luar block agar tidak error strict mode)
function base64ToBlob(base64: string, mime: string) {
  const byteChars = atob(base64.split(",")[1]);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mime });
}

// Editor PDF sederhana untuk menempelkan spesimen
const SimpleSpecimenEditor = ({
  pdfUrl,
  spesimenUrl,
  onPdfReady,
}: {
  pdfUrl: string;
  spesimenUrl: string;
  onPdfReady: (file: File) => void;
}) => {
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [specimenPlaced, setSpecimenPlaced] = useState(false);
  const [processing, setProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load PDF as image preview
  useEffect(() => {
    fetch(pdfUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onload = (e) => setPdfData(e.target?.result as string);
        reader.readAsDataURL(blob);
      });
  }, [pdfUrl]);

  // Render PDF as image (1st page only, for simplicity)
  // For real PDF preview, use pdf.js or react-pdf

  // Handler untuk menempelkan spesimen ke PDF
  const handlePlaceSpecimen = async () => {
    setProcessing(true);
    try {
      // Fetch PDF bytes
      const pdfRes = await fetch(pdfUrl);
      const pdfBytes = new Uint8Array(await pdfRes.arrayBuffer());
      // Fetch spesimen image
      const imgRes = await fetch(spesimenUrl);
      const imgBytes = new Uint8Array(await imgRes.arrayBuffer());
      // Load PDF
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const page = pdfDoc.getPages()[0];
      // Embed image (assume PNG)
      const img = await pdfDoc.embedPng(imgBytes);
      // Tempel di pojok kanan bawah (misal, offset 40x40 px)
      const width = 120,
        height = 40;
      page.drawImage(img, {
        x: page.getWidth() - width - 40,
        y: 40,
        width,
        height,
      });
      // Save PDF
      const newPdfBytes = await pdfDoc.save();
      const file = new File([newPdfBytes], "with_specimen.pdf", {
        type: "application/pdf",
      });
      setSpecimenPlaced(true);
      onPdfReady(file);
    } catch (e) {
      alert("Gagal menempelkan spesimen ke PDF");
    }
    setProcessing(false);
  };

  return (
    <Box>
      <Text fontWeight={600} mb={2}>
        Preview Dokumen (halaman 1)
      </Text>
      {pdfData ? (
        <img
          src={pdfData}
          alt="Preview PDF"
          style={{ maxWidth: 500, border: "1px solid #eee" }}
        />
      ) : (
        <Spinner />
      )}
      <Box mt={3}>
        <Button
          colorScheme="teal"
          onClick={handlePlaceSpecimen}
          isLoading={processing}
          isDisabled={specimenPlaced}
        >
          Tempelkan Spesimen ke PDF
        </Button>
        {specimenPlaced && (
          <Text color="green.600" mt={2}>
            Spesimen sudah ditempelkan ke PDF!
          </Text>
        )}
      </Box>
    </Box>
  );
};

// Gantikan SimpleSpecimenEditor dengan editor drag & drop seperti di coba.tsx
const SpecimenEditorDragDrop = ({
  pdfUrl,
  spesimenUrl,
  onPdfReady,
  signatureWidgets,
  setSignatureWidgets,
  pdfPageOriginalWidth,
  setPdfPageOriginalWidth,
  pdfPageOriginalHeight,
  setPdfPageOriginalHeight,
}: {
  pdfUrl: string;
  spesimenUrl: string;
  onPdfReady: (file: File) => void;
  signatureWidgets: any[];
  setSignatureWidgets: React.Dispatch<React.SetStateAction<any[]>>;
  pdfPageOriginalWidth: number;
  setPdfPageOriginalWidth: React.Dispatch<React.SetStateAction<number>>;
  pdfPageOriginalHeight: number;
  setPdfPageOriginalHeight: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [allLocked, setAllLocked] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Load PDF as base64
  useEffect(() => {
    fetch(pdfUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onload = (e) => setPdfData(e.target?.result as string);
        reader.readAsDataURL(blob);
      });
  }, [pdfUrl]);

  // Load spesimen image
  useEffect(() => {
    setSignatureImage(spesimenUrl);
  }, [spesimenUrl]);

  // Drag & drop, resize, lock logic
  const handleAddSignature = () => {
    if (!signatureImage) return;
    setSignatureWidgets([
      {
        x: 100,
        y: 100,
        id: "specimen-1",
        pageNumber: currentPage,
        image: signatureImage,
        width: 160,
        height: 60,
        isLocked: false,
      },
    ]);
    setDownloadUrl(null);
  };

  const handleWidgetLock = () => {
    if (signatureWidgets.length > 0) {
      setSignatureWidgets((prev) =>
        prev.map((w) => (w.id === "specimen-1" ? { ...w, isLocked: true } : w))
      );
      setAllLocked(true);
    }
  };

  const handleRemoveSignature = useCallback((id: string) => {
    setSignatureWidgets([]);
    setDownloadUrl(null);
    setAllLocked(false);
  }, []);

  const handleResizeWidget = (id: string, width: number, height: number) => {
    setSignatureWidgets((prev) =>
      prev.map((w) =>
        w.id === id
          ? { ...w, width: Math.round(width), height: Math.round(height) }
          : w
      )
    );
    setDownloadUrl(null);
  };

  const handleDragWidget = (id: string, x: number, y: number) => {
    setSignatureWidgets((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, x: Math.round(x), y: Math.round(y) } : w
      )
    );
    setDownloadUrl(null);
  };

  // Embed signature ke PDF jika locked
  useEffect(() => {
    const embedIfLocked = async () => {
      if (!pdfData || !allLocked || downloadUrl) return;
      setProcessing(true);
      try {
        const base64 = pdfData.split(",")[1];
        const pdfBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();
        for (const w of signatureWidgets) {
          const page = pages[w.pageNumber - 1];
          const width = w.width || 160;
          const height = w.height || 60;
          if (w.image) {
            let img;
            if (w.image.startsWith("data:image/png")) {
              img = await pdfDoc.embedPng(w.image);
            } else {
              img = await pdfDoc.embedJpg(w.image);
            }
            page.drawImage(img, {
              x: w.x,
              y: page.getHeight() - w.y - height,
              width,
              height,
            });
          }
        }
        const newPdfBytes = await pdfDoc.save();
        const file = new File([newPdfBytes], "with_specimen.pdf", {
          type: "application/pdf",
        });
        setDownloadUrl("done");
        onPdfReady(file);
      } catch (e) {
        alert("Gagal embed signature ke PDF: " + e);
      }
      setProcessing(false);
    };
    embedIfLocked();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allLocked, pdfData, signatureWidgets]);

  // Navigasi halaman
  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(numPages, p + 1));

  const widgetsForCurrentPage = signatureWidgets.filter(
    (w) => w.pageNumber === currentPage
  );

  return (
    <Box>
      <Text fontWeight={600} mb={2}>
        Editor Tanda Tangan (drag & drop spesimen ke PDF)
      </Text>
      <Box mb={2}>
        <Button
          colorScheme="teal"
          onClick={handleAddSignature}
          isDisabled={signatureWidgets.length > 0}
        >
          Tempelkan Spesimen ke PDF
        </Button>
        {signatureWidgets.length > 0 && !allLocked && (
          <Button ml={2} colorScheme="blue" onClick={handleWidgetLock}>
            Kunci Spesimen (Selesai)
          </Button>
        )}
        {allLocked && (
          <Text color="green.600" ml={4} display="inline">
            Spesimen sudah dikunci!
          </Text>
        )}
      </Box>
      <Box mb={2}>
        <Button
          size="sm"
          onClick={handlePrevPage}
          mr={2}
          isDisabled={currentPage === 1}
        >
          &lt;
        </Button>
        <Button
          size="sm"
          onClick={handleNextPage}
          isDisabled={currentPage === numPages}
        >
          &gt;
        </Button>
        <span style={{ marginLeft: 8 }}>
          Halaman {currentPage} / {numPages}
        </span>
      </Box>
      <Box
        style={{
          width: "100%",
          maxWidth: "900px",
          margin: "0 auto",
          minHeight: "1000px",
          paddingBottom: "48px",
          background: "#fff",
          borderRadius: "16px",
        }}
      >
        <PdfViewer
          pdfData={pdfData || ""}
          signatureWidgets={widgetsForCurrentPage}
          onDropSignature={() => {}}
          onRemoveSignature={handleRemoveSignature}
          currentPage={currentPage}
          onNumPages={setNumPages}
          onResizeWidget={handleResizeWidget}
          onDragWidget={handleDragWidget}
          onLockWidget={handleWidgetLock}
          onPageLoadSuccess={(page) => {
            setPdfPageOriginalWidth(page.originalWidth || page.width);
            setPdfPageOriginalHeight(page.originalHeight || page.height);
          }}
          pdfPageOriginalWidth={pdfPageOriginalWidth}
          pdfPageOriginalHeight={pdfPageOriginalHeight}
        />
      </Box>
    </Box>
  );
};

const SignatureDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState<SignatureDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [passphrase, setPassphrase] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [signing, setSigning] = useState(false);
  const [pdfFileWithSpecimen, setPdfFileWithSpecimen] = useState<File | null>(
    null
  );
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [idSdm, setIdSdm] = useState<string>("");
  const [activeDocIdx, setActiveDocIdx] = useState(0);
  const [signatureWidgets, setSignatureWidgets] = useState<any[]>([]);
  const [pdfPageOriginalWidth, setPdfPageOriginalWidth] = useState<number>(0);
  const [pdfPageOriginalHeight, setPdfPageOriginalHeight] = useState<number>(0);

  useEffect(() => {
    if (!id) return;
    // Debug: log id
    console.log("DetailPage id param:", id);
    let idStr = id;
    if (Array.isArray(id)) idStr = id[0];
    if (typeof idStr !== "string") return;
    // Validasi UUID sederhana
    if (!/^[0-9a-fA-F\-]{36}$/.test(idStr)) {
      setError("ID penandatanganan tidak valid");
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchSignatureDetail(idStr)
      .then(setData)
      .catch(() => setError("Gagal mengambil detail penandatanganan"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    // Ambil id_sdm anggota yang sedang login (yang belum sign)
    if (!data) return;
    const anggota = data.anggota.find((a) => !a.is_sign);
    if (!anggota) return;
    setIdSdm(anggota.id_sdm);
  }, [data]);

  useEffect(() => {
    if (!idSdm) return;
    // Fetch spesimen dari endpoint
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/spesimen/sdm/${idSdm}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.data) setSignatureImage(res.data);
      });
  }, [idSdm]);

  // Helper: dokumen array
  const dokumenArr = data
    ? Array.isArray(data.dokumen)
      ? data.dokumen
      : data.dokumen
      ? [data.dokumen]
      : []
    : [];
  const currentDokumen = dokumenArr[activeDocIdx] || dokumenArr[0];
  // Debug log
  console.log("currentDokumen:", currentDokumen);

  // Ambil id_sdm user yang belum sign (atau logic lain sesuai kebutuhan)
  const getIdSdmUser = () => {
    if (!data) return "";
    // Coba cari anggota yang belum sign dan nama sama dengan pembuat
    const anggota = data.anggota.find(
      (a) => !a.is_sign && a.nama === data.pembuat.nama
    );
    if (anggota) return anggota.id_sdm || "";
    // fallback: cari anggota yang belum sign
    const anggota2 = data.anggota.find((a) => !a.is_sign);
    if (anggota2) return anggota2.id_sdm || "";
    // fallback: kosong
    return "";
  };

  // Tambahkan fungsi untuk refetch detail penandatanganan
  const refetchDetail = async () => {
    if (!id) return;
    let idStr = id;
    if (Array.isArray(id)) idStr = id[0];
    if (typeof idStr !== "string") return;
    setLoading(true);
    try {
      const detail = await fetchSignatureDetail(idStr);
      setData(detail);
    } catch {
      setError("Gagal mengambil detail penandatanganan");
    } finally {
      setLoading(false);
    }
  };

  // Handler submit tanda tangan
  const handleSign = async () => {
    if (!data) return;
    setSigning(true);
    try {
      // 1. Ambil user SSO yang sedang login
      const userRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/user`,
        { credentials: "include" }
      );
      if (!userRes.ok) throw new Error("Gagal mengambil data user login");
      const userData = await userRes.json();
      const ssoUserId = userData.data.sso_user_id || userData.data.sub;
      if (!ssoUserId) throw new Error("SSO User ID tidak ditemukan");
      // 2. Ambil data SDM berdasarkan sso_user_id
      const sdmRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/sdm/by-sso-id/${ssoUserId}`,
        { credentials: "include" }
      );
      if (!sdmRes.ok) throw new Error("Gagal mengambil data SDM");
      const sdmData = await sdmRes.json();
      const sdm = sdmData.data ? sdmData.data : sdmData;
      const nik = sdm.nik;
      if (!nik) throw new Error("NIK tidak ditemukan untuk user ini");
      // 3. Ambil CSRF token
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/csrf-cookie`, {
        credentials: "include",
      });
      const csrfToken = getCookie("CSRF-TOKEN");
      // 4. Ambil file PDF hasil tempel spesimen (jika ada)
      let pdfFile: File;
      const dokumen = currentDokumen;
      if (pdfFileWithSpecimen) {
        pdfFile = pdfFileWithSpecimen;
      } else {
        if (!dokumen || !dokumen.nama_file) {
          throw new Error("File dokumen belum tersedia di server.");
        }
        const pdfUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/public/pdf/${dokumen.nama_file}`;
        const pdfRes = await fetch(pdfUrl);
        if (!pdfRes.ok) throw new Error("Gagal mengambil file PDF");
        const pdfBlob = await pdfRes.blob();
        pdfFile = new File([pdfBlob], dokumen.nama_file, {
          type: "application/pdf",
        });
      }
      // 5. Siapkan FormData
      const formData = new FormData();
      if (data.type === 2) {
        // Ambil widget utama (hanya satu untuk drag & drop spesimen)
        const widget = signatureWidgets[0];
        // Ambil image spesimen (base64)
        const spesimenBase64 = signatureImage;
        // Konversi base64 ke Blob
        const spesimenBlob = spesimenBase64
          ? base64ToBlob(spesimenBase64, "image/png")
          : null;
        const spesimenFile = spesimenBlob
          ? new File([spesimenBlob], "ttd.png", { type: "image/png" })
          : null;
        formData.append("file", pdfFile);
        formData.append("nik", nik);
        formData.append("passphrase", passphrase);
        formData.append("tampilan", "visible");
        formData.append("image", "true");
        if (spesimenFile) formData.append("imageTTD", spesimenFile);
        formData.append("page", widget?.pageNumber?.toString() || "1");
        // Hitung xAxis, yAxis, width, height sesuai editor.tsx
        const xAxis = Math.round(widget?.x || 0);
        const width = Math.round(widget?.width || 160);
        const height = Math.round(widget?.height || 60);
        const yAxis = Math.round(
          pdfPageOriginalHeight - ((widget?.y || 0) + height)
        );
        formData.append("xAxis", xAxis.toString());
        formData.append("yAxis", yAxis.toString());
        formData.append("width", width.toString());
        formData.append("height", height.toString());
      } else {
        // type 1: default
        formData.append("file", pdfFile);
        formData.append("nik", nik);
        formData.append("passphrase", passphrase);
        formData.append("tampilan", "invisible");
        formData.append("id_penandatanganan", data.id_penandatanganan);
      }
      // 6. Kirim ke backend
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sign/pdf`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
          headers: csrfToken ? { "X-CSRF-TOKEN": csrfToken } : undefined,
        }
      );
      if (!res.ok) {
        const errMsg = await res.text();
        throw new Error(`Gagal menandatangani dokumen: ${errMsg}`);
      }
      // Success
      toast({
        title: "Berhasil menandatangani dokumen!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // Refetch detail penandatanganan agar status anggota & dokumen terupdate
      await refetchDetail();
      onClose();
    } catch (e: any) {
      toast({
        title: "Gagal menandatangani dokumen",
        description: e.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSigning(false);
    }
  };

  return (
    <PageTransition pageTitle="Halaman Penandatanganan">
      <Box
        maxW="900px"
        mx="auto"
        mt={8}
        p={4}
        bg="white"
        borderRadius="xl"
        boxShadow="md"
      >
        {loading ? (
          <Center p={12}>
            <Spinner size="xl" />
          </Center>
        ) : error ? (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        ) : data && dokumenArr.length > 0 ? (
          <>
            {/* Jika dokumen tidak valid, tampilkan pesan error */}
            {!currentDokumen?.nama_file ? (
              <Alert status="error" mb={4}>
                <AlertIcon />
                Data dokumen tidak valid atau file tidak ditemukan.
              </Alert>
            ) : null}
            {/* Tab dokumen jika lebih dari satu */}
            {dokumenArr.length > 1 && (
              <Box mb={2} display="flex" gap={2}>
                {dokumenArr.map((dok, idx) => (
                  <Button
                    key={dok.id_dokumen || idx}
                    size="sm"
                    colorScheme={activeDocIdx === idx ? "blue" : "gray"}
                    variant={activeDocIdx === idx ? "solid" : "outline"}
                    onClick={() => setActiveDocIdx(idx)}
                  >
                    Dokumen {idx + 1}
                  </Button>
                ))}
              </Box>
            )}
            {/* Status tanda tangan */}
            {currentDokumen && !currentDokumen.is_signed && (
              <Alert status="warning" mb={4}>
                <AlertIcon />
                Anda belum melakukan tanda tangan pada dokumen ini. Silakan klik
                tombol Tanda Tangan dibawah.
              </Alert>
            )}
            {/* Dokumen */}
            <Box
              display="flex"
              alignItems="center"
              bg="#f7f8fa"
              p={3}
              borderRadius="md"
              mb={4}
            >
              <Box flex={1} display="flex" alignItems="center" gap={3}>
                <Box as="span" fontSize="2xl" color="red.500">
                  📄
                </Box>
                <Text fontWeight={600} fontSize="md" color="blue.700">
                  {currentDokumen?.nama_file || "-"}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {currentDokumen?.ukuran
                    ? (currentDokumen.ukuran / 1024).toFixed(2) + " KB"
                    : "-"}
                </Text>
              </Box>
              <Box display="flex" alignItems="center" gap={3}>
                <Text fontSize="sm">
                  Is Signed:{" "}
                  {currentDokumen?.is_signed ? (
                    <span style={{ color: "green" }}>✔</span>
                  ) : (
                    <span style={{ color: "red" }}>✖</span>
                  )}
                </Text>
                <Link
                  href={
                    currentDokumen
                      ? getDownloadUrlForDokumen(currentDokumen)
                      : "#"
                  }
                  download
                  target="_blank"
                >
                  <Button
                    size="sm"
                    colorScheme={currentDokumen?.is_signed ? "green" : "blue"}
                    variant="ghost"
                  >
                    {currentDokumen?.is_signed
                      ? "Unduh Dokumen Bertanda Tangan"
                      : "Unduh Dokumen Asli"}
                  </Button>
                </Link>
              </Box>
            </Box>
            {/* Info utama */}
            <Table variant="simple" mb={6}>
              <Tbody>
                <Tr>
                  <Td fontWeight={600} w="220px">
                    KONTEKS PENANDATANGAN
                  </Td>
                  <Td>{data.judul}</Td>
                </Tr>
                <Tr>
                  <Td fontWeight={600}>NAMA PEMBUAT</Td>
                  <Td>{data.pembuat.nama}</Td>
                </Tr>
                <Tr>
                  <Td fontWeight={600}>ANGGOTA PENANDATANGAN</Td>
                  <Td>
                    <VStack align="start" spacing={2}>
                      {data.anggota.map((a) => (
                        <Box
                          key={a.id_anggota_penandatangan}
                          display="flex"
                          alignItems="center"
                          gap={2}
                        >
                          <Box
                            as="span"
                            fontSize="xl"
                            color={a.is_sign ? "green.500" : "red.500"}
                          >
                            {a.is_sign ? "✔" : "✖"}
                          </Box>
                          <Text>{a.nama}</Text>
                        </Box>
                      ))}
                    </VStack>
                  </Td>
                </Tr>
              </Tbody>
            </Table>
            <Box textAlign="right">
              {currentDokumen && !currentDokumen.is_signed ? (
                <Button colorScheme="blue" onClick={onOpen}>
                  Tanda Tangani Dokumen ini
                </Button>
              ) : (
                <Button colorScheme="blue" isDisabled>
                  Anda sudah menandatangani
                </Button>
              )}
            </Box>
            {/* Tambahkan preview editor PDF di bawah detail */}
            <Box mt={8} width="100%" p={0} m={0}>
              <DndProvider backend={HTML5Backend}>
                <SpecimenEditorDragDrop
                  pdfUrl={
                    currentDokumen?.nama_file
                      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/public/pdf/${currentDokumen.nama_file}`
                      : ""
                  }
                  spesimenUrl={signatureImage || "/default-spesimen.png"}
                  onPdfReady={(file) => setPdfFileWithSpecimen(file)}
                  signatureWidgets={signatureWidgets}
                  setSignatureWidgets={setSignatureWidgets}
                  pdfPageOriginalWidth={pdfPageOriginalWidth}
                  setPdfPageOriginalWidth={setPdfPageOriginalWidth}
                  pdfPageOriginalHeight={pdfPageOriginalHeight}
                  setPdfPageOriginalHeight={setPdfPageOriginalHeight}
                />
              </DndProvider>
            </Box>
            {/* Modal Passphrase */}
            <Modal isOpen={isOpen} onClose={onClose} isCentered>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Tanda Tangani Dokumen</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <FormControl mb={4}>
                    <FormLabel>Masukkan passphrase</FormLabel>
                    <InputGroup>
                      <Input
                        type={showPass ? "text" : "password"}
                        placeholder="Masukkan passphrase Anda"
                        value={passphrase}
                        onChange={(e) => setPassphrase(e.target.value)}
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={showPass ? "Sembunyikan" : "Tampilkan"}
                          icon={showPass ? <ViewOffIcon /> : <ViewIcon />}
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowPass((v) => !v)}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                  <Box bg="yellow.50" p={3} borderRadius="md" mb={2}>
                    <Checkbox
                      isChecked={isChecked}
                      onChange={(e) => setIsChecked(e.target.checked)}
                    >
                      Dengan ini saya menyatakan bahwa saya telah membaca dan
                      memahami isi dokumen ini.
                    </Checkbox>
                  </Box>
                </ModalBody>
                <ModalFooter>
                  <Button onClick={onClose} mr={3} isDisabled={signing}>
                    Batal
                  </Button>
                  <Button
                    colorScheme="blue"
                    onClick={handleSign}
                    isLoading={signing}
                    isDisabled={!passphrase || !isChecked || signing}
                  >
                    Tanda Tangan
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </>
        ) : null}
      </Box>
    </PageTransition>
  );
};

export default SignatureDetailPage;

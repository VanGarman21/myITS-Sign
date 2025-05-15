import React, { useRef, useState } from "react";
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
} from "@chakra-ui/react";
import { FiUpload, FiTrash2, FiSave, FiCheckCircle } from "react-icons/fi";

const SpecimenPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [signatureSaved, setSignatureSaved] = useState(false);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

  // Reset all
  const resetAll = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    setSelectedImage(null);
    setSignatureSaved(false);
  };

  return (
    <Box minH="100vh" bg="gray.50" p={6}>
      <Container maxW="3xl" bg="white" borderRadius="lg" p={6} boxShadow="md">
        {/* Header Section */}
        <Heading as="h1" fontSize="2xl" mb={8} color="gray.700">
          Manajemen Spesimen Tanda Tangan
        </Heading>

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
                <Image
                  src={selectedImage || ""}
                  alt="Preview Tanda Tangan"
                  objectFit="contain"
                  w="full"
                  h="full"
                  fallbackSrc="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                />
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
          >
            Reset Semua
          </Button>
          <Button
            onClick={() => setSignatureSaved(true)}
            colorScheme="blue"
            flex={1}
            leftIcon={<FiSave />}
          >
            Simpan Tanda Tangan
          </Button>
        </HStack>

        {/* Success Message */}
        {signatureSaved && (
          <Alert status="success" mt={4} borderRadius="md">
            <FiCheckCircle />
            <AlertDescription ml={2}>
              Tanda tangan berhasil disimpan!
            </AlertDescription>
          </Alert>
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

import { Box, Heading, Stack, Button } from "@chakra-ui/react";
import { FiTrash2, FiSave } from "react-icons/fi";
import React from "react";

interface SpecimenCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  startDrawing: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  draw: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  endDrawing: () => void;
  onReset: () => void;
  onSave: () => void;
  loading?: boolean;
}

const SpecimenCanvas: React.FC<SpecimenCanvasProps> = ({
  canvasRef,
  startDrawing,
  draw,
  endDrawing,
  onReset,
  onSave,
  loading,
}) => (
  <Box>
    <Heading as="h3" fontSize="lg" mb={4} color="gray.700">
      Tanda Tangan Manual
    </Heading>
    <Box border="2px dashed" borderColor="gray.300" borderRadius="lg" p={2}>
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
    <Stack
      mt={2}
      spacing={2}
      direction={{ base: "column", md: "row" }}
      width="100%"
    >
      <Button
        onClick={onReset}
        colorScheme="red"
        size="sm"
        leftIcon={<FiTrash2 />}
        isLoading={loading}
        width={{ base: "100%", md: "auto" }}
      >
        Reset Canvas
      </Button>
      <Button
        onClick={onSave}
        colorScheme="blue"
        size="sm"
        leftIcon={<FiSave />}
        isLoading={loading}
        width={{ base: "100%", md: "auto" }}
      >
        Simpan dari Canvas
      </Button>
    </Stack>
  </Box>
);

export default SpecimenCanvas;

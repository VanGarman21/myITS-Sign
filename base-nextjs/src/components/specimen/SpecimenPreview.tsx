import {
  Box,
  Heading,
  AspectRatio,
  Image,
  Center,
  Text,
} from "@chakra-ui/react";
import React from "react";

interface SpecimenPreviewProps {
  selectedImage: string | null;
  spesimen: { data?: string } | null;
}

const SpecimenPreview: React.FC<SpecimenPreviewProps> = ({
  selectedImage,
  spesimen,
}) => (
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
);

export default SpecimenPreview;

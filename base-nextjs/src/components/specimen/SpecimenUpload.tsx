import {
  FormControl,
  FormLabel,
  Box,
  Input,
  VStack,
  Icon,
  Text,
} from "@chakra-ui/react";
import { FiUpload } from "react-icons/fi";
import React from "react";

type SpecimenUploadProps = {
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const SpecimenUpload: React.FC<SpecimenUploadProps> = ({ onImageUpload }) => (
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
          onChange={onImageUpload}
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
);

export default SpecimenUpload;

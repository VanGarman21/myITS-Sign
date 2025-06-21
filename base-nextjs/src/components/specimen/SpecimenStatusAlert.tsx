import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  VStack,
} from "@chakra-ui/react";

interface SpecimenStatusAlertProps {
  spesimen: { id_spesimen?: string } | null;
}

const SpecimenStatusAlert: React.FC<SpecimenStatusAlertProps> = ({
  spesimen,
}) => {
  return spesimen && spesimen.id_spesimen ? (
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
        Anda belum memiliki spesimen tanda tangan. Silakan gambar atau unggah
        tanda tangan.
      </AlertDescription>
    </Alert>
  );
};

export default SpecimenStatusAlert;

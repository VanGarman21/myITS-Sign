import { Stack, Button } from "@chakra-ui/react";
import { FiTrash2, FiSave } from "react-icons/fi";
import React from "react";

interface SpecimenActionsProps {
  onReset: () => void;
  onDelete?: () => void;
  onSave: () => void;
  loading?: boolean;
  spesimen: { id_spesimen?: string } | null;
}

const SpecimenActions: React.FC<SpecimenActionsProps> = ({
  onReset,
  onDelete,
  onSave,
  loading,
  spesimen,
}) => (
  <Stack
    mt={6}
    spacing={4}
    direction={{ base: "column", md: "row" }}
    width="100%"
  >
    <Button
      onClick={onReset}
      colorScheme="red"
      flex={1}
      leftIcon={<FiTrash2 />}
      isLoading={loading}
      width={{ base: "100%", md: "auto" }}
    >
      Reset
    </Button>
    {spesimen && spesimen.id_spesimen && onDelete && (
      <Button
        onClick={onDelete}
        colorScheme="orange"
        flex={1}
        leftIcon={<FiTrash2 />}
        isLoading={loading}
        width={{ base: "100%", md: "auto" }}
      >
        Hapus Tersimpan
      </Button>
    )}
    <Button
      onClick={onSave}
      colorScheme="blue"
      flex={1}
      leftIcon={<FiSave />}
      isLoading={loading}
      width={{ base: "100%", md: "auto" }}
    >
      Simpan Tanda Tangan
    </Button>
  </Stack>
);

export default SpecimenActions;

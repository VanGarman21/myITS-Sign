import { HStack, Button, Stack, useBreakpointValue } from "@chakra-ui/react";

interface SignatureActionButtonsProps {
  onSave: () => void;
  onSubmit: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const SignatureActionButtons = ({
  onSave,
  onSubmit,
  loading,
  disabled,
}: SignatureActionButtonsProps) => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  return (
    <Stack
      direction={isMobile ? "column" : "row"}
      spacing={4}
      mt={4}
      width="100%"
      align={isMobile ? "stretch" : "center"}
    >
      {/* <Button
        onClick={onSave}
        colorScheme="gray"
        variant="outline"
        isDisabled={loading}
        fontSize="md"
        borderRadius="md"
        minW="160px"
        width={isMobile ? "100%" : "auto"}
      >
        Simpan ke Editor
      </Button> */}
      <Button
        onClick={onSubmit}
        colorScheme="blue"
        isLoading={loading}
        isDisabled={disabled || loading}
        fontSize="md"
        borderRadius="md"
        minW="200px"
        width={isMobile ? "100%" : "auto"}
      >
        Simpan
      </Button>
    </Stack>
  );
};

export default SignatureActionButtons;

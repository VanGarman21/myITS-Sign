import AppSettingContext from "@/providers/AppSettingProvider";
import { Button, ButtonProps, useColorMode } from "@chakra-ui/react";
import { ReactNode, useContext } from "react";

interface BlueButtonInterface extends ButtonProps {
  children: ReactNode;
  btnProps?: ButtonProps;
  w?: string;
  width?: string;
}

const BlueButton = ({
  children,
  w,
  width,
  ...btnProps
}: BlueButtonInterface) => {
  const { colorMode } = useColorMode();
  const { colorPref } = useContext(AppSettingContext);
  return (
    <>
      <Button
        className="buttons"
        color="white"
        minW="166px"
        width={["100%", w ?? width ?? "unset"]}
        h="56px"
        p="0 20px"
        ml="12px"
        borderRadius="16px/16px"
        fontSize="14px"
        lineHeight="1.42857"
        fontWeight="700"
        transition="all .25s"
        bg={colorMode == "light" ? "blue.500" : "blueDim.500"}
        _hover={{
          bg: colorMode == "light" ? "blue.600" : "blueDim.600",
        }}
        _first={{
          marginLeft: "0px",
        }}
        {...btnProps}
      >
        {children}
      </Button>
    </>
  );
};

const BlueSubtleButton = ({
  children,
  w,
  width,
  ...btnProps
}: BlueButtonInterface) => {
  const { colorMode } = useColorMode();
  const { colorPref } = useContext(AppSettingContext);
  return (
    <>
      <Button
        className="buttons"
        color={colorMode == "light" ? "blue.500" : "blueDim.300"}
        minW="166px"
        width={["100%", w ?? width ?? "unset"]}
        h="56px"
        p="0 20px"
        ml="12px"
        borderRadius="16px/16px"
        fontSize="14px"
        lineHeight="1.42857"
        fontWeight="700"
        transition="all .25s"
        bg={colorMode == "light" ? "blue.50" : "blueDim.700"}
        _hover={{
          background: colorMode == "light" ? "blue.100" : "blueDim.800",
        }}
        _first={{
          marginLeft: "0px",
        }}
        {...btnProps}
      >
        {children}
      </Button>
    </>
  );
};

const BlueOutlineButton = ({
  children,
  w,
  width,
  ...btnProps
}: BlueButtonInterface) => {
  const { colorMode } = useColorMode();
  const { colorPref } = useContext(AppSettingContext);
  return (
    <>
      <Button
        className="buttons"
        color={colorMode == "light" ? "blue.500" : "blueDim.300"}
        minW="166px"
        width={["100%", w ?? width ?? "unset"]}
        h="56px"
        p="0 20px"
        ml="12px"
        borderRadius="16px/16px"
        fontSize="14px"
        lineHeight="1.42857"
        fontWeight="700"
        transition="all .25s"
        bg="transparent"
        border="2px solid"
        borderColor={colorMode == "light" ? "blue.400" : "blueDim.400"}
        _hover={{
          bg: colorMode == "light" ? "blue.50" : "blueDim.700",
        }}
        _first={{
          marginLeft: "0px",
        }}
        {...btnProps}
      >
        {children}
      </Button>
    </>
  );
};

const BlueGhostButton = ({
  children,
  w,
  width,
  ...btnProps
}: BlueButtonInterface) => {
  const { colorMode } = useColorMode();
  const { colorPref } = useContext(AppSettingContext);
  return (
    <>
      <Button
        className="buttons"
        color={colorMode == "light" ? "blue.500" : "blueDim.300"}
        minW="166px"
        width={["100%", w ?? width ?? "unset"]}
        h="56px"
        p="0 20px"
        ml="12px"
        borderRadius="16px/16px"
        fontSize="14px"
        lineHeight="1.42857"
        fontWeight="700"
        transition="all .25s"
        bg="transparent"
        _hover={{
          bg: colorMode == "light" ? "blue.50" : "blueDim.700",
        }}
        _first={{
          marginLeft: "0px",
        }}
        {...btnProps}
      >
        {children}
      </Button>
    </>
  );
};

export { BlueButton, BlueSubtleButton, BlueOutlineButton, BlueGhostButton };

import {
  Box,
  BoxProps,
  Center,
  Checkbox,
  createIcon,
  Flex,
  Stack,
  StackProps,
  Text,
  useCheckbox,
  useCheckboxGroup,
  UseCheckboxGroupProps,
  UseCheckboxProps,
  useColorModeValue,
  useId,
  useStyleConfig,
} from "@chakra-ui/react";
import {
  Children,
  cloneElement,
  isValidElement,
  ReactElement,
  useContext,
  useMemo,
} from "react";
import { CheckmarkSolidIconMade } from "../atoms/IconsMade";
import AppSettingContext from "@/providers/AppSettingProvider";

type PlainSwitchGroupProps = StackProps & UseCheckboxGroupProps;

export const PlainSwitchGroup = (props: PlainSwitchGroupProps) => {
  const { children, defaultValue, value, onChange, ...rest } = props;
  const { getCheckboxProps } = useCheckboxGroup({
    defaultValue,
    value,
    onChange,
  });

  const cards = useMemo(
    () =>
      Children.toArray(children)
        .filter<ReactElement<PlainSwitchProps>>(isValidElement)
        .map((card) => {
          return cloneElement(card, {
            checkboxprops: getCheckboxProps({
              value: card.props.value,
            }),
          });
        }),
    [children, getCheckboxProps]
  );

  return <Stack {...rest}>{cards}</Stack>;
};

interface PlainSwitchProps extends BoxProps {
  value: string;
  defaultChecked?: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
  isInvalid?: boolean;
  name?: string;
  checkboxprops?: UseCheckboxProps;
  alignMark?: "start" | "center" | "end";
  hasContent?: boolean;
}

export const PlainSwitch = (props: PlainSwitchProps) => {
  const {
    checkboxprops,
    children,
    defaultChecked,
    isDisabled,
    isRequired,
    isInvalid,
    name,
    alignMark = "center",
    hasContent = true,
    ...rest
  } = props;
  const { getInputProps, getCheckboxProps, getLabelProps, state } = useCheckbox(
    { ...checkboxprops, defaultChecked }
  );
  const id = useId(undefined, "checkbox-card");
  const { colorPref } = useContext(AppSettingContext);
  const styles = useStyleConfig("RadioCard", props);
  const borderdefault = useColorModeValue("gray.100", "gray.800");
  const borderactive = useColorModeValue(
    `${colorPref}.500`,
    `${colorPref}Dim.500`
  );
  const backgroundactive = useColorModeValue(
    `${colorPref}.50`,
    `${colorPref}Dim.800`
  );
  const disabledborderdefault = useColorModeValue("gray.100", "gray.800");
  const disabledbordermark = useColorModeValue("gray.200", "gray.800");
  const disabledbackground = useColorModeValue("gray.50", "whiteAlpha.100");
  const disabledcheckmarkactive = useColorModeValue("white", "gray.600");
  const disabledtext = useColorModeValue("gray.400", "gray.700");
  const errorcolor = useColorModeValue("red.500", "#B53F3F");

  return (
    <Box
      as="label"
      {...getLabelProps()}
      sx={{
        ".focus-visible + [data-focus]": {
          boxShadow: "outline",
          zIndex: 1,
        },
      }}
      _notFirst={{ marginInlineStart: "0px", marginTop: "0px" }}
      w="auto"
      display="flex"
      alignItems="center"
    >
      <input
        {...getInputProps()}
        aria-labelledby={id}
        width="auto"
        disabled={isDisabled}
        required={isRequired}
        name={name}
        style={{ position: "relative", display: "none" }}
      />

      {isDisabled ? (
        <Box
          sx={styles}
          {...getCheckboxProps()}
          {...rest}
          cursor="not-allowed"
          transition="all .25s"
          display="flex"
          alignItems={alignMark}
          gap={3}
          opacity=".5"
        >
          <Box w="32px" h="20px">
            <Flex
              w="32px"
              h="20px"
              p="1px"
              bg={state.isChecked ? borderactive : borderdefault}
              border="2px solid"
              borderColor={
                state.isChecked
                  ? borderactive
                  : isInvalid
                  ? errorcolor
                  : borderdefault
              }
              borderRadius="16px"
              transition="all .25s"
              justifyContent={state.isChecked ? "end" : "start"}
              alignItems="center"
            >
              <Box
                w="auto"
                h="full"
                background="white"
                borderRadius="16px"
                aspectRatio="1 / 1"
              />
            </Flex>
          </Box>
          {hasContent && <Box flex="1">{children}</Box>}
        </Box>
      ) : (
        <Box
          sx={styles}
          {...getCheckboxProps()}
          {...rest}
          cursor="pointer"
          transition="all .25s"
          display="flex"
          alignItems={alignMark}
          gap={3}
        >
          <Box w="32px" h="20px">
            <Flex
              w="32px"
              h="20px"
              p="1px"
              bg={state.isChecked ? borderactive : borderdefault}
              border="2px solid"
              borderColor={
                state.isChecked
                  ? borderactive
                  : isInvalid
                  ? errorcolor
                  : borderdefault
              }
              borderRadius="16px"
              transition="all .25s"
              justifyContent={state.isChecked ? "end" : "start"}
              alignItems="center"
            >
              <Box
                w="auto"
                h="full"
                background="white"
                borderRadius="16px"
                aspectRatio="1 / 1"
              />
            </Flex>
          </Box>
          {hasContent && <Box flex="1">{children}</Box>}
        </Box>
      )}
    </Box>
  );
};

export const PlainSwitchReverse = (props: PlainSwitchProps) => {
  const {
    checkboxprops,
    children,
    defaultChecked,
    isDisabled,
    isRequired,
    isInvalid,
    name,
    alignMark = "center",
    hasContent = true,
    ...rest
  } = props;
  const { getInputProps, getCheckboxProps, getLabelProps, state } = useCheckbox(
    { ...checkboxprops, defaultChecked }
  );
  const id = useId(undefined, "checkbox-card");
  const { colorPref } = useContext(AppSettingContext);
  const styles = useStyleConfig("RadioCard", props);
  const borderdefault = useColorModeValue("gray.100", "gray.800");
  const borderactive = useColorModeValue(
    `${colorPref}.500`,
    `${colorPref}Dim.500`
  );
  const backgroundactive = useColorModeValue(
    `${colorPref}.50`,
    `${colorPref}Dim.800`
  );
  const disabledborderdefault = useColorModeValue("gray.100", "gray.800");
  const disabledbordermark = useColorModeValue("gray.200", "gray.800");
  const disabledbackground = useColorModeValue("gray.50", "whiteAlpha.100");
  const disabledcheckmarkactive = useColorModeValue("white", "gray.600");
  const disabledtext = useColorModeValue("gray.400", "gray.700");
  const errorcolor = useColorModeValue("red.500", "#B53F3F");

  return (
    <Box
      as="label"
      {...getLabelProps()}
      sx={{
        ".focus-visible + [data-focus]": {
          boxShadow: "outline",
          zIndex: 1,
        },
      }}
      _first={{ marginInlineStart: "0px", marginTop: "0px" }}
      _notFirst={{ marginInlineStart: "0px", marginTop: "0px" }}
      w="auto"
      display="flex"
      alignItems="center"
    >
      <input
        {...getInputProps()}
        aria-labelledby={id}
        width="auto"
        disabled={isDisabled}
        required={isRequired}
        name={name}
        style={{ position: "relative", display: "none" }}
      />

      {isDisabled ? (
        <Box
          sx={styles}
          {...getCheckboxProps()}
          {...rest}
          cursor="not-allowed"
          transition="all .25s"
          display="flex"
          alignItems={alignMark}
          gap={3}
          opacity=".5"
        >
          {hasContent && <Box flex="1">{children}</Box>}
          <Box w="32px" h="20px">
            <Flex
              w="32px"
              h="20px"
              p="1px"
              bg={state.isChecked ? borderactive : borderdefault}
              border="2px solid"
              borderColor={
                state.isChecked
                  ? borderactive
                  : isInvalid
                  ? errorcolor
                  : borderdefault
              }
              borderRadius="16px"
              transition="all .25s"
              justifyContent={state.isChecked ? "end" : "start"}
              alignItems="center"
            >
              <Box
                w="auto"
                h="full"
                background="white"
                borderRadius="16px"
                aspectRatio="1 / 1"
              />
            </Flex>
          </Box>
        </Box>
      ) : (
        <Box
          sx={styles}
          {...getCheckboxProps()}
          {...rest}
          cursor="pointer"
          transition="all .25s"
          display="flex"
          alignItems={alignMark}
          gap={3}
        >
          {hasContent && <Box flex="1">{children}</Box>}
          <Box w="32px" h="20px">
            <Flex
              w="32px"
              h="20px"
              p="1px"
              bg={state.isChecked ? borderactive : borderdefault}
              border="2px solid"
              borderColor={
                state.isChecked
                  ? borderactive
                  : isInvalid
                  ? errorcolor
                  : borderdefault
              }
              borderRadius="16px"
              transition="all .25s"
              justifyContent={state.isChecked ? "end" : "start"}
              alignItems="center"
            >
              <Box
                w="auto"
                h="full"
                background="white"
                borderRadius="16px"
                aspectRatio="1 / 1"
              />
            </Flex>
          </Box>
        </Box>
      )}
    </Box>
  );
};

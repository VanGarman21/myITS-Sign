import PageTransition from "@/components/PageLayout";
import ContainerQuery from "@/components/atoms/ContainerQuery";
import {
    CheckmarkOutlineIconMade,
    CircleSolidIconMade,
} from "@/components/atoms/IconsMade";
import PageRow from "@/components/atoms/PageRow";
import { RadioCard, RadioCardGroup } from "@/components/molecules/RadioCard";
import ToastCard from "@/components/molecules/ToastCard";
import PlainCard from "@/components/organisms/Cards/Card";
import AppSettingContext from "@/providers/AppSettingProvider";
import { ColorPreference, LanguagePreference } from "@/types/app-setting";
import {
    Box,
    BoxProps,
    Divider,
    Flex,
    Grid,
    GridItem,
    HStack,
    Text,
    UseRadioProps,
    useColorMode,
    useRadio,
    useRadioGroup,
    useToast,
} from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import React, { useContext } from "react";

const Pengaturan = () => {
    const t = useTranslations("Common.modules.pengaturan");

    return (
        <>
            <PageTransition pageTitle={t("title")}>
                <PageRow>
                    <ContainerQuery>
                        <PengaturanModeTampilan />
                        <PengaturanBahasa />
                    </ContainerQuery>
                </PageRow>
            </PageTransition>
        </>
    );
};

const ToastModeTampilan = ({ onClose }: { onClose: () => void }) => {
    const t = useTranslations("Pengaturan.tampilan");
    const { colorMode } = useColorMode();

    return (
        <ToastCard
            title={t("berhasil_mengubah_mode_tampilan")}
            description={t("mode_tampilan_telah_diubah_menjadi_x", {
                x: t(`option.${colorMode}`).toLowerCase(),
            })}
            onClose={onClose}
            status="success"
            icon={<CheckmarkOutlineIconMade fontSize="24px" color="white" />}
        />
    );
};

interface RadioCardProps extends Omit<BoxProps, "onChange">, UseRadioProps {
    children: React.ReactNode;
}

const RadioBox: React.FC<RadioCardProps> = (props) => {
    const { getInputProps, getRadioProps } = useRadio(props);

    const input = getInputProps();
    const checkbox = getRadioProps();

    const { isChecked, ...rest } = props;

    return (
        <Box as="label" _notFirst={{ marginInlineStart: "unset" }} {...rest}>
            <input {...input} />
            <Box {...checkbox} cursor="pointer" transition="all .25s" {...rest}>
                {props.children}
            </Box>
        </Box>
    );
};

const PengaturanModeTampilan = () => {
    const t = useTranslations("Pengaturan.tampilan");
    const { setColorMode, colorMode } = useColorMode();
    const toast = useToast();

    const { colorPref, setColorPref } = useContext(AppSettingContext);
    const { getRootProps, getRadioProps } = useRadioGroup({
        value: colorPref,
        onChange: (newColor) => {
            setColorPref(newColor);
            localStorage.setItem("color_pref", newColor);
        },
    });
    const group = getRootProps();
    const optionsColor: ColorPreference[] = [
        "blue",
        "purple",
        "pink",
        "orange",
        "green",
        "teal",
        "cyan",
    ];

    const handleChange = (newColorMode: "light" | "dark") => {
        setColorMode(newColorMode);
        toast({
            position: "top-right",
            status: "success",
            duration: 5000,
            isClosable: true,
            render: (props) => <ToastModeTampilan onClose={props.onClose} />,
        });
    };

    return (
        <PlainCard>
            <Text fontSize="18px" fontWeight="600" mb="4px">
                {t("title")}
            </Text>
            <Text fontSize="16px" fontWeight="500" color="gray">
                {t("subtitle")}
            </Text>
            <Grid
                mt="24px"
                templateColumns={{
                    base: "repeat(1, 1fr)",
                    a: "repeat(2, 1fr)",
                }}
                gap={3}
                as={RadioCardGroup}
                value={colorMode}
                transition="all .25s"
                // @ts-expect-error
                onChange={handleChange}
            >
                <RadioCard hasMark h="100%" as={GridItem} value="light" hasBackground>
                    <Text fontSize="14px" fontWeight={600}>
                        {t("option.light")}
                    </Text>
                </RadioCard>
                <RadioCard hasMark h="100%" as={GridItem} value="dark" hasBackground>
                    <Text fontSize="14px" fontWeight={600}>
                        {t("option.dark")}
                    </Text>
                </RadioCard>
            </Grid>
            <Divider w="full" my="24px" />
            <HStack flexWrap="wrap" gap={4} {...group}>
                {optionsColor.map((value) => {
                    const radio = getRadioProps({ value });
                    return (
                        <RadioBox
                            key={value}
                            {...radio}
                            borderRadius="full"
                            bg={colorMode === "light" ? `${value}.500` : `${value}Dim.500`}
                            color="transparent"
                            position="relative"
                            w="36px"
                            h="36px"
                            _checked={{
                                boxShadow: "0px 0px 0 2px #00000034 inset",
                                color: "white",
                            }}
                        >
                            <Flex
                                justifyContent="center"
                                alignItems="center"
                                w="full"
                                h="full"
                                position="absolute"
                            >
                                <CircleSolidIconMade fontSize="12px" />
                            </Flex>
                        </RadioBox>
                    );
                })}
            </HStack>
        </PlainCard>
    );
};

const ToastBahasa = ({ onClose }: { onClose: () => void }) => {
    const t = useTranslations("Pengaturan.bahasa");
    const { langPref } = useContext(AppSettingContext);

    return (
        <ToastCard
            title={t("berhasil_mengubah_bahasa")}
            description={t("bahasa_telah_diubah_menjadi_x", {
                x: t(`language.${langPref}`),
            })}
            onClose={onClose}
            status="success"
            icon={<CheckmarkOutlineIconMade fontSize="24px" color="white" />}
        />
    );
};

const PengaturanBahasa = () => {
    const { langPref, setLangPref } = useContext(AppSettingContext);
    const t = useTranslations("Pengaturan.bahasa");
    const toast = useToast();

    const handleChangeLanguage = (newLangPref: LanguagePreference) => {
        setLangPref(newLangPref);
        localStorage.setItem("lang_pref", newLangPref);
        toast({
            position: "top-right",
            status: "success",
            duration: 5000,
            isClosable: true,
            render: (props) => <ToastBahasa onClose={props.onClose} />,
        });
    };

    return (
        <PlainCard>
            <Text fontSize="18px" fontWeight="600" mb="4px">
                {t("title")}
            </Text>
            <Text fontSize="16px" fontWeight="500" color="gray">
                {t("subtitle")}
            </Text>
            <Grid
                mt="24px"
                templateColumns={{
                    base: "repeat(1, 1fr)",
                    a: "repeat(2, 1fr)",
                    // d: "repeat(3, 1fr)",
                }}
                gap={3}
                as={RadioCardGroup}
                value={langPref}
                // @ts-expect-error
                onChange={handleChangeLanguage}
                transition="all .25s"
            >
                <RadioCard hasMark h="100%" as={GridItem} value="id" hasBackground>
                    <Text fontSize="14px" fontWeight={600}>
                        {t("language.id")}
                    </Text>
                </RadioCard>
                <RadioCard hasMark h="100%" as={GridItem} value="en" hasBackground>
                    <Text fontSize="14px" fontWeight={600}>
                        {t("language.en")}
                    </Text>
                </RadioCard>
                {/* <RadioCard hasMark h="100%" as={GridItem} value="jv" hasBackground>
          <Text fontSize="14px" fontWeight={600}>
            {t("language.jv")}
          </Text>
        </RadioCard> */}
            </Grid>
        </PlainCard>
    );
};

export default Pengaturan;
function getRootProps() {
    throw new Error("Function not implemented.");
}

import { ThemeConfig, extendTheme } from "@chakra-ui/react";
import ButtonStyles from "./Button";
import { cardTheme } from "./Card";
import Color from "./Color";
import Heading from "./Heading";
import Link from "./Link";
import Text from "./Text";
import Skeleton from "./Skeleton";
import { modalTheme } from "./Modal";
import { menuTheme } from "./Menu";
import { tooltipTheme } from "./Tooltip";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";

const config: ThemeConfig = {
  initialColorMode: "system",
  useSystemColorMode: true,
};

const breakpoints = {
  s: "474px",
  a: "639px",
  m: "767px",
  t: "1023px",
  d: "1179px",
  x: "1339px",
  w: "1419px",
};

const semanticTokens = {
  colors: {
    purple: "purple.500",
    orange: "orange.500",
    red: "red.500",
    gray: "gray.500",
    teal: "teal.500",
    yellow: "yellow.500",
    pink: "pink.500",
    blue: "blue.500",
    green: "green.500",
    cyan: "cyan.500",
  },
};

const theme = extendTheme({
  breakpoints,
  semanticTokens,
  config,
  fonts: {
    heading: "var(--font-poppins), sans-serif",
    body: "var(--font-inter), sans-serif",
  },
  styles: {
    global: {
      body: {
        bg: "gray.50",
      },
    },
  },
  components: {
    Card: cardTheme,
    Link,
    Text,
    Heading,
    ButtonStyles,
    Skeleton,
    Modal: modalTheme,
    Menu: menuTheme,
    Tooltip: tooltipTheme,
    Button: {
      defaultProps: {
        colorScheme: "blue",
      },
    },
  },
  colors: Color,
});

export default theme;

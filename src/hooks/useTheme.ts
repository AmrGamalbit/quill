import { useColorScheme } from "react-native";
import { colors } from "../constants/colors";
import { radius } from "../constants/radius";
import { spacing } from "../constants/spacings";
import { fonts, fontSizes, lineHeights } from "../constants/typography";

export default function useTheme() {
  const scheme = useColorScheme() == "dark" ? "dark" : "light";

  return {
    colors: colors[scheme],
    fonts,
    fontSizes,
    lineHeights,
    spacing,
    radius,
  };
}

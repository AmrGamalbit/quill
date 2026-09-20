const primitives = {
  // Base neutrals
  snow: "#FFFFFF",
  paper: "#F8FAF9",
  cardBg: "#FFFFFF",
  borderLight: "#E5EBE8",

  // Text
  charcoal: "#18201E",
  mutedSlate: "#62726E",

  // Brand Accents
  forest: "#1B4938",
  forestDark: "#123327",
  mintSoft: "#E8F2EC",
  wine: "#8B2635",
} as const;

export const colors = {
  light: {
    background: primitives.paper,
    surface: primitives.snow,
    card: primitives.cardBg,
    cardPressed: primitives.mintSoft,
    text: primitives.charcoal,
    textMuted: primitives.mutedSlate,
    textOnAccent: primitives.snow,
    accent: primitives.forest,
    accentPressed: primitives.forestDark,
    border: primitives.borderLight,
    shadow: primitives.charcoal,
    danger: primitives.wine,
  },
  dark: {
    background: "#111715",
    surface: "#18221F",
    card: "#1E2A27",
    cardPressed: "#253531",
    text: "#ECF2EF",
    textMuted: "#8EA39C",
    textOnAccent: "#FFFFFF",
    accent: "#4E9E80",
    accentPressed: "#3C7D65",
    border: "#283934",
    shadow: "#000000",
    danger: "#E56B7A",
  },
};

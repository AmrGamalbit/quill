const primitives = {
  snow: "#FFFFFF",
  paper: "#FDFCFE",
  cardBg: "#FFFFFF",
  borderLight: "#E0E4F5",
  borderDark: "#363C78",

  navyDark: "#252958",
  periwinkle: "#BDC2F7",
  periwinkleSoft: "#EEF0FD",
  cobalt: "#2D62A4",
  cobaltDark: "#20487B",

  mutedNavy: "#5E6692",
  mutedLavender: "#9DA5D4",

  crimson: "#D62845",
  crimsonDark: "#A81B34",
  crimsonLight: "#FF6B82",
} as const;

export const colors = {
  light: {
    background: primitives.paper,
    surface: primitives.snow,
    card: primitives.cardBg,
    cardPressed: primitives.periwinkleSoft,
    text: primitives.navyDark,
    textMuted: primitives.mutedNavy,
    textOnAccent: primitives.snow,
    accent: primitives.cobalt,
    accentPressed: primitives.cobaltDark,
    border: primitives.borderLight,
    shadow: primitives.navyDark,
    danger: primitives.crimson,
    dangerPressed: primitives.crimsonDark,
  },
  dark: {
    background: "#0E112A",
    surface: "#161A3D",
    card: primitives.navyDark,
    cardPressed: "#30356E",
    text: primitives.paper,
    textMuted: primitives.mutedLavender,
    textOnAccent: primitives.navyDark,
    accent: primitives.periwinkle,
    accentPressed: "#A4ACF2",
    border: primitives.borderDark,
    shadow: "#000000",
    danger: primitives.crimsonLight,
    dangerPressed: "#E54E67",
  },
};

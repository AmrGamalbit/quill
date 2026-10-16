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
    SegmentedControl: primitives.borderLight,
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
    SegmentedControl: primitives.borderDark,
  },
};

export const diaryColors = {
  cobalt: { light: "#2D62A4", dark: "#BDC2F7" },
  rose: { light: "#D62845", dark: "#FF6B82" },
  amber: { light: "#B7791F", dark: "#F6C453" },
  forest: { light: "#2F7D5B", dark: "#6FD3A5" },
  teal: { light: "#1F7A8C", dark: "#6CC6D6" },
  violet: { light: "#7B4FB8", dark: "#C2A3F2" },
  slate: { light: "#5E6692", dark: "#9DA5D4" },
} as const;

export type DiaryColorKey = keyof typeof diaryColors;
export const DEFAULT_DIARY_COLOR: DiaryColorKey = "cobalt";

export const resolveDiaryColor = (key: string, scheme: "light" | "dark") =>
  (diaryColors[key as DiaryColorKey] ?? diaryColors[DEFAULT_DIARY_COLOR])[
    scheme
  ];

import { Merriweather_400Regular } from "@expo-google-fonts/merriweather";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
} from "@expo-google-fonts/plus-jakarta-sans";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import migrations from "../../drizzle/migrations";
import { db } from "../db";
import useTheme from "../hooks/useTheme";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { success: isDbMigrated, error: dbMigrationError } = useMigrations(
    db,
    migrations,
  );
  const [isFontsLoaded, fontLoadingError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    Merriweather_400Regular,
  });

  useEffect(() => {
    if (fontLoadingError) {
      console.error("Fonts error:", fontLoadingError);
    }
  }, [fontLoadingError]);

  useEffect(() => {
    if (dbMigrationError) {
      console.error("Migration error:", dbMigrationError);
    }
  }, [dbMigrationError]);

  useEffect(() => {
    if (isFontsLoaded && isDbMigrated) {
      SplashScreen.hideAsync();
    }
  }, [isFontsLoaded, isDbMigrated]);

  if (!isFontsLoaded || !isDbMigrated) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const { colors } = useTheme();

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.background },
          headerShown: false,
        }}
      >
        <Stack.Screen name="(app)" />
      </Stack>
    </SafeAreaProvider>
  );
}

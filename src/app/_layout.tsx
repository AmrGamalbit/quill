import { subscribeToAuthState } from "@/src/utils/auth";
import { Merriweather_400Regular } from "@expo-google-fonts/merriweather";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
} from "@expo-google-fonts/plus-jakarta-sans";
import type { Session } from "@supabase/supabase-js";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { ActivityIndicator, useColorScheme } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import useTheme from "../hooks/useTheme";
import { initDatabase } from "../utils/db";
export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from "expo-router";
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [dbReady, setDbReady] = useState(false);
  const [loaded, error] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    Merriweather_400Regular,
  });
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const unsubscribe = subscribeToAuthState((newSession) => {
      setSession(newSession);
      setIsAuthLoading(false);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    initDatabase();
    setDbReady(true);
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;
    if (session) {
      router.replace("/(app)");
    } else {
      router.replace("/(auth)/login");
    }
  }, [session, isAuthLoading]);

  useEffect(() => {
    if (loaded && dbReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, dbReady]);

  if (!loaded) {
    return null;
  }

  if (isAuthLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator
          size="large"
          color={isDark ? "#4E9E80" : "#1B4938"}
        />
      </SafeAreaView>
    );
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
        <Stack.Screen name="(auth)" />
      </Stack>
    </SafeAreaProvider>
  );
}

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
import "react-native-get-random-values";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { UserSessionProvider, useUserSession } from "../context/UserSessionContext";
import useTheme from "../hooks/useTheme";
import { getStoredDerivedKey } from "../services/storage/secureKeyStore";
import { SupabaseStorageAdapter } from "../services/storage/SupabaseStorageAdapter";
import { getUserProfileRecord, subscribeToAuthState } from "../utils/auth";
import { decryptData, decryptUserProfile } from "../utils/crypto";
import { initDatabase } from "../utils/db";
import { downloadAndDecryptPhoto } from "../utils/photoCrypto";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <UserSessionProvider>
      <AppNavigator />
    </UserSessionProvider>
  );
}

function AppNavigator() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { colors } = useTheme();
  const { session: userSession, setSession } = useUserSession();
  const router = useRouter();

  const [dbReady, setDbReady] = useState(false);
  const [supabaseSession, setSupabaseSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [loaded, error] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    Merriweather_400Regular,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    initDatabase();
    setDbReady(true);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (newSession) => {
      setSupabaseSession(newSession);

      if (newSession && !userSession) {
        // Fast restore using the SecureStore key
        try {
          const derivedKey = await getStoredDerivedKey();
          if (derivedKey) {
            const profileRecord = await getUserProfileRecord(newSession.user.id);
            const rawPrivateKey = decryptData(
              profileRecord.encrypted_private_key,
              profileRecord.private_key_nonce,
              derivedKey
            );
            const decryptedProfile = decryptUserProfile(
              profileRecord.encrypted_profile,
              profileRecord.profile_nonce,
              derivedKey
            );

            let decryptedPhotoUri: string | null = null;
            if (decryptedProfile.photoPath && decryptedProfile.photoNonce) {
              const storage = new SupabaseStorageAdapter("avatars");
              decryptedPhotoUri = await downloadAndDecryptPhoto(
                decryptedProfile.photoPath,
                decryptedProfile.photoNonce,
                derivedKey,
                storage
              );
            }

            setSession({
              userId: newSession.user.id,
              email: newSession.user.email ?? "",
              name: decryptedProfile.name,
              photoUri: decryptedPhotoUri,
              rawPrivateKey,
              publicKeyHex: profileRecord.public_key,
            });
          }
        } catch (e) {
          console.error("Fast restore failed:", e);
        }
      }

      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;
    if (supabaseSession) {
      router.replace("/(app)");
    } else {
      router.replace("/(auth)/login");
    }
  }, [supabaseSession, isAuthLoading]);

  useEffect(() => {
    if (loaded && dbReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, dbReady]);

  if (!loaded || isAuthLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={isDark ? "#4E9E80" : "#1B4938"} />
      </SafeAreaView>
    );
  }

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
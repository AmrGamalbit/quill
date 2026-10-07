import { Merriweather_400Regular } from "@expo-google-fonts/merriweather";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
} from "@expo-google-fonts/plus-jakarta-sans";
import type { Session } from "@supabase/supabase-js";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import "expo-blob";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { ActivityIndicator, useColorScheme } from "react-native";
import "react-native-reanimated";
import migrations from "../../drizzle/migrations";
import { db, sqlite } from "../db";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from "expo-router";
// Prevent the splash screen from auto-hiding before asset loading is complete.
import "react-native-get-random-values";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  UserSessionProvider,
  useUserSession,
} from "../context/UserSessionContext";
import { getLocalProfile, saveLocalProfile } from "../db/localProfile";
import useTheme from "../hooks/useTheme";
import {
  clearDerivedKey,
  getStoredDerivedKey,
} from "../services/storage/secureKeyStore";
import { SupabaseStorageAdapter } from "../services/storage/SupabaseStorageAdapter";
import { getUserProfileRecord, subscribeToAuthState } from "../utils/auth";
import { decryptData, decryptUserProfile } from "../utils/crypto";
import {
  downloadAndDecryptPhoto,
  getValidAvatarUrl,
} from "../utils/photoCrypto";
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <UserSessionProvider>
      <AppNavigator />
    </UserSessionProvider>
  );
}

function AppNavigator() {
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { success: isDbMigrated, error: dbMigrationError } = useMigrations(
    db,
    migrations,
  );
  const [isFontsLoaded, fontLoadingError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    Merriweather_400Regular,
  });
  const { session: userSession, setSession } = useUserSession();
  const router = useRouter();

  const [supabaseSession, setSupabaseSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  let cachedPhotoUri: string | null = null;

  useEffect(() => {
    if (fontLoadingError) {
      console.error("Fonts error:", fontLoadingError);
    }
  }, [fontLoadingError]);

  useEffect(() => {
    if (isDbMigrated) {
      sqlite.execSync("PRAGMA foreign_keys = ON;");
    }
  }, [isDbMigrated]);

  useEffect(() => {
    if (dbMigrationError) {
      console.error("Migration error:", dbMigrationError);
    }
  }, [dbMigrationError]);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (newSession) => {
      setSupabaseSession(newSession);

      if (!newSession) {
        setIsAuthLoading(false);
        return;
      }

      try {
        const cached = await getLocalProfile(newSession.user.id);
        if (cached?.name) {
          cachedPhotoUri = await getValidAvatarUrl(cached.photoUri);
          setSession({
            userId: newSession.user.id,
            email: newSession.user.email ?? "",
            name: cached.name,
            photoUri: cached.photoUri ?? null,
            rawPrivateKey: null,
            publicKeyHex: cached.publicKey ?? userSession?.publicKeyHex ?? "",
          });
          // Unblock rendering immediately so the UI doesn't freeze on "Friend"
          setIsAuthLoading(false);
        }
      } catch (err) {
        console.warn("Failed reading cached local profile:", err);
        await clearDerivedKey();
      }

      // Background sync: Fetch cryptographic keys and latest cloud profile
      try {
        const derivedKey = await getStoredDerivedKey();
        if (derivedKey) {
          const profileRecord = await getUserProfileRecord(newSession.user.id);
          const rawPrivateKey = decryptData(
            profileRecord.encrypted_private_key,
            profileRecord.private_key_nonce,
            derivedKey,
          );
          const decryptedProfile = decryptUserProfile(
            profileRecord.encrypted_profile,
            profileRecord.profile_nonce,
            derivedKey,
          );

          let decryptedPhotoUri: string | null = null;
          if (decryptedProfile.photoPath && decryptedProfile.photoNonce) {
            const storage = new SupabaseStorageAdapter("avatars");
            try {
              decryptedPhotoUri = await downloadAndDecryptPhoto(
                decryptedProfile.photoPath,
                decryptedProfile.photoNonce,
                derivedKey,
                storage,
              );
            } catch (photoErr) {
              console.warn("Avatar restore failed: ", photoErr);
              decryptedPhotoUri = cachedPhotoUri;
            }
          }

          // Persist the freshly decrypted metadata to local SQLite cache
          await saveLocalProfile(
            newSession.user.id,
            decryptedProfile.name,
            decryptedPhotoUri,
            profileRecord.public_key,
          );

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
      } finally {
        setIsAuthLoading(false);
      }
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
    if (isFontsLoaded && isDbMigrated) {
      SplashScreen.hideAsync();
    }
  }, [isFontsLoaded, isDbMigrated]);

  if (!isFontsLoaded || !isDbMigrated) {
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

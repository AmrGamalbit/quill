import { Session } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import { supabase } from "./supabase";

export const redirectAuthUrl = Linking.createURL("login-callback");

export async function signIn(
  email: string,
  password: string,
): Promise<Session | null> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data.session;
}

export interface SignUpMetadata {
  publicKey: string;
  encryptedPrivateKey: string;
  privateKeyNonce: string;
  passwordSalt: string;
  encryptedProfile: string;
  profileNonce: string;
}

export async function signUp(
  email: string,
  password: string,
  metadata?: SignUpMetadata,
): Promise<{ session: Session | null }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: redirectAuthUrl,
    },
  });
  if (error) throw error;
  return { session: data.session };
}
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
export function handleAuthUrl(url: string) {
  const parsed = Linking.parse(url);
  if (parsed.path === "login-callback") {
    const params = parsed.queryParams;
    if (params?.access_token && params?.refresh_token) {
      supabase.auth.setSession({
        access_token: String(params.access_token),
        refresh_token: String(params.refresh_token),
      });
    }
  }
}
export function subscribeToAuthState(
  onSessionChange: (session: Session | null) => void,
) {
  supabase.auth.getSession().then(({ data: { session } }) => {
    onSessionChange(session);
  });
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    onSessionChange(session);
  });
  const linkingSub = Linking.addEventListener("url", (event) => {
    handleAuthUrl(event.url);
  });
  Linking.getInitialURL().then((url) => {
    if (url) handleAuthUrl(url);
  });
  return () => {
    subscription.unsubscribe();
    linkingSub.remove();
  };
}
export async function sendPasswordResetEmail(email: string): Promise<void> {
  const resetUrl = Linking.createURL("reset-password");

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: resetUrl,
  });

  if (error) throw error;
}
export interface UserProfileRecord {
  id: string;
  public_key: string;
  encrypted_private_key: string;
  private_key_nonce: string;
  password_salt: string;
  encrypted_profile: string;
  profile_nonce: string;
}
export async function getUserProfileRecord(
  userId: string,
): Promise<UserProfileRecord> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, public_key, encrypted_private_key, private_key_nonce, password_salt, encrypted_profile, profile_nonce",
    )
    .eq("id", userId)
    .single();

  if (error || !data) {
    throw error || new Error("Profile record not found in database.");
  }

  return data as UserProfileRecord;
}

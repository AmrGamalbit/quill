import { xchacha20poly1305 } from "@noble/ciphers/chacha.js";
import { x25519 } from "@noble/curves/ed25519.js";
import { scryptAsync } from "@noble/hashes/scrypt.js";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js";
import * as Crypto from "expo-crypto";
export { bytesToHex, hexToBytes };

export interface KeyPair {
  publicKeyHex: string;
  privateKeyHex: string;
  rawPrivateKey: Uint8Array;
}

export function generateUserKeyPair(): KeyPair {
  const privateKeyBytes = Crypto.getRandomValues(new Uint8Array(32));
  const publicKeyBytes = x25519.getPublicKey(privateKeyBytes);

  return {
    publicKeyHex: bytesToHex(publicKeyBytes),
    privateKeyHex: bytesToHex(privateKeyBytes),
    rawPrivateKey: privateKeyBytes,
  };
}

export async function deriveKeyFromPassword(
  password: string,
  saltBytes: Uint8Array,
): Promise<Uint8Array> {
  const passwordBytes = new TextEncoder().encode(password);

  return await scryptAsync(passwordBytes, saltBytes, {
    N: 16384,
    r: 8,
    p: 1,
    dkLen: 32,
  });
}

export function encryptData(
  plainBytes: Uint8Array,
  key32Bytes: Uint8Array,
): { cipherHex: string; nonceHex: string } {
  const nonce = Crypto.getRandomValues(new Uint8Array(24));
  const chacha = xchacha20poly1305(key32Bytes, nonce);
  const encryptedBytes = chacha.encrypt(plainBytes);

  return {
    cipherHex: bytesToHex(encryptedBytes),
    nonceHex: bytesToHex(nonce),
  };
}

export function decryptData(
  cipherHex: string,
  nonceHex: string,
  key32Bytes: Uint8Array,
): Uint8Array {
  const nonce = hexToBytes(nonceHex);
  const encryptedBytes = hexToBytes(cipherHex);
  const chacha = xchacha20poly1305(key32Bytes, nonce);
  return chacha.decrypt(encryptedBytes);
}

export function encryptUserProfile(
  profileData: {
    name: string;
    photoPath: string | null;
    photoNonce?: string | null;
  },
  derivedKey: Uint8Array,
): { encryptedProfileHex: string; profileNonceHex: string } {
  const jsonString = JSON.stringify(profileData);

  const plainBytes = new TextEncoder().encode(jsonString);

  const encrypted = encryptData(plainBytes, derivedKey);

  return {
    encryptedProfileHex: encrypted.cipherHex,
    profileNonceHex: encrypted.nonceHex,
  };
}
export interface DecryptedProfile {
  name: string;
  photoPath: string | null;
  photoNonce?: string | null;
}

export function decryptUserProfile(
  encryptedProfileHex: string,
  profileNonceHex: string,
  derivedKey: Uint8Array,
): DecryptedProfile {
  const decryptedBytes = decryptData(
    encryptedProfileHex,
    profileNonceHex,
    derivedKey,
  );
  const jsonString = new TextDecoder().decode(decryptedBytes);
  return JSON.parse(jsonString);
}

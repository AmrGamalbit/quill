import { StorageAdapter } from "@/src/services/storage/StorageAdapter";
import { decryptData, encryptData } from "@/src/utils/crypto";
import * as FileSystem from "expo-file-system/legacy";

// Helper: converts a Base64 text string into raw machine bytes (Uint8Array)
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function encryptAndUploadPhoto(
  localUri: string,
  folderId: string,
  encryptionKey: Uint8Array,
  storage: StorageAdapter,
): Promise<{ storagePath: string; photoNonceHex: string }> {
  // 1. Read the physical photo file from device storage as Base64 text
  const base64Data = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // 2. Convert Base64 text into raw binary bytes
  const rawImageBytes = base64ToUint8Array(base64Data);

  // 3. Encrypt the raw image bytes using XChaCha20-Poly1305
  const encrypted = encryptData(rawImageBytes, encryptionKey);

  // 4. Convert the scrambled hex text into bytes so storage can save it as a binary file
  const encryptedFileBytes = new TextEncoder().encode(encrypted.cipherHex);

  // 5. Upload via whichever storage adapter was passed in
  const remotePath = `${folderId}/avatar.enc`;
  await storage.uploadFile(
    remotePath,
    encryptedFileBytes,
    "application/octet-stream",
  );

  return {
    storagePath: remotePath,
    photoNonceHex: encrypted.nonceHex,
  };
}
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[1]);
  }
  return btoa(binary);
}

export async function downloadAndDecryptPhoto(
  storagePath: string,
  photoNonceHex: string,
  encryptionKey: Uint8Array,
  storage: StorageAdapter,
): Promise<string> {
  const encryptedFileBytes = await storage.downloadFile(storagePath);
  const cipherHex = new TextDecoder().decode(encryptedFileBytes);
  const decryptedImageBytes = decryptData(
    cipherHex,
    photoNonceHex,
    encryptionKey,
  );
  const decryptedBase64 = uint8ArrayToBase64(decryptedImageBytes);

  const localCachePath = `${FileSystem.cacheDirectory}avatar_${Date.now()}.jpg`;
  await FileSystem.writeAsStringAsync(localCachePath, decryptedBase64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return localCachePath;
}

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
  const base64Data = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const rawImageBytes = base64ToUint8Array(base64Data);
  const encrypted = encryptData(rawImageBytes, encryptionKey);
  const encryptedFileBytes = new TextEncoder().encode(encrypted.cipherHex);
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
    binary += String.fromCharCode(bytes[i]);
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
  await FileSystem.writeAsStringAsync(localCachePath, decryptedBase64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  await clearLocalAvatarCache(localCachePath).catch(() => {});
  return localCachePath;
}

export async function clearLocalAvatarCache(keepPath?: string): Promise<void> {
  const dir = FileSystem.cacheDirectory;
  if (!dir) return;

  const names = await FileSystem.readDirectoryAsync(dir);
  await Promise.all(
    names
      .filter((n) => n.startsWith("avatar_"))
      .map((n) => `${dir}${n}`)
      .filter((path) => path !== keepPath)
      .map((path) => FileSystem.deleteAsync(path, { idempotent: true })),
  );

  if (!keepPath) {
    await FileSystem.deleteAsync(`${dir}ImagePicker`, { idempotent: true });
  }
}

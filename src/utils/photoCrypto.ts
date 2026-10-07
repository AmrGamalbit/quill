import { StorageAdapter } from "@/src/services/storage/StorageAdapter";
import { decryptData, encryptData } from "@/src/utils/crypto";
import * as FileSystem from "expo-file-system/legacy";

const AVATAR_PREFIX = "avatar_";
const inflightDownloads = new Map<string, Promise<string>>();

export const avatarPathForNonce = (nonceHex: string) =>
  `${FileSystem.documentDirectory}${AVATAR_PREFIX}${nonceHex}.jpg`;

export async function getValidAvatarUrl(
  stored: string | null | undefined,
): Promise<string | null> {
  if (!stored || !FileSystem.documentDirectory) return null;
  const name = stored.split("/").pop();
  if (!name) return null;
  const uri = `${FileSystem.documentDirectory}${name}`;
  const info = await FileSystem.getInfoAsync(uri).catch(() => null);
  return info?.exists ? uri : null;
}

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

export function downloadAndDecryptPhoto(
  storagePath: string,
  photoNonceHex: string,
  encryptionKey: Uint8Array,
  storage: StorageAdapter,
): Promise<string> {
  const existing = inflightDownloads.get(photoNonceHex);
  if (existing) return existing;

  const p = (async () => {
    const localPath = avatarPathForNonce(photoNonceHex);
    if ((await FileSystem.getInfoAsync(localPath)).exists) return localPath;

    const encryptedFileBytes = await storage.downloadFile(storagePath);
    const cipherHex = new TextDecoder().decode(encryptedFileBytes);
    const decrypted = decryptData(cipherHex, photoNonceHex, encryptionKey);

    await FileSystem.writeAsStringAsync(
      localPath,
      uint8ArrayToBase64(decrypted),
      {
        encoding: FileSystem.EncodingType.Base64,
      },
    );
    await clearLocalAvatarCache(localPath).catch(() => {});
    return localPath;
  })().finally(() => inflightDownloads.delete(photoNonceHex));

  inflightDownloads.set(photoNonceHex, p);
  return p;
}

export async function clearLocalAvatarCache(keepPath?: string): Promise<void> {
  for (const dir of [FileSystem.documentDirectory, FileSystem.cacheDirectory]) {
    if (!dir) continue;
    const names = await FileSystem.readDirectoryAsync(dir);
    await Promise.all(
      names
        .filter((n) => n.startsWith(AVATAR_PREFIX))
        .map((n) => `${dir}${n}`)
        .filter((p) => p !== keepPath)
        .map((p) => FileSystem.deleteAsync(p, { idempotent: true })),
    );
  }
  if (!keepPath && FileSystem.cacheDirectory) {
    await FileSystem.deleteAsync(`${FileSystem.cacheDirectory}ImagePicker`, {
      idempotent: true,
    });
  }
}

export async function persistLocalAvatar(
  srcUri: string,
  nonceHex: string,
): Promise<string> {
  const dest = avatarPathForNonce(nonceHex);
  await FileSystem.copyAsync({ from: srcUri, to: dest });
  await clearLocalAvatarCache(dest).catch(() => {});
  return dest;
}

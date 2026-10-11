import { requireNativeModule } from "expo";
import { Platform } from "react-native";

interface FileGuardNative {
  secure(path: string, protect: boolean, recursive: boolean): Promise<number>;
  inspect(
    path: string,
  ): Promise<{ excludedFromBackup: boolean; protection: string }>;
}

const native =
  Platform.OS === "ios"
    ? requireNativeModule<FileGuardNative>("FileGuard")
    : null;

export interface SecureOptions {
  protect: boolean;
  recursive?: boolean;
}

export async function secure(
  path: string,
  { protect, recursive = false }: SecureOptions,
): Promise<number> {
  return native ? native.secure(path, protect, recursive) : 0;
}

export async function inspect(path: string) {
  return native ? native.inspect(path) : null;
}

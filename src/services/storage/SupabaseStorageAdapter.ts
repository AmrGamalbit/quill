import { supabase } from "@/src/utils/supabase";
import { StorageAdapter } from "./StorageAdapter";

export class SupabaseStorageAdapter implements StorageAdapter {
  private bucket: string;

  constructor(bucket: string) {
    this.bucket = bucket;
  }

  async uploadFile(
    path: string,
    bytes: Uint8Array,
    contentType: string,
  ): Promise<string> {
    // Pass the underlying ArrayBuffer slice so native iOS/Android networking layers recognize the byte stream properly
    const fileBody = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    );

    const { data, error } = await supabase.storage
      .from(this.bucket)
      .upload(path, fileBody, {
        contentType,
        upsert: true,
      });

    if (error) {
      throw error;
    }

    return data.path;
  }

  async downloadFile(path: string): Promise<Uint8Array> {
    const { data: signedData, error } = await supabase.storage
      .from(this.bucket)
      .createSignedUrl(path, 60);

    if (error || !signedData?.signedUrl) {
      throw error || new Error("Failed to generate signed download URL.");
    }

    const res = await fetch(signedData.signedUrl);
    if (!res.ok) {
      throw new Error(`Download failed with HTTP status ${res.status}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }
}

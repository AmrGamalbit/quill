import { supabase } from "@/src/utils/supabase";
import { StorageAdapter } from "./StorageAdapter";

function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error("FileReader did not return an ArrayBuffer."));
      }
    };

    reader.onerror = () => {
      reject(reader.error ?? new Error("Failed to read Blob as ArrayBuffer."));
    };

    reader.readAsArrayBuffer(blob);
  });
}

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
    // We pass the underlying ArrayBuffer slice so native iOS/Android networking layers recognize the byte stream properly
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
    const { data, error } = await supabase.storage
      .from(this.bucket)
      .download(path);

    if (error || !data) {
      throw error || new Error("Failed to download file from storage.");
    }

    // Convert the downloaded web Blob into raw binary bytes
    const arrayBuffer = await blobToArrayBuffer(data);
    return new Uint8Array(arrayBuffer);
  }
}

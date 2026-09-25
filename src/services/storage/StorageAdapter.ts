export interface StorageAdapter {
  uploadFile(
    path: string,
    bytes: Uint8Array,
    contentType: string,
  ): Promise<string>;
  downloadFile(path: string): Promise<Uint8Array>;
}

export type EncryptedStorageType = "text" | "object";

/** `v2` uses PBKDF2 + AES-CBC + HMAC (recommended for new data). `legacy` keeps the original CryptoJS format. */
export type EncryptedStorageFormat = "legacy" | "v2";

export type EncryptedStorageSetOptions = {
  storageFormat?: EncryptedStorageFormat;
};

export function Set_Encrypted_AsyncStorage(
  type: EncryptedStorageType,
  key: string,
  data: unknown,
  encryptionKey: string,
  options?: EncryptedStorageSetOptions
): Promise<boolean | undefined>;

export function Get_Encrypted_AsyncStorage(
  type: "text",
  key: string,
  encryptionKey: string
): Promise<string | null | undefined>;

export function Get_Encrypted_AsyncStorage(
  type: "object",
  key: string,
  encryptionKey: string
): Promise<unknown | null | undefined>;

export function Get_Encrypted_AsyncStorage(
  type: EncryptedStorageType,
  key: string,
  encryptionKey: string
): Promise<string | unknown | null | undefined>;

export function Remove_Encrypted_AsyncStorage(key: string): Promise<void>;

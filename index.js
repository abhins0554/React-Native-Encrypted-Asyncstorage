import AsyncStorage from "@react-native-async-storage/async-storage";
import CryptoJS from "crypto-js";

const VALID_TYPES = new Set(["text", "object"]);

/** @typedef {{ storageFormat?: "legacy" | "v2" }} EncryptedStorageSetOptions */

const V2_PREFIX = "ENC2$";
const V2_ITERATIONS = 100000;

function isValidType(type) {
  return VALID_TYPES.has(type);
}

/**
 * Timing-safe comparison for HMAC digests (same length).
 * @param {object} a
 * @param {object} b
 */
function macTimingSafeEqual(a, b) {
  const ab = CryptoJS.enc.Hex.stringify(a);
  const bb = CryptoJS.enc.Hex.stringify(b);
  if (ab.length !== bb.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < ab.length; i++) {
    diff |= ab.charCodeAt(i) ^ bb.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * @param {string} plaintext
 * @param {string} password
 */
function encryptV2Plaintext(plaintext, password) {
  const salt = CryptoJS.lib.WordArray.random(16);
  const iv = CryptoJS.lib.WordArray.random(16);
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: V2_ITERATIONS,
    hasher: CryptoJS.algo.SHA256,
  });
  const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  const ct = encrypted.ciphertext;
  // Hex-join avoids WordArray.concat quirks after iv/ct round-trip via Base64/JSON.
  const macInput = CryptoJS.enc.Hex.parse(
    CryptoJS.enc.Hex.stringify(iv) + CryptoJS.enc.Hex.stringify(ct)
  );
  const mac = CryptoJS.HmacSHA256(macInput, key);
  const payload = {
    salt: CryptoJS.enc.Base64.stringify(salt),
    iv: CryptoJS.enc.Base64.stringify(iv),
    ct: CryptoJS.enc.Base64.stringify(ct),
    mac: CryptoJS.enc.Base64.stringify(mac),
    i: V2_ITERATIONS,
  };
  const json = JSON.stringify(payload);
  return V2_PREFIX + CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(json));
}

/**
 * @param {string} stored
 * @param {string} password
 * @returns {string|null}
 */
function decryptV2ToString(stored, password) {
  if (!stored.startsWith(V2_PREFIX)) {
    return null;
  }
  let payload;
  try {
    const json = CryptoJS.enc.Base64.parse(stored.slice(V2_PREFIX.length)).toString(CryptoJS.enc.Utf8);
    payload = JSON.parse(json);
  } catch {
    return null;
  }
  const { salt, iv, ct, mac, i } = payload;
  if (typeof salt !== "string" || typeof iv !== "string" || typeof ct !== "string" || typeof mac !== "string") {
    return null;
  }
  const iterations = typeof i === "number" && i > 0 ? i : V2_ITERATIONS;
  let saltWA;
  let ivWA;
  let ctWA;
  let macExpected;
  try {
    saltWA = CryptoJS.enc.Base64.parse(salt);
    ivWA = CryptoJS.enc.Base64.parse(iv);
    ctWA = CryptoJS.enc.Base64.parse(ct);
    macExpected = CryptoJS.enc.Base64.parse(mac);
  } catch {
    return null;
  }
  const key = CryptoJS.PBKDF2(password, saltWA, {
    keySize: 256 / 32,
    iterations,
    hasher: CryptoJS.algo.SHA256,
  });
  const macInput = CryptoJS.enc.Hex.parse(
    CryptoJS.enc.Hex.stringify(ivWA) + CryptoJS.enc.Hex.stringify(ctWA)
  );
  const macComputed = CryptoJS.HmacSHA256(macInput, key);
  if (!macTimingSafeEqual(macComputed, macExpected)) {
    return null;
  }
  const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext: ctWA });
  const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
    iv: ivWA,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}

/**
 * @param {string} data
 * @param {string} encKey
 */
function decryptStoredToUtf8(data, encKey) {
  if (data.startsWith(V2_PREFIX)) {
    return decryptV2ToString(data, encKey);
  }
  const bytes = CryptoJS.AES.decrypt(data, encKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * @param {"text"|"object"} type
 * @param {string} key
 * @param {unknown} data
 * @param {string} encryptionKey
 * @param {EncryptedStorageSetOptions} [options]
 * @returns {Promise<boolean|undefined>}
 */
export const Set_Encrypted_AsyncStorage = async (type, key, data, encryptionKey, options) => {
  if (!isValidType(type)) {
    return undefined;
  }
  const keyStr = key.toString();
  const encKey = String(encryptionKey);
  const format = options?.storageFormat === "v2" ? "v2" : "legacy";

  if (format === "v2") {
    const plaintext = type === "text" ? data.toString() : JSON.stringify(data);
    const encryptedData = encryptV2Plaintext(plaintext, encKey);
    await AsyncStorage.setItem(keyStr, encryptedData);
    return true;
  }

  if (type === "text") {
    const encryptedData = CryptoJS.AES.encrypt(data.toString(), encKey).toString();
    await AsyncStorage.setItem(keyStr, encryptedData);
    return true;
  }

  const DATA = JSON.stringify(data);
  const encryptedData = CryptoJS.AES.encrypt(DATA.toString(), encKey).toString();
  await AsyncStorage.setItem(keyStr, encryptedData);
  return true;
};

/**
 * @param {"text"|"object"} type
 * @param {string} key
 * @param {string} encryptionKey
 * @returns {Promise<string|unknown|null|undefined>}
 */
export const Get_Encrypted_AsyncStorage = async (type, key, encryptionKey) => {
  if (!isValidType(type)) {
    return undefined;
  }
  const keyStr = key.toString();
  const encKey = String(encryptionKey);
  const data = await AsyncStorage.getItem(keyStr);

  if (data === null) {
    return null;
  }

  const unencryptData = decryptStoredToUtf8(data, encKey);

  if (type === "text") {
    return unencryptData;
  }

  try {
    return JSON.parse(unencryptData);
  } catch {
    return null;
  }
};

/**
 * Removes the encrypted value for `key` (same as AsyncStorage.removeItem).
 * @param {string} key
 * @returns {Promise<void>}
 */
export const Remove_Encrypted_AsyncStorage = async (key) => {
  await AsyncStorage.removeItem(key.toString());
};

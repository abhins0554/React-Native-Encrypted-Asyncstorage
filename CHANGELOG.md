# Changelog

## 2.4.0

- README refresh: centered layout, npm/GitHub badges (version, weekly downloads, stars, forks, last commit, CI), quick navigation, and a dedicated **Backward compatibility** section.

## 2.3.0

- **Security**: Optional **`storageFormat: "v2"`** on `Set_Encrypted_AsyncStorage` — PBKDF2-SHA256 (100k iterations), AES-256-CBC, HMAC-SHA256 integrity check. Reads auto-detect `ENC2$` payloads; legacy default unchanged.
- Replaced **`react-native-crypto-js`** with **`crypto-js`** so PBKDF2/HMAC are available (the old bundle omitted them).
- MAC is computed over **hex-encoded IV + ciphertext** to avoid `WordArray.concat` inconsistencies after Base64 round-trips.

## 2.2.0

- Documented actual behavior: JavaScript AES on top of AsyncStorage (README aligned with implementation).
- Added TypeScript declarations (`index.d.ts`).
- Added `Remove_Encrypted_AsyncStorage(key)` wrapper around `AsyncStorage.removeItem`.
- `Get_Encrypted_AsyncStorage` with `type === "object"` now returns `null` instead of throwing when decrypted bytes are not valid JSON (for example wrong key or corrupt data).
- Declared `peerDependencies` for `react-native` and `@react-native-async-storage/async-storage`; kept Async Storage as a **dependency** for backward-compatible installs.
- Added `exports` and `files` in `package.json` for cleaner publishing.
- Added Jest tests and GitHub Actions CI.

**Backward compatibility (valid usage)**

- `Set_Encrypted_AsyncStorage("text" | "object", ...)` still resolves to `true` on success.
- `Get_Encrypted_AsyncStorage` for missing keys still returns `null`.
- Invalid `type` still yields `undefined` from both set and get (unchanged from 2.1.x).

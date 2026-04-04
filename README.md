<div align="center">

# React Native Encrypted AsyncStorage

**AES-encrypted values on top of [Async Storage](https://github.com/react-native-async-storage/async-storage)** — pure JavaScript ([crypto-js](https://www.npmjs.com/package/crypto-js)), no native modules.

[![npm version](https://img.shields.io/npm/v/react-native-encrypted-asyncstorage?style=flat-square&logo=npm&label=version)](https://www.npmjs.com/package/react-native-encrypted-asyncstorage)
[![npm downloads](https://img.shields.io/npm/dw/react-native-encrypted-asyncstorage?style=flat-square&logo=npm&label=npm%2Fweek)](https://www.npmjs.com/package/react-native-encrypted-asyncstorage)
[![License](https://img.shields.io/npm/l/react-native-encrypted-asyncstorage?style=flat-square&label=license)](https://github.com/abhins0554/React-Native-Encrypted-Asyncstorage/blob/HEAD/LICENSE)

[![GitHub stars](https://img.shields.io/github/stars/abhins0554/React-Native-Encrypted-Asyncstorage?style=flat-square&logo=github&label=stars)](https://github.com/abhins0554/React-Native-Encrypted-Asyncstorage/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/abhins0554/React-Native-Encrypted-Asyncstorage?style=flat-square&logo=github&label=forks)](https://github.com/abhins0554/React-Native-Encrypted-Asyncstorage/network/members)
[![Last commit](https://img.shields.io/github/last-commit/abhins0554/React-Native-Encrypted-Asyncstorage?style=flat-square&logo=github&label=last%20commit)](https://github.com/abhins0554/React-Native-Encrypted-Asyncstorage/commits)
[![CI](https://github.com/abhins0554/React-Native-Encrypted-Asyncstorage/actions/workflows/ci.yml/badge.svg)](https://github.com/abhins0554/React-Native-Encrypted-Asyncstorage/actions/workflows/ci.yml)

[Installation](#installation) · [Usage](#usage) · [Backward compatibility](#backward-compatibility) · [Security](#security) · [API](#api-summary)

</div>

---

## Overview

This package wraps **AsyncStorage** so values are stored as **ciphertext** instead of plain text. Use it when you want a lightweight JS layer (for example tokens or prefs) and you already manage a passphrase or key in your app.

| | |
|---|---|
| **Stack** | `crypto-js` (AES, optional PBKDF2 + HMAC v2) + `@react-native-async-storage/async-storage` |
| **RN** | 0.60+ (autolinking) |
| **Types** | Published in `index.d.ts` |

---

## Backward compatibility

Releases keep **existing apps working** without code changes:

| Topic | Behavior |
|--------|----------|
| **Default writes** | `Set_Encrypted_AsyncStorage` uses **`storageFormat: "legacy"`** when you omit options — same CryptoJS password-AES format as earlier versions. |
| **Existing data** | Values **not** starting with the `ENC2$` prefix keep using the **legacy** decrypt path. |
| **Reads** | `Get_Encrypted_AsyncStorage` **auto-detects** `v2` vs legacy; call signature is unchanged (no extra arguments). |
| **Optional v2** | Pass `{ storageFormat: "v2" }` only when you **choose** stronger PBKDF2 + HMAC for **new** writes (or after migrating keys). |
| **Invalid `type`** | Still returns `undefined` from set/get (same as older releases). |

Upgrading the package does **not** require rewriting `Get_*` calls. Opt in to `v2` per key when you are ready.

---

## When to use

- You want **opaque blobs** in AsyncStorage instead of plaintext for casual device access or backups.
- You already supply or derive an **encryption passphrase / key** in your app.

## When not to use

- You need **OS-backed** secret storage (Keychain / Keystore) for keys — consider [`react-native-keychain`](https://github.com/oblador/react-native-keychain) or similar.
- You need **hardware-only** or audited native crypto — this library runs in JavaScript.

---

## Security

- **Crypto** uses [`crypto-js`](https://www.npmjs.com/package/crypto-js) (AES, PBKDF2, HMAC-SHA256).
- **Legacy (default)** — CryptoJS password-based AES (OpenSSL-style). No integrity tag; wrong keys may yield garbage strings for `"text"`.
- **Optional `storageFormat: "v2"`** — PBKDF2-SHA256 (100k iterations), AES-256-CBC, HMAC-SHA256 over IV + ciphertext. Reads auto-detect via `ENC2$` prefix.
- **Your key** — protect `encryptionKey`; prefer deriving or loading secrets securely in production.

---

## Requirements

- React Native **0.60+**
- `@react-native-async-storage/async-storage` **≥ 1.17** (see `peerDependencies` in `package.json`)

---

## Installation

```bash
npm install react-native-encrypted-asyncstorage
```

```bash
yarn add react-native-encrypted-asyncstorage
```

No native code in this package. If Async Storage is new to your app, follow its [install steps](https://react-native-async-storage.github.io/async-storage/docs/install/) (including iOS Pods when needed).

---

## Usage

### Import

```js
import {
  Set_Encrypted_AsyncStorage,
  Get_Encrypted_AsyncStorage,
  Remove_Encrypted_AsyncStorage,
} from "react-native-encrypted-asyncstorage";
```

### Store

`type` is `"text"` or `"object"`. Objects are `JSON.stringify`’d before encryption.

```js
const encryptionKey = "your-secret"; // derive or load securely in real apps

await Set_Encrypted_AsyncStorage("text", "user_token", tokenString, encryptionKey);
await Set_Encrypted_AsyncStorage("object", "prefs", { theme: "dark" }, encryptionKey);

// Stronger format (PBKDF2 + HMAC); reads auto-detect — same Get_* calls as before.
await Set_Encrypted_AsyncStorage("text", "user_token", tokenString, encryptionKey, {
  storageFormat: "v2",
});
```

Optional fifth argument: `{ storageFormat: "legacy" }` (default) or `{ storageFormat: "v2" }`.

Returns `true` on success, or `undefined` if `type` is not `"text"` or `"object"`.

### Read

```js
const token = await Get_Encrypted_AsyncStorage("text", "user_token", encryptionKey);
const prefs = await Get_Encrypted_AsyncStorage("object", "prefs", encryptionKey);
```

Returns `null` if nothing is stored for the key. For `"object"`, returns `null` if decryption / JSON parsing fails (including wrong key for `v2`).

### Remove

```js
await Remove_Encrypted_AsyncStorage("user_token");
```

Same as `AsyncStorage.removeItem(key)`. Use `AsyncStorage.clear()` from Async Storage only if clearing **everything** is intended.

---

## TypeScript

Types are in `index.d.ts`: `EncryptedStorageType`, `EncryptedStorageSetOptions`, and overloads for `Get_Encrypted_AsyncStorage`.

---

## API summary

| Function | Purpose |
|----------|---------|
| `Set_Encrypted_AsyncStorage(type, key, data, encryptionKey, options?)` | Encrypt and store (`storageFormat`: `legacy` \| `v2`) |
| `Get_Encrypted_AsyncStorage(type, key, encryptionKey)` | Read and decrypt (detects `v2` automatically) |
| `Remove_Encrypted_AsyncStorage(key)` | Remove one key |

---

## License

MIT — see [`LICENSE`](LICENSE).

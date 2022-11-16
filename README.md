**TAGS**
**React Native**
**Android**
**iOS**
**Encrypted**
**Encrypted Storage**
**Asyncstorage**

# React Native Encrypted AsyncStorage

React Native wrapper around SharedPreferences and Keychain to provide a secure alternative to [Async Storage](https://github.com/react-native-community/async-storage).

## Why ?

[Async Storage](https://github.com/react-native-community/async-storage) is great but it lacks security. This is less than ideal when storing sensitive data such as access tokens, payment information and so on. This module aims to solve this problem by providing a wrapper around Android's `EncryptedSharedPreferences` and iOS' `Keychain`, complete with support for TypeScript.

## Version Requirements

- Android API 21+ (5.0)
- iOS 2.0

## Installation

### Via `yarn`

```bash
$ yarn add react-native-encrypted-asyncstorage
```

### Via `npm`

```bash
$ npm install react-native-encrypted-asyncstorage
```

## Linking

- React Native 0.60+

Since version 0.60, React Native supports auto linking. This means no additional step is needed on your end.

- React Native <= 0.59

```bash
$ react-native link react-native-encrypted-asyncstorage
```

Special note for iOS using `cocoapods`, run:

```bash
$ npx pod-install
```

## Usage

This module exposes four (4) native functions to store, retrieve, remove and clear values. They can be used like so:

### Import

```js
import {
  Set_Encrypted_AsyncStorage,
  Get_Encrypted_AsyncStorage,
} from "react-native-encrypted-asyncstorage";
```

### Storing a value

```js
// type either "text" or "object"
// key like email or key for relating data
// data either text or object based on type
// encryptionKey key for encryption or decryption process

async function storeUserSession() {
  try {
    await Set_Encrypted_AsyncStorage(type, key, data, encryptionKey);

    // Congrats! You've just stored your first value!
  } catch (error) {
    // There was an error on the native side
  }
}
```

### Retrieving a value

```js
// type either "text" or "object"
// key like email or key for relating data
// encryptionKey key for encryption or decryption process

async function storeUserSession() {
  await Get_Encrypted_AsyncStorage(type, key, encryptionKey).then(
    (response) => {
      // console.log(response)
      // getting data on response
    }
  );
}
```

### Removing a value

```js
import AsyncStorage from "@react-native-async-storage/async-storage";

// defaut remove method

removeValue = async () => {
  try {
    await AsyncStorage.removeItem("@MyApp_key");
  } catch (e) {
    // remove error
  }

  console.log("Done.");
};
```

Removes item for a key, invokes (optional) callback once completed.

import AsyncStorage from "@react-native-async-storage/async-storage";
import CryptoJS from "react-native-crypto-js"

export const Set_Encrypted_AsyncStorage = async (type, key, data, encryptionKey) => {
    if (type === "text") {
        let encryptedData = CryptoJS.AES.encrypt(data.toString(), String(encryptionKey)).toString();
        await AsyncStorage.setItem(key.toString(), encryptedData);
        return true;
    }
    else if (type === "object") {
        let DATA = JSON.stringify(data);
        let encryptedData = CryptoJS.AES.encrypt(DATA.toString(), String(encryptionKey)).toString();
        await AsyncStorage.setItem(key.toString(), encryptedData);
        return true;
    }
}

export const Get_Encrypted_AsyncStorage = async (type, key, encryptionKey) => {
    if (type === "text") {
        let data = await AsyncStorage.getItem(key.toString());
        if (data === null) {
            return null;
        }
        else {
            let bytes = CryptoJS.AES.decrypt(data, String(encryptionKey));
            let unencryptData = bytes.toString(CryptoJS.enc.Utf8);
            return unencryptData;
        }
    }
    else if (type === "object") {
        let data = await AsyncStorage.getItem(key.toString());
        if (data === null) {
            return null;
        }
        else {
            let JSONData = JSON.parse(data);
            let bytes = CryptoJS.AES.decrypt(JSONData, String(encryptionKey));
            let unencryptData = bytes.toString(CryptoJS.enc.Utf8);
            return unencryptData;
        }
    }
}
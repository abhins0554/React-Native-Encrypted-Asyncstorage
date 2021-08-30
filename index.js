import AsyncStorage from "@react-native-async-storage/async-storage";
import CryptoJS from "react-native-crypto-js"

export const Set_Encrypted_AsyncStorage = async (type, key, data) => {
    if (type === "text") {
        let encryptedData = CryptoJS.AES.encrypt(data.toString(), 'pchat pcoders').toString();
        await AsyncStorage.setItem(key.toString(), encryptedData);
        return true;
    }
    else if (type === "object") {
        let DATA = JSON.stringify(data);
        let encryptedData = CryptoJS.AES.encrypt(DATA.toString(), 'pchat pcoders').toString();
        await AsyncStorage.setItem(key.toString(), encryptedData);
        return true;
    }
}

export const Get_Encrypted_AsyncStorage = async (type, key) => {
    if (type === "text") {
        let data = await AsyncStorage.getItem(key.toString());
        if (data === null) {
            return null;
        }
        else {
            let bytes = CryptoJS.AES.decrypt(data, 'pchat pcoders');
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
            let bytes = CryptoJS.AES.decrypt(JSONData, 'pchat pcoders');
            let unencryptData = bytes.toString(CryptoJS.enc.Utf8);
            return unencryptData;
        }
    }
}
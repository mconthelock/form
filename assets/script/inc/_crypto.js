import CryptoJS from 'crypto-js';
export function encryptText(text, secretKey) {
    return CryptoJS.AES.encrypt(text, secretKey).toString();
}

export function decryptText(text, secretKey) {
    const decryptedBytes = CryptoJS.AES.decrypt(text, secretKey);
    return decryptedBytes.toString(CryptoJS.enc.Utf8);
}


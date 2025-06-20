
/**
 * Crypto js
 * @module _crypto
 * @author Mr.Sutthipong Tangmongkhoncharoen(24008)
 * @since  2025-06-02
 * @requires crypto-js : npm install crypto-js
 * @version 1.0.1
 */
import CryptoJS from 'crypto-js';

/**
 * @description: Encrypts and decrypts text using AES encryption.
 * @param {string} text - The text to encrypt or decrypt.
 * @param {string} secretKey - The key used for encryption and decryption.
 * @returns {string} - The encrypted or decrypted text.
 */
export function encryptText(text, secretKey) {
    return CryptoJS.AES.encrypt(text, secretKey).toString();
}

/**
 * @description: Decrypts text using AES encryption.
 * @param {string} text - The text to decrypt.
 * @param {string} secretKey - The key used for decryption.
 * @returns {string} - The decrypted text.
 */
export function decryptText(text, secretKey) {
    const decryptedBytes = CryptoJS.AES.decrypt(text, secretKey);
    return decryptedBytes.toString(CryptoJS.enc.Utf8);
}


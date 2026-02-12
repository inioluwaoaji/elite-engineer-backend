const CryptoJS = require('crypto-js');
require('dotenv').config();

// Encryption key - add this to your .env file
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secret-encryption-key-change-this';

// Encrypt sensitive data
function encrypt(text) {
  if (!text) return null;
  const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
  return encrypted;
}

// Decrypt sensitive data
function decrypt(encryptedText) {
  if (!encryptedText) return null;
  const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return decrypted;
}

module.exports = { encrypt, decrypt };
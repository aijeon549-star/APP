// Helper functions to convert between ArrayBuffer and Base64
function bufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

const ALGORITHM = 'AES-GCM';
const KEY_NAME = 'crypto-key';
const ENCRYPTED_API_KEY_NAME = 'encrypted-api-key';
const IV_NAME = 'encryption-iv';

// Get the encryption key from localStorage, or generate a new one if it doesn't exist.
async function getEncryptionKey(): Promise<CryptoKey> {
  const storedKey = localStorage.getItem(KEY_NAME);
  if (storedKey) {
    const jwk = JSON.parse(storedKey);
    return await crypto.subtle.importKey('jwk', jwk, ALGORITHM, true, ['encrypt', 'decrypt']);
  }
  
  const newKey = await crypto.subtle.generateKey({ name: ALGORITHM, length: 256 }, true, ['encrypt', 'decrypt']);
  const jwk = await crypto.subtle.exportKey('jwk', newKey);
  localStorage.setItem(KEY_NAME, JSON.stringify(jwk));
  return newKey;
}

// Encrypt the API key and save it to localStorage.
export async function saveApiKey(apiKey: string): Promise<void> {
  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // Generate a new IV for each encryption
  const encodedApiKey = new TextEncoder().encode(apiKey);

  const encryptedData = await crypto.subtle.encrypt({ name: ALGORITHM, iv }, key, encodedApiKey);

  localStorage.setItem(ENCRYPTED_API_KEY_NAME, bufferToBase64(encryptedData));
  localStorage.setItem(IV_NAME, bufferToBase64(iv));
}

// Retrieve and decrypt the API key from localStorage.
export async function getApiKey(): Promise<string | null> {
  const encryptedKeyB64 = localStorage.getItem(ENCRYPTED_API_KEY_NAME);
  const ivB64 = localStorage.getItem(IV_NAME);

  if (!encryptedKeyB64 || !ivB64) {
    return null;
  }

  try {
    const key = await getEncryptionKey();
    const encryptedKey = base64ToBuffer(encryptedKeyB64);
    const iv = base64ToBuffer(ivB64);

    const decryptedData = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, encryptedKey);
    return new TextDecoder().decode(decryptedData);
  } catch (error) {
    console.error('API 키 복호화 실패:', error);
    // If decryption fails, clear the stale data
    localStorage.removeItem(ENCRYPTED_API_KEY_NAME);
    localStorage.removeItem(IV_NAME);
    return null;
  }
}

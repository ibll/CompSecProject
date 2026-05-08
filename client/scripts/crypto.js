let active_key = null;
let key_ver = 0;
let target_key_ver = 0;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Base64

function ArrBuffToB64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function b64ToArrBuff(base64) {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

// Crypto Functions

let crypto_API = {}

crypto_API.setup = async function(password, salt_str = "random_salt_asdkljfa;lskjf") {
    key_ver = 0;

    if (!password) {
        active_key = null;
        return;
    }

    const key_material = await window.crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    );

    // Derive the actual AES-CBC 256-bit key using PBKDF2
    active_key = await window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: encoder.encode(salt_str),
            iterations: 100000,
            hash: "SHA-256"
        },
        key_material,
        { name: "AES-CBC", length: 256 },
        true, // Must be true so we can extract it for the ratchet later
        ["encrypt", "decrypt"]
    );

    crypto_API.sync_ver(target_key_ver);
}

crypto_API.encrypt = async function(plaintext) {
    if (!active_key) {
        console.error("Key not established.");
        return;
    }

    const iv = window.crypto.getRandomValues(new Uint8Array(16));
    const encoded_text = encoder.encode(plaintext);
    const ciphertext_buffer = await window.crypto.subtle.encrypt(
        {name: "AES-CBC", iv},
        active_key,
        encoded_text
    );

    return {
        iv: ArrBuffToB64(iv.buffer),
        ciphertext: ArrBuffToB64(ciphertext_buffer)
    }
}

crypto_API.decrypt = async function(iv_b64, ciphertext_b64) {
    if (!active_key) {
        console.error("Key not established.");
        return;
    }

    const ciphertext = b64ToArrBuff(ciphertext_b64);
    const iv = b64ToArrBuff(iv_b64);

    try {
        const decrypted_buff = await window.crypto.subtle.decrypt(
            {name: "AES-CBC", iv},
            active_key,
            ciphertext
        );

        return decoder.decode(decrypted_buff);
    } catch (e) {
        console.error("Decryption failed");
        return;
    }
}

crypto_API.rotate_key = async function() {
    if (!active_key) {
        console.error("Key not established.");
        return;
    }

    const raw_key = await window.crypto.subtle.exportKey("raw", active_key);
    const hashed_key = await window.crypto.subtle.digest("SHA-256", raw_key);
    active_key = await window.crypto.subtle.importKey(
        "raw",
        hashed_key,
        {name: "AES-CBC", length: 256},
        true,
        ["encrypt", "decrypt"]
    );

    key_ver++;
}

crypto_API.sync_ver = async function(target_ver) {
    target_key_ver = target_ver;

    if (!active_key) return;

    while (key_ver < target_key_ver) {
        await crypto_API.rotate_key();
    }

    console.log(`Key moved to version ${key_ver}`);
}

crypto_API.get_key_ver = function() {
    return key_ver;
}

crypto_API.ready = function() {
    return active_key !== null;
}

export default crypto_API;
if (window) window.cryptography = crypto_API;

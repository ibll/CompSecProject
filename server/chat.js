import client from './events/outgoing.js';

export function sendPlaintext(_ws, name, content) {
    console.log(`${name}: ${content}`);
    client.broadcastPlaintext(name, content);
}

export function sendCiphertext(_ws, name, iv, ciphertext, version, fingerprint) {
    console.log(`${name}: ${iv}, ${iv, version, fingerprint, ciphertext}`);
    client.broadcastCiphertext(name, iv, ciphertext, version, fingerprint);
}

export function sendNotification(ws, content) {
    client.broadcastNotification(content)
}

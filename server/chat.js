import client from './events/outgoing.js';

export function sendPlaintext(_ws, name, content) {
    client.broadcastPlaintext(name, content);
}

export function sendCiphertext(_ws, name, iv, ciphertext, version) {
    client.broadcastCiphertext(name, iv, ciphertext, version);
}

export function sendNotification(ws, content) {
    client.broadcastNotification(content)
}

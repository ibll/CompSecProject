import client from './events/outgoing.js';

export function sendPlaintext(ws, name, content) {
    console.log(`${name}: ${content}`);
    client.broadcastPlaintext(name, content);
}

export function sendNotification(ws, content) {
    client.broadcastNotification(content)
}

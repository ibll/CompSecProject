import {connectedClients} from '../wss.js';
const client_API = {};

function sendToClient(ws, message) {
    ws.send(JSON.stringify(message));
}

function sendToAll(message) {
    connectedClients.forEach(ws => {
        sendToClient(ws, message)
    });
}

client_API.sendPlaintext = function (ws, name, content) {
    sendToClient(ws, { type: "receive_plaintext", name, content });
}

client_API.sendCiphertext = function (ws, name, iv, ciphertext, version, fingerprint) {
    sendToClient(ws, { type: "receive_ciphertext", name, iv, ciphertext, version, fingerprint });
}

client_API.sendNotification = function (ws, content) {
    sendToClient(ws, { type: "notification", content });
}

client_API.broadcastPlaintext = function (name, content) {
    sendToAll({ type: "receive_plaintext", name, content });
}

client_API.broadcastCiphertext = function (name, iv, ciphertext, version, fingerprint) {
    sendToAll({ type: "receive_ciphertext", name, iv, ciphertext, version, fingerprint });
}

client_API.broadcastNotification = function (content) {
    sendToAll({ type: "notification", content });
}

client_API.prepareClient = function (ws, client_events, client_events_path) {
    sendToClient(ws, { type: "prepare_client", client_events, client_events_path });
}


export default client_API;

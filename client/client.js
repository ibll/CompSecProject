import server from './events/outgoing.js';
import chat from './scripts/chat.js';
import crypto from './scripts/crypto.js';
import toast from './scripts/toast.js';

// Server Connection

const host = window.location.hostname;
const port = window.location.port;

let client_events = [];
let client_events_path = '';

export let ws;
export let prepared = false;
let ws_opened = false;
let attempts = 0;
let interval;


document.addEventListener("DOMContentLoaded", function () {
    connect();
    interval = setInterval(tryConnect, 1000);
});

// Websocket

function connect() {
    if (location.protocol === 'https:') ws = new WebSocket(`wss://${host}:${port}`);
    else if (location.protocol === 'http:') ws = new WebSocket(`ws://${host}:${port}`);

    ws.onopen = () => {
        if (attempts > 0)
            toast.display("Connected to server!", null, 'happy');

        const now = new Date();
        const iso_time = now.toISOString();
        chat.appendNotification(`Connected at ${iso_time}`);

        ws_opened = true;
    }
    ws.onclose = () => {
        ws_opened = false;
        prepared = false;
    }

    ws.onmessage = async (event) => {
        let payload = {};
        try {
            payload = JSON.parse(event.data);
        } catch {
            console.error('Invalid JSON:', event.data);
        }

        if (payload.type === 'prepare_client') {
            client_events = payload.client_events;
            client_events_path = payload.client_events_path;

            const urlParams = new URLSearchParams(window.location.search);
            let game_id = urlParams.get('room')
            if (game_id) server.join(game_id, true);

            prepared = true;
            server.process_message_queue();

            return
        }

        if (!client_events.includes(payload.type)) return;

        import(`${client_events_path}/${payload.type}.js`).then((event) => {
            event.default(ws, payload)
        });
    };
}

function tryConnect() {
    if (!ws || ws.readyState === WebSocket.CLOSED) {
        console.log(attempts);
        if (attempts >= 10) {
            clearInterval(interval);
            interval = setInterval(tryConnect, 10000);
        }
        attempts++;

        if (attempts == 1) {
            chat.appendNotification("Disconnected...");
            toast.display("Trying to reconnect to server...", Infinity, 'dead');
        }

        connect();

    } else if (attempts > 0) {
        attempts = 0;
        clearInterval(interval);
        interval = setInterval(tryConnect, 1000);
    }
}

// Elements

const name_input = document.getElementById('name');
const password_input = document.getElementById('encryption');
const textbox_input = document.getElementById('textbox');
const send_button = document.getElementById('send');

// Buttons

textbox_input.addEventListener("keydown", (event) => {
    if (event.key === 'Enter') send_button.click();
});

password_input.addEventListener("change", async () => {
    const password = password_input.value;

    await crypto.setup(password);
    chat.appendNotification("Password Set")
});

send_button.addEventListener("click", async () => {
    const name = name_input.value || "Anonymous";
    const password = password_input.value;
    const message = textbox_input.value;
    if (!message) return;


    if (!password) {
        // Plaintext Message

        server.sendPlaintext(name, message);
        textbox_input.value = "";
        return;
    }

    // Ciphertext Message

    if (!crypto.ready()) {
        await crypto.setup(password);
        chat.appendNotification("Password Set")
    }

    try {
        if (Math.random() < 0.2) {
            await crypto.rotate_key();
            chat.appendNotification(`Rotated key to version ${crypto.get_key_ver()}`);
        }

        const {iv, ciphertext} = await crypto.encrypt(message);
        const version = crypto.get_key_ver();

        textbox_input.value = "";
        server.sendCiphertext(name, iv, ciphertext, version);
    } catch (e) {
        console.error("Failed to encrypt!", e);
    }
});

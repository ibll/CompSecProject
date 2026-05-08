import server from './events/outgoing.js';
import toast from './scripts/toast.js'
import chat from './scripts/chat.js'

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
const encryption_input = document.getElementById('encryption');
const textbox_input = document.getElementById('textbox');
const send_button = document.getElementById('send');

// Set top text

// Buttons

textbox_input.addEventListener("keydown", (event) => {
    if (event.key === 'Enter') send_button.click();
});

send_button.addEventListener("click", () => {
    const name_content = name_input.value;
    const encryption_content = encryption_input.value;
    const message_content = textbox_input.value;
    if (!message_content) return;

    textbox_input.value = ""

    server.sendPlaintext(name_content ? name_content : "Anonymous", message_content)
});

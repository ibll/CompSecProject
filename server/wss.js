import fs from "fs";
import path from "path";
import { WebSocketServer } from "ws";
import clients from "./events/outgoing.js";

const __dirname = import.meta.dirname;

const CLIENT_EVENTS_DIR = './events/incoming';
const SERVER_EVENTS_DIR = './events/incoming';
const ABSOLUTE_CLIENT_EVENTS_DIR = path.join(__dirname, '../client/', CLIENT_EVENTS_DIR);
const CLIENT_EVENTS = fetchEventsIn(ABSOLUTE_CLIENT_EVENTS_DIR);

export const connectedClients = new Set();

export function createWSS(server) {
    const wss = new WebSocketServer({ server });
    wss.on('connection', wssConnection);
    return wss;
}

async function wssConnection(ws, response) {
    connectedClients.add(ws);
    clients.prepareClient(ws, CLIENT_EVENTS, CLIENT_EVENTS_DIR);

    // Add event listeners for the connection

    ws.on('message', async (data) => {
        try {
            let payload = JSON.parse(data)
            if (!payload.type) return;

            console.log(payload);

            const filePath = path.join(__dirname, SERVER_EVENTS_DIR, payload.type + '.js');
            fs.readFile(filePath, (err) => {
                if (err) return console.error(`Message type '${payload.type}' not found`);
                import(filePath)
                    .then(module => module.default(ws, payload))
                    .catch(err => console.error(err));
            });
        } catch {
            console.error(`Couldn't parse message:\n${data}`);
        }
    });

    ws.on('close', () => {
        connectedClients.delete(ws);
    });
}

function fetchEventsIn(dir) {
    return fs.readdirSync(dir).filter(file => file.endsWith('.js')).map(file => file.slice(0, -3));
}

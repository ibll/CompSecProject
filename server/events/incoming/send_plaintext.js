import { sendPlaintext } from '../../chat.js'

export default async (ws, payload) => {
    const name = payload.name;
    const content = payload.content;

    sendPlaintext(ws, name, content);
}

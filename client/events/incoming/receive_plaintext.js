import chat from "../../scripts/chat.js";

export default async (ws, payload) => {
    const name = payload.name;
    const content = payload.content;

	chat.appendMessage(name, null, content);
}

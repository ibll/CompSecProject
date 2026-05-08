import chat from "../../scripts/chat.js";

export default async (ws, payload) => {
    const content = payload.content;

	chat.appendNotification(content);
}

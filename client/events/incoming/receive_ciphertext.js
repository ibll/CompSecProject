import crypto from "../../scripts/crypto.js"
import chat from "../../scripts/chat.js";

export default async (ws, payload) => {
    const name = payload.name;
    const iv = payload.iv;
    const ciphertext = payload.ciphertext;
    const version = payload.version;

    let plaintext = "[Encrypted Message]";
    let color = "var(--red)";

    if (crypto.ready()) {
        if (version < crypto.get_key_ver()) {
            // Can't read - version is outdated
            plaintext = `[Unable To Decrypt]`
        } else {
            // Might be able to read
            if (version > crypto.get_key_ver()) {
                await crypto.sync_ver(version);
                chat.appendNotification(`Synced key to version ${version}`)
            }

            const decrypted = await crypto.decrypt(iv, ciphertext);
            if (decrypted) {
                plaintext = decrypted;
                color = null;
            }
        }
    } else {
        crypto.sync_ver(version);
    }

	chat.appendMessage(name, ciphertext, plaintext, color);
}

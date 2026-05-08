import crypto from "../../scripts/crypto.js"
import chat from "../../scripts/chat.js";

export default async (ws, payload) => {
    const name = payload.name;
    const iv = payload.iv;
    const ciphertext = payload.ciphertext;
    const version = payload.version;
    const fingerprint = payload.fingerprint;

    let plaintext = "[Encrypted Message]";
    let color = "var(--red)";

    if (crypto.ready()) {
        if (fingerprint !== crypto.get_fingerprint()) {
            // Can't read - password different
            plaintext = `[Encrypted Message - Mismatched Fingerprint]`
        } else if (version < crypto.get_key_ver()) {
            // Can't read - version is outdated
            plaintext = `[Encrypted Message - Outdated Version. Send a message to help them update!]`
        } else {
            // Should be able to read
            if (version > crypto.get_key_ver()) {
                await crypto.sync_ver(version);
                chat.appendNotification(`Synced key to version ${version}`)
            }

            plaintext = await crypto.decrypt(iv, ciphertext);
            color = null;
        }
    }

	chat.appendMessage(name, ciphertext, plaintext, color);
}

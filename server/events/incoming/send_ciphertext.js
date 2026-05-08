import { sendCiphertext } from '../../chat.js'

export default async (ws, payload) => {
    const name = payload.name;
    const iv = payload.iv;
    const ciphertext = payload.ciphertext;
    const version = payload.version;
    const fingerprint = payload.fingerprint;

    sendCiphertext(ws, name, iv, ciphertext, version, fingerprint);
}

import {icons} from "../assets/icons.js";

let chat_history;
let previous_name;
const message_queue = [];

document.addEventListener("DOMContentLoaded", function () {
	chat_history = document.getElementById('chat_history');

    while (message_queue.length > 0) {
        const action = message_queue.shift();
        action();
    }
});



const chat_API = {}

chat_API.append_message = function (name, ciphertext, plaintext, icon = "happy") {
    if (!chat_history) {
        message_queue.push(() => chat_API.append_message(name, ciphertext, plaintext, icon));
        return;
    }

    const user_info = `
        <div class="user">
            ${icons[icon]}
            <p class="name">${name}</p>
        </div>
    `;

    const element = `
        <div class="message">
            ${previous_name != name ? user_info : ''}
            <p class="ciphertext">${ciphertext}</p>
            <p class="plaintext">${plaintext}</p>
        </div>
    `;

    chat_history.insertAdjacentHTML('beforeend', element);
    previous_name = name

    // Scroll to most recent message
    chat_history.scrollTop = chat_history.scrollHeight;
}

chat_API.append_notification = function (text) {
    if (!chat_history) {
        message_queue.push(() => chat_API.append_notification(text));
        return;
    }

    const element = `
            <p class="system">${text}</p>
    `;

    chat_history.insertAdjacentHTML('beforeend', element);
    previous_name = undefined;

    // Scroll to most recent message
    chat_history.scrollTop = chat_history.scrollHeight;
}

export default chat_API;
window.chat = chat_API;

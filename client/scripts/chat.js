import {icons} from "../assets/icons.js";

let chat_container;
let chat_history;
let previous_name;
const message_queue = [];

document.addEventListener("DOMContentLoaded", function () {
	chat_container = document.getElementById('chat_container');
	chat_history = document.getElementById('chat_history');

    while (message_queue.length > 0) {
        const action = message_queue.shift();
        action();
    }
});



const chat_API = {}

chat_API.appendMessage = function (name, ciphertext, plaintext, icon = "happy") {
    if (!chat_history) {
        message_queue.push(() => chat_API.appendMessage(name, ciphertext, plaintext, icon));
        return;
    }

    const user_info_element = `
        <div class="user">
            ${icons[icon]}
            <p class="name">${name}</p>
        </div>
    `;

    const ciphertext_element = `
        <p class="ciphertext">${ciphertext}</p>
    `;

    const element = `
        <div class="message">
            ${previous_name != name ? user_info_element : ''}
            ${ciphertext ? ciphertext_element : ''}
            <p class="plaintext">${plaintext}</p>
        </div>
    `;

    const should_scroll = chat_container.scrollHeight - chat_container.scrollTop <= chat_container.clientHeight + 10;

    chat_history.insertAdjacentHTML('beforeend', element);
    previous_name = name

    // Scroll to most recent message
    if (should_scroll) chat_container.scrollTop = chat_container.scrollHeight;
}

chat_API.appendNotification = function (text) {
    if (!chat_history) {
        message_queue.push(() => chat_API.appendNotification(text));
        return;
    }

    const element = `
            <p class="notification">${text}</p>
    `;

    const should_scroll = chat_container.scrollHeight - chat_container.scrollTop <= chat_container.clientHeight + 10;

    chat_history.insertAdjacentHTML('beforeend', element);
    previous_name = undefined;

    // Scroll to most recent message
    if (should_scroll) chat_container.scrollTop = chat_container.scrollHeight;
}

export default chat_API;
window.chat = chat_API;

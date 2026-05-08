import toast from './scripts/toast.js'
import chat from './scripts/chat.js'

const encryption_input = document.getElementById('encryption');
const textbox_input = document.getElementById('textbox');
const send_button = document.getElementById('send');

toast.display("Loaded!")

const now = new Date();
const iso_time = now.toISOString();
chat.append_notification(`Connected at ${iso_time}`);

// Set top text

textbox_input.addEventListener("keydown", (event) => {
    if (event.key === 'Enter') send_button.click();
});

send_button.addEventListener("click", () => {
    const message_content = textbox_input.value;
    if (!message_content) return;

    textbox_input.value = ""

    chat.append_message('You', 'quipmollitanimessequiconsecteturullamcoinidminimconsecteturullamcomagnaetnostrudoccaecatincididuntquisquiiddeseruntvelitauteirureenimminimauteadipisicingsuntnullanonaliquipipsumcommodoeiusmodconsecteturmollitullamcoali', message_content)
});

import { prepared, ws } from "../client.js";
const server = {};

const message_queue = [];

function sendToServer(message) {
  if (prepared) {
    ws.send(JSON.stringify(message));
  } else {
    message_queue.push(message);
  }
}

server.process_message_queue = function () {
  while (message_queue.length > 0) {
    const message = message_queue.shift();
    sendToServer(message);
  }
}

server.sendPlaintext = function (name, content) {
  sendToServer({ type: "send_plaintext", name, content });
}


export default server;
if (window) window.server = server;

let ping;

function onopen(ws) {
  ws.onopen = () => {
    console.log('WebSocket connect');
  };

  ping = setInterval(() => {
    send(1, ws);
  }, 3000);
}

function send(data, ws) {
  // console.log('----SEND: ', data);
  ws.send(JSON.stringify(data));
}

function closeSocket(ws) {
  clearInterval(ping);
  ping = null;
  ws.close();
}

function clearPing() {
  clearInterval(ping);
  ping = null;
}

export {
  onopen,
  send,
  closeSocket,
  clearPing,
};

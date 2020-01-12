const WebSocket = require('ws');
const server = require('./app');
const db = require('./db/index');

const wss = new WebSocket.Server({
  server,
  path: '/socket/connect',
});

async function uploadRooms(userId) {
  if (!userId) return [];

  const query = `
    select array (
      select
        tc.chat_id::int
      from t_chat tc
      inner join t_chat_link tcl on tcl.chat_id = tc.chat_id
      inner join t_link_type tlt on tlt.link_type_id = tcl.link_type_id
      where tcl.user_id = ${userId}
        and tlt.brief = 'chat_member'
    )
  `;

  let result;

  try {
    result = await db.sql(query);
  } catch (error) {
    console.error(error.message);

    return [];
  }

  if (result && result.array && Array.isArray(result.array)) return result.array;

  return [];
}

function Broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.rooms.includes(data.message.chat_id)) {
      client.send(JSON.stringify(data));
    }
  });
};

wss.on('connection', (ws) => {
  ws.rooms = [];

  ws.on('message', async (query) => {
    const data = await JSON.parse(query);

    if (data.type == 'join') {
      ws.user = data.user;
      ws.rooms = await uploadRooms(data.user.user_id);
    }

    if (data.type == 'message') {
      if (!data.message) return;

      Broadcast(data);
    }
  });

  ws.on('close', () => {
    console.log('Client disconected: ', ws);
  });
});
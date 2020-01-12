const express = require('express');
const index = require('./routes/index.js');

const app = express();

const server = app.listen(3000, () => {
  require('./WebSocketServer');
  console.log('Listening on 3000 port');
});

index(app);

module.exports = server;

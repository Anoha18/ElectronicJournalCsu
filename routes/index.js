let api = require('./api.js');
let middleware = require('./middleware');
let express = require('express');
let path = require('path');

module.exports = (app) => {  
  app.use('/static', express.static('static'));
  
  middleware(app);
  
  app.use('/', api);
};

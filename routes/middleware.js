const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const PostgreSqlStore = require('connect-pg-simple')(session);
const connection = require('../connection.js');

const sessionOptions = {
  secret: 'mYT0P$eCrEtIcK',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 365 * 24 * 60 * 60 * 1000,
  },
  store: new PostgreSqlStore({
    conObject: connection,
    tableName: 't_session',
  }),
};

module.exports = (app) => {
  app.use(bodyParser.urlencoded({
    extended: true
  }));

  app.use(bodyParser.json());

  app.use(cookieParser());
  app.use(session(sessionOptions));
};

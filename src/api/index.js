const express = require('express');
const api = express.Router();

api.use('/v1', require('./v1/index'));

api.get('/', ({ req, res }) => {
  res.end('Welcome to /api');
});

module.exports = api;

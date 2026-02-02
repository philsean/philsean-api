const express = require('express');
const api = express.Router();

api.use('/canvas', require('./canvas'));
api.use(['/plate', '/plaquinha'], require('./plate'));

api.get('/', ({ req, res }) => {
  res.end('Welcome to /api/v1');
});

module.exports = api;

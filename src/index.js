const { logger: log, icon } = require('@kauzx/logger');
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.request.log = log;
app.request.log.icon = icon;

app.use('/api', require('./api/index'));

app.get('/', (req, res) => {
  res.status(200).json({ message: '👁️👄👁️' });
});

app.listen(5000, () => {
  log.style(`{green.bold ${icon.success} Rodando na porta:} {blue 5000}`);
});

module.exports = app;

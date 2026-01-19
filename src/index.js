require('dotenv').config({ quiet: true });
const { logger: log, icon } = require('@kauzx/logger');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const express = require('express');
const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'You are making too many requests.'
});

app.set('trust proxy', 1);

app.use(cors());
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', require('./api/index'));

app.get('/', (req, res) => {
  res.status(200).json({ message: '👁️👄👁️' });
});

app.listen(process.env.PORT || 5000, () => {
  log.style(`{green.bold ${icon.success} Rodando na porta:} {blue ${process.env.PORT || 5000}}`);
});

module.exports = app;

const { AzuraClient } = require('azurajs');
const { createLoggingMiddleware } = require('azurajs/middleware');

const app = new AzuraClient();
const logger = createLoggingMiddleware(app.getConfig());

app.use(logger);

app.get('/', (req, res) => {
  res.status(200).json({ message: '👁️👄👁️' });
});

app.listen();

module.exports = app;
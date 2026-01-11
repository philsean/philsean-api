const { Hono } = require('hono');

const app = new App();

app.get('/', c => c.text('Hello People!'));

module.exports = app;

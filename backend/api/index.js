process.env.SERVERLESS = '1';
const express = require('express');

let cachedHandler;

async function getHandler() {
  if (cachedHandler) {
    return cachedHandler;
  }

  const server = express();

  let mainModule;
  try {
    mainModule = require('../dist/src/main');
  } catch (err) {
    mainModule = require('../dist/main');
  }

  const createApp = mainModule.createApp || mainModule.default?.createApp || mainModule;
  if (typeof createApp !== 'function') {
    throw new Error('createApp is not a function. Exported keys: ' + Object.keys(mainModule).join(', '));
  }

  const app = await createApp(server);
  await app.init();

  cachedHandler = server;
  return cachedHandler;
}

module.exports = async (req, res) => {
  try {
    const handler = await getHandler();
    return handler(req, res);
  } catch (err) {
    console.error('Vercel serverless error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: 'Internal Server Error',
        message: err.message,
        stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
      }),
    );
  }
};

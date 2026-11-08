process.env.SERVERLESS = '1';
const express = require('express');

let cachedHandler;

async function getHandler() {
  if (cachedHandler) {
    return cachedHandler;
  }

  const server = express();
  const { createApp } = require('../dist/src/main');
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

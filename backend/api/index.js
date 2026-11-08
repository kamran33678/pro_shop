let handler;

module.exports = async (req, res) => {
  try {
    if (!handler) {
      const main = require('../dist/src/main');
      handler = main.default || main;
    }
    return await handler(req, res);
  } catch (err) {
    console.error('Serverless execution error:', err);
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        error: 'Serverless invocation error',
        message: err.message,
        stack: err.stack,
      }),
    );
  }
};

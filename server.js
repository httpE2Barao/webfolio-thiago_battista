require('events').EventEmitter.defaultMaxListeners = 15;

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Cleanup function to remove listeners
function cleanup() {
  process.removeAllListeners();
  if (server) {
    server.removeAllListeners();
    server.close();
  }
  process.exit(0);
}

// Handle errors and cleanup
process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  cleanup();
});

let server;

app.prepare().then(() => {
  server = createServer((req, res) => {
    // Set socket timeout to avoid hanging connections
    req.setTimeout(30000);
    res.setTimeout(30000);
    
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  server.keepAliveTimeout = 60000;
  server.headersTimeout = 65000;

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });

  // Handle server errors
  server.on('error', (err) => {
    console.error('Server error:', err);
    cleanup();
  });
});
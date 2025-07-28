// server.js
const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
const socketManager = require('./socket/socketManager');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`⚡ New client connected: ${socket.id}`);
  socketManager(io, socket);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'https://collabtexteditor.onrender.com',
    'http://localhost:3000',
  ],
  methods: ['GET', 'POST'],
  credentials: true,
};

app.use(cors(corsOptions));

// HTTP route
app.get('/', (req, res) => {
  res.send('Server is running');
});

const server = http.createServer(app);

// WebSocket Server with explicit path
const wss = new WebSocket.Server({ server, path: '/ws' });

let doc = "";

wss.on('connection', (ws) => {
  console.log('New Client connected');
  ws.send(JSON.stringify({ type: 'init', data: doc }));

  ws.on('message', (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      if (parsedMessage.type === 'update') {
        doc = parsedMessage.data;
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'update', data: doc }));
          }
        });
      }
    } catch (error) {
      console.error('Error parsing message: ', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

const PORT = process.env.PORT || 5005;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

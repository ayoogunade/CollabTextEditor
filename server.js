const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());


const server = http.createServer(app);
const wss = new WebSocket.Server({server});

let doc = "";

wss.on('connection', (ws) => {
    console.log('New Client connected');

    ws.send(JSON.stringify({type: 'init', data: doc}));

    ws.on('message',(message)=>{
        try {
            const parsedMessage = JSON.parse(message);
            if (parsedMessage.type === 'update'){
                doc = parsedMessage.data;
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN){
                        client.send(JSON.stringify({type:'update', data:doc}));
                    }
                });
            }
        } catch (error){
            console.error('Error pasing message: ',error);
        }
    });
    ws.on('close',()=>{
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});


// we are going to create a real time collabortive text editor using websockets
const express = require('express');
const http = require('http');
const websocket = require('ws');
const cors = require('cors');

const app = express();  
app.use(cors());

const server = http.createServer(app);
const wss = new websocket.Server({ server });

let documentContent = ''; // this will hold the current content of the document

wss.on('connection', (ws) => {
    console.log('A new client connected');

    // Send the current document content to the newly connected client
    ws.send(JSON.stringify({ type: 'document', content: documentContent }));

    ws.on('message', (message) => {
        try{
            const parsedMessage = JSON.parse(message);
            if (parsedMessage.type === 'update') {
                documentContent = parsedMessage.content; // update the document content
                // Broadcast the updated content to all connected clients
                wss.clients.forEach((client) => {
                    if (client.readyState === websocket.OPEN) {
                        client.send(JSON.stringify({ type: 'document', content: documentContent }));
                    }
                });
            }
        } catch (error) {
            console.error('Error parsing message:', error); 
        }
    });

    ws.on('close', () => {
        console.log('A client disconnected');
    });
});

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});     

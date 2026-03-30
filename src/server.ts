import * as fs from 'fs';
import * as https from 'https';
import { WebSocketServer } from 'ws';

import {
    Person, TICK_FREQUENCY,
    ServerUpdateMsg, ServerInitMsg, ServerExitMsg, ClientMsg
} from "./common";

type IncomingMessage = {
    clientId: string,
    payload: ClientMsg
};

const WEBSOCKET_PORT = 4242;

let httpsServer = null;
if (process.env.OURSPACE_HTTPS_ENABLED) {
    const serverConfig = {
        key: fs.readFileSync(process.env.OURSPACE_HTTPS_KEY),
        cert: fs.readFileSync(process.env.OURSPACE_HTTPS_CERT)
    };
    httpsServer = https.createServer(serverConfig)
}

const wsServer = httpsServer
    ? new WebSocketServer({ server: httpsServer })
    : new WebSocketServer({ port: WEBSOCKET_PORT });

console.log("Server ws in ascolto sulla porta " + WEBSOCKET_PORT);

let people: Record<string, Person> = {};
let idCounter: number = 0;

let incomingMessages: IncomingMessage[] = []; 

wsServer.on("connection", (ws, req) => {
    const clientIp = req.socket.remoteAddress;
    console.log("Nuova connessione da " + clientIp);

    idCounter+= 1;
    const id = idCounter + '';
    ws.id = id;
    const initMessage: ServerInitMsg = {
        kind: "init",
        yourId: id,
        people: people
    };
    ws.send(JSON.stringify(initMessage));

    ws.on("message", async data => {
        const payload = JSON.parse(data);

        incomingMessages.push({
            clientId: ws.id,
            payload: payload
        });
    });

    ws.on("close", data => {
        console.log("Client disconnesso: " + clientIp);
        delete people[ws.id];
        const exitMessage: ServerExitMsg = {
            kind: "exit",
            id: ws.id
        };
        const exitMessageString = JSON.stringify(exitMessage);
        wsServer.clients.forEach(socket => socket.send(exitMessageString));
    });
});


function tick(){
    const messages = incomingMessages;
    incomingMessages = [];
    const updatedPeople: Record<string, Person> = {};

    messages.forEach(message => {
        const clientId: string = message.clientId;
        const payload: ClientMsg = message.payload;
        if (payload.kind === "init") {
            const newPerson = {
                x: 0,
                y: 0,
                speed: 5,
                character: payload.character,
            };
            people[clientId] = newPerson;
            updatedPeople[clientId] = newPerson;
        }
        else if (payload.kind === "move") {
            const person = people[clientId]
            person.x = payload.x 
            person.y = payload.y
            updatedPeople[clientId] = person;
        }
    });
    const updateMessage: ServerUpdateMsg = {
        kind: "update",
        people: updatedPeople
    };
    const updateMessageString = JSON.stringify(updateMessage);
    wsServer.clients.forEach(
        socket => socket.send(updateMessageString)
    );
}

setInterval(tick, 1000/TICK_FREQUENCY)
if (httpsServer) httpsServer.listen(WEBSOCKET_PORT, () => {
    console.log('Server https in ascolto sulla porta ' + WEBSOCKET_PORT);
});
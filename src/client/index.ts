import { TICK_FREQUENCY } from '../common';
import { UserInput } from './user-input';
import { LobbyClient } from '../lobby';
import { GameClient } from '../games/game';
import { GuessGameClient } from '../games/guess';

const playground = document.getElementById('playground') as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = playground.getContext("2d")!;

export const userInput = new UserInput(playground);
export const lobby = new LobbyClient(userInput);
export let currentGame: GameClient | null = null;
export let currentGameId: string | null = null;

let lastFrameTime = performance.now();

function draw(timestamp: number) {
    const dt = (timestamp - lastFrameTime) / 1000; // Convert to seconds
    lastFrameTime = timestamp;

    if (currentGame) currentGame.draw(ctx, dt);
    else lobby.draw(ctx, dt);

    requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
const wsHost = window.location.host;
const wsConnectionString = `${wsProtocol}://${wsHost}`;
export const socket = new WebSocket(wsConnectionString);

socket.addEventListener("message", async event => {
    const incomingMessage = JSON.parse(event.data);
    console.log(incomingMessage);

    if (incomingMessage.kind === "gameStarted") {
        console.log(incomingMessage);
        if (currentGame) return;
        currentGame = new GuessGameClient(userInput, lobby.myId!);
        currentGame.init(incomingMessage.players);
        currentGameId = incomingMessage.gameId;
    }
    else if (incomingMessage.kind === "gameEnded") {
        currentGame = null;
    }
    else if (currentGame && incomingMessage.gameId === currentGameId) {
        console.log("BINGO!");
        console.log(incomingMessage);
        currentGame.handleMessage(incomingMessage);
    }
    else {
        lobby.handleMessage(incomingMessage);
    }
});

setInterval(() => {
    lobby.flushMessages().forEach((message) =>{
        socket.send(JSON.stringify(message));
    })
    if (currentGame) {
        if (currentGame.isFinished()) {
            currentGame = null;
            currentGameId = null;
        }
        else {
            const gameMessages = currentGame.flushMessages();
            gameMessages.forEach((message) => {
                message.gameId = currentGameId;
                socket.send(JSON.stringify(message));
            })
        }
    }
}, 1000/TICK_FREQUENCY);

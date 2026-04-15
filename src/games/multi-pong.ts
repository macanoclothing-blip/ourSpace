import { Player } from '../common';
import { IncomingMsg, OutgoingMsg } from '../server';
import { GameClient, GameServer } from './game';

const PLAYER_W = 0.04;
const PLAYER_H = 0.15;

export class PongServer extends GameServer {

    private players;

    init(players) {
        this.players = players;

        let i = 0;
        Object.keys(players).forEach(id => {
            const player = players[id];
            if (i % 2 === 0) {
                player.x = -0.97;
                player.y = 0;
            }
            else {
                player.x = 0.97 - PLAYER_W;
                player.y = 0;
            }
            i += 1;
        });

        // TODO meccanismo che genera le palle
    }

    tick(
        incomingMessages: IncomingMsg[],
        dt: number
    ): OutgoingMsg[] {
        incomingMessages.forEach(message => {
            const id = message.clientId;
            const payload = message.payload;

            if (payload.kind === 'move') {
                const player = this.players[id];
                player.y = payload.y;
            }
        });

        // TODO far muovere le palle
        // TODO gestire collisioni palla/bordi
        // TODO gestire collisioni palla/giocatore

        return [{
            payload: {
                players: this.players
            }
        }]
    }

    isFinished(): boolean {
        return false;
    }
}

import { UserInput } from '../client/user-input';

export class PongClient extends GameClient {

    private players = null;

    constructor(userInput: UserInput, myId: string) {
        super(userInput, myId);
    }

    init(players) {
    }

    draw(ctx: CanvasRenderingContext2D, dt: number) {
        if (this.players === null) return;

        const { screenW, screenH, moveDirectionY } = this.userInput;

        // gestione movimento 
        const me = this.players[this.myId];
        me.y += moveDirectionY * dt * 1.3;
        // TODO non far uscire il giocatore dallo schermo

        ctx.save();
        ctx.translate(screenW/2, screenH/2); // (0,0) al centro
        ctx.scale(screenW/2, screenH/2); // coordinate normalizzate

        ctx.fillStyle = "#00820d";
        ctx.fillRect(-1, -1, 2, 2);

        ctx.fillStyle = "#e1e1e1";
        ctx.fillRect(0, -1, 0.05, 2);

        Object.keys(this.players).forEach(id => {
            const player = this.players[id];
            ctx.fillStyle = "#1d1d1d";
            ctx.fillRect(player.x, player.y, PLAYER_W, PLAYER_H);
        });

        ctx.restore();
    }

    handleMessage(message: any) {
        // TODO aggiornare solo la posizione degli altri giocatori
        this.players = message.players;
    }

    flushMessages(): any[] {
        if (this.players === null) return [];

        const me = this.players[this.myId];
        return [{
            kind: 'move',
            y: me.y
        }];
    }

    isFinished(): boolean {
        return false;
    }
}

import { Player } from '../common';
import { IncomingMsg, OutgoingMsg } from '../server';

export abstract class GameServer {
    protected players: Record<string, Player>;

    constructor(players: Record<string, Player>) {
        this.players = players;
    }

    abstract tick(
        incomingMessages: IncomingMsg[],
        dt: number
    ): OutgoingMsg[];
}

/////////////////////////////////////////

import { UserInput } from '../client/user-input';

export abstract class GameClient {
    protected players: Record<string, Player>;
    protected userInput: UserInput;

    constructor(players: Record<string, Player>, userInput: UserInput) {
        this.players = players;
        this.userInput = userInput;
    }

    abstract draw(ctx: CanvasRenderingContext2D, dt: number);
    abstract handleMessage(message: object);
    abstract flushMessages(): object[];
}

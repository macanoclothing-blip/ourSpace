export const TICK_FREQUENCY = 20; // ticks per second

export type Person = {
    x: number;
    y: number;
    speed: number;
    character: string;
};

// Messaggi mandati dal server
export type ServerInitMsg = {
    kind: "init";
    yourId: string;
    people: Record<string, Person>;
};

export type ServerUpdateMsg = {
    kind: "update";
    people: Record<string, Person>;
};

export type ServerExitMsg = {
    kind: "exit";
    id: string;
};

export type ServerMsg = 
    | ServerInitMsg
    | ServerUpdateMsg 
    | ServerExitMsg;

// Messaggi mandati dal client
export type ClientInitMsg = {
    kind: "init";
    character: string;
};

export type ClientMoveMsg = {
    kind: "move";
    x: number;
    y: number;
};

export type ClientMsg = 
    | ClientInitMsg 
    | ClientMoveMsg;


// Funzioni matematiche
export const mod = (n: number, m: number) => ((n % m) + m) % m;



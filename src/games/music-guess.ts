import { Player } from '../common';
import { IncomingMsg, OutgoingMsg } from '../server';
import { GameServer, GameClient } from './game';
import { UserInput } from '../client/user-input';
import { Button } from '../client/ui-elements';

// Fallback music data (local data for backup)
const MUSIC_DATA: Record<string, Array<{ title: string; artist: string; audioUrl: string }>> = {
    rock: [
        { title: "Bohemian Rhapsody", artist: "Queen", audioUrl: "https://cdns-files-c.dzcdn.net/stream/c-c8e1f1e2a8d8b8e8f1e2a8d8b8e8f1e2-9.mp3" },
        { title: "Imagine", artist: "John Lennon", audioUrl: "https://cdns-files-c.dzcdn.net/stream/c-d1c2b3a4f5e6d7c8b9a0e1f2d3c4b5a6-9.mp3" },
        { title: "Sweet Home Alabama", artist: "Lynyrd Skynyrd", audioUrl: "https://cdns-files-c.dzcdn.net/stream/c-e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2-9.mp3" },
        { title: "Smoke on the Water", artist: "Deep Purple", audioUrl: "https://cdns-files-c.dzcdn.net/stream/c-f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6-9.mp3" },
        { title: "All Right Now", artist: "Free", audioUrl: "https://cdns-files-c.dzcdn.net/stream/c-a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6-9.mp3" }
    ],
    pop: [
        { title: "Blinding Lights", artist: "The Weeknd", audioUrl: "https://cdns-files-c.dzcdn.net/stream/c-b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6-9.mp3" },
        { title: "Shape of You", artist: "Ed Sheeran", audioUrl: "https://cdns-files-c.dzcdn.net/stream/c-c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0-9.mp3" },
        { title: "Levitating", artist: "Dua Lipa", audioUrl: "https://cdns-files-c.dzcdn.net/stream/c-d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4-9.mp3" },
        { title: "Someone You Loved", artist: "Lewis Capaldi", audioUrl: "https://cdns-files-c.dzcdn.net/stream/c-e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8-9.mp3" },
        { title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars", audioUrl: "https://cdns-files-c.dzcdn.net/stream/c-f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2-9.mp3" }
    ],
    jazz: [
        { title: "Take Five", artist: "Dave Brubeck", audioUrl: "https://cdns-files-c.dzcdn.net/stream/c-a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0-9.mp3" },
        { title: "Fly Me to the Moon", artist: "Frank Sinatra", audioUrl: "https://cdns-files-c.dzcdn.net/stream/c-b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4-9.mp3" },
        { title: "All the Things You Are", artist: "Art Tatum", audioUrl: "https://cdns-files-c.dzcdn.net/stream/c-c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8-9.mp3" },
        { title: "So What", artist: "Miles Davis", audioUrl: "https://cdns-files-c.dzcdn.net/stream/c-d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2-9.mp3" },
        { title: "Autumn Leaves", artist: "Bill Evans Trio", audioUrl: "https://cdns-files-c.dzcdn.net/stream/c-e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6-9.mp3" }
    ],
    hip_hop: [
        { title: "Lose Yourself", artist: "Eminem", audioUrl: "https://cdns-files-c.dzcdn.net/stream/c-f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0-9.mp3" },
        { title: "In Da Club", artist: "50 Cent", audioUrl: "https://cdns-files-c.dzcdn.net/stream/c-a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4-9.mp3" },
        { title: "Hotline Bling", artist: "Drake", audioUrl: "https://cdns-files-c.dzcdn.net/stream/c-b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8-9.mp3" },
        { title: "God's Plan", artist: "Drake", audioUrl: "https://cdns-files-c.dzcdn.net/stream/c-c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2-9.mp3" },
        { title: "HUMBLE.", artist: "Kendrick Lamar", audioUrl: "https://cdns-files-c.dzcdn.net/stream/c-d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6-9.mp3" }
    ],
    classical: [
        { title: "Moonlight Sonata", artist: "Ludwig van Beethoven", audioUrl: "https://cdns-files-c.dzcdn.net/stream/c-e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0-9.mp3" },
        { title: "Canon in D", artist: "Johann Pachelbel", audioUrl: "https://cdns-files-c.dzcdn.net/stream/c-f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4-9.mp3" },
        { title: "The Four Seasons - Spring", artist: "Antonio Vivaldi", audioUrl: "https://cdns-files-c.dzcdn.net/stream/c-a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8-9.mp3" },
        { title: "Clair de Lune", artist: "Claude Debussy", audioUrl: "https://cdns-files-c.dzcdn.net/stream/c-b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2-9.mp3" },
        { title: "Eine kleine Nachtmusik", artist: "Wolfgang Amadeus Mozart", audioUrl: "https://cdns-files-c.dzcdn.net/stream/c-c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6-9.mp3" }
    ]
};

// Game messages
type MusicGameServerMsg = {
    kind: "music_game_update";
    gameState: GameState;
    lastGuess?: {
        playerName: string;
        guess: string;
        correct: boolean;
    };
};

type MusicGameClientMsg = {
    kind: "music_genre_select";
    genre: string;
} | {
    kind: "music_guess_submit";
    guess: string;
};

type GameState = {
    phase: "genre_select" | "playing" | "game_over";
    selectedGenre?: string;
    currentSong?: { title: string; artist: string; audioUrl: string };
    guesses: Array<{
        playerId: string;
        playerName: string;
        guess: string;
        timestamp: number;
    }>;
    gameOver: boolean;
    winnerId?: string;
    correctPlayers: string[];
};

// Server-side player state
type MusicPlayer = Player & {
    score: number;
};

// Function to fetch songs from Deezer API
async function fetchSongsFromDeezer(genre: string): Promise<Array<{ title: string; artist: string; audioUrl: string }>> {
    return new Promise((resolve) => {
        try {
            const https = require('https');
            
            const genreQueries: Record<string, string> = {
                rock: 'rock',
                pop: 'pop',
                jazz: 'jazz',
                hip_hop: 'hip hop',
                classical: 'classical'
            };

            const query = genreQueries[genre] || 'music';
            const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=20`;

            https.get(url, (res: any) => {
                let data = '';
                res.on('data', (chunk: string) => {
                    data += chunk;
                });
                res.on('end', () => {
                    try {
                        const jsonData = JSON.parse(data);
                        const songs = jsonData.data
                            ?.filter((track: any) => track.preview && track.preview.length > 0)
                            .slice(0, 5)
                            .map((track: any) => ({
                                title: track.title,
                                artist: track.artist.name,
                                audioUrl: track.preview
                            })) || [];
                        
                        if (songs.length > 0) {
                            resolve(songs);
                        } else {
                            // Fallback to local data
                            resolve(MUSIC_DATA[genre] || []);
                        }
                    } catch (e) {
                        // Fallback to local data
                        resolve(MUSIC_DATA[genre] || []);
                    }
                });
            }).on('error', () => {
                // Fallback to local data
                resolve(MUSIC_DATA[genre] || []);
            });
        } catch (e) {
            // If running on client or https not available, use fallback
            resolve(MUSIC_DATA[genre] || []);
        }
    });
}

//////////////////////
////// SERVER ////////
//////////////////////

export class MusicGuessGameServer extends GameServer {
    private gameState: GameState;
    private gamePlayers: Record<string, MusicPlayer>;
    private initMessage: MusicGameServerMsg;
    private playersReady: Set<string> = new Set();
    private fetchedSongs: Array<{ title: string; artist: string; audioUrl: string }> = [];

    constructor() {
        super();

        this.gameState = {
            phase: "genre_select",
            guesses: [],
            gameOver: false,
            correctPlayers: []
        };
    }

    init(players: Record<string, Player>) {
        this.gamePlayers = {};
        Object.entries(players).forEach(([id, player]) => {
            this.gamePlayers[id] = {
                ...player,
                score: 0
            };
        });

        this.initMessage = {
            kind: "music_game_update",
            gameState: this.gameState
        }
    }

    tick(incomingMessages: IncomingMsg[], dt: number): OutgoingMsg[] {
        const outgoingMessages: OutgoingMsg[] = [];

        if (this.initMessage) {
            outgoingMessages.push({
                payload: this.initMessage
            });
            this.initMessage = null;
        }

        incomingMessages.forEach(message => {
            const clientId = message.clientId;
            const payload = message.payload;
            
            if (payload.kind === "music_genre_select" && this.gameState.phase === "genre_select") {
                const genre = payload.genre;
                // Use fallback data immediately
                const genreData = MUSIC_DATA[genre];
                if (genreData && genreData.length > 0) {
                    this.gameState.selectedGenre = genre;
                    this.gameState.phase = "playing";
                    
                    // Select random song
                    const randomSong = genreData[Math.floor(Math.random() * genreData.length)];
                    this.gameState.currentSong = randomSong;
                    this.gameState.correctPlayers = [];
                    this.gameState.guesses = [];
                    this.gameState.gameOver = false;
                    this.gameState.winnerId = undefined;
                    
                    // Send update to all players
                    outgoingMessages.push({
                        payload: {
                            kind: "music_game_update",
                            gameState: this.gameState
                        }
                    });
                }
            } else if (payload.kind === "music_guess_submit" && this.gameState.phase === "playing" && !this.gameState.correctPlayers.includes(clientId)) {
                const guess = payload.guess.toLowerCase().trim();
                const player = this.gamePlayers[clientId];
                
                if (player && this.gameState.currentSong) {
                    const correct = guess === this.gameState.currentSong.title.toLowerCase();
                    
                    // Record the guess
                    this.gameState.guesses.push({
                        playerId: clientId,
                        playerName: player.name,
                        guess: payload.guess,
                        timestamp: Date.now()
                    });
                    
                    if (correct) {
                        this.gameState.correctPlayers.push(clientId);
                        player.score += 1;
                        
                        if (this.gameState.correctPlayers.length === 1) {
                            this.gameState.winnerId = clientId;
                        }
                        
                        // If anyone got it right, end game
                        if (this.gameState.correctPlayers.length >= 1) {
                            this.gameState.gameOver = true;
                            this.gameState.phase = "game_over";
                        }
                    }
                    
                    // Send update to all players
                    outgoingMessages.push({
                        payload: {
                            kind: "music_game_update",
                            gameState: this.gameState,
                            lastGuess: {
                                playerName: player.name,
                                guess: payload.guess,
                                correct: correct
                            }
                        }
                    });
                }
            }
        });

        return outgoingMessages;
    }

    isFinished(): boolean {
        return this.gameState.gameOver;
    }
}

//////////////////////
////// CLIENT ////////
//////////////////////

export class MusicGuessGameClient extends GameClient {
    private gameState: GameState | null = null;
    private lastGuessResult: any = null;
    private currentGuess: string = "";
    private messageQueue: MusicGameClientMsg[] = [];
    private userExited: boolean = false;
    private exitButton: Button;
    private players: Record<string, Player>;

    private genreButtons: Map<string, Button> = new Map();
    private audioElement: HTMLAudioElement;

    constructor(userInput: UserInput, myId: string) {
        super(userInput, myId);
        
        // Initialize audio element
        this.audioElement = new Audio();
        this.audioElement.crossOrigin = "anonymous";
        
        // Setup keyboard input for guessing
        document.addEventListener('keydown', (e) => {
            if (this.gameState?.phase !== "playing") return;
            
            if (e.key === 'Enter' && this.currentGuess.trim() !== '') {
                this.messageQueue.push({
                    kind: "music_guess_submit",
                    guess: this.currentGuess
                });
                this.currentGuess = "";
            } else if (e.key === 'Backspace') {
                this.currentGuess = this.currentGuess.slice(0, -1);
            } else if (e.key.length === 1) {
                this.currentGuess += e.key;
            }
        });

        this.exitButton = new Button("exit", this.userInput, () => {
            this.userExited = true;
        });

        // Create genre buttons
        const genres = ['rock', 'pop', 'jazz', 'hip_hop', 'classical'];
        genres.forEach(genre => {
            const btn = new Button(genre, userInput, () => {
                this.messageQueue.push({
                    kind: "music_genre_select",
                    genre: genre
                });
            });
            this.genreButtons.set(genre, btn);
        });
    }

    init(players: Record<string, Player>) {
        this.players = players;
    }

    draw(ctx: CanvasRenderingContext2D, dt: number) {
        const { screenW, screenH } = this.userInput;
        
        // Clear screen
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, screenW, screenH);
        
        // Draw game title
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 48px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Guess the Song", screenW / 2, 80);
        
        if (!this.gameState) {
            ctx.font = "24px Arial";
            ctx.fillText("Waiting for game to start...", screenW / 2, screenH / 2);
            return;
        }

        if (this.gameState.phase === "genre_select") {
            // Genre selection phase
            ctx.fillStyle = "#ffffff";
            ctx.font = "28px Arial";
            ctx.fillText("Select a Music Genre:", screenW / 2, 150);

            const genres = Array.from(this.genreButtons.keys());
            const buttonHeight = 60;
            const buttonWidth = 150;
            const spacing = 20;
            const totalHeight = genres.length * (buttonHeight + spacing);
            const startY = (screenH - totalHeight) / 2;

            genres.forEach((genre, index) => {
                const btn = this.genreButtons.get(genre)!;
                const y = startY + index * (buttonHeight + spacing);
                btn.draw(ctx, screenW / 2 - buttonWidth / 2, y, buttonWidth, buttonHeight);
            });
        } else if (this.gameState.phase === "playing") {
            // Playing phase
            ctx.fillStyle = "#ffffff";
            ctx.font = "24px Arial";
            ctx.textAlign = "center";
            ctx.fillText(`Genre: ${this.gameState.selectedGenre}`, screenW / 2, 150);
            ctx.fillText("Listen to the song preview and guess the title", screenW / 2, 200);

            // Draw current guess input
            ctx.fillStyle = "#333333";
            ctx.fillRect(screenW / 2 - 200, screenH / 2 - 50, 400, 60);
            ctx.fillStyle = "#ffffff";
            ctx.font = "32px Arial";
            ctx.fillText(this.currentGuess || "...", screenW / 2, screenH / 2 - 20);

            // Draw last guess result
            if (this.lastGuessResult) {
                ctx.font = "24px Arial";
                const result = this.lastGuessResult;
                let resultText = "";
                let resultColor = "#ffffff";
                
                if (result.correct) {
                    resultText = `${result.playerName} guessed correctly! "${result.guess}" 🎉`;
                    resultColor = "#4CAF50";
                } else {
                    resultText = `${result.playerName} guessed "${result.guess}" ❌`;
                    resultColor = "#FF5722";
                }
                
                ctx.fillStyle = resultColor;
                ctx.fillText(resultText, screenW / 2, screenH / 2 + 80);
            }

            // Draw guess history
            if (this.gameState.guesses.length > 0) {
                ctx.fillStyle = "#666666";
                ctx.font = "18px Arial";
                ctx.textAlign = "left";
                ctx.fillText("Guesses:", 50, screenH - 150);
                
                const recentGuesses = this.gameState.guesses.slice(-5);
                recentGuesses.forEach((guess, index) => {
                    const yPos = screenH - 100 + (index * 25);
                    ctx.fillText(`${guess.playerName}: "${guess.guess}"`, 50, yPos);
                });
                ctx.textAlign = "center";
            }
        } else if (this.gameState.phase === "game_over") {
            // Game over phase
            ctx.fillStyle = "#4CAF50";
            ctx.font = "bold 36px Arial";
            if (this.gameState.winnerId) {
                const winner = this.players[this.gameState.winnerId];
                ctx.fillText(`🎵 ${winner?.name || "Someone"} guessed correctly!`, screenW / 2, screenH / 2 - 100);
                
                if (this.gameState.currentSong) {
                    ctx.fillStyle = "#ffffff";
                    ctx.font = "28px Arial";
                    ctx.fillText(`The song was: "${this.gameState.currentSong.title}"`, screenW / 2, screenH / 2 - 20);
                    ctx.fillText(`by ${this.gameState.currentSong.artist}`, screenW / 2, screenH / 2 + 40);
                }
            }
            this.exitButton.draw(ctx, screenW / 2 - 60, screenH - 80, 120, 50);
        }

        // Draw player scores
        ctx.fillStyle = "#888888";
        ctx.font = "20px Arial";
        ctx.textAlign = "left";
        ctx.fillText("Players:", screenW - 250, 50);
        
        Object.values(this.players).forEach((player, index) => {
            const yPos = 80 + (index * 30);
            ctx.fillText(`${player.name}: ${(player as any).score || 0}`, screenW - 250, yPos);
        });
        ctx.textAlign = "center";
    }

    handleMessage(message: any) {
        if (message.kind === "music_game_update") {
            const previousPhase = this.gameState?.phase;
            this.gameState = message.gameState;
            this.lastGuessResult = message.lastGuess;

            // When transitioning to playing phase, play the song
            if (previousPhase !== "playing" && this.gameState.phase === "playing") {
                if (this.gameState.currentSong) {
                    this.playAudioPreview();
                }
            }
        }
    }

    private playAudioPreview() {
        if (!this.gameState?.currentSong) return;
        
        try {
            this.audioElement.src = this.gameState.currentSong.audioUrl;
            this.audioElement.crossOrigin = "anonymous";
            this.audioElement.play().catch(err => {
                console.log("Audio playback info:", err.message);
            });
        } catch (err) {
            console.log("Error playing audio:", err);
        }
    }

    flushMessages(): any[] {
        const messages = this.messageQueue;
        this.messageQueue = [];
        return messages;
    }

    isFinished(): boolean {
        return this.userExited;
    }
}

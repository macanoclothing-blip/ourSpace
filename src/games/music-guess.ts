import { Player } from '../common';
import { IncomingMsg, OutgoingMsg } from '../server';
import { GameServer, GameClient } from './game';
import { UserInput } from '../client/user-input';
import { Button } from '../client/ui-elements';

// ─── Types ───────────────────────────────────────────────────────────────────

type SongInfo = { title: string; artist: string; audioUrl: string };

type MusicGameServerMsg = {
    kind: "music_game_update";
    gameState: GameState;
    lastGuess?: { playerName: string; guess: string; correct: boolean };
};

type MusicGameClientMsg =
    | { kind: "music_song_ready"; genre: string; song: SongInfo }
    | { kind: "music_guess_submit"; guess: string };

type GuessRecord = {
    playerId: string;
    playerName: string;
    guess: string;
    timestamp: number;
};

type GameState = {
    phase: "genre_select" | "playing" | "game_over";
    selectedGenre?: string;
    selectedArtist?: string;   // set when mode is "artist"
    currentSong?: SongInfo;
    guesses: GuessRecord[];
    gameOver: boolean;
    winnerId?: string;
    correctPlayers: string[];
    hintsRevealed: number;
};

type MusicPlayer = Player & { score: number };

// ─── Genre definitions ───────────────────────────────────────────────────────

const GENRE_TERMS: Record<string, string> = {
    rock:           'rock classic',
    pop:            'pop hits',
    jazz:           'jazz standard',
    hip_hop:        'hip hop rap',
    classical:      'classical orchestra',
    electronic:     'electronic dance EDM',
    metal:          'heavy metal',
    r_and_b:        'r&b soul',
    country:        'country music',
    reggae:         'reggae',
    blues:          'blues guitar',
    latin:          'latin salsa',
    punk:           'punk rock',
    disco:          'disco funk',
    indie:          'indie alternative',
    soul:           'soul motown',
    folk:           'folk acoustic',
    funk:           'funk groove',
    gospel:         'gospel',
    bossa_nova:     'bossa nova',
    kpop:           'kpop',
    italian:        'pop italiano',
    mega_hits:      'pop hits 2025 2026',
};

const GENRE_LABELS: Record<string, string> = {
    rock:       '🎸 Rock',
    pop:        '🌟 Pop',
    jazz:       '🎷 Jazz',
    hip_hop:    '🎤 Hip Hop',
    classical:  '🎻 Classical',
    electronic: '🎧 Electronic',
    metal:      '🤘 Metal',
    r_and_b:    '🎶 R&B',
    country:    '🤠 Country',
    reggae:     '🌿 Reggae',
    blues:      '🎵 Blues',
    latin:      '💃 Latin',
    punk:       '⚡ Punk',
    disco:      '🪩 Disco',
    indie:      '🌀 Indie',
    soul:       '❤️ Soul',
    folk:       '🪕 Folk',
    funk:       '🕺 Funk',
    gospel:     '✝️ Gospel',
    bossa_nova: '🌴 Bossa Nova',
    kpop:       '🇰🇷 K-Pop',
    italian:    '🇮🇹 Italiane',
    mega_hits:  '🌍 Famosissime',
};

// ─── Hint generation ─────────────────────────────────────────────────────────

function generateHints(song: SongInfo, artistKnown: boolean): string[] {
    const title = song.title;
    const artist = song.artist;
    const words = title.split(/\s+/).filter(w => w.length > 0);

    const skeleton = words.map(w => w[0].toUpperCase() + '_'.repeat(Math.max(0, w.length - 1))).join(' ');
    const charCount = title.replace(/\s/g, '').length;
    const hint2 = `Il titolo ha ${words.length} parola${words.length > 1 ? 'e' : ''} e ${charCount} lettere totali`;
    const artistWords = artist.split(/\s+/).length;
    const hint3 = artistKnown
        ? `L'anno di uscita: cerca negli anni '${Math.floor(Math.random() * 3 + 20)}0`
        : `L'artista inizia con "${artist[0].toUpperCase()}" e il nome ha ${artistWords} parola${artistWords > 1 ? 'e' : ''}`;
    const hint4 = words.length > 1
        ? `Il titolo inizia con la parola "${words[0]}"`
        : `Il titolo inizia con "${title.slice(0, 3)}..."`;
    const hint5 = artistKnown ? `Artista: ${artist} — prova a ricordare i suoi successi!` : `Artista: ${artist}`;

    return [skeleton, hint2, hint3, hint4, hint5];
}

// ─── iTunes fetch ─────────────────────────────────────────────────────────────

async function fetchSongFromItunes(genre: string): Promise<SongInfo | null> {
    const term = encodeURIComponent(GENRE_TERMS[genre] || genre);
    const url = `https://itunes.apple.com/search?term=${term}&media=music&limit=50&entity=song`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        const tracks = (data.results || []).filter(
            (t: any) => t.previewUrl && t.trackName && t.artistName
        );
        if (tracks.length === 0) return null;
        const shuffled = tracks.sort(() => Math.random() - 0.5);
        const pick = shuffled[0];
        return { title: pick.trackName, artist: pick.artistName, audioUrl: pick.previewUrl };
    } catch (err) {
        console.error("iTunes fetch failed:", err);
        return null;
    }
}

async function fetchSongByArtist(artistName: string): Promise<SongInfo | null> {
    const term = encodeURIComponent(artistName);
    const url = `https://itunes.apple.com/search?term=${term}&media=music&limit=50&entity=song&attribute=artistTerm`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        const tracks = (data.results || []).filter(
            (t: any) =>
                t.previewUrl &&
                t.trackName &&
                t.artistName &&
                t.artistName.toLowerCase().includes(artistName.toLowerCase())
        );
        if (tracks.length === 0) return null;
        const shuffled = tracks.sort(() => Math.random() - 0.5);
        const pick = shuffled[0];
        return { title: pick.trackName, artist: pick.artistName, audioUrl: pick.previewUrl };
    } catch (err) {
        console.error("iTunes artist fetch failed:", err);
        return null;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
//  SERVER
// ─────────────────────────────────────────────────────────────────────────────

export class MusicGuessGameServer extends GameServer {
    private gameState: GameState;
    private gamePlayers: Record<string, MusicPlayer>;
    private initMessage: MusicGameServerMsg;

    private static HINT_EVERY = 2;

    constructor() {
        super();
        this.gameState = {
            phase: "genre_select",
            guesses: [],
            gameOver: false,
            correctPlayers: [],
            hintsRevealed: 0
        };
    }

    init(players: Record<string, Player>) {
        this.gamePlayers = {};
        Object.entries(players).forEach(([id, player]) => {
            this.gamePlayers[id] = { ...player, score: 0 };
        });
        this.initMessage = { kind: "music_game_update", gameState: this.gameState };
    }

    tick(incomingMessages: IncomingMsg[], dt: number): OutgoingMsg[] {
        const out: OutgoingMsg[] = [];

        if (this.initMessage) {
            out.push({ payload: this.initMessage });
            this.initMessage = null;
        }

        for (const message of incomingMessages) {
            const { clientId, payload } = message;

            if (payload.kind === "music_song_ready" && this.gameState.phase === "genre_select") {
                this.gameState = {
                    phase: "playing",
                    selectedGenre: payload.genre,
                    selectedArtist: (payload as any).artist,
                    currentSong: payload.song,
                    guesses: [],
                    gameOver: false,
                    winnerId: undefined,
                    correctPlayers: [],
                    hintsRevealed: 0
                };
                out.push({ payload: { kind: "music_game_update", gameState: this.gameState } });
            }

            else if (
                payload.kind === "music_guess_submit" &&
                this.gameState.phase === "playing" &&
                !this.gameState.correctPlayers.includes(clientId)
            ) {
                const player = this.gamePlayers[clientId];
                if (!player || !this.gameState.currentSong) continue;

                const guess = payload.guess.toLowerCase().trim();
                const songTitle = this.gameState.currentSong.title.toLowerCase();
                const correct =
                    guess === songTitle ||
                    songTitle.includes(guess) ||
                    guess.includes(songTitle);

                this.gameState.guesses.push({
                    playerId: clientId,
                    playerName: player.name,
                    guess: payload.guess,
                    timestamp: Date.now()
                });

                const newHintsCount = Math.floor(
                    this.gameState.guesses.length / MusicGuessGameServer.HINT_EVERY
                );
                this.gameState.hintsRevealed = Math.min(newHintsCount, 5);

                if (correct) {
                    this.gameState.correctPlayers.push(clientId);
                    player.score += 1;
                    if (this.gameState.correctPlayers.length === 1) {
                        this.gameState.winnerId = clientId;
                    }
                    this.gameState.gameOver = true;
                    this.gameState.phase = "game_over";
                }

                out.push({
                    payload: {
                        kind: "music_game_update",
                        gameState: this.gameState,
                        lastGuess: { playerName: player.name, guess: payload.guess, correct }
                    }
                });
            }
        }

        return out;
    }

    isFinished(): boolean {
        return this.gameState.gameOver;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
//  CLIENT
// ─────────────────────────────────────────────────────────────────────────────

export class MusicGuessGameClient extends GameClient {
    private gameState: GameState | null = null;
    private lastGuessResult: { playerName: string; guess: string; correct: boolean } | null = null;
    private currentGuess: string = "";
    private messageQueue: MusicGameClientMsg[] = [];
    private userExited: boolean = false;
    private isLoadingSong: boolean = false;
    private loadError: string | null = null;
    private players: Record<string, Player> = {};
    private currentHints: string[] = [];
    private artistKnownMode: boolean = false;

    // Artist input overlay state
    private showingArtistInput: boolean = false;
    private artistInputEl: HTMLInputElement | null = null;
    private artistConfirmBtn: HTMLButtonElement | null = null;
    private artistCancelBtn: HTMLButtonElement | null = null;
    private artistOverlayDiv: HTMLDivElement | null = null;

    // Buttons
    private genreButtons: Map<string, Button> = new Map();
    private artistModeButton: Button;
    private replayButton: Button;
    private exitButton: Button;

    // Audio
    private audioElement: HTMLAudioElement;
    private genreList = Object.keys(GENRE_TERMS);

    constructor(userInput: UserInput, myId: string) {
        super(userInput, myId);

        this.audioElement = new Audio();
        this.audioElement.crossOrigin = "anonymous";
        this.audioElement.volume = 0.8;

        // Keyboard input for guessing
        document.addEventListener('keydown', (e) => {
            if (this.gameState?.phase !== "playing" || this.showingArtistInput) return;
            if (e.key === 'Enter') {
                if (this.currentGuess.trim() !== '') {
                    this.messageQueue.push({ kind: "music_guess_submit", guess: this.currentGuess });
                    this.currentGuess = "";
                }
            } else if (e.key === 'Backspace') {
                this.currentGuess = this.currentGuess.slice(0, -1);
            } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                this.currentGuess += e.key;
            }
        });

        // Genre buttons
        this.genreList.forEach(genre => {
            const btn = new Button(GENRE_LABELS[genre] || genre, userInput, () => {
                if (this.isLoadingSong || this.showingArtistInput) return;
                this.handleGenreSelect(genre);
            });
            this.genreButtons.set(genre, btn);
        });

        // "Scegli Artista" button — special highlighted button
        this.artistModeButton = new Button("🎤 Scegli Artista", userInput, () => {
            if (this.isLoadingSong) return;
            this.openArtistOverlay();
        });

        this.replayButton = new Button("🔁 Riascolta", userInput, () => {
            if (this.gameState?.currentSong) {
                this.playAudioPreview(this.gameState.currentSong.audioUrl);
            }
        });

        this.exitButton = new Button("🚪 Esci", userInput, () => {
            this.userExited = true;
        });
    }

    // ── Artist overlay (HTML element over the canvas) ───────────────────────

    private openArtistOverlay() {
        if (this.showingArtistInput) return;
        this.showingArtistInput = true;

        // Container
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; inset: 0;
            background: rgba(0,0,0,0.75);
            display: flex; align-items: center; justify-content: center;
            z-index: 9999;
            font-family: Georgia, serif;
        `;

        const box = document.createElement('div');
        box.style.cssText = `
            background: #141428;
            border: 2px solid #e8c547;
            border-radius: 12px;
            padding: 32px 40px;
            display: flex; flex-direction: column; gap: 16px;
            min-width: 340px; align-items: center;
        `;

        const label = document.createElement('div');
        label.textContent = '🎤 Inserisci il nome dell\'artista';
        label.style.cssText = 'color: #e8c547; font-size: 20px; font-weight: bold; text-align: center;';

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'es. Taylor Swift, Vasco Rossi…';
        input.style.cssText = `
            width: 100%; padding: 10px 14px; font-size: 18px;
            background: #0d0d1a; color: #fff;
            border: 1.5px solid #555; border-radius: 6px;
            outline: none; font-family: Georgia, serif;
            box-sizing: border-box;
        `;
        input.addEventListener('focus', () => { input.style.borderColor = '#e8c547'; });
        input.addEventListener('blur', () => { input.style.borderColor = '#555'; });

        const errorMsg = document.createElement('div');
        errorMsg.style.cssText = 'color: #f87171; font-size: 14px; min-height: 18px; text-align: center;';

        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'display: flex; gap: 14px; justify-content: center; width: 100%;';

        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = '✅ Cerca';
        confirmBtn.style.cssText = `
            padding: 10px 26px; font-size: 16px; font-family: Georgia, serif;
            background: #e8c547; color: #0d0d1a; border: none;
            border-radius: 6px; cursor: pointer; font-weight: bold;
        `;

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '✖ Annulla';
        cancelBtn.style.cssText = `
            padding: 10px 22px; font-size: 16px; font-family: Georgia, serif;
            background: #333; color: #aaa; border: 1px solid #555;
            border-radius: 6px; cursor: pointer;
        `;

        const loadingMsg = document.createElement('div');
        loadingMsg.style.cssText = 'color: #e8c547; font-size: 15px; text-align: center; display: none;';
        loadingMsg.textContent = '⏳ Cerco una canzone…';

        btnRow.appendChild(confirmBtn);
        btnRow.appendChild(cancelBtn);
        box.appendChild(label);
        box.appendChild(input);
        box.appendChild(errorMsg);
        box.appendChild(btnRow);
        box.appendChild(loadingMsg);
        overlay.appendChild(box);
        document.body.appendChild(overlay);

        this.artistOverlayDiv = overlay;
        this.artistInputEl = input;
        this.artistConfirmBtn = confirmBtn;
        this.artistCancelBtn = cancelBtn;

        setTimeout(() => input.focus(), 50);

        // Confirm handler
        const confirm = async () => {
            const name = input.value.trim();
            if (!name) {
                errorMsg.textContent = 'Inserisci un nome!';
                return;
            }
            errorMsg.textContent = '';
            confirmBtn.disabled = true;
            cancelBtn.disabled = true;
            loadingMsg.style.display = 'block';

            const song = await fetchSongByArtist(name);
            loadingMsg.style.display = 'none';

            if (!song) {
                errorMsg.textContent = `Nessuna canzone trovata per "${name}". Riprova.`;
                confirmBtn.disabled = false;
                cancelBtn.disabled = false;
                return;
            }

            this.closeArtistOverlay();
            this.isLoadingSong = true;
            this.artistKnownMode = true;
            this.messageQueue.push({
                kind: "music_song_ready",
                genre: `🎤 ${name}`,
                song,
                ...(({ artist: name }) as any)  // pass artist name through for server state
            } as any);
        };

        confirmBtn.addEventListener('click', confirm);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') confirm();
            if (e.key === 'Escape') this.closeArtistOverlay();
        });
        cancelBtn.addEventListener('click', () => this.closeArtistOverlay());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeArtistOverlay();
        });
    }

    private closeArtistOverlay() {
        if (this.artistOverlayDiv) {
            document.body.removeChild(this.artistOverlayDiv);
            this.artistOverlayDiv = null;
        }
        this.showingArtistInput = false;
    }

    // ── Genre fetch ─────────────────────────────────────────────────────────

    private async handleGenreSelect(genre: string) {
        this.isLoadingSong = true;
        this.loadError = null;
        this.artistKnownMode = false;
        try {
            const song = await fetchSongFromItunes(genre);
            if (song) {
                this.messageQueue.push({ kind: "music_song_ready", genre, song });
            } else {
                this.loadError = "Nessuna canzone trovata. Riprova.";
                this.isLoadingSong = false;
            }
        } catch {
            this.loadError = "Errore di rete. Riprova.";
            this.isLoadingSong = false;
        }
    }

    init(players: Record<string, Player>) {
        this.players = players;
        return Promise.resolve();
    }

    draw(ctx: CanvasRenderingContext2D, dt: number) {
        const { screenW, screenH } = this.userInput;

        ctx.fillStyle = "#0d0d1a";
        ctx.fillRect(0, 0, screenW, screenH);

        ctx.fillStyle = "#e8c547";
        ctx.font = "bold 40px Georgia, serif";
        ctx.textAlign = "center";
        ctx.fillText("🎵 Guess the Song", screenW / 2, 62);

        if (!this.gameState) {
            ctx.fillStyle = "#888";
            ctx.font = "22px Georgia, serif";
            ctx.fillText("Connessione in corso...", screenW / 2, screenH / 2);
            return;
        }

        if (this.gameState.phase === "genre_select") {
            this.drawGenreSelect(ctx, screenW, screenH);
        } else if (this.gameState.phase === "playing") {
            this.drawPlaying(ctx, screenW, screenH);
        } else if (this.gameState.phase === "game_over") {
            this.drawGameOver(ctx, screenW, screenH);
        }

        this.drawScoreboard(ctx, screenW);
    }

    // ── Genre selection grid ────────────────────────────────────────────────

    private drawGenreSelect(ctx: CanvasRenderingContext2D, W: number, H: number) {
        if (this.isLoadingSong) {
            ctx.fillStyle = "#e8c547";
            ctx.font = "24px Georgia, serif";
            ctx.textAlign = "center";
            ctx.fillText("⏳ Caricamento canzone...", W / 2, H / 2);
            return;
        }

        ctx.fillStyle = "#cccccc";
        ctx.font = "20px Georgia, serif";
        ctx.textAlign = "center";
        ctx.fillText("Scegli un genere — oppure cerca per artista:", W / 2, 98);

        if (this.loadError) {
            ctx.fillStyle = "#ff6b6b";
            ctx.font = "16px Georgia, serif";
            ctx.fillText(this.loadError, W / 2, 120);
        }

        // "Scegli Artista" button — full width, highlighted, above the grid
        const artBtnW = 220;
        const artBtnH = 46;
        this.artistModeButton.draw(ctx, W / 2 - artBtnW / 2, 130, artBtnW, artBtnH);

        // Draw a subtle separator line
        ctx.strokeStyle = "#2a2a44";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(W / 2 - 200, 188);
        ctx.lineTo(W / 2 + 200, 188);
        ctx.stroke();

        ctx.fillStyle = "#555";
        ctx.font = "13px Georgia, serif";
        ctx.fillText("— oppure scegli genere —", W / 2, 202);

        // 4-column genre grid
        const cols = 4;
        const btnW = 162;
        const btnH = 46;
        const gapX = 16;
        const gapY = 10;
        const genres = this.genreList;
        const totalW = cols * btnW + (cols - 1) * gapX;
        const startX = W / 2 - totalW / 2;
        const startY = 214;

        genres.forEach((genre, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = startX + col * (btnW + gapX);
            const y = startY + row * (btnH + gapY);
            this.genreButtons.get(genre)!.draw(ctx, x, y, btnW, btnH);
        });
    }

    // ── Playing phase ───────────────────────────────────────────────────────

    private drawPlaying(ctx: CanvasRenderingContext2D, W: number, H: number) {
        const gs = this.gameState!;

        // Label: genre or artist
        ctx.fillStyle = "#e8c547";
        ctx.font = "19px Georgia, serif";
        ctx.textAlign = "center";
        const modeLabel = gs.selectedArtist
            ? `🎤 Artista: ${gs.selectedArtist}`
            : (GENRE_LABELS[gs.selectedGenre || ''] || gs.selectedGenre || '');
        ctx.fillText(modeLabel, W / 2, 100);

        ctx.fillStyle = "#777";
        ctx.font = "15px Georgia, serif";
        ctx.fillText("Ascolta il preview, scrivi il titolo e premi Invio", W / 2, 122);

        this.replayButton.draw(ctx, W / 2 - 75, 136, 150, 38);

        // Input box
        const boxW = 460;
        const boxH = 52;
        const boxX = W / 2 - boxW / 2;
        const boxY = 192;

        ctx.strokeStyle = "#e8c547";
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, boxW, boxH);
        ctx.fillStyle = "#141428";
        ctx.fillRect(boxX + 1, boxY + 1, boxW - 2, boxH - 2);

        ctx.fillStyle = this.currentGuess ? "#ffffff" : "#555";
        ctx.font = "23px Georgia, serif";
        ctx.textAlign = "center";
        ctx.fillText(this.currentGuess || "Scrivi qui...", W / 2, boxY + 34);

        if (Math.floor(Date.now() / 500) % 2 === 0 && this.currentGuess) {
            const tw = ctx.measureText(this.currentGuess).width;
            ctx.fillStyle = "#e8c547";
            ctx.fillRect(W / 2 + tw / 2 + 4, boxY + 8, 2, 34);
        }

        if (this.lastGuessResult) {
            const r = this.lastGuessResult;
            ctx.font = "19px Georgia, serif";
            ctx.fillStyle = r.correct ? "#4ade80" : "#f87171";
            ctx.fillText(
                `${r.correct ? "✅" : "❌"} ${r.playerName}: "${r.guess}"`,
                W / 2, 268
            );
        }

        // Hints panel
        const hintsRevealed = gs.hintsRevealed;
        const hintAreaY = 292;

        if (gs.guesses.length === 0) {
            ctx.fillStyle = "#3a3a5a";
            ctx.font = "14px Georgia, serif";
            ctx.textAlign = "center";
            ctx.fillText("💡 Suggerimenti si sbloccano ogni 2 tentativi", W / 2, hintAreaY + 14);
        } else if (hintsRevealed === 0) {
            ctx.fillStyle = "#3a3a5a";
            ctx.font = "14px Georgia, serif";
            ctx.textAlign = "center";
            ctx.fillText(`💡 Prossimo suggerimento tra ${2 - (gs.guesses.length % 2)} tentativo/i`, W / 2, hintAreaY + 14);
        } else {
            ctx.fillStyle = "#6b5e1e";
            ctx.font = "bold 15px Georgia, serif";
            ctx.textAlign = "center";
            ctx.fillText("💡 Suggerimenti:", W / 2, hintAreaY);
            for (let i = 0; i < hintsRevealed && i < this.currentHints.length; i++) {
                const isLatest = i === hintsRevealed - 1;
                ctx.fillStyle = isLatest ? "#e8c547" : "#9a8535";
                ctx.font = `${isLatest ? "bold " : ""}14px Georgia, serif`;
                ctx.fillText(`${i + 1}. ${this.currentHints[i]}`, W / 2, hintAreaY + 22 + i * 22);
            }
        }

        // Guess history
        if (gs.guesses.length > 0) {
            const recent = gs.guesses.slice(-6);
            ctx.fillStyle = "#3a3a5a";
            ctx.font = "14px Georgia, serif";
            ctx.textAlign = "left";
            ctx.fillText("Tentativi:", 28, H - 148);
            recent.forEach((g, i) => {
                ctx.fillStyle = "#666";
                ctx.fillText(`${g.playerName}: "${g.guess}"`, 28, H - 126 + i * 20);
            });
            ctx.textAlign = "center";
        }
    }

    // ── Game over ───────────────────────────────────────────────────────────

    private drawGameOver(ctx: CanvasRenderingContext2D, W: number, H: number) {
        const gs = this.gameState!;

        if (gs.winnerId) {
            const winner = this.players[gs.winnerId];
            ctx.fillStyle = "#4ade80";
            ctx.font = "bold 30px Georgia, serif";
            ctx.textAlign = "center";
            ctx.fillText(`🏆 ${winner?.name || "Qualcuno"} ha indovinato!`, W / 2, H / 2 - 105);
        }

        if (gs.currentSong) {
            ctx.fillStyle = "#e8c547";
            ctx.font = "bold 24px Georgia, serif";
            ctx.textAlign = "center";
            ctx.fillText(`"${gs.currentSong.title}"`, W / 2, H / 2 - 50);
            ctx.fillStyle = "#aaaaaa";
            ctx.font = "19px Georgia, serif";
            ctx.fillText(`di ${gs.currentSong.artist}`, W / 2, H / 2 - 15);
        }

        this.replayButton.draw(ctx, W / 2 - 75, H / 2 + 22, 150, 40);
        this.exitButton.draw(ctx, W / 2 - 65, H / 2 + 78, 130, 42);
    }

    // ── Scoreboard ──────────────────────────────────────────────────────────

    private drawScoreboard(ctx: CanvasRenderingContext2D, W: number) {
        ctx.fillStyle = "#333";
        ctx.font = "bold 15px Georgia, serif";
        ctx.textAlign = "left";
        ctx.fillText("Giocatori:", W - 190, 48);
        Object.values(this.players).forEach((player, i) => {
            ctx.fillStyle = "#777";
            ctx.font = "14px Georgia, serif";
            ctx.fillText(`${player.name}: ${(player as any).score ?? 0}`, W - 190, 68 + i * 22);
        });
        ctx.textAlign = "center";
    }

    // ── Message handling ────────────────────────────────────────────────────

    handleMessage(message: any) {
        if (message.kind === "music_game_update") {
            const previousPhase = this.gameState?.phase;
            this.gameState = message.gameState;
            this.lastGuessResult = message.lastGuess ?? null;
            this.isLoadingSong = false;

            if (previousPhase !== "playing" && this.gameState.phase === "playing") {
                if (this.gameState.currentSong) {
                    this.currentHints = generateHints(this.gameState.currentSong, this.artistKnownMode);
                    this.playAudioPreview(this.gameState.currentSong.audioUrl);
                }
            }

            if (this.gameState.phase === "game_over") {
                this.audioElement.pause();
            }
        }
    }

    private playAudioPreview(url: string) {
        try {
            this.audioElement.src = url;
            this.audioElement.load();
            this.audioElement.play().catch(err =>
                console.warn("Audio play blocked:", err.message)
            );
        } catch (err) {
            console.error("Error playing audio:", err);
        }
    }

    flushMessages(): any[] {
        const msgs = this.messageQueue;
        this.messageQueue = [];
        return msgs;
    }

    isFinished(): boolean {
        return this.userExited;
    }
}
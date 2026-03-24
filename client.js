const playground = document.getElementById('playground');
const ctx = playground.getContext("2d");

let screenW = 0, screenH = 0; // larghezza ed altezza del canvas
const worldW = 1000, worldH = 600; // larghezza ed altezza dello spazio di gioco
const worldBounds = {
    top: -worldH/2,
    left: -worldW/2,
    bottom: worldH/2,
    right: worldW/2,
};
const camera = { x: 0, y: 0, zoom: 1.0 };

function resize() {
    screenW = window.innerWidth;
    screenH = window.innerHeight;
    playground.width = screenW;
    playground.height = screenH;
}
resize();
window.addEventListener('resize', resize);

let me = {
    x: 0,
    y: 0,
    speed: 5,
    character: 'normalGuy'
};
let others = []; // TODO riempire con i dati che arrivano dal server

const personW = 40;
const personH = 120;

function draw() {
    // gestione movimento
    if (goingUp) me.y -= me.speed;
    if (goingLeft) me.x -= me.speed;
    if (goingDown) me.y += me.speed;
    if (goingRight) me.x += me.speed;

    // controllo che il giocatore non esca dallo spazio di gioco
    if (me.y - personH/2 < worldBounds.top) me.y = worldBounds.top + personH/2;
    if (me.y + personH/2 > worldBounds.bottom) me.y = worldBounds.bottom - personH/2;
    if (me.x - personW/2 < worldBounds.left) me.x = worldBounds.left + personW/2;
    if (me.x + personW/2 > worldBounds.right) me.x = worldBounds.right - personW/2;

    // la camera segue il giocatore
    camera.x = me.x;
    camera.y = me.y;

    // pulisci lo schermo
    ctx.beginPath();
    ctx.rect(0, 0, screenW, screenH);
    ctx.fillStyle = "#000";
    ctx.fill();

    ctx.save(); // sistema di coordinate world-space
        ctx.translate(screenW/2, screenH/2); // centra lo schermo
        ctx.scale(camera.zoom, camera.zoom); // applica lo zoom
        ctx.translate(-camera.x, -camera.y); // sposta relativamente alla camera

        // disegna lo sfondo del "mondo" (campo da gioco)
        ctx.beginPath();
        ctx.rect(worldBounds.left, worldBounds.top, worldW, worldH);
        ctx.fillStyle = "#58a515";
        ctx.fill();

        others.forEach(p => drawPerson(p.x, p.y, personW, personH, p.character));
        drawPerson(me.x, me.y, personW, personH, me.character);
    ctx.restore();

    requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

function drawPerson(x, y, w, h, style) {
    const drawFunction = characters[style];
    drawFunction(x, y, w, h, style);
}

const socket = new WebSocket(`ws://localhost:4242`);
socket.addEventListener("message", async event => {
    // TODO aggiornare lo stato in base ai messaggi del server
});

// TODO spostare la gestione dei movimenti sul server
let goingUp = false;
let goingLeft = false;
let goingDown = false;
let goingRight = false;

document.addEventListener("keydown", (event) => {
    if (event.code == "KeyW") goingUp = true;
    else if (event.code == "KeyA") goingLeft = true;
    else if (event.code == "KeyS") goingDown = true;
    else if (event.code == "KeyD") goingRight = true;
});
document.addEventListener("keyup", (event) => {
    if (event.code == "KeyW") goingUp = false;
    else if (event.code == "KeyA") goingLeft = false;
    else if (event.code == "KeyS") goingDown = false;
    else if (event.code == "KeyD") goingRight = false;
});

// gestione dello zoom
const minZoom = 0.1, maxZoom = 4;
const zoomSpeed = 0.035;
window.addEventListener('wheel', (event) => {
    event.preventDefault();
    
    if (event.deltaY > 0) {
        camera.zoom *= (1 - zoomSpeed);
    } else {
        camera.zoom *= (1 + zoomSpeed);
    }

    camera.zoom = Math.min(Math.max(minZoom, camera.zoom), maxZoom);
}, { passive: false });

const characters = {
    normalGuy: drawNormalGuy,
}

function drawNormalGuy(x, y, w, h, style = {}) {
    ctx.save();

    // move origin (x=0, y=0) to the person center
    ctx.translate(x, y);
    const startX = -w/2;
    const startY = -h/2;


    // +head
    const headH = h * 0.3;

    ctx.beginPath();
    ctx.fillStyle = style.skinColor || "#eaa66e";
    ctx.rect(startX, startY, w, headH);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = "#151514";
    ctx.rect(startX, startY, w, headH/4);
    ctx.fill();
    // -head

    // +body
    const bodyStartY = startY + headH;
    const bodyH = h * 0.35;
    const armLen = 0.4 * w;

    ctx.beginPath();
    ctx.fillStyle = "#04097f";
    ctx.rect(startX, bodyStartY, w, bodyH); // body
    ctx.rect(startX - armLen, bodyStartY, armLen, 0.35*bodyH); // left arm
    ctx.rect(startX + w, bodyStartY, armLen, 0.35*bodyH); // left arm
    ctx.fill();
    // -body

    // +legs
    const legH = h - headH - bodyH;
    const legStartY = bodyStartY + bodyH;
    const legW = w * 0.35;

    ctx.beginPath();
    ctx.fillStyle = "#100712";
    ctx.rect(startX, legStartY, w, legH/3); // top
    ctx.rect(startX, legStartY, legW, legH); // left leg
    ctx.rect(startX + w - legW, legStartY, legW, legH); // right leg
    ctx.fill();
    // -legs

    // +bounding box
    ctx.beginPath();
    ctx.rect(startX, startY, w, h);
    ctx.strokeStyle = "#f620ef";
    ctx.stroke();
    /*
    */
    // -bounding box

    ctx.restore();
}

function drawPersona2(x, y, w, h, style = {}) {
    ctx.save();
    ctx.translate(x, y);
    const startX = -w / 2;
    const startY = -h / 2;

    const headH      = h * 0.30;
    const bodyH      = h * 0.35;
    const legH       = h - headH - bodyH;
    const bodyStartY = startY + headH;
    const legStartY  = bodyStartY + bodyH;

    // ── BERRETTO MARINARO BLU ────────────────────────────────────────
    // cupola
    ctx.fillStyle = "#2a6fd4";
    ctx.fillRect(startX + w * 0.08, startY - headH * 0.48, w * 0.84, headH * 0.42);
    // falda piatta
    ctx.fillStyle = "#2a6fd4";
    ctx.fillRect(startX - w * 0.06, startY - headH * 0.10, w * 1.12, headH * 0.14);
    // nastro nero sul bordo falda
    ctx.fillStyle = "#111111";
    ctx.fillRect(startX - w * 0.06, startY - headH * 0.10, w * 1.12, headH * 0.06);
    // fiocco/nastro nero sul retro (piccolo rettangolo a destra)
    ctx.fillStyle = "#111111";
    ctx.fillRect(startX + w * 0.78, startY - headH * 0.22, w * 0.10, headH * 0.18);

    // ── TESTA (faccia bianca/crema) ──────────────────────────────────
    ctx.fillStyle = "#f5f0e0";
    ctx.fillRect(startX, startY, w, headH * 0.88);

    // guancia destra più chiara (volume cartoon)
    ctx.fillStyle = "#fff8ee";
   ctx.fillRect(startX + w * 0.25, startY + headH * 0.85, w * 0.50, headH * 0.20);

    // occhi (bianchi + pupille nere)
    const eyeY = startY + headH * 0.12;
    const eyeW = w * 0.20;
    const eyeH = headH * 0.32;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(startX + w * 0.08, eyeY, eyeW, eyeH);
    ctx.fillRect(startX + w * 0.60, eyeY, eyeW, eyeH);
    ctx.fillStyle = "#111111";
    ctx.fillRect(startX + w * 0.13, eyeY + eyeH * 0.30, eyeW * 0.45, eyeH * 0.55);
    ctx.fillRect(startX + w * 0.67, eyeY + eyeH * 0.30, eyeW * 0.45, eyeH * 0.55);
    // lucine occhi
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(startX + w * 0.14, eyeY + eyeH * 0.28, eyeW * 0.14, eyeH * 0.18);
    ctx.fillRect(startX + w * 0.68, eyeY + eyeH * 0.28, eyeW * 0.14, eyeH * 0.18);

    // becco arancione (lungo e piatto, stile foto)
    ctx.fillStyle = "#f07800";
    ctx.fillRect(startX + w * 0.18, startY + headH * 0.55, w * 0.70, headH * 0.24);
    // linea centrale becco
    ctx.fillStyle = "#c05a00";
    ctx.fillRect(startX + w * 0.18, startY + headH * 0.65, w * 0.70, headH * 0.04);
    // punta becco (più scura)
    ctx.fillStyle = "#d06000";
    ctx.fillRect(startX + w * 0.72, startY + headH * 0.55, w * 0.16, headH * 0.24);

    // ── BODY (giacca blu come in foto) ───────────────────────────────
    ctx.fillStyle = "#2a6fd4";
    ctx.fillRect(startX, bodyStartY, w, bodyH);

    // petto bianco centrale (camicia/petto papera)
    ctx.fillStyle = "#f5f0e0";
    ctx.fillRect(startX + w * 0.25, bodyStartY, w * 0.50, bodyH);

    // risvolti giacca blu sopra il petto
    ctx.fillStyle = "#2a6fd4";
    ctx.fillRect(startX + w * 0.25, bodyStartY, w * 0.13, bodyH * 0.60); // risvolto sx
    ctx.fillRect(startX + w * 0.62, bodyStartY, w * 0.13, bodyH * 0.60); // risvolto dx

    // papillon rosso al centro
    ctx.fillStyle = "#cc1111";
    ctx.fillRect(startX + w * 0.32, bodyStartY + bodyH * 0.08, w * 0.16, bodyH * 0.16); // ala sx
    ctx.fillRect(startX + w * 0.52, bodyStartY + bodyH * 0.08, w * 0.16, bodyH * 0.16); // ala dx
    // nodo centrale papillon
    ctx.fillStyle = "#991111";
    ctx.fillRect(startX + w * 0.44, bodyStartY + bodyH * 0.10, w * 0.12, bodyH * 0.12);

    // fascia/cintura gialla in vita
    ctx.fillStyle = "#f0c000";
    ctx.fillRect(startX, bodyStartY + bodyH * 0.84, w, bodyH * 0.16);

    // ── BRACCIA (ali blu con guanti bianchi) ─────────────────────────
    const armW = w * 0.18;
    const armH = bodyH * 0.55;
    const armY = bodyStartY + bodyH * 0.08;

    ctx.fillStyle = "#2a6fd4";
    ctx.fillRect(startX - armW * 0.9, armY, armW, armH);           // braccio sx
    ctx.fillRect(startX + w - armW * 0.1, armY, armW, armH);       // braccio dx

    // guanti bianchi
    ctx.fillStyle = "#f5f0e0";
    ctx.fillRect(startX - armW * 1.1, armY + armH * 0.78, armW * 1.3, armH * 0.30); // guanto sx
    ctx.fillRect(startX + w - armW * 0.1, armY + armH * 0.78, armW * 1.3, armH * 0.30); // guanto dx

    // ── GAMBE (zampe bianche + piedi arancioni) ───────────────────────
    const bootH = legH * 0.38;
    const legW  = w * 0.32;

    ctx.fillStyle = "#f5f0e0";
    ctx.fillRect(startX + w * 0.04, legStartY, legW, legH - bootH);
    ctx.fillRect(startX + w * 0.64, legStartY, legW, legH - bootH);

    // piedi arancioni esagerati
    ctx.fillStyle = "#f07800";
    ctx.fillRect(startX - w * 0.04, startY + h - bootH, legW * 1.4, bootH);
    ctx.fillRect(startX + w * 0.58, startY + h - bootH, legW * 1.4, bootH);

    // ── BOUNDING BOX ─────────────────────────────────────────────────
    ctx.beginPath();
    ctx.rect(startX, startY, w, h);
    ctx.strokeStyle = "#f620ef";
    ctx.stroke();

    ctx.restore();
}